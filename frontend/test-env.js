const { loadEnvConfig } = require('@next/env');
const path = require('path');
loadEnvConfig(path.resolve(process.cwd(), '..'));
console.log('Loaded API URL:', process.env.NEXT_PUBLIC_API_URL);
