const sqlite3 = require('/var/www/pj-air-testing/backend/node_modules/sqlite3').verbose();
const crypto = require('crypto');

const dbPath = process.argv[2] || '/var/www/pj-air-testing/database-testing.sqlite';
const email = process.argv[3] || 'rubendarioc@gmail.com';
const password = process.argv[4] || 'Sebas1007.';

const db = new sqlite3.Database(dbPath);

const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
const stored = `${salt}:${hash}`;

db.run('UPDATE users SET password = ? WHERE email = ?', [stored, email], function(err) {
  if (err) {
    console.error('Error updating password:', err.message);
    process.exit(1);
  }
  console.log(`Password successfully updated for ${email} (${this.changes} rows updated)`);
  db.close();
});
