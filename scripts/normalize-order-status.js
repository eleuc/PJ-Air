const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

let dbPath = process.argv[2];

if (!dbPath) {
  console.error('Error: Database file path not provided');
  console.error('Usage: node scripts/normalize-order-status.js <database-file>');
  process.exit(1);
}

if (!fs.existsSync(dbPath)) {
  console.error(`Error: Database file not found at: ${dbPath}`);
  console.error('Usage: node scripts/normalize-order-status.js <database-file>');
  process.exit(1);
}

console.log(`Using database at: ${dbPath}`);
let db;
try {
  db = new DatabaseSync(dbPath);
} catch (err) {
  console.error(`Failed to open database: ${dbPath}`, err.message);
  process.exit(1);
}

try {
  console.log('Normalizing order statuses...');
  
  const updates = [
    { target: 'pending', sources: ['Pedido', 'Pedido Enviado', 'confirmed'] },
    { target: 'production', sources: ['En Producción'] },
    { target: 'ready', sources: ['Finalizado'] },
    { target: 'shipping', sources: ['En camino', 'shipped'] },
    { target: 'delivering', sources: ['En Entrega', 'En Delivery'] },
    { target: 'delivered', sources: ['Entregado', 'Pedido Recibido'] },
    { target: 'cancelled', sources: ['Cancelado'] }
  ];

  let totalUpdated = 0;
  for (const { target, sources } of updates) {
    const placeholders = sources.map(() => '?').join(', ');
    const selectStmt = db.prepare(`SELECT COUNT(*) as count FROM orders WHERE status IN (${placeholders})`);
    const countResult = selectStmt.get(...sources);
    const count = countResult ? countResult.count : 0;
    
    if (count > 0) {
      const updateStmt = db.prepare(`UPDATE orders SET status = ? WHERE status IN (${placeholders})`);
      updateStmt.run(target, ...sources);
      console.log(`- Updated ${count} orders from (${sources.join(', ')}) to '${target}'`);
      totalUpdated += count;
    }
  }

  console.log(`✅ Order status normalization complete. Total orders updated: ${totalUpdated}`);
} catch (err) {
  console.error('Error during normalization:', err.message);
  process.exit(1);
} finally {
  db.close();
}
