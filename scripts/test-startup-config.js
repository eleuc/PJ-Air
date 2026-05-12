const { spawn } = require('child_process');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const FRONTEND_DIR = path.resolve(ROOT_DIR, 'frontend');
const BACKEND_DIR = path.resolve(ROOT_DIR, 'backend');

function runTest(name, command, args, cwd, env, expectedExitCode) {
    return new Promise((resolve, reject) => {
        console.log(`\n▶️ Running test: ${name}`);
        
        // Ensure critical env vars are cleared if not explicitly set in the env object
        const testEnv = { ...process.env, ...env };
        if (!env.NEXT_PUBLIC_API_URL) delete testEnv.NEXT_PUBLIC_API_URL;
        if (!env.DATABASE_PATH) delete testEnv.DATABASE_PATH;
        
        const child = spawn(command, args, { cwd, env: testEnv, shell: true });
        
        let output = '';
        child.stdout.on('data', (data) => output += data.toString());
        child.stderr.on('data', (data) => output += data.toString());
        
        // For success tests, we just wait a bit to see if it stays alive
        let successTimer;
        if (expectedExitCode === 0) {
            successTimer = setTimeout(() => {
                console.log(`✅ Passed: ${name} (Stayed alive)`);
                child.kill();
                resolve();
            }, 5000);
        }

        child.on('close', (code) => {
            if (successTimer) clearTimeout(successTimer);
            
            if (code === expectedExitCode) {
                console.log(`✅ Passed: ${name} (Exited with expected code ${code})`);
                if (expectedExitCode !== 0) {
                    console.log(`   Output snippet: ${output.slice(0, 200).replace(/\n/g, ' ')}...`);
                }
                resolve();
            } else {
                // If we expected it to stay alive (0) but it was killed manually, code might be null.
                if (expectedExitCode === 0 && code === null) {
                    return resolve(); // Handled by successTimer kill
                }
                console.error(`❌ Failed: ${name} (Expected code ${expectedExitCode}, got ${code})`);
                console.error(`   Output: ${output}`);
                reject(new Error(`Test failed: ${name}`));
            }
        });
    });
}

async function runAllTests() {
    try {
        // Helper to rename files temporarily
        const fs = require('fs');
        const renameIfExists = (from, to) => {
            if (fs.existsSync(from)) fs.renameSync(from, to);
        };

        const frontendEnvLocal = path.join(FRONTEND_DIR, '.env.local');
        const backendEnv = path.join(BACKEND_DIR, '.env');
        const rootEnv = path.join(ROOT_DIR, '.env');

        try {
            // Hide all existing env files
            renameIfExists(frontendEnvLocal, frontendEnvLocal + '.bak');
            renameIfExists(backendEnv, backendEnv + '.bak');
            renameIfExists(rootEnv, rootEnv + '.bak');

            // Test 1: Frontend fails without NEXT_PUBLIC_API_URL
            await runTest(
                'Frontend fails without NEXT_PUBLIC_API_URL',
                'npm', ['run', 'dev'],
                FRONTEND_DIR,
                {}, // Empty env overrides
                1
            );

            // Test 2: Backend fails without DATABASE_PATH
            await runTest(
                'Backend fails without DATABASE_PATH',
                'npm', ['run', 'start'],
                BACKEND_DIR,
                {}, // Empty env overrides
                1
            );

            // Test 3: Frontend starts with NEXT_PUBLIC_API_URL
            await runTest(
                'Frontend starts with NEXT_PUBLIC_API_URL',
                'npm', ['run', 'dev'],
                FRONTEND_DIR,
                { NEXT_PUBLIC_API_URL: 'http://localhost:3001' },
                0 // Expect it to stay alive
            );

            // Test 4: Backend starts with DATABASE_PATH
            await runTest(
                'Backend starts with DATABASE_PATH',
                'npm', ['run', 'start'],
                BACKEND_DIR,
                { DATABASE_PATH: '../database.sqlite' },
                0 // Expect it to stay alive
            );

            console.log('\n🎉 All configuration tests passed successfully!');
            process.exit(0);
        } finally {
            // Restore all existing env files
            renameIfExists(frontendEnvLocal + '.bak', frontendEnvLocal);
            renameIfExists(backendEnv + '.bak', backendEnv);
            renameIfExists(rootEnv + '.bak', rootEnv);
        }
    } catch (err) {
        console.error('\n💥 Test suite failed.');
        process.exit(1);
    }
}

runAllTests();
