const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Check all possible database locations
const paths = [
    './database.sqlite',
    '../database.sqlite',
    './dist/database.sqlite',
];

paths.forEach(p => {
    const fs = require('fs');
    const full = path.resolve(p);
    if (fs.existsSync(full)) {
        const db = new sqlite3.Database(full);
        db.all('SELECT name FROM sqlite_master WHERE type="table"', [], (err, rows) => {
            console.log(full + ':', JSON.stringify(rows.map(r => r.name)));
            db.close();
        });
    } else {
        console.log(full + ': NOT FOUND');
    }
});
