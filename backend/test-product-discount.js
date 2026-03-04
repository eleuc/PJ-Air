const http = require('http');

// Use an actual user ID and product ID from the DB
// I saw user1's ID was '620a6e14-afcb-4a31-b9ec-ae9c768197dc' in step 2156
// And product IDs are numbers (1, 2, 3...)
const userId = 'bc90035e-47a8-4e8f-a96b-4a48a57907cb';
const productId = 1;

const data = JSON.stringify({
  productId: productId,
  discount_percentage: 10
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: `/users/${userId}/product-discounts`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
