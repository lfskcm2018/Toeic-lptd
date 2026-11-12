#!/usr/bin/env node
/* deploy-audio-merged.js — 600+ (merge vào site dùng chung) */
'use strict';
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const https = require('https');

const SITE_ID = '7951df54-c4fb-4717-b6f4-ddae3f8d480d';
const ROOT = process.cwd();

const SOURCES = [
  { dir: path.join(ROOT, 'op/Tích hợp nội dung mới/Hacker 1/_deploy_audio/audio/hacker1'), remoteDir: '/audio/hacker1', pattern: /\.mp3$/i },
  { dir: path.join(ROOT, 'op/Tích hợp nội dung mới/Dictation Part 2/_deploy_audio/audio/dictation-part2'), remoteDir: '/audio/dictation-part2', pattern: /\.mp3$/i },
  { dir: path.join(ROOT, 'op/Tích hợp nội dung mới/600+/_deploy_audio/audio/600plus'), remoteDir: '/audio/600plus', pattern: /\.mp3$/i },
];

function readToken() {
  const appData = process.env.APPDATA || path.join(process.env.USERPROFILE || '', 'AppData', 'Roaming');
  const candidates = [path.join(appData, 'netlify', 'Config', 'config.json'), path.join(process.env.USERPROFILE || '', '.netlify', 'config.json')];
  for (const p of candidates) {
    if (!fs.existsSync(p)) continue;
    const cfg = JSON.parse(fs.readFileSync(p, 'utf8'));
    const uid = cfg.userId || Object.keys(cfg.users || {})[0];
    const token = cfg.users && cfg.users[uid] && cfg.users[uid].auth && cfg.users[uid].auth.token;
    if (token) return token;
  }
  throw new Error('Không tìm thấy Netlify token.');
}
const TOKEN = readToken();
function api(method, apiPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = { hostname: 'api.netlify.com', path: apiPath, method, headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json', ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}) } };
    const req = https.request(opts, (res) => { let d = ''; res.on('data', c => d += c); res.on('end', () => { let j; try { j = JSON.parse(d); } catch (e) { j = d; } if (res.statusCode >= 200 && res.statusCode < 300) resolve(j); else reject(new Error('HTTP ' + res.statusCode + ': ' + String(typeof j === 'string' ? j : JSON.stringify(j)).slice(0, 400))); }); });
    req.on('error', reject); if (data) req.write(data); req.end();
  });
}
function uploadFile(deployId, remotePath, localPath) {
  return new Promise((resolve, reject) => {
    const buf = fs.readFileSync(localPath);
    const upPath = '/api/v1/deploys/' + deployId + '/files/' + encodeURIComponent(remotePath.replace(/^\//, ''));
    const opts = { hostname: 'api.netlify.com', path: upPath, method: 'PUT', headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/octet-stream', 'Content-Length': buf.length } };
    const req = https.request(opts, (res) => { let d = ''; res.on('data', c => d += c); res.on('end', () => { if (res.statusCode >= 200 && res.statusCode < 300) resolve({ status: res.statusCode }); else reject(new Error('UPLOAD ' + remotePath + ' HTTP ' + res.statusCode + ': ' + d.slice(0, 300))); }); });
    req.on('error', reject); req.write(buf); req.end();
  });
}
(async () => {
  console.log('== deploy-audio-merged (600+) ==');
  const site = await api('GET', '/api/v1/sites/' + SITE_ID);
  const live = site.published_deploy;
  const liveFiles = await api('GET', '/api/v1/deploys/' + live.id + '/files');
  const filesMap = {}; for (const f of liveFiles) filesMap[f.path] = f.sha;
  console.log('base files:', Object.keys(filesMap).length);
  const localBySha = {}; let localCount = 0;
  for (const src of SOURCES) {
    if (!fs.existsSync(src.dir)) { console.warn('  ⚠️ thiếu:', src.dir); continue; }
    const names = fs.readdirSync(src.dir).filter(n => src.pattern.test(n));
    for (const name of names) {
      const local = path.join(src.dir, name);
      const sha = crypto.createHash('sha1').update(fs.readFileSync(local)).digest('hex');
      const remotePath = src.remoteDir + '/' + name;
      filesMap[remotePath] = sha;
      localBySha[sha] = { remotePath, local, name };
      localCount++;
    }
    console.log(' +', src.remoteDir, names.length, 'files');
  }
  console.log('local audio:', localCount, '| total:', Object.keys(filesMap).length);
  const deploy = await api('POST', '/api/v1/sites/' + SITE_ID + '/deploys', { files: filesMap, draft: false });
  console.log('deploy id:', deploy.id, '| state:', deploy.state, '| required:', (deploy.required || []).length);
  let uploaded = 0;
  for (const sha of deploy.required || []) {
    const item = localBySha[sha];
    if (!item) { console.warn('  ⚠️ blob không local:', sha); continue; }
    await uploadFile(deploy.id, item.remotePath, item.local); uploaded++;
  }
  console.log('uploaded:', uploaded, '/', (deploy.required || []).length);
  let final = deploy;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 3000));
    final = await api('GET', '/api/v1/deploys/' + deploy.id);
    console.log('state:', final.state, final.error_message || '');
    if (final.state === 'ready' || final.state === 'error') break;
  }
  if (final.state !== 'ready') throw new Error('Deploy không ready: ' + final.state);
  console.log('URL:', final.ssl_url || final.url);
  const out = path.join(ROOT, 'op/Tích hợp nội dung mới/600+/reports/last-audio-deploy.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ deployId: final.id, url: final.ssl_url || final.url, totalFiles: Object.keys(filesMap).length, uploaded, finishedAt: new Date().toISOString() }, null, 2) + '\n');
  console.log('saved:', path.relative(ROOT, out));
})().catch(err => { console.error('LỖI:', err.message); process.exit(1); });
