const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbFiles = [
    path.resolve(__dirname, '../database.sqlite'),
    path.resolve(__dirname, 'database.sqlite'),
    path.resolve(__dirname, 'database.test.sqlite')
];

const newHash = '8c8387fd315b78a04a2f86c2c6108c51:3a7f78c0b7459a25edbc7b84d527cb9e16857f294acb5e3be2a42f9300243474885ba9aef939dcefe73f70c6085a39fe7bed31c53bcd0b51709340252b1a194e';
const userId = 'f1127b07-f626-4d3e-ac98-10efb511d84f';

async function processDb(dbPath) {
    if (!fs.existsSync(dbPath)) {
        console.log(`Skipping (does not exist): ${dbPath}`);
        return;
    }

    return new Promise((resolve) => {
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error(`Error opening ${dbPath}:`, err.message);
                resolve();
                return;
            }
        });

        db.serialize(() => {
            db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
                if (err || !tables) {
                    db.close();
                    resolve();
                    return;
                }
                const names = tables.map(t => t.name);
                if (names.includes('users')) {
                    db.all("SELECT id FROM users WHERE email='eleuterioc@gmail.com'", [], (err, rows) => {
                        if (rows && rows.length > 0) {
                            db.run("UPDATE users SET password=? WHERE email='eleuterioc@gmail.com'", [newHash], (err) => {
                                if (err) console.error(`Error updating in ${dbPath}:`, err.message);
                                else console.log(`Updated eleuterioc@gmail.com in ${dbPath}`);
                                db.close();
                                resolve();
                            });
                        } else {
                            db.run("INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)", [userId, 'eleuterioc@gmail.com', newHash, 'admin'], (err) => {
                                if (err) {
                                    console.error(`Error inserting in ${dbPath}:`, err.message);
                                    db.close();
                                    resolve();
                                } else {
                                    console.log(`Inserted eleuterioc@gmail.com into ${dbPath}`);
                                    if (names.includes('profiles')) {
                                        db.run("INSERT OR IGNORE INTO profiles (id, full_name, username) VALUES (?, ?, ?)", [userId, 'Eleuterio', 'eleuterioc'], (err) => {
                                            if (err) console.error(`Error inserting profile in ${dbPath}:`, err.message);
                                            db.close();
                                            resolve();
                                        });
                                    } else {
                                        db.close();
                                        resolve();
                                    }
                                }
                            });
                        }
                    });
                } else {
                    db.close();
                    resolve();
                }
            });
        });
    });
}

async function main() {
    for (const db of dbFiles) {
        await processDb(db);
    }
    console.log('All local databases checked.');
}

main();
