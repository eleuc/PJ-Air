const fs = require('fs');
const path = require('path');

let bcrypt;
try {
  bcrypt = require('bcrypt');
} catch {
  try {
    bcrypt = require('../backend/node_modules/bcrypt');
  } catch {
    console.error('bcrypt module not found');
    process.exit(1);
  }
}

let Database;
try {
  Database = require('better-sqlite3');
} catch {
  try {
    Database = require('../node_modules/better-sqlite3');
  } catch {
    try {
      Database = require('../backend/node_modules/better-sqlite3');
    } catch {
      console.error('better-sqlite3 module not found');
      process.exit(1);
    }
  }
}

const possiblePaths = [
  path.join(__dirname, '../database.sqlite'),
  path.join(__dirname, '../../database.sqlite'),
  path.join(__dirname, '../backend/database.sqlite'),
];

let dbPath = possiblePaths.find(p => fs.existsSync(p)) || path.join(__dirname, '../database.sqlite');
console.log(`Using database at: ${dbPath}`);

const db = new Database(dbPath);

// Create backup table
db.exec('CREATE TABLE IF NOT EXISTS users_password_backup (id TEXT PRIMARY KEY, plain_password TEXT)');

const users = db.prepare('SELECT id, password FROM users').all();
let count = 0;

const insertBackup = db.prepare('INSERT OR REPLACE INTO users_password_backup (id, plain_password) VALUES (?, ?)');
const updatePassword = db.prepare('UPDATE users SET password = ? WHERE id = ?');

for (const user of users) {
  if (user.password && !user.password.startsWith('$2b$') && !user.password.startsWith('$2a$') && !user.password.startsWith('$2y$')) {
    // Backup plain text password
    insertBackup.run(user.id, user.password);

    // Hash password
    const hashed = bcrypt.hashSync(user.password, 10);
    updatePassword.run(hashed, user.id);
    count++;
  }
}

db.close();
console.log(`✅ Migration complete. Successfully migrated ${count} plain-text passwords to bcrypt hashes.`);
