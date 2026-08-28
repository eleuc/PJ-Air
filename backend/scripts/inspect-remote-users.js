const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const config = {
    host: '187.124.67.53',
    port: 22,
    username: 'root',
    privateKey: fs.readFileSync('c:\\Users\\Ruben\\.ssh\\id_rsa')
};

const conn = new Client();

function executeCommand(conn, cmd) {
    return new Promise((resolve, reject) => {
        conn.exec(cmd, (err, stream) => {
            if (err) return reject(err);
            let stdout = '';
            let stderr = '';
            stream.on('close', (code, signal) => {
                resolve({ code, stdout, stderr });
            }).on('data', (data) => {
                stdout += data.toString();
            }).stderr.on('data', (data) => {
                stderr += data.toString();
            });
        });
    });
}

conn.on('ready', async () => {
    console.log('SSH Connection Established.');
    try {
        console.log('--- FINDING ALL SQLITE FILES ON VPS ---');
        const findRes = await executeCommand(conn, 'find /var/www -name "*.sqlite"');
        const dbPaths = findRes.stdout.split('\n').map(p => p.trim()).filter(Boolean);
        console.log('Found databases:', dbPaths);

        for (const dbPath of dbPaths) {
            console.log(`\nChecking database: ${dbPath}`);
            // Check if users table exists and query eleuterioc@gmail.com
            const checkQuery = `sqlite3 ${dbPath} "SELECT name FROM sqlite_master WHERE type='table' AND name='users';"`
            const tableCheck = await executeCommand(conn, checkQuery);
            if (tableCheck.stdout.trim() === 'users') {
                console.log('Users table exists. Querying users...');
                const queryRes = await executeCommand(conn, `sqlite3 ${dbPath} "SELECT id, email, password, role FROM users;"`);
                console.log('All Users inside this DB:');
                console.log(queryRes.stdout);

                const specificQuery = await executeCommand(conn, `sqlite3 ${dbPath} "SELECT id, email, password, role FROM users WHERE email='eleuterioc@gmail.com';"`);
                if (specificQuery.stdout.trim()) {
                    console.log(`[FOUND USER] in ${dbPath}:`, specificQuery.stdout.trim());
                } else {
                    console.log(`[NOT FOUND] eleuterioc@gmail.com in ${dbPath}`);
                }
            } else {
                console.log('No users table.');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        conn.end();
    }
}).connect(config);
