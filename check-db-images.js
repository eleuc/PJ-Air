const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'backend/database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all("SELECT name, image FROM products LIMIT 10", (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.table(rows);
    }
    db.close();
});
