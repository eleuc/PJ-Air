const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

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

function downloadFile(sftp, remotePath, localPath) {
    return new Promise((resolve, reject) => {
        console.log(`Downloading: ${remotePath} -> ${localPath}`);
        sftp.fastGet(remotePath, localPath, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

conn.on('ready', () => {
    console.log('SSH Connection Established.');
    conn.sftp(async (err, sftp) => {
        if (err) {
            console.error('SFTP error:', err);
            conn.end();
            return;
        }

        try {
            // 1. Create remote backup of database.sqlite
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const remoteDbPath = '/var/www/pj-air/database.sqlite';
            const remoteBackupPath = `/var/www/pj-air/database.sqlite.bak_${timestamp}`;
            
            console.log('1. Creating remote backup...');
            await executeCommand(conn, `cp ${remoteDbPath} ${remoteBackupPath}`);
            console.log(`Remote backup created at: ${remoteBackupPath}`);

            // 2. Download the backup to local
            const localBackupPath = path.join(__dirname, '..', 'database.remote.prod.bak');
            console.log('2. Downloading database backup to local...');
            await downloadFile(sftp, remoteDbPath, localBackupPath);
            console.log(`Database backup downloaded to: ${localBackupPath}`);

            // 3. Deploy code updates
            console.log('3. Starting code update and build in production...');
            const deployCmd = [
                'cd /var/www/pj-air',
                'git checkout master',
                'git reset --hard',
                'git pull origin master',
                'cd backend',
                'npm install',
                'npm run build',
                'cd ../frontend',
                'npm install',
                'npm run build',
                'cd ..',
                'pm2 restart pj-air-backend pj-air-frontend'
            ].join(' && ');

            await executeCommand(conn, deployCmd);
            console.log('Deployment completed successfully!');

        } catch (error) {
            console.error('CRITICAL ERROR DURING DEPLOYMENT:', error.message);
        } finally {
            conn.end();
            console.log('SSH Connection Closed.');
        }
    });
}).connect(config);
