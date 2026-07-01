const { Client } = require('ssh2');

const config = {
    host: '187.124.67.53',
    port: 22,
    username: 'root',
    password: 'o7BR&vX+F2;wqYye'
};

const conn = new Client();

const scriptContent = `
const nodemailer = require('/var/www/pj-air/backend/node_modules/nodemailer');
const transporter = nodemailer.createTransport({
    host: 'mail.privateemail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: {
        user: 'recovery@jhoanes.com',
        pass: 'Tecnolog1aRY'
    },
    tls: {
        rejectUnauthorized: false
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP verify on mail.privateemail.com failed:', error.message);
    } else {
        console.log('SMTP verify on mail.privateemail.com SUCCESS!');
    }
    process.exit(0);
});
`;

conn.on('ready', () => {
    console.log('SSH Connection Ready');
    
    conn.sftp((err, sftp) => {
        if (err) throw err;
        
        const remoteScriptPath = '/tmp/test-smtp-pe.js';
        const stream = sftp.createWriteStream(remoteScriptPath);
        stream.on('close', () => {
            conn.exec('node /tmp/test-smtp-pe.js', (err2, stream2) => {
                if (err2) throw err2;
                stream2.on('close', () => {
                    conn.exec('rm /tmp/test-smtp-pe.js', () => {
                        conn.end();
                    });
                }).on('data', (data) => {
                    console.log('STDOUT: ' + data);
                }).stderr.on('data', (data) => {
                    console.error('STDERR: ' + data);
                });
            });
        });
        
        stream.write(scriptContent);
        stream.end();
    });
}).connect(config);
