const http = require('http');

const body = JSON.stringify({ email: 'admin@test.com', password: '123123' });

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        const parsed = JSON.parse(data);
        console.log('Full login response:');
        console.log(JSON.stringify(parsed, null, 2));
        console.log('\n--- KEY FIELDS ---');
        console.log('user_metadata:', JSON.stringify(parsed?.user?.user_metadata, null, 2));
        console.log('role in user_metadata:', parsed?.user?.user_metadata?.role);
    });
});

req.on('error', (err) => console.error('Request error:', err));
req.write(body);
req.end();
