#!/usr/bin/env node
/* Tạo backup + bàn giao cho dự án con EPI Elementary */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const SRC = path.resolve(__dirname, '..', '..');
const OP = path.join(ROOT, 'op');
const BACKUP = path.join(OP, 'backup_20261112_epu');
const HAND = path.join(OP, 'ban-giao-epu');

function mkdirp(p) { fs.mkdirSync(p, { recursive: true }); }
function cp(src, dst) {
  mkdirp(path.dirname(dst));
  fs.copyFileSync(src, dst);
}
function write(p, s) { mkdirp(path.dirname(p)); fs.writeFileSync(p, s, 'utf8'); }

const DATA = path.join(SRC, 'work', 'data');
const TOOLS = path.join(SRC, 'work', 'tools');
const GAS = path.join(SRC, 'work', 'gas');
const OCR = path.join(SRC, 'work', 'ocr');

/* ---------- 1. BACKUP ---------- */
if (fs.existsSync(BACKUP)) fs.rmSync(BACKUP, { recursive: true, force: true });
const backupFiles = [
  ['work/data/epu-lessons.json', 'work/data/epu-lessons.json'],
  ['work/data/epu-units-meta.js', 'work/data/epu-units-meta.js'],
  ['work/data/epu-track-map.js', 'work/data/epu-track-map.js'],
  ['work/data/epu-section-e.js', 'work/data/epu-section-e.js'],
  ['work/tools/build-epu-data.js', 'work/tools/build-epu-data.js'],
  ['work/tools/build-track-map.js', 'work/tools/build-track-map.js'],
  ['work/tools/build-gas-epu.js', 'work/tools/build-gas-epu.js'],
  ['work/tools/build-main-app-epu.js', 'work/tools/build-main-app-epu.js'],
  ['work/tools/parse-content-v4.js', 'work/tools/parse-content-v4.js'],
  ['work/tools/parse-e.js', 'work/tools/parse-e.js'],
  ['work/tools/ocr-batch.mjs', 'work/tools/ocr-batch.mjs'],
  ['work/gas/Code.gs', 'work/gas/Code.gs'],
  ['work/gas/EPIData.gs', 'work/gas/EPIData.gs'],
  ['work/gas/EPIUI.html', 'work/gas/EPIUI.html'],
  ['work/gas/Index.html', 'work/gas/Index.html'],
  ['work/gas/Styles.html', 'work/gas/Styles.html'],
  ['work/gas/appsscript.json', 'work/gas/appsscript.json'],
  ['work/gas/.clasp.json', 'work/gas/.clasp.json'],
  ['work/ocr/units-content-v4.json', 'work/ocr/units-content-v4.json'],
  ['work/ocr/track-map.json', 'work/ocr/track-map.json'],
  ['work/ocr/sound-pairs.json', 'work/ocr/sound-pairs.json'],
  ['KE_HOACH_TRIEN_KHAI.md', 'KE_HOACH_TRIEN_KHAI.md'],
];
for (const [a, b] of backupFiles) {
  const s = path.join(SRC, a);
  if (fs.existsSync(s)) cp(s, path.join(BACKUP, b));
  else console.log('  ! thiếu', a);
}
console.log('backup ->', path.relative(ROOT, BACKUP));

/* ---------- 2. HANDOVER ---------- */
if (fs.existsSync(HAND)) fs.rmSync(HAND, { recursive: true, force: true });
mkdirp(HAND);

const lessons = JSON.parse(fs.readFileSync(path.join(DATA, 'epu-lessons.json'), 'utf8'));

/* files/data */
cp(path.join(DATA, 'epu-lessons.json'), path.join(HAND, 'files/data/epu-lessons.json'));
cp(path.join(DATA, 'epu-units-meta.js'), path.join(HAND, 'files/data/epu-units-meta.js'));
cp(path.join(DATA, 'epu-track-map.js'), path.join(HAND, 'files/data/epu-track-map.js'));
cp(path.join(DATA, 'epu-section-e.js'), path.join(HAND, 'files/data/epu-section-e.js'));

/* files/gas */
cp(path.join(ROOT, 'app', 'EpiData.gs'), path.join(HAND, 'files/gas/EpiData.gs'));
cp(path.join(ROOT, 'app', 'EpiServer.gs'), path.join(HAND, 'files/gas/EpiServer.gs'));
cp(path.join(GAS, 'Code.gs'), path.join(HAND, 'files/gas/Code.epu-standalone.gs'));
cp(path.join(GAS, 'EPIData.gs'), path.join(HAND, 'files/gas/EPIData.epu-standalone.gs'));
cp(path.join(GAS, 'EPIUI.html'), path.join(HAND, 'files/gas/EPIUI.epu-standalone.html'));
cp(path.join(ROOT, 'app', 'LptdUI.html'), path.join(HAND, 'files/gas/LptdUI.epu-reference.html'));

/* files/tools */
['build-epu-data.js', 'build-gas-epu.js', 'build-main-app-epu.js', 'parse-content-v4.js', 'parse-e.js', 'ocr-batch.mjs']
  .forEach((f) => cp(path.join(TOOLS, f), path.join(HAND, 'files/tools', f)));

