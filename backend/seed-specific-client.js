const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const db = new sqlite3.Database('C:/Users/USUARIO/Documents/Antigravity/database.sqlite');

const email = 'client@test.com';
const password = '123132';
const username = 'client_test';
const fullName = 'Cliente Prueba';

db.serialize(() => {
  db.run("DELETE FROM profiles WHERE username = ?", [username]);
  db.run("DELETE FROM users WHERE email = ?", [email]);

  const id = uuidv4();
  db.run("INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)", [id, email, password, 'client'], function(err) {
    if (err) {
      console.error(`Error creating user ${email}:`, err);
    } else {
      console.log(`User ${email} created with password ${password}`);
      db.run("INSERT INTO profiles (id, full_name, username) VALUES (?, ?, ?)", [id, fullName, username], (err2) => {
         if (err2) console.error(`Error creating profile for ${email}:`, err2);
         else console.log(`Profile for ${username} created.`);
      });
    }
  });
});

setTimeout(() => db.close(), 2000);
