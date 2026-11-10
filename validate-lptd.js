#!/usr/bin/env node
/* =========================================================
   op/tools/validate-lptd.js
   Kiểm tra toàn bộ dữ liệu LPTD đã build:
     - 160 unit, 40 unit/cuốn, id duy nhất
     - mỗi unit có title, audioFileName, ≥1 câu, text không rỗng
     - audio local tồn tại đúng tên
     - CDN name đúng chuẩn LPTD{B}U{NN}.mp3
     - không còn lỗi trích xuất đã biết (từ dính, "---", nháy cong)
     - lptd-lessons-data.js và LptdData.gs khớp JSON nguồn
     - CSV manifest đủ 160 dòng
     - stats khớp totals

   Chạy:
     node op/tools/validate-lptd.js
   Exit code 0 = PASS, 1 = FAIL.
   ========================================================= */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const OP = path.join(ROOT, 'op');
const CDN_BASE = 'https://toeic-audio.netlify.app/audio/lptd';

const errors = [];
const warnings = [];

function fail(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }
function read(rel) { return fs.readFileSync(path.join(OP, rel), 'utf8'); }
function exists(rel) { return fs.existsSync(path.join(OP, rel)); }

/* Những cụm lỗi trích xuất PDF đã biết — nếu còn thì build chưa sửa hết. */
const KNOWN_BAD_TOKENS = [
  'differentareas', 'discoveredmany', 'sparklingclean', 'systemthat',
  'lisagreat', 'lisabefore', 'lisapainted', 'lisawould', 'everyoneelse',
  'childrenlearn', 'sawyerand', 'conductorcame', 'afamous', 'computerfor',
  'ourselvesthat', 'centimeterslong', 'academyparking', 'mid-wintertrip',
  'todaymagazine', 'someoneand', 'julietwas', 'centerfor', 'communicateand',
  'sometimesbite', 'cannotbe', 'musicon',
];

function pad2(n) { return String(n).padStart(2, '0'); }

function countWords(text) {
  return String(text || '').split(/\s+/).filter(function (w) { return /[A-Za-z0-9]/.test(w); }).length;
}

