'use strict';

const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

// Deliberately independent of the legacy server, device database and APK builder.
const publicDirectory = path.join(__dirname, 'public');
const assets = new Map([
    ['/', ['index.html', 'text/html; charset=utf-8']],
    ['/index.html', ['index.html', 'text/html; charset=utf-8']],
    ['/demo.css', ['demo.css', 'text/css; charset=utf-8']],
    ['/demo.js', ['demo.js', 'text/javascript; charset=utf-8']]
]);

function createDemoServer() {
    const server = http.createServer(async (req, res) => {
        res.setHeader('Content-Security-Policy', [
            "default-src 'none'", "script-src 'self'", "style-src 'self'",
            "img-src 'self' data:", "connect-src 'none'", "object-src 'none'",
            "base-uri 'none'", "form-action 'none'", "frame-ancestors 'none'"
        ].join('; '));
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'no-referrer');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        res.setHeader('Cache-Control', 'no-store');

        const port = server.address().port;
        if (![`127.0.0.1:${port}`, `localhost:${port}`].includes(req.headers.host)) {
            res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('Use the local demo address printed in the terminal.');
        }
        if (!['GET', 'HEAD'].includes(req.method)) {
            res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('This demo only serves static pages.');
        }
        const asset = assets.get(req.url.split('?')[0]);
        if (!asset) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('Demo page not found.');
        }
        try {
            const body = await fs.readFile(path.join(publicDirectory, asset[0]));
            res.writeHead(200, { 'Content-Type': asset[1], 'Content-Length': body.length });
            res.end(req.method === 'HEAD' ? undefined : body);
        } catch {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('A demo asset is unavailable. Check the demo/public directory.');
        }
    });
    return server;
}

if (require.main === module) {
    const value = process.env.DEMO_PORT || '8081';
    const port = Number(value);
    if (!/^\d+$/.test(value) || !Number.isInteger(port) || port < 1 || port > 65535) {
        console.error('DEMO_PORT must be a whole number from 1 to 65535.');
        process.exitCode = 1;
    } else {
        const server = createDemoServer();
        server.on('error', (error) => {
            console.error(error.code === 'EADDRINUSE'
                ? 'The demo port is in use. Choose another DEMO_PORT.'
                : `The demo could not start (${error.code || 'unknown error'}).`);
            process.exitCode = 1;
        });
        server.listen(port, '127.0.0.1', () => {
            console.log(`ANDRO ethical demo: http://127.0.0.1:${port}`);
            console.log('Simulated data only. No device connections. Press Ctrl+C to stop.');
        });
    }
}

module.exports = { createDemoServer };
