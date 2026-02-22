const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) { console.error('DB open error:', err.message); return; }
    db.all('SELECT name FROM sqlite_master WHERE type="table"', [], (err, rows) => {
        console.log('Tables:', JSON.stringify(rows));
        db.all('PRAGMA table_info("order_item")', [], (e2, cols) => {
            console.log('order_item:', JSON.stringify(cols));
            db.all('PRAGMA table_info("order")', [], (e3, ocols) => {
                console.log('order:', JSON.stringify(ocols));
                db.close();
            });
        });
    });
});
