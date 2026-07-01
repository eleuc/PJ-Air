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
    // Output env files and DB path
    conn.exec('cat /var/www/pj-air/backend/.env', (err, stream) => {
        stream.on('close', () => {
            conn.exec('ls -la /var/www/pj-air', (err2, stream2) => {
                stream2.on('close', () => conn.end())
                       .on('data', d => console.log('LS:', d.toString()));
            });
        }).on('data', d => console.log('ENV:', d.toString()));
    });
}).connect(config);
