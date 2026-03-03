const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'backend', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Checking database at:', dbPath);

db.serialize(() => {
    db.get('SELECT COUNT(*) as count FROM orders', (err, row) => {
        if (err) {
            console.error('Error fetching orders:', err.message);
        } else {
            console.log('Orders count:', row.count);
        }
    });

    db.all('SELECT DISTINCT delivery_date FROM orders ORDER BY delivery_date DESC LIMIT 5', (err, rows) => {
        if (err) {
            console.error('Error fetching dates:', err.message);
        } else {
            console.log('Recent dates:', rows.map(r => r.delivery_date));
        }
        db.close();
    });
});
