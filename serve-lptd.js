#!/usr/bin/env node
/* =========================================================
   op/tools/serve-lptd.js
   Static server có hỗ trợ HTTP Range (seek audio) để chạy thử op/index.html.

   Vì sao cần: server.js gốc dùng fs.readFile + không trả Accept-Ranges,
   nên Chromium coi audio local là không tua được (seekable = [0,0]).
   Server này trả 206 Partial Content + Accept-Ranges: bytes.

   Chạy:
     node op/tools/serve-lptd.js
     node op/tools/serve-lptd.js --port 8096
   Mở:
     http://localhost:8096/op/index.html
   ========================================================= */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_PAGE = '/op/index.html';
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function getPort() {
  const ix = process.argv.indexOf('--port');
  const value = ix !== -1 ? Number(process.argv[ix + 1]) : Number(process.env.PORT || 8096);
  return value > 0 ? value : 8096;
}

function parseRange(header, size) {
  const m = /^bytes=(\d*)-(\d*)$/i.exec(String(header || '').trim());
  if (!m) return null;
  let start = m[1] === '' ? null : Number(m[1]);
  let end = m[2] === '' ? null : Number(m[2]);
  if (start == null && end == null) return null;
  if (start == null) { // bytes=-N  → N byte cuối
    const suffix = Math.min(end, size);
    start = size - suffix;
    end = size - 1;
  } else {
    if (end == null || end >= size) end = size - 1;
  }
  if (start < 0 || start >= size || end < start) return null;
  return { start, end };
}

const server = http.createServer(function (req, res) {
  let pathname;
  try {
    pathname = decodeURIComponent(url.parse(req.url).pathname || '/');
  } catch (e) {
    res.writeHead(400);
    return res.end('bad url');
  }
  if (pathname === '/') pathname = DEFAULT_PAGE;

  const filePath = path.resolve(ROOT, '.' + pathname);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('forbidden');
  }

  fs.stat(filePath, function (err, stat) {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('not found: ' + pathname);
    }

    const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    const range = parseRange(req.headers.range, stat.size);
    const baseHeaders = {
      'Content-Type': type,
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    };

    if (req.method === 'HEAD') {
      const headers = Object.assign({}, baseHeaders, { 'Content-Length': stat.size });
      if (range) {
        headers['Content-Range'] = 'bytes ' + range.start + '-' + range.end + '/' + stat.size;
        headers['Content-Length'] = range.end - range.start + 1;
        res.writeHead(206, headers);
        return res.end();
      }
      res.writeHead(200, headers);
      return res.end();
    }

    if (range) {
      const headers = Object.assign({}, baseHeaders, {
        'Content-Range': 'bytes ' + range.start + '-' + range.end + '/' + stat.size,
        'Content-Length': range.end - range.start + 1,
      });
      res.writeHead(206, headers);
      if (req.method === 'GET') {
        fs.createReadStream(filePath, { start: range.start, end: range.end }).pipe(res);
      } else return res.end();
      return;
    }

    res.writeHead(200, Object.assign({}, baseHeaders, { 'Content-Length': stat.size }));
    if (req.method === 'GET') fs.createReadStream(filePath).pipe(res);
    else res.end();
  });
});

const port = getPort();
server.listen(port, function () {
  console.log('LPTD test server: http://localhost:' + port + '/op/index.html');
  console.log('Root: ' + ROOT);
  console.log('Range: bật (seek audio hoạt động)');
});
