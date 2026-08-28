const crypto = require('crypto');
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.pbkdf2Sync('Tecnolog1a', salt, 1000, 64, 'sha512').toString('hex');
console.log(`${salt}:${hash}`);
