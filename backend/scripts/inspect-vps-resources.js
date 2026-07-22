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
        console.log('--- VPS RESOURCES ---');
        const ram = await executeCommand(conn, 'free -h');
        console.log('RAM Info:\n', ram.stdout);

        const cpu = await executeCommand(conn, 'nproc && uptime');
        console.log('CPU Info:\n', cpu.stdout);

        const disk = await executeCommand(conn, 'df -h /');
        console.log('Disk Info:\n', disk.stdout);

        const docker = await executeCommand(conn, 'docker --version || echo "Docker not installed"');
        console.log('Docker Info:\n', docker.stdout);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        conn.end();
    }
}).connect(config);
