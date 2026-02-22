const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Connecting to database at:', dbPath);

db.serialize(() => {
  // Add notes to orders
  db.run("ALTER TABLE orders ADD COLUMN notes TEXT", (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('Column notes already exists.');
      } else {
        console.error('Error adding notes:', err.message);
      }
    } else {
      console.log('Column notes added successfully.');
    }
  });
});

db.close();
