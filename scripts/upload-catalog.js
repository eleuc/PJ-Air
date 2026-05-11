const fs = require('fs');
const path = require('path');

const { API_BASE, envName, getHeaders } = require('./config-loader');

console.log(`====================================================`);
console.log(`   CARGA DE CATÁLOGO DESDE CSV (Entorno: ${envName})`);
console.log(`   API URL: ${API_BASE}`);
console.log(`====================================================\n`);

// 1. Obtener la ruta del archivo CSV de los argumentos (el primero que no empiece con "-")
const args = process.argv.slice(2);
let csvPath = null;
for (const arg of args) {
    if (!arg.startsWith('-')) {
        csvPath = arg;
        break;
    }
}

if (!csvPath) {
    console.error('❌ Error: No se especificó el archivo CSV de catálogo.');
    console.error('Uso: node scripts/upload-catalog.js <ruta_al_archivo_csv>');
    process.exit(1);
}

const resolvedCsvPath = path.resolve(csvPath);
if (!fs.existsSync(resolvedCsvPath)) {
    console.error(`❌ Error: El archivo CSV no existe en la ruta especificada: ${resolvedCsvPath}`);
    process.exit(1);
}

const csvDir = path.dirname(resolvedCsvPath);

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.png') return 'image/png';
    if (ext === '.webp') return 'image/webp';
    return 'image/jpeg';
}

function escapeCsvField(val) {
    if (val === undefined || val === null) return '""';
    const str = val.toString();
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
}

async function uploadImage(imageName, imagePath) {
    const formData = new FormData();
    const mimeType = getMimeType(imagePath);
    const blob = new Blob([fs.readFileSync(imagePath)], { type: mimeType });
    formData.append('file', blob, imageName);

    const res = await fetch(`${API_BASE}/products/upload-image`, {
        method: 'POST',
        headers: getHeaders(),
        body: formData
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    return data.url;
}

async function run() {
    try {
        console.log(`Paso 1: Leyendo y analizando el archivo CSV...`);
        const csvContent = fs.readFileSync(resolvedCsvPath, 'utf8');
        const lines = csvContent.split(/\r?\n/).filter(l => l.trim());
        
        if (lines.length <= 1) {
            throw new Error('El archivo CSV está vacío o solo contiene la cabecera.');
        }

        // Parsear líneas del CSV
        const parsedRows = [];
        const uniqueImagePaths = new Set();

        for (let i = 1; i < lines.length; i++) {
            const cols = [];
            let current = '', inQuotes = false;
            for (let j = 0; j < lines[i].length; j++) {
                const char = lines[i][j];
                if (char === '"') {
                    if (inQuotes && lines[i][j + 1] === '"') {
                        current += '"';
                        j++; // saltar siguiente comilla
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    cols.push(current);
                    current = '';
                } else {
                    current += char;
                }
            }
            cols.push(current);

            // Columnas según catalog-DATE.csv:
            // Name,Category,Price,Page,X,Y,Font,Size,Image,Description
            const name = cols[0] || '';
            const category = cols[1] || '';
            const price = parseFloat(cols[2]) || 0;
            const imagePath = cols[8] || '';
            const desc = cols[9] || '';

            if (!name) continue;

            parsedRows.push({ name, category, price, imagePath, desc });

            if (imagePath) {
                uniqueImagePaths.add(imagePath);
            }
        }

        console.log(`   Encontrados ${parsedRows.length} productos en el catálogo.`);
        console.log(`   Identificadas ${uniqueImagePaths.size} imágenes únicas.`);

        console.log('\nPaso 2: Subiendo imágenes referenciadas en el catálogo...');
        const uploadedImagesMap = {};
        for (const imgPath of uniqueImagePaths) {
            const absPath = path.resolve(csvDir, imgPath);
            if (!fs.existsSync(absPath)) {
                console.log(`   ⚠️ Imagen no encontrada localmente, se omitirá: ${imgPath}`);
                continue;
            }

            try {
                const imageName = path.basename(imgPath);
                const serverUrl = await uploadImage(imageName, absPath);
                uploadedImagesMap[imgPath] = serverUrl;
                console.log(`   ✅ ${imageName} ➡️ ${serverUrl}`);
            } catch (err) {
                console.log(`   ❌ Error subiendo ${imgPath}: ${err.message}`);
            }
        }

        console.log('\nPaso 3: Construyendo el catálogo mapeado para la API...');
        const outputLines = ['name,price,category,description,image'];

        for (const row of parsedRows) {
            const imageUrl = row.imagePath ? (uploadedImagesMap[row.imagePath] || '') : '';
            outputLines.push(
                `${escapeCsvField(row.name)},${row.price},${escapeCsvField(row.category)},${escapeCsvField(row.desc)},${escapeCsvField(imageUrl)}`
            );
        }

        console.log('\nPaso 4: Enviando catálogo a la API...');
        const csvFormData = new FormData();
        csvFormData.append('files', new Blob([outputLines.join('\n')], { type: 'text/csv' }), 'catalog.csv');

        const csvResponse = await fetch(`${API_BASE}/products/upload`, {
            method: 'POST',
            headers: getHeaders(),
            body: csvFormData
        });

        if (!csvResponse.ok) throw new Error(`API respondió con estado ${csvResponse.status}`);
        const resData = await csvResponse.json();

        console.log('\n====================================================');
        console.log(`   🎉 ¡CARGA DE CATÁLOGO FINALIZADA EXITOSAMENTE!`);
        console.log(`   Mensaje: ${resData.message || 'Catálogo actualizado.'}`);
        console.log(`====================================================`);

    } catch (error) {
        console.error('\n❌ ERROR DURANTE LA CARGA:', error.message);
        process.exit(1);
    }
}

run();
