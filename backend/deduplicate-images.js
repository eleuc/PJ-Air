const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const uploadsDir = path.join(__dirname, 'uploads', 'products');

function getHash(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

db.all('SELECT id, name, image FROM products', (err, rows) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    const hashes = new Map(); // hash -> masterFileName
    const updates = [];

    rows.forEach(row => {
        if (!row.image || !row.image.startsWith('/uploads/products/')) return;
        
        const fileName = row.image.replace('/uploads/products/', '');
        const filePath = path.join(uploadsDir, fileName);
        const hash = getHash(filePath);

        if (!hash) return;

        if (hashes.has(hash)) {
            const masterFileName = hashes.get(hash);
            if (masterFileName !== fileName) {
                updates.push({ id: row.id, newImage: `/uploads/products/${masterFileName}`, oldPath: filePath });
            }
        } else {
            hashes.set(hash, fileName);
        }
    });

    if (updates.length === 0) {
        console.log('No duplicates found.');
        db.close();
        return;
    }

    db.serialize(() => {
        const stmt = db.prepare("UPDATE products SET image = ? WHERE id = ?");
        updates.forEach(update => {
            stmt.run(update.newImage, update.id, (err) => {
                if (err) console.error(`Error updating ID ${update.id}:`, err);
                else {
                    console.log(`Updated ID ${update.id} to use ${update.newImage}`);
                    if (fs.existsSync(update.oldPath)) {
                        fs.unlinkSync(update.oldPath);
                        console.log(`Deleted duplicate file: ${update.oldPath}`);
                    }
                }
            });
        });
        stmt.finalize(() => {
            console.log(`Finished deduplication. Updated ${updates.length} records.`);
            db.close();
        });
    });
});
