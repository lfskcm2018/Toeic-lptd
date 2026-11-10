#!/usr/bin/env node
/* =========================================================
   op/tools/verify-cdn.js
   Kiểm tra 160 file MP3 LPTD trên Netlify CDN:
     - HTTP 200/206
     - Content-Type: audio/mpeg
     - CORS: * (nếu CDN trả header)
     - Accept-Ranges: bytes (tua được)
     - Content-Length khớp dung lượng file local (nếu có)

   Chạy:
     node op/tools/verify-cdn.js
     node op/tools/verify-cdn.js --concurrency 8
     node op/tools/verify-cdn.js --sample 5

   Exit code 0 = PASS, 1 = FAIL.
   ========================================================= */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DATA = path.join(ROOT, 'op', 'data', 'lptd-lessons.json');
const DEFAULT_BASE = 'https://toeic-audio.netlify.app/audio/lptd';

function arg(name, def) {
  const ix = process.argv.indexOf('--' + name);
  return ix !== -1 && process.argv[ix + 1] ? process.argv[ix + 1] : def;
}

const CONC = Math.max(1, Number(arg('concurrency', 10)) || 10);
const SAMPLE = Math.max(0, Number(arg('sample', 0)) || 0);
const BASE = String(arg('base', DEFAULT_BASE)).replace(/\/+$/, '');

function loadLessons() {
  if (!fs.existsSync(DATA)) {
    console.error('✗ Thiếu ' + path.relative(ROOT, DATA) + ' — chạy build-lptd-data.js trước.');
    process.exit(1);
  }
  const payload = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  return Array.isArray(payload) ? payload : payload.lessons || [];
}

function localSize(lesson) {
  try {
    const full = path.join(ROOT, lesson.localPath.replace(/\//g, path.sep));
    return fs.existsSync(full) ? fs.statSync(full).size : null;
  } catch (e) { return null; }
}

async function head(url) {
  const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
  return { res, headers: res.headers };
}

async function check(lesson) {
  const url = BASE + '/' + lesson.cdnName;
  const expected = localSize(lesson);
  let lastErr = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { res, headers } = await head(url);
      const status = res.status;
      const type = (headers.get('content-type') || '').toLowerCase();
      const cors = headers.get('access-control-allow-origin') || '';
      const ranges = (headers.get('accept-ranges') || '').toLowerCase();
      const len = Number(headers.get('content-length') || 0);

      const problems = [];
      if (status !== 200 && status !== 206) problems.push('HTTP ' + status);
      if (type.indexOf('audio') === -1 && type.indexOf('mpeg') === -1) problems.push('Content-Type=' + (type || '(none)'));
      if (!cors) problems.push('thiếu CORS');
      if (ranges && ranges.indexOf('bytes') === -1) problems.push('Accept-Ranges=' + ranges);
      if (expected != null && len && len !== expected) problems.push('size ' + len + ' != local ' + expected);

      return { lesson, url, status, type, cors, ranges, len, expected, problems };
    } catch (e) {
      lastErr = e;
      await new Promise(function (r) { setTimeout(r, 400); });
    }
  }
  return { lesson, url, problems: ['network: ' + (lastErr && lastErr.message ? lastErr.message : lastErr)] };
}

async function main() {
  console.log('== verify-cdn ==');
  console.log('Base: ' + BASE);
  console.log('Concurrency: ' + CONC);

  let lessons = loadLessons();
  if (SAMPLE > 0) lessons = lessons.slice(0, SAMPLE);
  console.log('Số file kiểm tra: ' + lessons.length + '\n');

  const results = [];
  let index = 0;
  async function worker() {
    while (index < lessons.length) {
      const lesson = lessons[index++];
      const r = await check(lesson);
      results.push(r);
      if (r.problems.length) console.log('  ✗ ' + lesson.cdnName + ' — ' + r.problems.join(', '));
      else if (process.stdout.isTTY && results.length % 20 === 0) console.log('  … ' + results.length + '/' + lessons.length);
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONC, lessons.length) }, worker));

  const ok = results.filter(function (r) { return !r.problems.length; }).length;
  const bad = results.length - ok;
  const missingCors = results.filter(function (r) { return r.problems.some(function (p) { return p.indexOf('CORS') !== -1; }); }).length;
  const missingRange = results.filter(function (r) { return r.problems.some(function (p) { return p.indexOf('Accept-Ranges') !== -1; }); }).length;

  console.log('\n--- KẾT QUẢ ---');
  console.log('  PASS: ' + ok + '/' + results.length);
  console.log('  FAIL: ' + bad);
  if (missingCors) console.log('  Thiếu CORS: ' + missingCors);
  if (missingRange) console.log('  Không hỗ trợ Range: ' + missingRange);

  if (bad) {
    console.log('\n✗ FAIL — CDN chưa sẵn sàng cho toàn bộ LPTD.');
    process.exit(1);
  }
  console.log('\n✓ PASS — toàn bộ audio LPTD phát trực tiếp + tua được trên CDN.');
}

main().catch(function (e) {
  console.error('✗ Lỗi không mong đợi: ' + (e && e.stack ? e.stack : e));
  process.exit(1);
});
