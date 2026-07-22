const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all("SELECT id, status, total, payment_gateway FROM orders ORDER BY created_at DESC LIMIT 1", (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Last Order:', rows);
    }
    db.close();
});
