const { Client } = require('ssh2');

const config = {
    host: '187.124.67.53',
    port: 22,
    username: 'root',
    password: 'o7BR&vX+F2;wqYye'
};

const conn = new Client();
conn.on('ready', () => {
    console.log('SSH Connection Ready');
    // Delete the duplicate database.sqlite in the backend directory
    conn.exec('rm -f /var/www/pj-air/backend/database.sqlite', (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log(`Duplicate DB removed from backend folder. Exit code: ${code}`);
            conn.end();
        }).on('data', (data) => {
            console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
        });
    });
}).connect(config);
