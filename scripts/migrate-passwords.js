const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const bcrypt = (() => {
  try { return require('bcryptjs'); } catch {
    return require('../backend/node_modules/bcryptjs');
  }
})();
const dbPath = process.argv[2];
if (!dbPath) {
  console.error('Error: Please provide the database filename as an argument.\nUsage: node scripts/migrate-passwords.js <database-file>');
  process.exit(1);
}

if (!fs.existsSync(dbPath)) {
  console.error(`Error: Database file not found at: ${dbPath}`);
  process.exit(1);
}

console.log(`Using database at: ${dbPath}`);
const db = new DatabaseSync(dbPath);

// Drop the backup table from database if it exists (cleaning up)
db.exec('DROP TABLE IF EXISTS users_password_backup');

const updatePassword = db.prepare('UPDATE users SET password = ? WHERE id = ?');

const backupPath = path.join(path.dirname(dbPath), 'users_password_backup.json');
let backupData = {};
if (fs.existsSync(backupPath)) {
  try {
    backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  } catch {}
}

let count = 0;
for (const user of db.prepare('SELECT id, password FROM users').all()) {
  const pwd = user.password;
  if (pwd && !/^\$2[aby]\$/.test(pwd)) {
    backupData[user.id] = pwd;
    updatePassword.run(bcrypt.hashSync(pwd, 10), user.id);
    count++;
  }
}

if (count > 0) {
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf8');
  console.log(`Backed up plain-text passwords to: ${backupPath}`);
}

db.close();
console.log(`✅ Migration complete. Successfully migrated ${count} plain-text passwords.`);

