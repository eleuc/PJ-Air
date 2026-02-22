import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// We'll use Database class from better-sqlite3
let Database: any;
try {
  Database = require('better-sqlite3');
} catch {
  console.error('better-sqlite3 not found, installing...');
  process.exit(1);
}

const dbPath = path.resolve(__dirname, '../../backend/data.sqlite');
if (!fs.existsSync(dbPath)) {
  console.error('DB not found at', dbPath);
  process.exit(1);
}

const db = new Database(dbPath);

// Ensure role column exists
try {
  db.exec('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "client"');
  console.log('✅ role column added');
} catch (e: any) {
  console.log('ℹ️  role column already exists');
}

const ADMIN_EMAIL = 'admin@test.com';
const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(ADMIN_EMAIL);

if (!existing) {
  const userId = crypto.randomUUID();
  db.prepare('INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)').run(userId, ADMIN_EMAIL, '123123', 'admin');
  try {
    db.prepare('INSERT INTO profiles (id, full_name, username) VALUES (?, ?, ?)').run(userId, 'Administrador', 'admin');
  } catch (e) {
    console.log('Profile table issue (may use different schema)', e);
  }
  console.log('✅ Admin user created:', ADMIN_EMAIL, '| id:', userId);
} else {
  db.prepare('UPDATE users SET role = ? WHERE email = ?').run('admin', ADMIN_EMAIL);
  console.log('✅ Admin role updated for existing user:', ADMIN_EMAIL);
}

db.close();
console.log('Done!');
