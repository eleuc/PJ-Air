const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('--- Buscando usuarios ADMINISTRADORES ---');
db.all("SELECT email, password, role FROM users WHERE role = 'admin'", [], (err, rows) => {
  if (err) {
    console.error('Error al consultar DB:', err.message);
    process.exit(1);
  }

  if (rows.length === 0) {
    console.log('No se encontraron administradores.');
  } else {
    rows.forEach(row => {
      console.log(`Email: ${row.email}`);
      console.log(`Rol: ${row.role}`);
      console.log(`Password (Hash): ${row.password}`);
      console.log('-------------------------');
    });
  }
  db.close();
});
