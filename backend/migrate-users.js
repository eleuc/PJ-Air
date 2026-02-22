// Migrates users + profiles from backend/database.sqlite → ../database.sqlite
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const OLD_DB = path.resolve('./database.sqlite');
const NEW_DB = path.resolve('../database.sqlite');

const oldDb = new sqlite3.Database(OLD_DB, sqlite3.OPEN_READONLY);
const newDb = new sqlite3.Database(NEW_DB, sqlite3.OPEN_READWRITE);

oldDb.all('SELECT * FROM users', [], (err, oldUsers) => {
    if (err) { console.error('Error reading old users:', err.message); return; }
    console.log(`Found ${oldUsers.length} users in old DB`);

    oldDb.all('SELECT * FROM profiles', [], (e2, oldProfiles) => {
        if (e2) { console.error('Error reading old profiles:', e2.message); return; }
        console.log(`Found ${oldProfiles.length} profiles in old DB`);

        newDb.serialize(() => {
            newDb.all('SELECT id, email FROM users', [], (e3, existingUsers) => {
                const existingIds = new Set((existingUsers || []).map(u => u.id));
                const existingEmails = new Set((existingUsers || []).map(u => u.email));

                let migratedUsers = 0;
                let skippedUsers = 0;

                const stmt = newDb.prepare(
                    'INSERT OR IGNORE INTO users (id, email, password, role) VALUES (?, ?, ?, ?)'
                );
                oldUsers.forEach(u => {
                    if (existingEmails.has(u.email)) {
                        console.log(`  SKIP (email exists): ${u.email}`);
                        skippedUsers++;
                    } else {
                        stmt.run(u.id, u.email, u.password, u.role || 'client');
                        console.log(`  MIGRATED user: ${u.email} (role=${u.role})`);
                        migratedUsers++;
                    }
                });
                stmt.finalize();

                const pStmt = newDb.prepare(
                    'INSERT OR IGNORE INTO profiles (id, full_name, username, phone, avatar_url) VALUES (?, ?, ?, ?, ?)'
                );
                let migratedProfiles = 0;
                oldProfiles.forEach(p => {
                    pStmt.run(p.id, p.full_name, p.username, p.phone, p.avatar_url);
                    migratedProfiles++;
                });
                pStmt.finalize();

                console.log(`\n✅ Done. Migrated: ${migratedUsers} users, ${migratedProfiles} profiles. Skipped: ${skippedUsers}.`);
                oldDb.close();
                newDb.close();
            });
        });
    });
});
