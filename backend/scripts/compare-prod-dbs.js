const { Client } = require('ssh2');

const config = {
    host: '187.124.67.53',
    port: 22,
    username: 'root',
    password: 'o7BR&vX+F2;wqYye'
};

const conn = new Client();
conn.on('ready', () => {
    console.log('SSH Connection Ready');
    // Check user rubendarioc in the ROOT database (/var/www/pj-air/database.sqlite)
    conn.exec('sqlite3 /var/www/pj-air/database.sqlite "SELECT email, password FROM users WHERE email = \'rubendarioc@gmail.com\'"', (err, stream) => {
        stream.on('close', () => {
            // Also check in the BACKEND folder database
            conn.exec('sqlite3 /var/www/pj-air/database.sqlite "SELECT email, password FROM users WHERE email = \'rubendarioc@gmail.com\'" || echo "No DB in backend"', (err2, stream2) => {
                stream2.on('close', () => conn.end())
                       .on('data', d => console.log('BACKEND DB USER:', d.toString()));
            });
        }).on('data', d => console.log('ROOT DB USER:', d.toString()));
    });
}).connect(config);
