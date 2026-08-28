const { Client } = require('ssh2');

const config = {
    host: '187.124.67.53',
    port: 22,
    username: 'root',
    privateKey: require('fs').readFileSync(require('os').homedir() + '/.ssh/id_rsa')
};

const conn = new Client();

function executeCommand(conn, cmd) {
    return new Promise((resolve, reject) => {
        console.log(`Executing: ${cmd}`);
        conn.exec(cmd, (err, stream) => {
            if (err) return reject(err);
            let stdout = '';
            let stderr = '';
            stream.on('close', (code, signal) => {
                if (code !== 0) {
                    reject(new Error(`Command failed with code ${code}. Stderr: ${stderr}`));
                } else {
                    resolve(stdout);
                }
            }).on('data', (data) => {
                stdout += data.toString();
                process.stdout.write(data);
            }).stderr.on('data', (data) => {
                stderr += data.toString();
                process.stderr.write(data);
            });
        });
    });
}

conn.on('ready', async () => {
    console.log('SSH Connection Established for Testing Deployment.');
    try {
        // 1. Clone repository if not exists, otherwise pull testing branch
        console.log('1. Checking repository status on remote...');
        const checkRepoCmd = 'if [ ! -d "/var/www/pj-air-testing" ]; then git clone -b testing --single-branch https://github.com/eleuc/PJ-Air.git /var/www/pj-air-testing; else cd /var/www/pj-air-testing && git fetch origin && git checkout testing && git reset --hard origin/testing; fi';
        await executeCommand(conn, checkRepoCmd);

        // 2. Setup database from test snapshot (clean database)
        // console.log('2. Aprovisonando base de datos de testing...');
        // const setupDbCmd = 'cp /var/www/pj-air/backend/database.test.sqlite /var/www/pj-air-testing/database-testing.sqlite';
        // await executeCommand(conn, setupDbCmd);

        // 3. Build Backend
        console.log('3. Building Backend...');
        const buildBackendCmd = [
            'cd /var/www/pj-air-testing/backend',
            'npm install',
            'chmod -R +x node_modules/.bin',
            'npm run build'
        ].join(' && ');
        await executeCommand(conn, buildBackendCmd);

        // 4. Build Frontend
        console.log('4. Building Frontend...');
        const buildFrontendCmd = [
            'cd /var/www/pj-air-testing/frontend',
            'npm install',
            'chmod -R +x node_modules/.bin',
            'NEXT_PUBLIC_API_URL=https://testing.jhoanes.com/api npm run build'
        ].join(' && ');
        await executeCommand(conn, buildFrontendCmd);


        // 5. Restart PM2 processes with environment variables
        console.log('5. Deploying PM2 processes for testing...');
        const pm2Cmd = [
            'pm2 delete pj-air-backend-testing || true',
            'pm2 delete pj-air-frontend-testing || true',
            'BACKEND_PORT=3201 PORT=3201 DATABASE_PATH=../database-testing.sqlite FRONTEND_URL=https://testing.jhoanes.com pm2 start dist/src/main.js --name pj-air-backend-testing --cwd /var/www/pj-air-testing/backend',
            'PORT=3200 NEXT_PUBLIC_API_URL=https://testing.jhoanes.com/api pm2 start node_modules/next/dist/bin/next --name pj-air-frontend-testing --cwd /var/www/pj-air-testing/frontend -- start'
        ].join(' && ');

        await executeCommand(conn, pm2Cmd);

        // 6. Setup Nginx Server Block
        console.log('6. Configuring Nginx reverse proxy...');
        const nginxConfig = `
map $http_upgrade $connection_upgrade {
    default upgrade;
    ""      close;
}

server {
    server_name testing.jhoanes.com;

    location /n8n/ {
        proxy_pass http://localhost:5678/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /assets/ {
        proxy_pass http://localhost:5678/assets/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /static/ {
        proxy_pass http://localhost:5678/static/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /rest/ {
        proxy_pass http://localhost:5678/rest/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
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
        // Write the nginx config file
        await executeCommand(conn, `echo '${nginxConfig.trim()}' > /etc/nginx/sites-available/testing.jhoanes.com`);
        await executeCommand(conn, 'ln -sf /etc/nginx/sites-available/testing.jhoanes.com /etc/nginx/sites-enabled/testing.jhoanes.com');
        await executeCommand(conn, 'nginx -t && systemctl reload nginx');

        console.log('Running Certbot to configure/restore SSL...');
        await executeCommand(conn, 'certbot --nginx -d testing.jhoanes.com --non-interactive --agree-tos --email rbarrosop@gmail.com --redirect');


        console.log('Testing environment deployment completed successfully!');
        console.log('Please ensure testing.jhoanes.com points to 187.124.67.53 in your DNS configuration.');

    } catch (error) {
        console.error('CRITICAL ERROR DURING DEPLOYMENT:', error.message);
    } finally {
        conn.end();
        console.log('SSH Connection Closed.');
    }
}).connect(config);
