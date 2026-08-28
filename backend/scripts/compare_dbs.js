const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

function getCounts(dbPath) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(dbPath)) {
            return resolve(null);
        }
        const db = new sqlite3.Database(dbPath);
        db.serialize(() => {
            const counts = {};
            db.get("SELECT count(*) as c FROM users", (err, row) => {
                if (err) counts.users = err.message; else counts.users = row.c;
            });
            db.get("SELECT count(*) as c FROM products", (err, row) => {
                if (err) counts.products = err.message; else counts.products = row.c;
            });
            db.get("SELECT count(*) as c FROM orders", (err, row) => {
                if (err) counts.orders = err.message; else counts.orders = row.c;
                resolve(counts);
                db.close();
            });
        });
    });
}

function checkUser(dbPath, email) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(dbPath)) {
            return resolve(null);
        }
        const db = new sqlite3.Database(dbPath);
        db.get("SELECT id, email, role FROM users WHERE email = ?", [email], (err, row) => {
            resolve(row);
            db.close();
        });
    });
}

async function run() {
    console.log("Checking database.sqlite (Local Production):");
    console.log(await getCounts('database.sqlite'));
    console.log("User:", await checkUser('database.sqlite', 'eleuterioc@gmail.com'));
    
    console.log("\nChecking database.test.sqlite (Testing/Unit Test):");
    console.log(await getCounts('database.test.sqlite'));
    console.log("User:", await checkUser('database.test.sqlite', 'eleuterioc@gmail.com'));
}

run();
