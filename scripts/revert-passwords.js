const fs = require('fs');
const path = require('path');

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

try {
  const backups = db.prepare('SELECT id, plain_password FROM users_password_backup').all();
  const updatePassword = db.prepare('UPDATE users SET password = ? WHERE id = ?');
  let count = 0;

  for (const backup of backups) {
    if (backup.plain_password) {
      updatePassword.run(backup.plain_password, backup.id);
      count++;
    }
  }

  console.log(`✅ Revert complete. Successfully restored ${count} plain-text passwords.`);
} catch (e) {
  console.error('Error during revert (backup table may not exist or is empty):', e.message);
} finally {
  db.close();
}
