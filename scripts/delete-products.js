const { API_BASE, envName, getHeaders } = require('./config-loader');

console.log(`====================================================`);
console.log(`   ELIMINACIÓN DE PRODUCTOS (Entorno: ${envName})`);
console.log(`   API URL: ${API_BASE}`);
console.log(`====================================================\n`);

async function run() {
    try {
        console.log('Paso 1: Obteniendo productos actuales de la API...');
        const res = await fetch(`${API_BASE}/products`, {
            headers: getHeaders()
        });

        if (!res.ok) {
            throw new Error(`Error obteniendo productos: Status ${res.status}`);
        }

        const products = await res.json();
        console.log(`   Se encontraron ${products.length} productos en el catálogo.\n`);

        if (products.length === 0) {
            console.log(`====================================================`);
            console.log(`   ℹ️ El catálogo ya está vacío. No hay productos que eliminar.`);
            console.log(`====================================================`);
            return;
        }

        console.log('Paso 2: Eliminando productos individualmente...');
        let deletedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const indexStr = `[${i + 1}/${products.length}]`;
            try {
                const delRes = await fetch(`${API_BASE}/products/${product.id}`, {
                    method: 'DELETE',
                    headers: getHeaders()
                });

                if (!delRes.ok) {
                    throw new Error(`Status ${delRes.status}`);
                }

                deletedCount++;
                console.log(`   ${indexStr} Eliminando: ${product.name} (ID: ${product.id}) ➡️ ✅ Eliminado`);
            } catch (err) {
                errorCount++;
                console.error(`   ${indexStr} Error eliminando: ${product.name} (ID: ${product.id}) ➡️ ❌ Error: ${err.message}`);
            }
        }

        console.log('\n====================================================');
        console.log(`   🎉 ¡PROCESO DE ELIMINACIÓN FINALIZADO!`);
        console.log(`   Productos eliminados con éxito: ${deletedCount}`);
        if (errorCount > 0) {
            console.log(`   Productos con error al eliminar: ${errorCount}`);
        }
        console.log(`====================================================`);

    } catch (error) {
        console.error('\n❌ ERROR DURANTE EL PROCESO:', error);
        if (error.cause) {
            console.error('\n🔍 CAUSA DEL ERROR:', error.cause);
        }
    }
}

run();
