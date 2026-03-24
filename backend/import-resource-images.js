const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'uploads', 'products');
const fotosSrc = path.join(__dirname, '..', 'tmp_fotos', 'fotos');
const slicesSrc = path.join(__dirname, '..', 'recursos', 'slices');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// 1. Map for Slices (File in slices folder -> Product Name substring)
const sliceMap = {
    'BlackForest_p.jpg': 'Black Forest',
    'Dulce de Leche.jpg': 'Dulce de Leche Cheesecake',
    'Mango Cheesecake.jpg': 'Mango Cheesecake',
    'Mocca Chocolate.jpg': 'Mocca Chocolate',
    'NewYork_p.jpg': 'New York Cheesecake',
    'Strawberry.jpg': 'Strawberry Shortcake',
    'Tiramisu.jpg': 'Tiramisu Slice',
    'White Chocolat.jpg': 'White Chocolate Mousse',
    'carrot_p.jpg': 'Carrot Cake',
    'red_velvet_p.jpg': 'Red Velvet'
};

db.serialize(() => {
    db.all('SELECT id, name, image FROM products', (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }

        const updates = [];

        // Function to copy and track update
        const prepareUpdate = (productId, srcPath, destFileName) => {
            const destPath = path.join(targetDir, destFileName);
            fs.copyFileSync(srcPath, destPath);
            updates.push({ id: productId, image: `/uploads/products/${destFileName}` });
            console.log(`Matched ID ${productId} (${rows.find(r => r.id === productId).name}) -> ${destFileName}`);
        };

        // Process Slices first
        const sliceFiles = fs.readdirSync(slicesSrc);
        sliceFiles.forEach(file => {
            if (sliceMap[file]) {
                const targetProduct = rows.find(r => r.name.includes(sliceMap[file]));
                if (targetProduct) {
                    // Use a unique name for slices to avoid collision with base products
                    const ext = path.extname(file);
                    const base = path.basename(file, ext);
                    const newName = `${base}_p${ext}`; 
                    prepareUpdate(targetProduct.id, path.join(slicesSrc, file), newName);
                }
            }
        });

        // Process Base Fotos
        const fotoFiles = fs.readdirSync(fotosSrc);
        fotoFiles.forEach(file => {
            const ext = path.extname(file);
            const nameWithoutExt = path.basename(file, ext);
            
            // Try to find a product that matches the filename or is part of it
            const targetProduct = rows.find(r => 
                r.name.toLowerCase() === nameWithoutExt.toLowerCase() ||
                (r.name.toLowerCase().includes(nameWithoutExt.toLowerCase()) && !updates.find(u => u.id === r.id))
            );

            if (targetProduct && !updates.find(u => u.id === targetProduct.id)) {
                prepareUpdate(targetProduct.id, path.join(fotosSrc, file), file);
            }
        });

        // Apply updates to DB
        if (updates.length > 0) {
            const stmt = db.prepare("UPDATE products SET image = ? WHERE id = ?");
            updates.forEach(u => {
                stmt.run(u.image, u.id);
            });
            stmt.finalize(() => {
                console.log(`Successfully updated ${updates.length} products.`);
                db.close();
            });
        } else {
            console.log('No matches found.');
            db.close();
        }
    });
});
