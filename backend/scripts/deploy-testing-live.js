const { Client } = require('ssh2');

const config = {
    host: '187.124.67.53',
    port: 22,
    username: 'root',
    password: 'o7BR&vX+F2;wqYye'
};

const conn = new Client();

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
        // 1. Check PM2 status
        console.log('\n--- 1. PM2 Status on Remote ---');
        await executeCommand(conn, 'pm2 list');

        // 2. Update code in /var/www/pj-air-testing
        console.log('\n--- 2. Synchronizing Repository (branch: testing) ---');
        const repoCmd = [
            'if [ ! -d "/var/www/pj-air-testing" ]; then git clone -b testing --single-branch https://github.com/eleuc/PJ-Air.git /var/www/pj-air-testing; else cd /var/www/pj-air-testing && git fetch origin && git checkout testing && git reset --hard origin/testing; fi'
        ].join(' && ');
        await executeCommand(conn, repoCmd);

        // 3. Write .env file in /var/www/pj-air-testing
        console.log('\n--- 3. Configuring Remote .env File ---');
        const envContent = [
            'APP_ENV=testing',
            'NODE_ENV=production',
            'FRONTEND_PORT=3200',
            'BACKEND_PORT=3201',
            'PORT=3201',
            'DATABASE_PATH=../database-testing.sqlite',
            'FRONTEND_URL=https://testing.jhoanes.com',
            'NEXT_PUBLIC_API_URL=https://testing.jhoanes.com/api',
            'UPLOAD_PATH=../uploads',
            'SUPABASE_URL=https://jdeojeykyapjhvkhrxnc.supabase.co',
            'SUPABASE_KEY=sb_publishable_...',
            'GOOGLE_MAPS_KEY=AIzaSy...',
            'NEXT_PUBLIC_SUPABASE_URL=https://jdeojeykyapjhvkhrxnc.supabase.co',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...',
            'NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSy...',
            'XERO_CLIENT_ID=BD5B29EBF80C460ABD945E92217C26ED',
            'XERO_CLIENT_SECRET=W7vQmQoiScSKkTjoqCuzJJ9NLUY8snP0G0Jd68wzaM-rwa7W'
        ].join('\n');

        await executeCommand(conn, `cat << 'EOF' > /var/www/pj-air-testing/.env\n${envContent}\nEOF`);
        await executeCommand(conn, `cat << 'EOF' > /var/www/pj-air-testing/backend/.env\n${envContent}\nEOF`);
        await executeCommand(conn, `cat << 'EOF' > /var/www/pj-air-testing/frontend/.env\n${envContent}\nEOF`);

        // 4. Ensure testing database exists
        console.log('\n--- 4. Checking / Provisioning Testing Database ---');
        await executeCommand(conn, 'if [ ! -f "/var/www/pj-air-testing/database-testing.sqlite" ]; then cp /var/www/pj-air/backend/database.sqlite /var/www/pj-air-testing/database-testing.sqlite || touch /var/www/pj-air-testing/database-testing.sqlite; fi');

        // 5. Build Backend
        console.log('\n--- 5. Building Backend ---');
        await executeCommand(conn, 'cd /var/www/pj-air-testing/backend && npm install && npm run build');

        // 6. Build Frontend
        console.log('\n--- 6. Building Frontend ---');
        await executeCommand(conn, 'cd /var/www/pj-air-testing/frontend && npm install && NEXT_PUBLIC_API_URL=https://testing.jhoanes.com/api npm run build');

        // 7. Restart PM2 processes
        console.log('\n--- 7. Starting / Reloading PM2 Processes ---');
        const pm2Cmd = [
            'pm2 delete pj-air-backend-testing || true',
            'pm2 delete pj-air-frontend-testing || true',
            'cd /var/www/pj-air-testing/backend && BACKEND_PORT=3201 PORT=3201 DATABASE_PATH=../database-testing.sqlite FRONTEND_URL=https://testing.jhoanes.com XERO_CLIENT_ID=BD5B29EBF80C460ABD945E92217C26ED XERO_CLIENT_SECRET=W7vQmQoiScSKkTjoqCuzJJ9NLUY8snP0G0Jd68wzaM-rwa7W pm2 start dist/src/main.js --name pj-air-backend-testing --cwd /var/www/pj-air-testing/backend',
            'cd /var/www/pj-air-testing/frontend && PORT=3200 NEXT_PUBLIC_API_URL=https://testing.jhoanes.com/api pm2 start node_modules/next/dist/bin/next --name pj-air-frontend-testing --cwd /var/www/pj-air-testing/frontend -- start'
        ].join(' && ');
        await executeCommand(conn, pm2Cmd);

        // 8. Verify Endpoints
        console.log('\n--- 8. Health Checking Testing Endpoints ---');
        await executeCommand(conn, 'sleep 3 && curl -Is http://localhost:3201/xero/connect | head -n 5');
        await executeCommand(conn, 'curl -Is http://localhost:3200 | head -n 5');

        console.log('\n=== [SUCCESS] Testing Deployment Finished Successfully! ===');
    } catch (error) {
        console.error('\n❌ [ERROR] Deployment failed:', error.message);
    } finally {
        conn.end();
        console.log('=== [SSH] Connection Closed. ===');
    }
}).connect(config);
