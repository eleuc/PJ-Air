const JWT_TOKEN = process.env.JWT_TOKEN || ''; 

let API_BASE = 'http://localhost:3001';
let envName = 'Local';

if (process.argv.includes('--staging')) {
    API_BASE = 'https://staging.jhoanes.com/api';
    envName = 'Staging';
} else if (process.argv.includes('--prod')) {
    API_BASE = 'https://app.jhoanes.com/api';
    envName = 'Producción';
}

function getHeaders(customHeaders = {}) {
    const headers = { ...customHeaders };
    if (JWT_TOKEN) {
        headers['Authorization'] = `Bearer ${JWT_TOKEN}`;
    }
    return headers;
}

module.exports = {
    JWT_TOKEN,
    API_BASE,
    envName,
    getHeaders
};
