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
    conn.exec('host -t mx jhoanes.com || nslookup -type=mx jhoanes.com', (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => {
            console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
            console.error('STDERR: ' + data);
        });
    });
}).connect(config);
