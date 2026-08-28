const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    console.log('Connected to remote');
    conn.exec('sqlite3 /var/www/pj-air-testing/database-testing.sqlite "SELECT count(*) FROM users; SELECT count(*) FROM products; SELECT count(*) FROM orders;"', (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => {
            console.log('REMOTE OUT: ' + data);
        }).stderr.on('data', (data) => {
            console.log('REMOTE ERR: ' + data);
        });
    });
}).connect({
    host: '187.124.67.53',
    port: 22,
    username: 'root',
    password: 'o7BR&vX+F2;wqYye'
});
