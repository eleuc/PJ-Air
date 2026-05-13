const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const BACKEND_ENV_PATH = path.join(ROOT_DIR, 'backend', '.env');
const FRONTEND_ENV_PATH = path.join(ROOT_DIR, 'frontend', '.env.local');
const COMBINED_ENV_PATH = path.join(ROOT_DIR, '.env');

// Parse arguments
const isProd = process.argv.includes('--prod');
const isStaging = process.argv.includes('--staging');

let targetEnv = 'local';
if (isProd) targetEnv = 'prod';
else if (isStaging) targetEnv = 'staging';

console.log(`Starting env unification for target environment: ${targetEnv.toUpperCase()}`);

// Read and parse helpers
function parseEnvFile(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    content.split(/\r?\n/).forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim();
            env[key] = value;
        }
    });
    return env;
}

const backendEnv = parseEnvFile(BACKEND_ENV_PATH);
const frontendEnv = parseEnvFile(FRONTEND_ENV_PATH);

// Keys to ignore/override dynamically
const dynamicKeys = new Set([
    'PORT',
    'APP_ENV',
    'NODE_ENV',
    'FRONTEND_PORT',
    'BACKEND_PORT',
    'DATABASE_PATH',
    'FRONTEND_URL',
    'NEXT_PUBLIC_API_URL'
]);

// Build sections
let output = `# =========================================================================\n`;
output += `# ${targetEnv.toUpperCase()} - ${new Date().toISOString()}\n`;
output += `# =========================================================================\n\n`;

output += `# --- Environment-Specific Configurations ---\n`;
if (isProd) {
    output += `APP_ENV=production\n`;
    output += `NODE_ENV=production\n`;
    output += `FRONTEND_PORT=3000\n`;
    output += `BACKEND_PORT=3001\n`;
    output += `DATABASE_PATH=../database.sqlite\n`;
    output += `FRONTEND_URL=https://app.jhoanes.com\n`;
    output += `NEXT_PUBLIC_API_URL=https://app.jhoanes.com/api\n`;
} else if (isStaging) {
    output += `APP_ENV=staging\n`;
    output += `NODE_ENV=production\n`;
    output += `FRONTEND_PORT=3100\n`;
    output += `BACKEND_PORT=3101\n`;
    output += `DATABASE_PATH=../database-staging.sqlite\n`;
    output += `FRONTEND_URL=https://staging.jhoanes.com\n`;
    output += `NEXT_PUBLIC_API_URL=https://staging.jhoanes.com/api\n`;
} else {
    output += `APP_ENV=\n`;
    output += `NODE_ENV=development\n`;
    output += `FRONTEND_PORT=3000\n`;
    output += `BACKEND_PORT=3001\n`;
    output += `DATABASE_PATH=../database.sqlite\n`;
    output += `FRONTEND_URL=http://localhost:3000\n`;
    output += `NEXT_PUBLIC_API_URL=http://localhost:3001\n`;
}
output += `\n`;

// Add backend static config
output += `# --- Backend Configurations ---\n`;
let hasBackendKeys = false;
for (const [key, val] of Object.entries(backendEnv)) {
    if (dynamicKeys.has(key)) continue;
    output += `${key}=${val}\n`;
    hasBackendKeys = true;
}
if (!hasBackendKeys) {
    output += `# (No static backend keys loaded)\n`;
}
output += `\n`;

// Add frontend static config
output += `# --- Frontend Configurations ---\n`;
let hasFrontendKeys = false;
for (const [key, val] of Object.entries(frontendEnv)) {
    if (dynamicKeys.has(key)) continue;
    output += `${key}=${val}\n`;
    hasFrontendKeys = true;
}
if (!hasFrontendKeys) {
    output += `# (No static frontend keys loaded)\n`;
}
output += `\n`;

// Write the unified file
fs.writeFileSync(COMBINED_ENV_PATH, output, 'utf8');
console.log(`✅ Unified environment config successfully written to: ${COMBINED_ENV_PATH}`);

// Clean up old files
if (fs.existsSync(BACKEND_ENV_PATH)) {
    fs.unlinkSync(BACKEND_ENV_PATH);
    console.log(`🧹 Deleted old backend env file: ${BACKEND_ENV_PATH}`);
}
if (fs.existsSync(FRONTEND_ENV_PATH)) {
    fs.unlinkSync(FRONTEND_ENV_PATH);
    console.log(`🧹 Deleted old frontend env file: ${FRONTEND_ENV_PATH}`);
}

console.log('🎉 Environment update and unification completed successfully!');