function deepEqual(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

function loadDataJson() {
  if (!exists('data/lptd-lessons.json')) {
    fail('thiếu op/data/lptd-lessons.json — chạy build-lptd-data.js trước');
    return null;
  }
  try {
    return JSON.parse(read('data/lptd-lessons.json'));
  } catch (e) {
    fail('JSON không hợp lệ: ' + e.message);
    return null;
  }
}

function validateStructure(data) {
  if (!data || !Array.isArray(data.lessons)) { fail('payload.lessons không phải mảng'); return; }
  if (data.schemaVersion !== 1) fail('schemaVersion phải = 1');
  if (data.cdnBase !== CDN_BASE) fail('cdnBase sai: ' + data.cdnBase);

  const lessons = data.lessons;
  if (lessons.length !== 160) fail('tổng unit = ' + lessons.length + ' (yêu cầu 160)');

  const ids = new Set();
  const byBook = { 1: 0, 2: 0, 3: 0, 4: 0 };
  let totalLines = 0, totalWords = 0;

  lessons.forEach(function (u, idx) {
    const where = 'unit[' + idx + '] ' + (u && u.id ? u.id : '?');
    if (!u || typeof u !== 'object') { fail(where + ': không phải object'); return; }
    if (!/^lptd-[1-4]-\d{2}$/.test(String(u.id))) fail(where + ': id sai chuẩn');
    if (ids.has(u.id)) fail(where + ': id trùng');
    ids.add(u.id);
    if (!(u.book >= 1 && u.book <= 4)) { fail(where + ': book ngoài 1-4'); } else { byBook[u.book]++; }
    if (!(u.unit >= 1 && u.unit <= 40)) fail(where + ': unit ngoài 1-40');
    if (!u.title || !String(u.title).trim()) fail(where + ': thiếu title');
    if (!u.audioFileName || !/\.mp3$/i.test(u.audioFileName)) fail(where + ': audioFileName không hợp lệ');
    if (u.cdnName !== 'LPTD' + u.book + 'U' + pad2(u.unit) + '.mp3') fail(where + ': cdnName sai (' + u.cdnName + ')');
    if (!u.localPath || u.localPath.indexOf('Audio + Transcipt/') === -1) fail(where + ': localPath sai');
    if (!Array.isArray(u.lines) || !u.lines.length) { fail(where + ': không có câu thoại'); return; }

    let words = 0;
    u.lines.forEach(function (l, li) {
      const at = where + ' câu ' + (li + 1);
      if (!l || typeof l.text !== 'string' || !l.text.trim()) fail(at + ': text rỗng');
      if (l.no !== li + 1) warn(at + ': số thứ tự không liên tục (' + l.no + ')');
      if (l.speaker && !/^[A-Z][A-Z0-9]?$/.test(l.speaker)) warn(at + ': speaker lạ "' + l.speaker + '"');
      const text = l.text || '';
      if (/\s{2,}/.test(text)) fail(at + ': có khoảng trắng kép');
      if (/[\u2018\u2019\u201C\u201D]/.test(text)) fail(at + ': còn nháy cong chưa chuẩn hóa');
      if (/---/.test(text)) fail(at + ': còn "---"');
      if (/([,;:])[A-Za-z]/.test(text)) fail(at + ': dấu câu dính chữ');
      if (/[.!?][A-Z][a-z]/.test(text)) fail(at + ': dấu kết câu dính chữ');
      KNOWN_BAD_TOKENS.forEach(function (bad) {
        if (text.toLowerCase().indexOf(bad) !== -1) fail(at + ': còn cụm lỗi "' + bad + '"');
      });
      words += countWords(text);
    });
    if (u.lineCount !== u.lines.length) fail(where + ': lineCount không khớp');
    if (u.wordCount !== words) fail(where + ': wordCount không khớp (' + u.wordCount + ' != ' + words + ')');
    totalLines += u.lines.length;
    totalWords += words;
  });

  [1, 2, 3, 4].forEach(function (b) {
    if (byBook[b] !== 40) fail('cuốn ' + b + ' có ' + byBook[b] + ' unit (yêu cầu 40)');
  });
  if (data.totals.units !== lessons.length) fail('totals.units không khớp');
  if (data.totals.lines !== totalLines) fail('totals.lines không khớp (' + data.totals.lines + ' != ' + totalLines + ')');
  if (data.totals.words !== totalWords) fail('totals.words không khớp (' + data.totals.words + ' != ' + totalWords + ')');
  if (!Array.isArray(data.books) || data.books.length !== 4) fail('books phải có 4 phần tử');
  else data.books.forEach(function (b) {
    if (b.units !== 40) fail('books[' + b.book + '].units != 40');
  });

  return { lessons: lessons, totalLines: totalLines, totalWords: totalWords };
}

function validateLocalAudio(lessons) {
  let missing = 0;
  lessons.forEach(function (u) {
    const full = path.join(ROOT, u.localPath.replace(/\//g, path.sep));
    if (!fs.existsSync(full)) { missing++; fail('thiếu MP3 local: ' + u.localPath); }
  });
  return missing;
}

function validateLocalJs(lessons) {
  if (!exists('app/lptd-lessons-data.js')) { fail('thiếu app/lptd-lessons-data.js'); return; }
  const sandbox = { window: {} };
  try {
    vm.runInNewContext(read('app/lptd-lessons-data.js'), sandbox, { filename: 'lptd-lessons-data.js' });
  } catch (e) {
    fail('lptd-lessons-data.js lỗi cú pháp: ' + e.message);
    return;
  }
  if (!Array.isArray(sandbox.window.LPTD_LESSONS_RAW)) { fail('LPTD_LESSONS_RAW không phải mảng'); return; }
  if (sandbox.window.LPTD_LESSONS_RAW.length !== lessons.length) fail('LPTD_LESSONS_RAW.length != JSON');
  if (!deepEqual(sandbox.window.LPTD_LESSONS_RAW, lessons)) fail('LPTD_LESSONS_RAW khác JSON nguồn — chạy lại build');
  const meta = sandbox.window.LPTD_LESSONS_META;
  if (!meta || !meta.totals || meta.totals.units !== 160) fail('LPTD_LESSONS_META.totals sai');
  return sandbox.window.LPTD_LESSONS_RAW.length;
}

function validateGas(lessons) {
  if (!exists('app/LptdData.gs')) { fail('thiếu app/LptdData.gs'); return; }
  const sandbox = {};
  try {
    vm.runInNewContext(read('app/LptdData.gs'), sandbox, { filename: 'LptdData.gs' });
  } catch (e) {
    fail('LptdData.gs lỗi cú pháp: ' + e.message);
    return;
  }
  if (typeof sandbox.LPTD_LESSONS !== 'function') { fail('LptdData.gs thiếu hàm LPTD_LESSONS()'); return; }
  if (typeof sandbox.LPTD_LESSONS_META !== 'function') { fail('LptdData.gs thiếu hàm LPTD_LESSONS_META()'); return; }
  const gasLessons = sandbox.LPTD_LESSONS();
  if (!Array.isArray(gasLessons) || gasLessons.length !== lessons.length) fail('LPTD_LESSONS() trả sai số unit');
  else if (!deepEqual(gasLessons, lessons)) fail('LPTD_LESSONS() khác JSON nguồn — chạy lại build');
  const meta = sandbox.LPTD_LESSONS_META();
  if (!meta || meta.totals.units !== 160) fail('LPTD_LESSONS_META() sai');
  return Array.isArray(gasLessons) ? gasLessons.length : 0;
}

function validateCsv(lessons) {
  if (!exists('data/lptd-cdn-manifest.csv')) { fail('thiếu data/lptd-cdn-manifest.csv'); return; }
  const lines = read('data/lptd-cdn-manifest.csv').replace(/\r/g, '').split('\n').filter(Boolean);
  if (lines.length !== lessons.length + 1) fail('CSV có ' + (lines.length - 1) + ' dòng dữ liệu (yêu cầu 160)');
  const header = lines[0].split(',');
  if (header[0] !== 'book' || header[4] !== 'cdnName') fail('CSV header sai');
  const sample = lines[1].split(',');
  if (sample.length < 8) fail('CSV dòng 1 thiếu cột');
}

function validateStats(data) {
  if (!exists('data/lptd-stats.json')) { fail('thiếu data/lptd-stats.json'); return; }
  let stats;
  try { stats = JSON.parse(read('data/lptd-stats.json')); }
  catch (e) { fail('lptd-stats.json lỗi: ' + e.message); return; }
  if (!deepEqual(stats.totals, data.totals)) fail('stats.totals khác lessons JSON');
  if (!Array.isArray(stats.books) || stats.books.length !== 4) fail('stats.books sai');
}

function main() {
  console.log('== validate-lptd ==');
  const data = loadDataJson();
  if (!data) { printAndExit(); return; }

  const structure = validateStructure(data);
  if (structure) {
    const missing = validateLocalAudio(structure.lessons);
    const jsCount = validateLocalJs(structure.lessons);
    const gasCount = validateGas(structure.lessons);
    validateCsv(structure.lessons);
    validateStats(data);

    console.log('  • JSON          : ' + structure.lessons.length + ' unit / ' + structure.totalLines + ' câu / ' + structure.totalWords + ' từ');
    console.log('  • MP3 local     : ' + (structure.lessons.length - missing) + '/' + structure.lessons.length + ' tồn tại');
    console.log('  • lptd-lessons-data.js : ' + jsCount + ' unit');
    console.log('  • LptdData.gs   : ' + gasCount + ' unit');
    console.log('  • CSV manifest  : 160 dòng');
  }

  if (warnings.length) {
    console.log('\n⚠ Cảnh báo (' + warnings.length + '):');
    warnings.slice(0, 20).forEach(function (w) { console.log('  - ' + w); });
  }

  if (errors.length) {
    console.log('\n✗ FAIL — ' + errors.length + ' lỗi:');
    errors.slice(0, 40).forEach(function (e) { console.log('  - ' + e); });
    process.exit(1);
  }

  console.log('\n✓ PASS — dữ liệu LPTD hợp lệ.');
}

function printAndExit() {
  console.log('\n✗ FAIL — không đọc được dữ liệu.');
  process.exit(1);
}

main();
