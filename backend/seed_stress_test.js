const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

async function run() {
  console.log('🚀 Iniciando semilla de prueba de estrés...');

  // 1. Obtener productos para los pedidos
  const products = await new Promise((resolve, reject) => {
    db.all("SELECT id, price FROM products LIMIT 20", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  if (products.length === 0) {
    console.error('❌ No se encontraron productos en la base de datos.');
    process.exit(1);
  }

  // 2. Crear 30 usuarios
  const userIds = [];
  const password = '123123';
  
  console.log('👥 Creando 30 usuarios...');
  for (let i = 1; i <= 30; i++) {
    const userId = crypto.randomUUID();
    const email = `user${i}@test.com`;
    const fullName = `Test User ${i}`;
    const username = `testuser${i}`;

    await new Promise((resolve, reject) => {
      db.run("INSERT OR IGNORE INTO users (id, email, password, role) VALUES (?, ?, ?, 'client')", [userId, email, password], function(err) {
        if (err) reject(err);
        else {
          // If already exists, we might not get the ID we want, but let's assume clean slate or IGNORE handles it.
          // Let's at least try to create the profile.
          db.run("INSERT OR IGNORE INTO profiles (id, full_name, username) VALUES (?, ?, ?)", [userId, fullName, username], (err2) => {
            if (err2) console.error(`Error en perfil de ${email}`, err2);
            userIds.push(userId);
            resolve();
          });
        }
      });
    });
  }

  // 3. Crear pedidos para las últimas 2 semanas
  console.log('📦 Creando pedidos para las últimas 2 semanas...');
  const now = new Date();
  const statuses = ['delivered', 'pending', 'cancelled', 'processing'];
  
  for (const userId of userIds) {
    // Cada usuario hará entre 3 y 8 pedidos en estas 2 semanas
    const numOrders = Math.floor(Math.random() * 6) + 3;

    for (let j = 0; j < numOrders; j++) {
      const orderId = crypto.randomUUID();
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Fecha aleatoria en los últimos 14 días
      const daysAgo = Math.floor(Math.random() * 14);
      const orderDate = new Date(now);
      orderDate.setDate(now.getDate() - daysAgo);
      const dateString = orderDate.toISOString();

      // Elegir entre 1 y 4 productos para el pedido
      const numItems = Math.floor(Math.random() * 4) + 1;
      let total = 0;
      const orderItems = [];

      for (let k = 0; k < numItems; k++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 3) + 1;
        const price = product.price;
        total += price * qty;
        orderItems.push({ productId: product.id, qty, price });
      }

      // Insertar pedido
      await new Promise((resolve, reject) => {
        // En SQLite, created_at puede ser un string ISO
        db.run("INSERT INTO orders (id, user_id, total, status, created_at) VALUES (?, ?, ?, ?, ?)", 
          [orderId, userId, total, status, dateString], (err) => {
          if (err) reject(err);
          else {
            // Insertar items
            let itemsCount = 0;
            if (orderItems.length === 0) resolve();
            orderItems.forEach(item => {
              db.run("INSERT INTO order_items (id, order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?, ?)",
                [crypto.randomUUID(), orderId, item.productId, item.qty, item.price], (err3) => {
                  itemsCount++;
                  if (itemsCount === orderItems.length) resolve();
                });
            });
          }
        });
      });
    }
  }

  console.log('✅ Semilla completada con éxito.');
  db.close();
}

run().catch(err => {
  console.error('❌ Error durante la ejecución:', err);
  db.close();
  process.exit(1);
});
