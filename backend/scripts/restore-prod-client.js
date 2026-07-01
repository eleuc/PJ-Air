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
    
    // Restore the exact original bcrypt hash for eleucn1@gmail.com
    const originalHash = '$2b$10$jGEh4TrgXRd6lXesTelJhO2m5w2.QwjsZNoKc2AG3BmxMczuDGUmK';
    const sql = `UPDATE users SET password = '${originalHash}' WHERE email = 'eleucn1@gmail.com';`;
    
    conn.exec(`sqlite3 /var/www/pj-air/database.sqlite "${sql}"`, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log('Production password restored:', code);
            conn.end();
        }).on('data', (data) => {
            console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
        });
    });
}).connect(config);
