const { Client } = require('ssh2');
const sqlite3 = require('sqlite3');
const path = require('path');

const config = {
    host: '187.124.67.53',
    port: 22,
    username: 'root',
    password: 'o7BR&vX+F2;wqYye'
};

const hash = 'ab46d742017c0e8671592da3f79d6210:722fac8da42a8b464fec2c63ef4dcefed704e11e5afeee846422e9113df6e6c1ff8753050ca60791fb3773a15c26233d8fa8c6b1a3eafc55aaa1da618a97c21f';
const email = 'christianfranco07@gmail.com';

// 1. Update local database
const localDbPath = path.join(__dirname, '..', '..', 'database.sqlite');
const db = new sqlite3.Database(localDbPath);
db.run('UPDATE users SET password = ? WHERE email = ?', [hash, email], function(err) {
    if (err) {
        console.error('Error updating local DB:', err);
    } else {
        console.log(`Local DB updated. Rows changed: ${this.changes}`);
    }
    db.close();
    
    // 2. Update production database via SSH
    const conn = new Client();
    conn.on('ready', () => {
        console.log('SSH Connection Ready');
        const sql = `UPDATE users SET password = '${hash}' WHERE email = '${email}';`;
        conn.exec(`sqlite3 /var/www/pj-air/database.sqlite "${sql}"`, (err2, stream) => {
            if (err2) throw err2;
            stream.on('close', (code, signal) => {
                console.log(`Production DB updated. Exit code: ${code}`);
                conn.end();
            }).on('data', (data) => {
                console.log('STDOUT: ' + data);
            }).stderr.on('data', (data) => {
                console.log('STDERR: ' + data);
            });
        });
    }).connect(config);
});
