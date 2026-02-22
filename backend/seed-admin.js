const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) { console.error('DB error:', err); process.exit(1); }
});

// Step 1: Add role column
db.run('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "client"', (err) => {
    if (!err) console.log('role column added');
    else console.log('role column already exists');

    // Step 2: Check if admin exists
    db.get('SELECT id FROM users WHERE email = ?', ['admin@test.com'], (err2, row) => {
        if (err2) { console.error(err2); db.close(); return; }

        if (row) {
            // Update role
            db.run('UPDATE users SET role = ? WHERE email = ?', ['admin', 'admin@test.com'], (err3) => {
                if (err3) console.error('Update error:', err3);
                else console.log('Admin role updated for user:', row.id);
                db.close(() => console.log('Done!'));
            });
        } else {
            // Create admin
            const uid = crypto.randomUUID();
            db.run(
                'INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)',
                [uid, 'admin@test.com', '123123', 'admin'],
                (err3) => {
                    if (err3) { console.error('User insert error:', err3); db.close(() => console.log('Done!')); return; }
                    console.log('Admin user created:', uid);

                    db.run(
                        'INSERT INTO profiles (id, full_name, username) VALUES (?, ?, ?)',
                        [uid, 'Administrador', 'admin'],
                        (err4) => {
                            if (err4) console.log('Profile note:', err4.message);
                            else console.log('Admin profile created');
                            db.close(() => console.log('Done!'));
                        }
                    );
                }
            );
        }
    });
});
