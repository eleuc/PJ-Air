const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) { console.error('DB error:', err); process.exit(1); }
});

db.all(`SELECT u.id, u.email, u.password, u.role, p.full_name, p.username 
        FROM users u 
        LEFT JOIN profiles p ON p.id = u.id
        WHERE u.email = 'admin@test.com'`, [], (err, rows) => {
    if (err) { console.error(err); }
    else { console.log('Admin user data:', JSON.stringify(rows, null, 2)); }
    
    // Also check all users with their roles
    db.all(`SELECT id, email, role FROM users`, [], (err2, allRows) => {
        if (err2) { console.error(err2); }
        else { console.log('\nAll users:', JSON.stringify(allRows, null, 2)); }
        db.close();
    });
});
