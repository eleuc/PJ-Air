const http = require('http');
const https = require('https');

async function testLogin(url, email, password) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ email, password });
        const parsedUrl = new URL(url);
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const client = parsedUrl.protocol === 'https:' ? https : http;
        
        const req = client.request(options, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });

        req.on('error', error => reject(error));
        req.write(data);
        req.end();
    });
}

async function run() {
    try {
        console.log("Testing LOCAL DB login...");
        const localRes = await testLogin('http://localhost:3201/auth/login', 'eleuterioc@gmail.com', 'Tecnolog1a');
        console.log("LOCAL RESULT:", localRes.status, localRes.body.substring(0, 200));

        console.log("\nTesting REMOTE DB login...");
        const remoteRes = await testLogin('https://testing.jhoanes.com/api/auth/login', 'eleuterioc@gmail.com', 'Tecnolog1a');
        console.log("REMOTE RESULT:", remoteRes.status, remoteRes.body.substring(0, 200));

    } catch (e) {
        console.error("Error:", e);
    }
}
run();
