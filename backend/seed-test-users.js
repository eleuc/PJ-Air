const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const db = new sqlite3.Database('C:/Users/USUARIO/Documents/Antigravity/database.sqlite');

const usersToCreate = [
  { email: 'user1@test.com', username: 'user1', role: 'production' },
  { email: 'user2@test.com', username: 'user2', role: 'delivery' },
  { email: 'user3@test.com', username: 'user3', role: 'delivery' }
];

const password = '123132';

db.serialize(() => {
  usersToCreate.forEach(u => {
    const id = uuidv4();
    db.run("INSERT OR IGNORE INTO users (id, email, password, role) VALUES (?, ?, ?, ?)", [id, u.email, password, u.role], function(err) {
      if (err) {
        console.error(`Error creating user ${u.email}:`, err);
      } else if (this.changes > 0) {
        console.log(`User ${u.email} created.`);
        db.run("INSERT INTO profiles (id, full_name, username) VALUES (?, ?, ?)", [id, u.username, u.username], (err2) => {
           if (err2) console.error(`Error creating profile for ${u.email}:`, err2);
           else console.log(`Profile for ${u.username} created.`);
        });
      } else {
        // User might already exist, update password just in case
        db.run("UPDATE users SET password = ? WHERE email = ?", [password, u.email], (err3) => {
            if (err3) console.error(`Error updating password for ${u.email}:`, err3);
            else console.log(`Password for ${u.email} ensured to be ${password}.`);
        });
      }
    });
  });
});

setTimeout(() => db.close(), 2000);
