const { Client } = require('ssh2');
const sqlite3 = require('sqlite3');
const path = require('path');

const config = {
    host: '187.124.67.53',
    port: 22,
    username: 'root',
    password: 'o7BR&vX+F2;wqYye'
};

const hash = '48ae6416d371909799a1c206d58724b5:6017e8f8b7ce9ce2ffe2830418ed0312ceb6cc40e01138c1f1cc40842e98a870625873dc32042963669da7f18d77ad8a33ae7b25e034d7b196b4b03c1a0de0b7';
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
