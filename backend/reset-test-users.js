const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const db = new sqlite3.Database('C:/Users/USUARIO/Documents/Antigravity/database.sqlite');

const usersToCreate = [
  { email: 'user1@test.com', username: 'user1', role: 'production' },
  { email: 'user2@test.com', username: 'user2', role: 'delivery' },
  { email: 'user3@test.com', username: 'user3', role: 'delivery' }
];

const password = '123'; // Probemos con una mas simple por si acaso

db.serialize(() => {
  // Limpiar perfiles y usuarios existentes para estas cuentas
  db.run("DELETE FROM profiles WHERE username IN ('user1', 'user2', 'user3')");
  db.run("DELETE FROM users WHERE email IN ('user1@test.com', 'user2@test.com', 'user3@test.com')");

  usersToCreate.forEach(u => {
    const id = uuidv4();
    db.run("INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)", [id, u.email, password, u.role], function(err) {
      if (err) {
        console.error(`Error creating user ${u.email}:`, err);
      } else {
        console.log(`User ${u.email} created with password ${password}`);
        db.run("INSERT INTO profiles (id, full_name, username) VALUES (?, ?, ?)", [id, u.username, u.username], (err2) => {
           if (err2) console.error(`Error creating profile for ${u.email}:`, err2);
           else console.log(`Profile for ${u.username} created.`);
        });
      }
    });
  });
});

setTimeout(() => db.close(), 2000);
