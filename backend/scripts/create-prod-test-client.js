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
    
    // Create a brand new test client in production
    // PBKDF2 hash for Jhoanes2026*
    const hash = 'a1b2c3d4e5f60718293a4b5c6d7e8f90:5469b6264ff3f3a1f73ad82a172778641eb93a8d1df00ab3e098495db6a760b24dc65ec8d87455edcc211324caafad33433e144a991f86026a0dcbdce22c83c2';
    
    const sql = `INSERT OR IGNORE INTO users (id, email, password, role) VALUES ('test-client-999', 'client-test@jhoanes.com', '${hash}', 'client');`;
    const sqlProfile = `INSERT OR IGNORE INTO profiles (id, full_name) VALUES ('test-client-999', 'Test Client Production');`;
    
    conn.exec(`sqlite3 /var/www/pj-air/database.sqlite "${sql}" && sqlite3 /var/www/pj-air/database.sqlite "${sqlProfile}"`, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log('Test client created:', code);
            conn.end();
        }).on('data', (data) => {
            console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
        });
    });
}).connect(config);
