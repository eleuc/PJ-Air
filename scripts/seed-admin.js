const Database = require('./backend/node_modules/better-sqlite3');
const crypto = require('crypto');

const db = new Database('./backend/database.sqlite');

try {
    db.exec('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "client"');
    console.log('role column added');
} catch (e) {
    console.log('role column exists');
}

const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@test.com');
if (existing) {
    db.prepare('UPDATE users SET role = ? WHERE email = ?').run('admin', 'admin@test.com');
    console.log('Admin role updated for user:', existing.id);
} else {
    const uid = crypto.randomUUID();
    db.prepare('INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)').run(uid, 'admin@test.com', '123123', 'admin');
    try {
        db.prepare('INSERT INTO profiles (id, full_name, username) VALUES (?, ?, ?)').run(uid, 'Administrador', 'admin');
    } catch (e) {
        console.log('profile note:', e.message);
    }
    console.log('Admin user created:', uid);
}

db.close();
console.log('Done!');
