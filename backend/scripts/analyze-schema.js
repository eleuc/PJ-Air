const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.remote.prod.bak');

db.serialize(() => {
    // 1. Get all tables
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log("=== TABLES IN DATABASE ===");
        console.log(tables.map(t => t.name).join(', '));
        console.log("\n");

        // 2. Get details for each table
        let count = 0;
        tables.forEach(table => {
            db.all(`PRAGMA table_info(${table.name})`, (err, columns) => {
                db.get(`SELECT COUNT(*) as cnt FROM ${table.name}`, (err, countRow) => {
                    console.log(`Table: ${table.name} (${countRow ? countRow.cnt : 0} rows)`);
                    console.log(columns.map(c => `  - ${c.name} (${c.type})${c.pk ? ' PK' : ''}`).join('\n'));
                    console.log("\n");
                    
                    count++;
                    if (count === tables.length) {
                        db.close();
                    }
                });
            });
        });
    });
});
