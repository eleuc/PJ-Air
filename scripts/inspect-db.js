const { DatabaseSync } = require('node:sqlite');

const dbFile = process.argv[2] || 'database.sqlite';
const tableName = process.argv[3];

let db;
try {
  db = new DatabaseSync(dbFile);
} catch (err) {
  console.error(`Failed to open database: ${dbFile}`, err.message);
  process.exit(1);
}

try {
  if (tableName) {
    const rows = db.prepare(`SELECT * FROM "${tableName}"`).all();
    console.table(rows);
  } else {
    const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).all();
    tables.forEach(t => console.log(t.name));
  }
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
