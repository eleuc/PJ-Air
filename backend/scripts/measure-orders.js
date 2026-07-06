const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../database.sqlite');

console.time('Direct SQLite Query with JOINs');
db.all(`
    SELECT o.*, u.email, p.full_name, p.nickname, oi.quantity, oi.price_at_time, pr.name as product_name
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN profiles p ON u.id = p.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products pr ON oi.product_id = pr.id
    ORDER BY o.created_at DESC
`, (err, rows) => {
    if (err) console.error(err);
    console.timeEnd('Direct SQLite Query with JOINs');
    console.log(`Retrieved ${rows.length} rows`);
    db.close();
});
