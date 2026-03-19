const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const csv = require('csv-parser');

const CSV_PATH = path.join(__dirname, '../../recursos/2-BDD_Jhoanes2.csv');
const IMAGES_SRC = path.join(__dirname, '../../recursos/slices');
const IMAGES_DEST = path.join(__dirname, '../uploads/products');
const DB_PATHS = [
    path.join(__dirname, '../database.sqlite'),
    path.join(__dirname, '../../database.sqlite')
];

// Mapeo manual de imágenes basado en los nombres de archivo disponibles
const imageMapping = {
    'Mocca Chocolate Mousse Slice': 'Mocca Chocolate.jpg',
    'Carrot Cake Slice': 'carrot_p.jpg',
    'Black Forest Slice': 'BlackForest_p.jpg',
    'White Chocolate Mousse Slice': 'White Chocolat.jpg',
    'Red Velvet': 'red_velvet_p.jpg',
    'New York Cheesecake Slices': 'NewYork_p.jpg',
    'Mango Cheesecake Slice': 'Mango Cheesecake.jpg',
    'Tiramisu Slice': 'Tiramisu.jpg',
    'Dulce de Leche Cheesecake Slice': 'Dulce de Leche.jpg',
    'Strawberry Shortcake Slice': 'Strawberry.jpg',
    'Strawberry Croissant': 'Strawberry.jpg',
    'Dulce de Leche': 'Dulce de Leche.jpg',
    'Tiramisú': 'Tiramisu.jpg'
};

async function importProducts() {
    console.log('Iniciando importación...');

    // 1. Asegurar carpeta de imágenes
    if (!fs.existsSync(IMAGES_DEST)) {
        fs.mkdirSync(IMAGES_DEST, { recursive: true });
    }

    // 2. Copiar imágenes de recursos/slices a uploads/products
    if (fs.existsSync(IMAGES_SRC)) {
        const files = fs.readdirSync(IMAGES_SRC);
        files.forEach(file => {
            fs.copyFileSync(path.join(IMAGES_SRC, file), path.join(IMAGES_DEST, file));
        });
        console.log(`Copiadas ${files.length} imágenes.`);
    }

    const products = [];

    // 3. Leer CSV
    await new Promise((resolve, reject) => {
        fs.createReadStream(CSV_PATH)
            .pipe(csv())
            .on('data', (row) => {
                // Limpiar nombre para el mapeo (quitar "x10", etc)
                const cleanName = row.name.replace(/ x10| \(Cold\)/g, '').trim();
                const imageFile = imageMapping[cleanName] || row.image || '';

                products.push({
                    name: row.name,
                    description: row.description || row['descripción corta'] || '',
                    price: parseFloat(row.precio) || 0,
                    category: row['categoría'] || 'General',
                    image: imageFile ? `/uploads/products/${imageFile}` : ''
                });
            })
            .on('end', resolve)
            .on('error', reject);
    });

    console.log(`Leídos ${products.length} productos del CSV.`);

    // 4. Insertar en las bases de datos
    for (const dbPath of DB_PATHS) {
        if (!fs.existsSync(dbPath)) {
            console.warn(`Base de datos no encontrada: ${dbPath}`);
            continue;
        }

        const db = new sqlite3.Database(dbPath);

        db.serialize(() => {
            // Limpiar tabla
            db.run('DELETE FROM products');
            
            const stmt = db.prepare('INSERT INTO products (name, category, price, description, image) VALUES (?, ?, ?, ?, ?)');
            
            products.forEach(p => {
                stmt.run(p.name, p.category, p.price, p.description, p.image);
            });

            stmt.finalize();
            console.log(`Importados exitosamente en ${dbPath}`);
        });

        db.close();
    }
}

importProducts().catch(err => {
    console.error('Error durante la importación:', err);
    process.exit(1);
});
