const http = require('http');

// First get the admin user ID from the DB
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.get('SELECT id FROM users WHERE email = ?', ['admin@test.com'], (err, row) => {
    if (err || !row) { console.error('User not found', err); return; }
    const userId = row.id;
    console.log('Admin user ID:', userId);

    const options = {
        hostname: 'localhost',
        port: 3001,
        path: `/users/${userId}`,
        method: 'GET',
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            const parsed = JSON.parse(data);
            console.log('\nGET /users/:id response:');
            console.log('role:', parsed.role);
            console.log('profile:', JSON.stringify(parsed.profile));
            console.log('\nFull (abbreviated):', JSON.stringify({ id: parsed.id, email: parsed.email, role: parsed.role, profile: parsed.profile }));
        });
    });
    req.on('error', (err) => console.error(err));
    req.end();

    db.close();
});
