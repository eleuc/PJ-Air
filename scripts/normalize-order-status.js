const sqlite3 = require('sqlite3').verbose();
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
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(`Failed to open database: ${dbPath}`, err.message);
    process.exit(1);
  }
});

db.serialize(() => {
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
  
  updates.forEach(({ target, sources }) => {
    const placeholders = sources.map(() => '?').join(', ');
    
    // First, count how many records will be updated
    db.get(
      `SELECT COUNT(*) as count FROM orders WHERE status IN (${placeholders})`,
      sources,
      (err, row) => {
        if (err) {
          console.error(`Error counting records: ${err.message}`);
          return;
        }
        const count = row ? row.count : 0;
        
        if (count > 0) {
          // Update the records
          db.run(
            `UPDATE orders SET status = ? WHERE status IN (${placeholders})`,
            [target, ...sources],
            function(err) {
              if (err) {
                console.error(`Error updating records: ${err.message}`);
                return;
              }
              console.log(`- Updated ${count} orders from (${sources.join(', ')}) to '${target}'`);
              totalUpdated += count;
            }
          );
        }
      }
    );
  });

  // Wait for all updates to complete before closing
  let updateCount = 0;
  const checkUpdates = () => {
    if (updateCount === updates.length) {
      console.log(`✅ Order status normalization complete. Total orders updated: ${totalUpdated}`);
      db.close();
    } else {
      updateCount++;
      setTimeout(checkUpdates, 100);
    }
  };
  
  // Start checking after a short delay
  setTimeout(checkUpdates, 500);
});
