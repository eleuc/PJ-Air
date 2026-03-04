const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('C:/Users/USUARIO/Documents/Antigravity/database.sqlite');

db.all("SELECT role, COUNT(*) as count FROM users GROUP BY role", (err, roles) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Roles usage:", roles);
  
  db.all("SELECT username FROM profiles", (err, usernames) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("All usernames:", usernames);
    db.close();
  });
});






