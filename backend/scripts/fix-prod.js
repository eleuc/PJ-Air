const { Client } = require('ssh2');

const config = {
    host: '187.124.67.53',
    port: 22,
    username: 'root',
    password: 'o7BR&vX+F2;wqYye'
};

const conn = new Client();

conn.on('ready', () => {
    console.log('Client :: ready');
    
    // 1. Update password for eleucn1@gmail.com to Tecnolog1a (using same hash as admin)
    const sql = `UPDATE users SET password = '04cbfdc5c8c467ae24ccee6ad95f3a9c:983d19e325ed71f960a25378b6b80b5b14b7889b036a91b01f91e42acba46a1679a411501b083219d7a142eefc2055a016c1b705ae362860476ede00260613df' WHERE email = 'eleucn1@gmail.com';`;
    
    conn.exec(`sqlite3 /var/www/pj-air/database.sqlite "${sql}"`, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log('SQL Update Finished:', code);
            
            // 2. Install bcryptjs on production
            conn.exec('cd /var/www/pj-air/backend && npm install bcryptjs && pm2 restart all', (err2, stream2) => {
                if (err2) throw err2;
                stream2.on('close', (code2, signal2) => {
                    console.log('NPM Install and PM2 Restart Finished:', code2);
                    conn.end();
                }).on('data', (data) => {
                    console.log('STDOUT: ' + data);
                }).stderr.on('data', (data) => {
                    console.log('STDERR: ' + data);
                });
            });
            
        }).on('data', (data) => {
            console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
        });
    });
}).connect(config);
