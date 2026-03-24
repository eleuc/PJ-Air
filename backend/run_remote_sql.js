const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
const fs = require('fs');

const sql = fs.readFileSync('update_remote_images.sql', 'utf8');

db.serialize(() => {
    db.exec(sql, (err) => {
        if (err) {
            console.error('Error executing SQL:', err);
            process.exit(1);
        }
        console.log('SQL update executed successfully.');
        db.close();
    });
});
