const { Client } = require('ssh2');
const sqlite3 = require('sqlite3');
const path = require('path');

const config = {
    host: '187.124.67.53',
    port: 22,
    username: 'root',
    password: 'o7BR&vX+F2;wqYye'
};

const hash = '1cc9c1ddb950f0a7b1b9450a43e31033:4fc101cb815850f4c27f3446a00661fdc92aa104d334ba964fbab87cba16fa269e979e651ba9fe01b005c7532337fb3694f99bbcbd9aaa00ad2f7c66d377f290';
const email = 'rubendarioc@gmail.com';

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
