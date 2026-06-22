const fs = require('fs');
const path = require('path');

// Read and parse the root .env file dynamically
const envPath = path.resolve(__dirname, '.env');
let envConfig = {};

if (fs.existsSync(envPath)) {
    try {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split(/\r?\n/).forEach(line => {
            line = line.trim();
            if (!line || line.startsWith('#')) return;
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                envConfig[match[1].trim()] = match[2].trim();
            }
        });
    } catch (e) {
        console.error('Failed to parse .env file dynamically:', e);
    }
}

// Compute app name suffix based on APP_ENV
const appEnv = envConfig.APP_ENV || '';
let suffix = '';
if (appEnv === 'production' || appEnv === 'prod') {
    suffix = '-prod';
} else if (appEnv === 'staging') {
    suffix = '-staging';
}

module.exports = {
    apps: [
        {
            name: `pj-air-backend${suffix}`,
            cwd: './backend',
            script: 'dist/src/main.js',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: envConfig
        },
        {
            name: `pj-air-frontend${suffix}`,
            cwd: './frontend',
            script: 'npm',
            args: 'run start',
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: envConfig
        }
    ]
};
