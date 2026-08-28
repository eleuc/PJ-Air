const { Client } = require('ssh2');

const config = {
    host: '187.124.67.53',
    port: 22,
    username: 'root',
    password: 'o7BR&vX+F2;wqYye',
    tryKeyboard: true
};

const conn = new Client();

conn.on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
    finish(['o7BR&vX+F2;wqYye']);
});

function executeCommand(conn, cmd) {
    return new Promise((resolve, reject) => {
        console.log(`\n>>> [REMOTE] Executing: ${cmd}`);
        conn.exec(cmd, (err, stream) => {
            if (err) return reject(err);
            let stdout = '';
            let stderr = '';
            stream.on('close', (code, signal) => {
                if (code !== 0) {
                    console.warn(`[WARN] Command finished with code ${code}. Stderr: ${stderr.trim()}`);
                    resolve({ code, stdout, stderr, ok: false });
                } else {
                    resolve({ code, stdout, stderr, ok: true });
                }
            }).on('data', (data) => {
                stdout += data.toString();
                process.stdout.write(data);
            }).stderr.on('data', (data) => {
                stderr += data.toString();
                process.stderr.write(data);
            });
        });
    });
}

conn.on('ready', async () => {
    console.log('=== [SSH] Connection Established to VPS (187.124.67.53) ===');
    try {
        const dateStr = `$(date +%F_%H-%M-%S)`;
        
        console.log('\n--- 1. Creating Backups Directory ---');
        await executeCommand(conn, 'mkdir -p /var/www/pj-air-testing/backups');

        console.log('\n--- 2. Backing up current Testing Database ---');
        await executeCommand(conn, `cp /var/www/pj-air-testing/database-testing.sqlite /var/www/pj-air-testing/backups/testing-database-backup-${dateStr}.sqlite || echo "No existing testing DB to backup"`);

        console.log('\n--- 3. Backing up Production Data (to testing folder) ---');
        const cpProdBackupRes = await executeCommand(conn, `cp /var/www/pj-air/backend/database.sqlite /var/www/pj-air-testing/backups/prod-database-backup-${dateStr}.sqlite`);
        if (!cpProdBackupRes.ok) {
            throw new Error("Failed to copy production database. Aborting.");
        }

        console.log('\n--- 4. Replacing Testing Database with Production Database ---');
        const cpProdToTestingRes = await executeCommand(conn, `cp /var/www/pj-air/backend/database.sqlite /var/www/pj-air-testing/database-testing.sqlite`);
        if (!cpProdToTestingRes.ok) {
            throw new Error("Failed to replace testing database. Aborting.");
        }

        console.log('\n--- 5. Restarting Testing Backend ---');
        await executeCommand(conn, 'pm2 restart pj-air-backend-testing');

        console.log('\n--- 6. Verifying Testing Database ---');
        await executeCommand(conn, 'sqlite3 /var/www/pj-air-testing/database-testing.sqlite "SELECT count(*) AS users_count FROM users;"');

        console.log('\n=== [SUCCESS] Sync Production to Testing Finished! ===');
    } catch (error) {
        console.error('\n❌ [ERROR] Script failed:', error.message);
    } finally {
        conn.end();
        console.log('=== [SSH] Connection Closed. ===');
    }
});

conn.on('error', (err) => {
    console.error('>>> CONNECTION ERROR:', err);
});

conn.connect(config);
