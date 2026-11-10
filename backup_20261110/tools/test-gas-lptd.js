#!/usr/bin/env node
/* =========================================================
   op/tools/test-gas-lptd.js
   Kiểm thử backend Google Apps Script mà không cần deploy:
     - Nạp LptdData.gs + Code.lptd.gs trong VM với stub GAS.
     - Kiểm tra getLptdBootstrap / getLptdLessons / getLptdBooks / getLptdUnit.
     - Kiểm tra override Settings LPTD_AUDIO_CDN_BASE / LPTD_DOCS_CDN_BASE.

   Chạy:
     node op/tools/test-gas-lptd.js
   Exit code 0 = PASS, 1 = FAIL.
   ========================================================= */
'use strict';

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DATA_GS = path.join(ROOT, 'op', 'app', 'LptdData.gs');
const CODE_GS = path.join(ROOT, 'op', 'app', 'Code.lptd.gs');
const EXPECTED_CDN = 'https://toeic-audio.netlify.app/audio/lptd';

function read(file) {
  if (!fs.existsSync(file)) {
    console.error('✗ Thiếu ' + path.relative(ROOT, file) + ' — chạy op/tools/build-lptd-data.js trước.');
    process.exit(1);
  }
  return fs.readFileSync(file, 'utf8');
}

function createContext(settings) {
  const ctx = {
    Logger: { log: function () {} },
    UrlFetchApp: {
      fetch: function () {
        return {
          getResponseCode: function () { return 206; },
          getHeaders: function () { return { 'Content-Type': 'audio/mpeg' }; },
        };
      },
    },
    settingsMap_: function () { return settings || {}; },
    audioCdnBase_: function () { return 'https://toeic-audio.netlify.app/audio'; },
  };
  vm.createContext(ctx);
  vm.runInContext(read(DATA_GS), ctx, { filename: 'LptdData.gs' });
  vm.runInContext(read(CODE_GS), ctx, { filename: 'Code.lptd.gs' });
  return ctx;
}

const results = [];
function check(name, cond, extra) {
  results.push({ name: name, pass: !!cond, extra: extra == null ? '' : String(extra) });
}

const gas = createContext({});
const boot = gas.getLptdBootstrap();
const lessons = gas.getLptdLessons();
const books = gas.getLptdBooks();
const unit = gas.getLptdUnit(3, 7);
const meta = gas.LPTD_LESSONS_META();

check('bootstrap.lessonCount = 160', boot.lessonCount === 160, boot.lessonCount);
check('bootstrap.lessons = 160', Array.isArray(boot.lessons) && boot.lessons.length === 160);
check('bootstrap.cdnBase đúng', boot.cdnBase === EXPECTED_CDN, boot.cdnBase);
check('getLptdLessons = 160', Array.isArray(lessons) && lessons.length === 160);
check('cdnUrl Unit 1 đúng', lessons[0].cdnUrl === EXPECTED_CDN + '/LPTD1U01.mp3', lessons[0].cdnUrl);
check('getLptdBooks = 4', Array.isArray(books) && books.length === 4);
check('getLptdUnit(3,7) đúng', unit && unit.id === 'lptd-3-07', unit && unit.id);
check('getLptdUnit có cdnUrl', unit && /LPTD3U07\.mp3$/.test(unit.cdnUrl), unit && unit.cdnUrl);
check('meta.totals đúng', meta.totals.units === 160 && meta.totals.lines === 1041 && meta.totals.words === 30555,
  JSON.stringify(meta.totals));
check('lines giữ nguyên', lessons[0].lines.length === 9 && lessons[0].lines[0].speaker === 'W');

const custom = createContext({
  LPTD_AUDIO_CDN_BASE: 'https://cdn.example.com/lptd/',
  LPTD_DOCS_CDN_BASE: 'https://cdn.example.com/doc/',
});
const boot2 = custom.getLptdBootstrap();
check('override audio base', boot2.cdnBase === 'https://cdn.example.com/lptd', boot2.cdnBase);
check('override audio url', boot2.lessons[0].cdnUrl === 'https://cdn.example.com/lptd/LPTD1U01.mp3', boot2.lessons[0].cdnUrl);
check('override docs base', boot2.docsCdnBase === 'https://cdn.example.com/doc', boot2.docsCdnBase);

let failed = 0;
console.log('== test-gas-lptd ==');
results.forEach(function (r) {
  console.log((r.pass ? '  ✓ ' : '  ✗ ') + r.name + (r.extra ? '  [' + r.extra + ']' : ''));
  if (!r.pass) failed++;
});

if (failed) {
  console.log('\n✗ FAIL — ' + failed + '/' + results.length + ' lỗi.');
  process.exit(1);
}
console.log('\n✓ PASS — GAS API (mock) hợp lệ: ' + results.length + '/' + results.length + '.');
