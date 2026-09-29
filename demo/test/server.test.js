'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { createDemoServer } = require('../server');

const server = createDemoServer();
let port;
before(async () => {
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    port = server.address().port;
});
after(async () => {
    await new Promise((resolve) => server.close(resolve));
});

function request(url, method = 'GET', headers = {}) {
    return new Promise((resolve, reject) => {
        const req = http.request({ hostname: '127.0.0.1', port, path: url, method, headers }, (res) => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
        });
        req.on('error', reject);
        req.end();
    });
}

test('serves only local demo assets with browser capability restrictions', async () => {
    for (const url of ['/', '/index.html', '/demo.css', '/demo.js']) {
        const response = await request(url);
        assert.equal(response.status, 200, url);
        assert.ok(response.body.length > 0);
        assert.match(response.headers['content-security-policy'], /connect-src 'none'/);
        assert.match(response.headers['permissions-policy'], /microphone=\(\)/);
        assert.equal(response.headers['cache-control'], 'no-store');
    }
    const response = await request('/');
    assert.match(response.body, /ethical purposes in an isolated environment only/);
});

test('does not expose legacy data, commands, APK files or arbitrary paths', async () => {
    for (const url of ['/maindb.json', '/clientData/test.json', '/build.s.apk', '/client_downloads/test', '/manage/test/info', '/builder', '/../package.json', '/%2e%2e/package.json']) {
        assert.equal((await request(url)).status, 404, url);
    }
    for (const method of ['POST', 'PUT', 'DELETE']) {
        const response = await request('/manage/test/test', method);
        assert.equal(response.status, 405);
        assert.equal(response.headers.allow, 'GET, HEAD');
    }
});

test('rejects foreign Host headers and returns bodyless HEAD responses', async () => {
    assert.equal((await request('/', 'GET', { Host: 'example.invalid' })).status, 403);
    const response = await request('/', 'HEAD');
    assert.equal(response.status, 200);
    assert.equal(response.body, '');
    assert.ok(Number(response.headers['content-length']) > 0);
});

test('invalid port configuration exits cleanly without starting a listener', () => {
    for (const value of ['0', '65536', 'abc', '1.5']) {
        const result = spawnSync(process.execPath, [path.join(__dirname, '../server.js')], {
            env: { ...process.env, DEMO_PORT: value }, encoding: 'utf8', timeout: 5000
        });
        assert.equal(result.status, 1);
        assert.match(result.stderr, /DEMO_PORT must be/);
    }
});
