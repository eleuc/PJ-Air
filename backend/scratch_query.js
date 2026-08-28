const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbFiles = [
    path.join(__dirname, 'database.sqlite'),
    path.join(__dirname, '../database.sqlite'),
    path.join(__dirname, 'database.test.sqlite')
];

dbFiles.forEach(dbPath => {
    if (!fs.existsSync(dbPath)) return;
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) return;
    });

    db.serialize(() => {
        db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
            if (err || !tables) return;
            const names = tables.map(t => t.name);
            if (names.includes('users')) {
                db.all("SELECT * FROM users", [], (err, rows) => {
                    if (err) {
                        console.error(`Error querying users in ${dbPath}:`, err.message);
                    } else {
                        console.log(`=== Users in ${dbPath} ===`);
                        console.log(rows.map(r => ({ id: r.id, email: r.email, role: r.role, password: r.password })));
                    }
                });
            }
        });
    });
});
