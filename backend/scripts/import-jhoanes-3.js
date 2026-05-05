const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const productsData = [
    { category: 'Cake Bar', name: 'Passion Fruit Chocolate Cream Cake (6 Portions)', price: 35.00 },
    { category: 'Cake Bar', name: 'Blueberry Mascarpone Delight (6 Portions)', price: 35.00 },
    { category: 'Cake Bar', name: 'Classic Tiramisu Cake bar (6 Portions)', price: 35.00 },
    { category: 'Cake Bar', name: 'Pistachio Tiramisu Cake Bar (6 Portions)', price: 35.00 },
    
    { category: 'Cake Slices', name: 'Mocca Chocolate Mousse Slice', price: 6.00 },
    { category: 'Cake Slices', name: 'Carrot Cake Slice', price: 6.00 },
    { category: 'Cake Slices', name: 'Black Forest Slice', price: 6.00 },
    { category: 'Cake Slices', name: 'White Chocolate Mousse Slice', price: 6.00 },
    { category: 'Cake Slices', name: 'Red Velvet Slice', price: 6.00 },
    { category: 'Cake Slices', name: 'Tiramisu Slice', price: 6.00 },
    { category: 'Cake Slices', name: 'Dulce de Leche Cheesecake Slice', price: 6.00 },
    { category: 'Cake Slices', name: 'Strawberry Shortcake Slice', price: 6.00 },
    
    { category: 'Cheesecakes', name: 'Red Velvet Cheesecake', price: 6.00 },
    { category: 'Cheesecakes', name: 'Blueberry Cheesecake', price: 6.00 },
    { category: 'Cheesecakes', name: 'Apple Cheesecake', price: 6.00 },
    { category: 'Cheesecakes', name: 'Passion Fruit Cheesecake', price: 6.00 },
    { category: 'Cheesecakes', name: 'New York Cheesecake Slice', price: 6.00 },
    { category: 'Cheesecakes', name: 'Mango Cheesecake Slice', price: 6.00 },
    
    { category: 'Croissant', name: 'Artisanal Croissant', price: 2.50 },
    { category: 'Croissant', name: 'Pain au Chocolat', price: 3.25 },
    { category: 'Croissant', name: 'Almond Croissant', price: 3.50 },
    { category: 'Croissant', name: 'Nutella New York Roll', price: 4.50 },
    { category: 'Croissant', name: 'Cookie Croissant', price: 4.95 },
    { category: 'Croissant', name: 'Raspberry Cream Cheese Croissant', price: 4.95 },
    { category: 'Croissant', name: 'Chocolate Mousse Croissant', price: 4.95 },
    { category: 'Croissant', name: 'Lemon Pie Croissant', price: 4.95 },
    { category: 'Croissant', name: 'Pistachio & Raspberry Croissant', price: 4.95 },
    { category: 'Croissant', name: 'Dulce de Leche Croissant', price: 4.95 },
    { category: 'Croissant', name: 'Strawberry Croissant', price: 4.95 },
    { category: 'Croissant', name: 'Dubai Chocolate', price: 4.95 },
    { category: 'Croissant', name: 'Fruit Danish', price: 4.95 },
    
    { category: 'Entremet Dessert', name: 'Emerald Temptation', price: 6.50 },
    { category: 'Entremet Dessert', name: 'Berry Cloud Pavlova', price: 6.50 },
    { category: 'Entremet Dessert', name: 'Tiramisú Cup', price: 6.50 },
    { category: 'Entremet Dessert', name: 'Creamy Dulce Temptation', price: 6.50 },
    { category: 'Entremet Dessert', name: 'Triple Chocolate Mousse', price: 6.50 },
    { category: 'Entremet Dessert', name: 'Tropical Bliss', price: 6.50 },
    { category: 'Entremet Dessert', name: 'Golden Crunch', price: 6.50 },
    { category: 'Entremet Dessert', name: 'Golden Love', price: 6.50 },
    { category: 'Entremet Dessert', name: 'Opera Cake', price: 6.00 },
    
    { category: 'Fruit Desserts', name: 'Zesty Lemon', price: 6.50 },
    { category: 'Fruit Desserts', name: 'Apple Essence', price: 6.50 },
    { category: 'Fruit Desserts', name: 'Pear Harmony', price: 6.50 },
    { category: 'Fruit Desserts', name: 'Blueberry Heart', price: 6.50 },
    { category: 'Fruit Desserts', name: 'Dark Passion', price: 6.50 },
    { category: 'Fruit Desserts', name: 'Caramel Banana Bliss', price: 6.50 },
    { category: 'Fruit Desserts', name: 'Mango Coco Dream', price: 6.50 },
    { category: 'Fruit Desserts', name: 'Raspberry Secret', price: 6.50 },
    { category: 'Fruit Desserts', name: 'Piña Colada Dream', price: 6.50 },
    { category: 'Fruit Desserts', name: 'Mango Tres Leches', price: 6.50 },
    { category: 'Fruit Desserts', name: 'Strawberry Bliss', price: 6.50 },
    
    { category: 'Mini Cakes', name: 'Raspberry Tres Leches', price: 5.50 },
    { category: 'Mini Cakes', name: 'Passion Fruit Tres Leches', price: 5.50 },
    { category: 'Mini Cakes', name: 'Passion Fruit Chocolate Tres Leches', price: 5.50 },
    { category: 'Mini Cakes', name: 'Peach & Strawberry Tres Leches', price: 5.50 },
    { category: 'Mini Cakes', name: 'Strawberry Vanilla Cake', price: 5.50 },
    { category: 'Mini Cakes', name: 'Mango Coconut Ganache Cake', price: 5.50 },
    { category: 'Mini Cakes', name: 'Mango Coconut Mousse Cake', price: 5.50 },
    { category: 'Mini Cakes', name: 'Pistachio Rose Cake', price: 5.50 },
    { category: 'Mini Cakes', name: 'Dubai Chocolate Cake', price: 5.50 },
    { category: 'Mini Cakes', name: 'Dark Chocolate Mousse Cake', price: 5.50 },
    { category: 'Mini Cakes', name: 'Passion Fruit Chocolate Cream Cake', price: 5.50 },
    
    { category: 'Pound Cakes', name: 'Vanilla Butter Pound Cake', price: 3.25 },
    { category: 'Pound Cakes', name: 'Blueberry Butter Pound Cake', price: 3.25 },
    { category: 'Pound Cakes', name: 'Orange Poppy Seed Butter Pound Cake', price: 3.25 },
    { category: 'Pound Cakes', name: 'Coconut Butter Pound Cake', price: 3.25 },
    
    { category: 'Puff Pastry', name: 'Chicken Puff Pastry', price: 3.90 },
    { category: 'Puff Pastry', name: 'Beef Puff Pastry', price: 3.90 },
    { category: 'Puff Pastry', name: 'Cheese Puff Pastry', price: 3.90 },
    
    { category: 'Savory Croissant', name: 'Turkey Ham & Cheese Croissant', price: 4.25 },
    { category: 'Savory Croissant', name: 'Cheese Croissant', price: 4.00 },
    
    { category: 'Sweet Croissant', name: 'Guava & Cream Cheese Croissant', price: 4.95 },
    { category: 'Sweet Croissant', name: 'Banoffee Croissant', price: 4.95 },
    { category: 'Sweet Croissant', name: 'Tiramisu Danish', price: 4.95 },
    { category: 'Sweet Croissant', name: 'Mango Croissant Tart', price: 4.95 },
    { category: 'Sweet Croissant', name: 'Brulee Croissant Tart', price: 4.95 },
    { category: 'Sweet Croissant', name: 'Pain Suisse', price: 4.95 },
    { category: 'Sweet Croissant', name: 'Fruit & Cream Croissant (Braided)', price: 4.25 },
    
    { category: 'Tarta', name: 'Strawberry Tart', price: 6.00 },
    { category: 'Tarta', name: 'Lemon Tart', price: 5.50 },
    { category: 'Tarta', name: 'Raspberry Tart', price: 5.50 },
    { category: 'Tarta', name: 'Chocolate Tart', price: 5.50 },
    { category: 'Tarta', name: 'Fruit Tart', price: 6.00 },
    
    { category: 'Tres Leches', name: 'Classic Tres Leches', price: 4.50 },
];

