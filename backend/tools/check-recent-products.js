const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const checkDB = (dbPath) => {
    const db = new sqlite3.Database(dbPath);
    console.log(`--- Checking ${dbPath} ---`);
    db.all("SELECT id, name, category FROM products ORDER BY id DESC LIMIT 10", (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Recent Products:', rows);
        }
    });
    setTimeout(() => db.close(), 2000);
};

checkDB(path.join(__dirname, '../database.sqlite'));
checkDB(path.join(__dirname, '../../database.sqlite'));
