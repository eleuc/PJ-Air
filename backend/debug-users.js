const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('C:/Users/USUARIO/Documents/Antigravity/database.sqlite');

db.all("SELECT u.id, u.email, u.password, u.role, p.username FROM users u LEFT JOIN profiles p ON u.id = p.id WHERE p.username IN ('user1', 'user2', 'user3') OR u.email IN ('user1@test.com', 'user2@test.com', 'user3@test.com')", (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Debug Users:", JSON.stringify(rows, null, 2));
  db.close();
});