// Helper for fuzzy image matching
const imagesDir = path.join(__dirname, '..', 'uploads', 'products');
const imageFiles = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : [];

function findImageForProduct(productName) {
    const cleanName = productName.toLowerCase().replace(/[^a-z0-9]/g, '');
    let bestMatch = null;
    let maxSimilarity = 0;

    for (const file of imageFiles) {
        const cleanFile = file.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/png$|jpg$|jpeg$|webp$/, '');
        if (cleanName.includes(cleanFile) || cleanFile.includes(cleanName)) {
            const similarity = Math.min(cleanName.length, cleanFile.length) / Math.max(cleanName.length, cleanFile.length);
            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
                bestMatch = file;
            }
        }
    }
    return bestMatch ? `/uploads/products/${bestMatch}` : null;
}

async function run() {
    console.log('Starting import...');
    
    for (const prod of productsData) {
        const image = findImageForProduct(prod.name);
        
        await new Promise((resolve, reject) => {
            db.get('SELECT id FROM products WHERE name = ?', [prod.name], (err, row) => {
                if (err) return reject(err);
                
                if (row) {
                    // Update
                    db.run('UPDATE products SET price = ?, category = ?, category_en = ? WHERE id = ?', 
                        [prod.price, prod.category, prod.category, row.id], (err) => {
                        if (err) reject(err);
                        else {
                            console.log(`Updated: ${prod.name} -> $${prod.price}`);
                            resolve();
                        }
                    });
                } else {
                    // Insert
                    db.run('INSERT INTO products (name, price, category, category_en, description, image) VALUES (?, ?, ?, ?, ?, ?)', 
                        [prod.name, prod.price, prod.category, prod.category, '', image || ''], (err) => {
                        if (err) reject(err);
                        else {
                            console.log(`Inserted: ${prod.name} ($${prod.price})`);
                            resolve();
                        }
                    });
                }
            });
        });
    }

    db.close(() => {
        console.log('Import finished.');
    });
}

run().catch(console.error);
