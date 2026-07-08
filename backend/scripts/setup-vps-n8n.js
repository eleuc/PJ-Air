const { Client } = require('ssh2');

const config = {
    host: '187.124.67.53',
    port: 22,
    username: 'root',
    password: 'o7BR&vX+F2;wqYye'
};

const conn = new Client();

function executeCommand(conn, cmd) {
    return new Promise((resolve, reject) => {
        conn.exec(cmd, (err, stream) => {
            if (err) return reject(err);
            let stdout = '';
            let stderr = '';
            stream.on('close', (code, signal) => {
                resolve({ code, stdout, stderr });
            }).on('data', (data) => {
                stdout += data.toString();
            }).stderr.on('data', (data) => {
                stderr += data.toString();
            });
        });
    });
}

conn.on('ready', async () => {
    console.log('SSH Connection Established for VPS Setup.');
    try {
        // 1. Configure SWAP
        console.log('1. Configuring 4GB SWAP space...');
        const swapSetup = `
        if [ ! -f /swapfile ]; then
            echo "Creating swap file..."
            fallocate -l 4G /swapfile
            chmod 600 /swapfile
            mkswap /swapfile
            swapon /swapfile
            echo "/swapfile none swap sw 0 0" >> /etc/fstab
            echo "SWAP setup completed."
        else
            echo "SWAP already exists."
        fi
        `;
        const swapRes = await executeCommand(conn, swapSetup);
        console.log(swapRes.stdout || swapRes.stderr);

        // 2. Deploy N8N in Docker with limits
        console.log('2. Deploying N8N container in Docker...');
        const dockerSetup = `
        mkdir -p /root/.n8n
        chown -R 1000:1000 /root/.n8n
        docker stop n8n || true
        docker rm n8n || true
        docker run -d --name n8n \\
            --restart unless-stopped \\
            --cpus="0.5" \\
            --memory="1536m" \\
            -p 5678:5678 \\
            -e EXECUTIONS_PROCESS=main \\
            -e N8N_PORT=5678 \\
            -e N8N_SUBPATH=/n8n/ \\
            -e WEBHOOK_URL=https://testing.jhoanes.com/n8n/ \\
            -v /root/.n8n:/home/node/.n8n \\
            n8nio/n8n:latest
        `;
        const dockerRes = await executeCommand(conn, dockerSetup);
        console.log(dockerRes.stdout || dockerRes.stderr);


        // 3. Configure Nginx with N8N path
        console.log('3. Muffling Nginx for /n8n/ location block...');
        const nginxConfig = `server {
    server_name testing.jhoanes.com;

    location /n8n/ {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3201/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3200;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    listen 80;
}
`;
        await executeCommand(conn, `echo '${nginxConfig.trim()}' > /etc/nginx/sites-available/testing.jhoanes.com`);
        await executeCommand(conn, 'nginx -t && systemctl reload nginx');

        console.log('Running Certbot to configure/restore SSL...');
        await executeCommand(conn, 'certbot --nginx -d testing.jhoanes.com --non-interactive --agree-tos --email rbarrosop@gmail.com --redirect');

        console.log('Nginx and SSL configuration completed successfully.');

    } catch (error) {
        console.error('CRITICAL ERROR:', error.message);
    } finally {
        conn.end();
        console.log('SSH Connection Closed.');
    }
}).connect(config);
