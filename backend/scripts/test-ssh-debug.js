const { Client } = require('ssh2');

const config = {
    host: '187.124.67.53',
    port: 22,
    username: 'root',
    password: 'o7BR&vX+F2;wqYye',
    tryKeyboard: true,
    debug: (info) => console.log('[SSH-DEBUG]', info)
};

const conn = new Client();

conn.on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
    console.log('[KEYBOARD-INTERACTIVE] prompts:', prompts);
    finish(['o7BR&vX+F2;wqYye']);
});

conn.on('ready', () => {
    console.log('>>> CONNECTED SUCCESSFULLY! <<<');
    conn.exec('uptime', (err, stream) => {
        if (err) throw err;
        stream.on('data', (data) => console.log('UPTIME:', data.toString()));
        stream.on('close', () => conn.end());
    });
});

conn.on('error', (err) => {
    console.error('>>> CONNECTION ERROR:', err);
});

conn.connect(config);
