const fs = require('fs');
const path = require('path');
const { parseEnv } = require('node:util');
const readline = require('node:readline/promises');

const targetEnv = process.argv.includes('--prod') ? 'Producción' : (process.argv.includes('--staging') ? 'Staging' : 'Local');
console.log(`Checking Environment: ${targetEnv}\n`);

const makeVar = (label, params) => {
  const { isFile, ...envs } = params;
  return { label, isFile, envs };
};

const schema = [
  makeVar('Node Environment', { root: 'NODE_ENV', backend: 'NODE_ENV' }),
  makeVar('Frontend Port', { root: 'FRONTEND_PORT', frontend: 'PORT' }),
  makeVar('Backend Port', { root: 'BACKEND_PORT', backend: 'PORT' }),
  makeVar('Database Path', { root: 'DATABASE_PATH', backend: 'DATABASE_PATH', isFile: true }),
  makeVar('Upload Path', { root: 'UPLOAD_PATH', backend: 'UPLOAD_PATH', isFile: true }),
  makeVar('Frontend/Site URL', { root: 'FRONTEND_URL', backend: 'SITE_URL' }),
  makeVar('API URL', { root: 'API_URL', frontend: 'NEXT_PUBLIC_API_URL' }),
  makeVar('Supabase URL', { root: 'SUPABASE_URL', backend: 'SUPABASE_URL', frontend: 'NEXT_PUBLIC_SUPABASE_URL' }),
  makeVar('Supabase Key', { root: 'SUPABASE_KEY', backend: 'SUPABASE_KEY', frontend: 'NEXT_PUBLIC_SUPABASE_ANON_KEY' }),
  makeVar('Google Maps Key', { root: 'GOOGLE_MAPS_KEY', backend: 'GOOGLE_MAPS_KEY', frontend: 'NEXT_PUBLIC_GOOGLE_MAPS_KEY' }),
  makeVar('JWT Secret', { backend: 'JWT_SECRET' }),
  makeVar('JWT Expires In', { backend: 'JWT_EXPIRES_IN' }),
  makeVar('SMTP Host', { backend: 'SMTP_HOST' }),
  makeVar('SMTP Port', { backend: 'SMTP_PORT' }),
  makeVar('SMTP Secure', { backend: 'SMTP_SECURE' }),
  makeVar('SMTP User', { backend: 'SMTP_USER' }),
  makeVar('SMTP Pass', { backend: 'SMTP_PASS' })
];

const files = {
  root: { path: path.join(__dirname, '../.env') },
  backend: { path: path.join(__dirname, '../backend/.env') },
  frontend: { path: path.join(__dirname, '../frontend/.env.local'), fallback: path.join(__dirname, '../frontend/.env') }
};

const getCanonicalKey = (item) => item.envs.root || item.envs.backend || item.envs.frontend || item.label;

const writeEnvFile = (name, filePath, canonicalValues) => {
  const content = schema
    .map(item => {
      const key = item.envs[name];
      if (!key) return null;
      const canonicalKey = getCanonicalKey(item);
      const val = canonicalValues[canonicalKey];
      if (!val) return null;
      return `${key}=${val}`;
    })
    .filter(line => line !== null)
    .join('\n') + '\n';

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
};

async function main() {
  const parsed = {};
  const filePaths = {};
  const warnings = [];

  // 1. Read files and construct env objects for each workspace
  for (const [name, cfg] of Object.entries(files)) {
    let file = cfg.path;
    if (!fs.existsSync(file) && cfg.fallback && fs.existsSync(cfg.fallback)) file = cfg.fallback;

    if (!fs.existsSync(file)) {
      warnings.push(`Missing env file: ${name} (expected at ${cfg.path})`);
      continue;
    }

    try {
      parsed[name] = parseEnv(fs.readFileSync(file, 'utf8'));
      filePaths[name] = file;
    } catch (err) {
      warnings.push(`Failed to parse ${name} file: ${err.message}`);
    }
  }

  const canonicalValues = {};
  const missingVariables = [];
  const mismatches = [];

  // 2. Iterate the schemas collecting canonical values, missing variables, and workspace mismatches
  schema.forEach(item => {
    let canonicalVal = null;
    const workspacesSeq = ['root', 'backend', 'frontend'];

    // Find canonical value (wherever it shows up first in root, backend, frontend sequence)
    for (const ws of workspacesSeq) {
      const env = parsed[ws];
      if (!env) continue;
      const key = item.envs[ws];
      if (key && env[key] !== undefined && env[key] !== '') {
        const rawVal = env[key];
        canonicalVal = item.isFile ? path.resolve(path.dirname(filePaths[ws]), rawVal) : rawVal;
        break;
      }
    }

    const key = getCanonicalKey(item);

    if (canonicalVal === null) {
      missingVariables.push(item.label);
    } else {
      canonicalValues[key] = canonicalVal;

      // Check mismatches for each workspace with a parsed environment
      for (const [ws, env] of Object.entries(parsed)) {
        const key = item.envs[ws];
        if (key) {
          const val = env[key];
          if (val !== canonicalVal) {
            mismatches.push(`${ws}.${key} = ${val === undefined ? 'undefined' : `"${val}"`} (expected "${canonicalVal}")`);
          }
        }
      }
    }
  });

  // 3. Output Results
  if (warnings.length > 0) {
    console.log('Warnings:');
    warnings.forEach(w => console.log(` - ${w}`));
    console.log();
  }

  if (missingVariables.length > 0) {
    console.log('Missing Variables (not defined anywhere):');
    console.log(` - ${missingVariables.join(', ')}`);
    console.log();
  }

  if (mismatches.length > 0) {
    console.log('Workspace Variable Mismatches:');
    mismatches.forEach(m => console.log(` - ${m}`));
    console.log();
  }

  if (warnings.length === 0 && missingVariables.length === 0 && mismatches.length === 0) {
    console.log('✔ All environment variables check out successfully.');
  }

  // 4. Ask user whether they want to create missing env files and create them
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    for (const [name, cfg] of Object.entries(files)) {
      const fileExists = fs.existsSync(cfg.path) || (cfg.fallback && fs.existsSync(cfg.fallback));
      if (!fileExists) {
        const answer = await rl.question(`Missing env file for ${name}. Do you want to create it at ${cfg.path}? (y/n): `);
        if (answer.trim().toLowerCase().startsWith('y')) {
          writeEnvFile(name, cfg.path, canonicalValues);
          console.log(`Created env file for ${name} at ${cfg.path}\n`);
        }
      }
    }
  } finally {
    rl.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

