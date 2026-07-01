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
    host: 'mail.jhoanes.com',
    port: 587,
    secure: false,
    auth: {
        user: 'recovery@jhoanes.com',
        pass: 'Tecnolog1aRY'
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP verify failed without TLS option:', error.message);
        
        const transporter2 = nodemailer.createTransport({
            host: 'mail.jhoanes.com',
            port: 587,
            secure: false,
            auth: {
                user: 'recovery@jhoanes.com',
                pass: 'Tecnolog1aRY'
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        
        transporter2.verify((error2, success2) => {
            if (error2) {
                console.error('SMTP verify failed WITH TLS option:', error2.message);
            } else {
                console.log('SMTP verify SUCCESS with TLS rejectUnauthorized: false');
            }
        });
    } else {
        console.log('SMTP verify SUCCESS without TLS option');
    }
});
`;

conn.on('ready', () => {
    console.log('SSH Connection Ready');
    
    conn.sftp((err, sftp) => {
        if (err) throw err;
        
        const remoteScriptPath = '/tmp/test-smtp.js';
        
        // Write the script file to production
        const stream = sftp.createWriteStream(remoteScriptPath);
        stream.on('close', () => {
            console.log('Script written to production');
            
            // Execute the script
            conn.exec('node /tmp/test-smtp.js', (err2, stream2) => {
                if (err2) throw err2;
                stream2.on('close', (code, signal) => {
                    // Delete the temp script
                    conn.exec('rm /tmp/test-smtp.js', () => {
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
