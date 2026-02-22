const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Migrar la base de datos de la RAÍZ que es la que usa la app
const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Connecting to database at:', dbPath);

db.serialize(() => {
  // delivery_user_id
  db.run("ALTER TABLE orders ADD COLUMN delivery_user_id TEXT", (err) => {
    if (err) console.log('Column delivery_user_id already exists or error:', err.message);
    else console.log('Column delivery_user_id added.');
  });

  // notes
  db.run("ALTER TABLE orders ADD COLUMN notes TEXT", (err) => {
    if (err) console.log('Column notes already exists or error:', err.message);
    else console.log('Column notes added.');
  });
});

db.close();
