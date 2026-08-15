const sqlite3 = require('../backend/node_modules/sqlite3').verbose();
const crypto = require('crypto');

const dbPath = process.argv[2] || '/var/www/pj-air-testing/database-testing.sqlite';
const email = process.argv[3] || 'e2e-user@jhoanes.com';
const password = process.argv[4] || 'Sebas1007.';
const role = process.argv[5] || 'client';

const db = new sqlite3.Database(dbPath);

const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
const storedPassword = `${salt}:${hash}`;

db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
  if (err) {
    console.error('Error querying user:', err);
    process.exit(1);
  }

  if (row) {
    db.run('UPDATE users SET password = ?, role = ? WHERE id = ?', [storedPassword, role, row.id], function(updateErr) {
      if (updateErr) console.error('Error updating user:', updateErr);
      else console.log(`User ${email} updated successfully (role: ${role}).`);
      db.close();
    });
  } else {
    const uid = crypto.randomUUID();
    db.run('INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)', [uid, email, storedPassword, role], function(insertErr) {
      if (insertErr) {
        console.error('Error inserting user:', insertErr);
        db.close();
        process.exit(1);
      }
      db.run('INSERT OR REPLACE INTO profiles (id, full_name, username) VALUES (?, ?, ?)', [uid, role === 'admin' ? 'System Admin' : 'E2E Test User', email.split('@')[0]], function(profErr) {
        if (profErr) console.error('Error inserting profile:', profErr);
        else console.log(`Created user ${email} (${uid}) with role: ${role}`);
        db.close();
      });
    });
  }
});
