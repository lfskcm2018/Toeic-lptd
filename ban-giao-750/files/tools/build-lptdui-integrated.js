#!/usr/bin/env node
/* =========================================================
   build-lptdui-integrated.js
   Ghép app/lptd-data.js + app/lptd-ui.js  →  app/LptdUI.html
   (bundle dùng để include vào Google Apps Script, KHÔNG auto-open)

   CÁCH DÙNG (chạy tại gốc repo dự án tổng):

     node tools/build-lptdui-integrated.js

   hoặc:

     node tools/build-lptdui-integrated.js --root "E:\...\29. Học chép chính tả TOEIC"

   Script tự tìm gốc repo nếu chạy từ thư mục con: nó đi ngược lên
   cho tới khi thấy app/lptd-data.js.

   KHÔNG sửa tay app/LptdUI.html — luôn build lại từ 2 file nguồn.
   ========================================================= */
'use strict';

const fs = require('fs');
const path = require('path');

/* ---------- 1. Xác định gốc repo ---------- */
function findRoot(start) {
  let dir = path.resolve(start);
  for (let i = 0; i < 12; i++) {
    if (fs.existsSync(path.join(dir, 'app', 'lptd-data.js')) &&
        fs.existsSync(path.join(dir, 'app', 'lptd-ui.js'))) {
      return dir;
    }
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return null;
}

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : '';
}

const ROOT = findRoot(argValue('--root') || process.cwd()) ||
             findRoot(__dirname) ||
             process.cwd();

const SRC = {
  data: path.join(ROOT, 'app', 'lptd-data.js'),
  ui: path.join(ROOT, 'app', 'lptd-ui.js'),
};
const OUT = path.join(ROOT, 'app', 'LptdUI.html');

/* ---------- 2. Tiện ích ---------- */
function read(p) {
  if (!fs.existsSync(p)) throw new Error('Thiếu file: ' + p);
  return fs.readFileSync(p, 'utf8');
}

/** Tránh đóng thẻ <script> sớm nếu nội dung JS có chuỗi "</script>". */
function safeJs(src) {
  return src.replace(/<\/script/gi, '<\\/script');
}

/** Bỏ BOM + chuẩn hoá CRLF để bundle ổn định giữa các máy. */
function normalize(src) {
  return src.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
}

/* ---------- 3. Build ---------- */
function build() {
  const data = normalize(read(SRC.data));
  const ui = normalize(read(SRC.ui));
  const stamp = new Date().toISOString();

  const header = [
    '<!-- LPTD 1–4 + Hacker 1 — bản dùng để TÍCH HỢP vào app tổng.',
    '     Gồm: lptd-data.js + lptd-ui.js. KHÔNG auto-open (khác bản standalone).',
    '     Include SAU JavaScript và SAU khi đã có #modeBody + .sidebar-footer.',
    '     CSS nằm ở LptdStyles.html.',
    '     AUTO-GENERATED bởi tools/build-lptdui-integrated.js — KHÔNG SỬA TAY.',
    '     Sinh lúc: ' + stamp,
    '-->',
    '<script>',
  ].join('\n');

  const parts = [
    header,
    safeJs(data).trimEnd(),
    '</script>',
    '<script>',
    safeJs(ui).trimEnd(),
    '</script>',
    '',
  ];

  fs.writeFileSync(OUT, parts.join('\n'), 'utf8');
  return { out: OUT, bytes: fs.statSync(OUT).size, stamp };
}

/* ---------- 4. Chạy ---------- */
try {
  const res = build();
  console.log('== build-lptdui-integrated ==');
  console.log('Root : ' + ROOT);
  console.log('Data : ' + SRC.data);
  console.log('UI   : ' + SRC.ui);
  console.log('Out  : ' + res.out + ' (' + res.bytes.toLocaleString('en-US') + ' bytes)');
  console.log('OK   : ' + res.stamp);
} catch (err) {
  console.error('LỖI: ' + err.message);
  process.exit(1);
}
