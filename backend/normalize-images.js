const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
const path = require('path');

db.serialize(() => {
    // 1. Convert legacy paths
    db.run("UPDATE products SET image = REPLACE(image, '/images/products/', '/uploads/products/') WHERE image LIKE '/images/products/%'", function(err) {
        if (err) console.error('Error in conversion:', err);
        else console.log('Normalized legacy paths:', this.changes);
    });

    // 2. Set placeholders for empty paths
    db.run("UPDATE products SET image = '/uploads/products/placeholder.jpg' WHERE image = '' OR image IS NULL", function(err) {
        if (err) console.error('Error in placeholder update:', err);
        else console.log('Updated empty paths with placeholders:', this.changes);
    });

    // 3. Log the current states
    db.all('SELECT id, name, image FROM products', (err, rows) => {
        if (err) console.error('Error in selection:', err);
        else {
            const fs = require('fs');
            fs.writeFileSync('normalized_products.json', JSON.stringify(rows, null, 2));
            console.log('Database snapshot saved to normalized_products.json');
        }
        db.close();
    });
});
