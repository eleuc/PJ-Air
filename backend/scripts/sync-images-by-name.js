const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const imagesDir = path.join(__dirname, '..', 'uploads', 'products');
const imageFiles = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : [];

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

function findBestMatch(productName) {
    const slugName = slugify(productName);
    const cleanName = productName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    let bestMatch = null;
    let maxScore = 0;

    for (const file of imageFiles) {
        const fileName = file.toLowerCase().replace(/\.[^/.]+$/, ""); // remove extension
        const slugFile = slugify(fileName);
        const cleanFile = fileName.replace(/[^a-z0-9]/g, '');

        let score = 0;
        
        // Exact slug match
        if (slugName === slugFile) score += 100;
        
        // Product name contains file name or vice versa
        if (cleanName.includes(cleanFile)) score += 50;
        if (cleanFile.includes(cleanName)) score += 50;

        // Common word matches
        const productWords = slugName.split('-');
        const fileWords = slugFile.split('-');
        const commonWords = productWords.filter(w => fileWords.includes(w) && w.length > 2);
        score += commonWords.length * 10;

        if (score > maxScore) {
            maxScore = score;
            bestMatch = file;
        }
    }

    // Minimum threshold for a match
    return maxScore > 20 ? `/uploads/products/${bestMatch}` : null;
}

async function run() {
    console.log(`Syncing images for products using ${imageFiles.length} files...`);
    
    db.all('SELECT id, name, image FROM products', async (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }

        let updatedCount = 0;
        let skippedCount = 0;

        for (const row of rows) {
            const bestImage = findBestMatch(row.name);
            
            if (bestImage && bestImage !== row.image) {
                await new Promise((resolve) => {
                    db.run('UPDATE products SET image = ? WHERE id = ?', [bestImage, row.id], (err) => {
                        if (err) console.error(`Error updating ${row.name}:`, err);
                        else {
                            console.log(`Linked: ${row.name} -> ${bestImage}`);
                            updatedCount++;
                        }
                        resolve();
                    });
                });
            } else {
                skippedCount++;
            }
        }

        console.log(`\nSync finished!`);
        console.log(`Updated: ${updatedCount}`);
        console.log(`Skipped/No change: ${skippedCount}`);
        db.close();
    });
}

run().catch(console.error);
