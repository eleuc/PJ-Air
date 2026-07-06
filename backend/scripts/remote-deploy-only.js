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
        console.log(`Executing remote command: ${cmd}`);
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
    console.log('SSH Connection Established.');
    try {
        console.log('Starting remote code pull, build and restart...');
        const deployCmd = [
            'cd /var/www/pj-air',
            'git checkout master',
            'git pull origin master',
            'cd backend',
            'npm install',
            'npm run build',
            'cd ../frontend',
            'npm install',
            'npm run build',
            'cd ..',
            'pm2 restart 6 7'
        ].join(' && ');

        await executeCommand(conn, deployCmd);
        console.log('Deployment only completed successfully!');

    } catch (error) {
        console.error('CRITICAL ERROR DURING DEPLOYMENT:', error.message);
    } finally {
        conn.end();
        console.log('SSH Connection Closed.');
    }
}).connect(config);
