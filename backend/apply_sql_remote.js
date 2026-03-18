const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = '/var/www/database.sqlite';
const sqlPath = '/tmp/sync_products.sql';

if (!fs.existsSync(sqlPath)) {
    console.error('SQL file not found at ' + sqlPath);
    process.exit(1);
}

const sql = fs.readFileSync(sqlPath, 'utf8');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
});

// SQLite's exec can handle multiple statements
db.exec(sql, (err) => {
    if (err) {
        console.error('Error executing SQL:', err.message);
        db.close();
        process.exit(1);
    }
    console.log('SQL executed successfully. Products table substituted.');
    db.close();
});
