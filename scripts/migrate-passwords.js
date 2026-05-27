const sqlite3 = require('sqlite3').verbose();
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
const db = new sqlite3.Database(dbPath);

// Drop the backup table from database if it exists (cleaning up)
db.run('DROP TABLE IF EXISTS users_password_backup');

const updatePassword = db.prepare('UPDATE users SET password = ? WHERE id = ?');

const backupPath = path.join(path.dirname(dbPath), 'users_password_backup.json');
let backupData = {};
if (fs.existsSync(backupPath)) {
  try {
    backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  } catch {}
}

let count = 0;
db.each('SELECT id, password FROM users', (err, user) => {
  if (err) {
    console.error('Error querying user:', err);
    return;
  }
  const pwd = user.password;
  if (pwd && !/^\$2[aby]\$/.test(pwd)) {
    backupData[user.id] = pwd;
    updatePassword.run(bcrypt.hashSync(pwd, 10), user.id, (err) => {
      if (err) {
        console.error('Error updating password:', err);
      }
    });
    count++;
  }
}, (err) => {
  if (err) {
    console.error('Error iterating users:', err);
    db.close();
    process.exit(1);
  }
  if (count > 0) {
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf8');
    console.log(`Backed up plain-text passwords to: ${backupPath}`);
  }
  db.close();
  console.log(`✅ Migration complete. Successfully migrated ${count} plain-text passwords.`);
});



