const fs = require('fs');
const products = JSON.parse(fs.readFileSync('final_import_check.json', 'utf8'));

let sql = '';
products.forEach(p => {
    if (p.image) {
        // Double single-quotes for SQL escaping
        const escapedImage = p.image.replace(/'/g, "''");
        sql += `UPDATE products SET image = '${escapedImage}' WHERE id = ${p.id};\n`;
    }
});

fs.writeFileSync('update_remote_images.sql', sql);
console.log('Generated update_remote_images.sql');
