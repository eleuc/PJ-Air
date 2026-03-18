const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all('SELECT * FROM products', [], (err, rows) => {
  if (err) {
    console.error('Error reading local products:', err.message);
    process.exit(1);
  }

  let sql = 'BEGIN TRANSACTION;\nDELETE FROM products;\n';

  rows.forEach(row => {
    const columns = Object.keys(row);
    const values = Object.values(row).map(val => {
      if (val === null) return 'NULL';
      if (typeof val === 'string') return "'" + val.replace(/'/g, "''") + "'";
      return val;
    });
    sql += `INSERT INTO products (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
  });

  sql += 'COMMIT;\n';

  fs.writeFileSync(path.join(__dirname, 'sync_products.sql'), sql);
  console.log(`Generated sync_products.sql with ${rows.length} products.`);
  db.close();
});
