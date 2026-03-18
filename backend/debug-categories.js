const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
db.all('SELECT * FROM products', (err, rows) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    const found = rows.filter(r => {
        return Object.values(r).some(v => String(v).toLowerCase().includes('undefined'));
    });
    console.log('--- FOUND ---');
    console.log(JSON.stringify(found, null, 2));
    console.log('--- ALL CATEGORIES ---');
    const cats = [...new Set(rows.map(r => r.category))];
    console.log(JSON.stringify(cats));
    db.close();
});
