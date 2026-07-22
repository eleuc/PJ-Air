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
    console.log('SSH Connection Established.');
    try {
        console.log('--- RECENT API LOGS ---');
        const res = await executeCommand(conn, 'grep "create-intent" /var/log/nginx/access.log | tail -n 20');
        console.log(res.stdout || 'No matching access logs.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        conn.end();
    }
}).connect(config);
