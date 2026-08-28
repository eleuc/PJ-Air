const { Client } = require('ssh2');
const fs = require('fs');

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

// PBKDF2 hash of "Tecnolog1a"
const newHash = '8c8387fd315b78a04a2f86c2c6108c51:3a7f78c0b7459a25edbc7b84d527cb9e16857f294acb5e3be2a42f9300243474885ba9aef939dcefe73f70c6085a39fe7bed31c53bcd0b51709340252b1a194e';

conn.on('ready', async () => {
    console.log('SSH Connection Established.');
    try {
        const dbPath = '/var/www/pj-air-staging/database-staging.sqlite';
        console.log(`Updating password for eleuterioc@gmail.com in ${dbPath}...`);
        
        const updateCmd = `sqlite3 ${dbPath} "UPDATE users SET password='${newHash}' WHERE email='eleuterioc@gmail.com';"`;
        const updateRes = await executeCommand(conn, updateCmd);
        
        console.log('Result code:', updateRes.code);
        console.log('Stdout:', updateRes.stdout);
        console.log('Stderr:', updateRes.stderr);

        // Verify it was updated
        const verifyRes = await executeCommand(conn, `sqlite3 ${dbPath} "SELECT email, password FROM users WHERE email='eleuterioc@gmail.com';"`);
        console.log('Verification query result:', verifyRes.stdout.trim());

    } catch (error) {
        console.error('Error:', error);
    } finally {
        conn.end();
    }
}).connect(config);