/* files/extract — bản chép lại mapping + metadata (nguồn: đọc tay trong sách) */
const mapSrc = fs.readFileSync(path.join(DATA, 'epu-track-map.js'), 'utf8');
const metaSrc = fs.readFileSync(path.join(DATA, 'epu-units-meta.js'), 'utf8');
write(path.join(HAND, 'files/extract/epu-mapping.txt'), [
  '=== EPI ELEMENTARY — MAPPING AUDIO ↔ UNIT (đọc tay từ marker trong sách) ===',
  '',
  'Marker trong sách = icon tai nghe hồng + nhãn "<CD><số track><phần>".',
  'Mỗi unit = 1 dải track liên tiếp trên CD của nó.',
  'Tổng khớp chính xác: CD A 81, CD B 92, CD C 85, CD D 55, CD E 38 = 351 track.',
  '',
  mapSrc,
  '',
  '=== METADATA 50 UNIT + SECTION E (IPA đọc tay từ ảnh trang Mục lục) ===',
  '',
  metaSrc,
].join('\n'));

/* files/audio — manifest CDN */
const AUDIO_DIR = path.join(OP, 'epu-audio');
const audioFiles = fs.readdirSync(AUDIO_DIR).filter((n) => /\.mp3$/i.test(n)).sort();
const byCd = {};
audioFiles.forEach((n) => { const cd = n.split('-')[0]; (byCd[cd] = byCd[cd] || []).push(n); });
const manifest = {
  source: 'English Pronunciation in Use Elementary (Cambridge, 2007)',
  cdnBase: 'https://lfskcm2018.github.io/Toeic-lptd/epu-audio',
  totalFiles: audioFiles.length,
  byCd: Object.keys(byCd).map((cd) => ({
    cd,
    count: byCd[cd].length,
    first: byCd[cd][0],
    last: byCd[cd][byCd[cd].length - 1],
    files: byCd[cd],
  })),
};
write(path.join(HAND, 'files/audio/epu-cdn-manifest.json'), JSON.stringify(manifest, null, 2));
write(path.join(HAND, 'files/audio/upload-manifest.csv'),
  'cd,track,file,url\n' + audioFiles.map((n) => {
    const cd = n.split('-')[0], t = n.match(/Track(\d+)/)[1];
    return `${cd},${t},${n},https://lfskcm2018.github.io/Toeic-lptd/epu-audio/${n}`;
  }).join('\n'));
write(path.join(HAND, 'files/audio/upload-manifest.json'), JSON.stringify(manifest.byCd, null, 2));

/* files/data/epu-meta.json + epu-source.json */
write(path.join(HAND, 'files/data/epu-meta.json'), JSON.stringify(lessons.meta, null, 2));
write(path.join(HAND, 'files/data/epu-source.json'), JSON.stringify({
  title: 'English Pronunciation in Use Elementary',
  author: 'Jonathan Marks',
  publisher: 'Cambridge University Press',
  year: 2007,
  pdf: 'Marks - English Pronunciation in Use - Elementary.pdf',
  pages: 168,
  units: 50,
  sections: ['A', 'B', 'C', 'D', 'E'],
  cds: [
    { cd: 'A', file: 'CD1', units: '1–12', tracks: 81 },
    { cd: 'B', file: 'CD2', units: '13–27', tracks: 92 },
    { cd: 'C', file: 'CD3', units: '28–43', tracks: 85 },
    { cd: 'D', file: 'CD4', units: '44–50 + Section E', tracks: 55 },
    { cd: 'E', file: 'CD5', units: 'E3 Sound pairs (37 cặp)', tracks: 38 },
  ],
  extraction: 'OCR (mupdf + tesseract.js) + đọc tay marker/audio từ ảnh chụp màn hình',
  generatedAt: new Date().toISOString(),
}, null, 2));

/* files/data/epu-local-glue.js — nối EPI vào bản local */
write(path.join(HAND, 'files/data/epu-local-glue.js'), `/* Glue EPI Elementary (book 9) vào bản local của app LPTD.
   Đặt SAU app/lptd-lessons-data.js và TRƯỚC app/lptd-data.js. */
(function (global) {
  'use strict';
  var raw = global.EPU_LESSONS_RAW || [];
  var BASE = 'https://lfskcm2018.github.io/Toeic-lptd/epu-audio';
  raw.forEach(function (u) {
    u.book = 9;
    u.cdnUrl = BASE + '/' + (u.cdnName || '');
    if (u.epi && u.epi.audioTracks) {
      u.epi.audioTracks = u.epi.audioTracks.map(function (t) { return BASE + '/' + t; });
    }
  });
  global.EPU_LESSONS_RAW = raw;
  if (global.LPTD_LESSONS_RAW) {
    global.LPTD_LESSONS_RAW = global.LPTD_LESSONS_RAW.concat(raw);
  }
})(typeof window !== 'undefined' ? window : this);
`);

console.log('handover ->', path.relative(ROOT, HAND));
