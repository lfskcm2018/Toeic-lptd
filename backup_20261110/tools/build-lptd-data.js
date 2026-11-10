#!/usr/bin/env node
/* =========================================================
   op/tools/build-lptd-data.js
   Sinh toàn bộ dữ liệu LPTD từ nguồn Agnes/data/lptd-lessons.json.

   Đầu ra:
     op/data/lptd-lessons.json        (chuẩn hóa + metadata)
     op/data/lptd-stats.json          (thống kê)
     op/data/lptd-cdn-manifest.csv    (map unit -> CDN -> file local)
     op/app/lptd-lessons-data.js      (window.LPTD_LESSONS_RAW cho local)
     op/app/LptdData.gs               (LPTD_LESSONS() cho Google Apps Script)

   Chạy:
     node op/tools/build-lptd-data.js
     node op/tools/build-lptd-data.js --check   (không ghi file, chỉ kiểm tra)
   ========================================================= */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const OP = path.join(ROOT, 'op');
const SRC = path.join(ROOT, 'Agnes', 'data', 'lptd-lessons.json');
const CDN_BASE = 'https://toeic-audio.netlify.app/audio/lptd';
/* Nguồn trên đĩa lồng 2 cấp:
   Listening Practice Through Dictation/Listening Practice Through Dictation 1/... */
const LPTD_PARENT = 'Listening Practice Through Dictation';
const LPTD_DIR_PREFIX = LPTD_PARENT + '/' + LPTD_PARENT;
const CHECK_ONLY = process.argv.indexOf('--check') !== -1;

const BOOK_META = {
  1: {
    title: 'Listening Practice Through Dictation 1',
    level: 'Beginner',
    bookPdf: LPTD_DIR_PREFIX + ' 1/Listening Practice Through Dictation 1.pdf',
    transcriptPdf: LPTD_DIR_PREFIX + ' 1/Audio + Transcipt/ListeningPracticeThroughDictation_1_Transcripts.pdf',
  },
  2: {
    title: 'Listening Practice Through Dictation 2',
    level: 'Elementary',
    bookPdf: LPTD_DIR_PREFIX + ' 2/Listening Practice Through Dictation 2.pdf',
    transcriptPdf: LPTD_DIR_PREFIX + ' 2/Audio + Transcipt/LPTD 2_Transcripts.pdf',
  },
  3: {
    title: 'Listening Practice Through Dictation 3',
    level: 'Intermediate',
    bookPdf: LPTD_DIR_PREFIX + ' 3/Listening Practice Through Dictation 3.pdf',
    transcriptPdf: LPTD_DIR_PREFIX + ' 3/Audio + Transcipt/LPTD 3_transcript.pdf',
    extraDocs: [
      { label: 'Answer Key 3', file: LPTD_DIR_PREFIX + ' 3/LPTD_3_Answer_key.pdf' },
    ],
  },
  4: {
    title: 'Listening Practice Through Dictation 4',
    level: 'Upper-intermediate',
    bookPdf: '',
    transcriptPdf: LPTD_DIR_PREFIX + ' 4/Audio + Transcipt/ListeningPracticeThroughDictation_4_transcript.pdf',
    extraDocs: [
      { label: 'Transcript 4 (bản 1)', file: LPTD_DIR_PREFIX + ' 4/LPTD4.pdf' },
    ],
  },
};

/* Những cụm bị dính do trích xuất PDF — sửa thủ công, có kiểm chứng ngữ cảnh.
   Khóa là chữ thường; thay thế giữ nguyên chữ hoa/thường của phần đầu. */
const REPAIRS = [
  ['differentareas', 'different areas'],
  ['discoveredmany', 'discovered many'],
  ['sparklingclean', 'sparkling clean'],
  ['systemthat', 'system that'],
  ['lisagreat', 'Lisa great'],
  ['lisabefore', 'Lisa before'],
  ['lisapainted', 'Lisa painted'],
  ['lisawould', 'Lisa would'],
  ['everyoneelse', 'everyone else'],
  ['childrenlearn', 'children learn'],
  ['sawyerand', 'Sawyer and'],
  ['conductorcame', 'conductor came'],
  ['afamous', 'a famous'],
  ['computerfor', 'computer for'],
  ['ourselvesthat', 'ourselves that'],
  ['centimeterslong', 'centimeters long'],
  ['academyparking', 'academy parking'],
  ['mid-wintertrip', 'mid-winter trip'],
  ['todaymagazine', 'Today magazine'],
  ['someoneand', 'someone and'],
  ['julietwas', 'Juliet was'],
  ['centerfor', 'center for'],
  ['communicateand', 'communicate and'],
  ['sometimesbite', 'sometimes bite'],
  ['cannotbe', 'cannot be'],
  ['musicon', 'Music on'],
];
const REPAIR_MAP = new Map(REPAIRS.map(function (p) { return [p[0], p[1]]; }));

function repairToken(token) {
  const m = token.match(/^([^A-Za-z]*)([A-Za-z'\u2019\-]+)(.*)$/);
  if (!m) return token;
  const core = m[2];
  const fix = REPAIR_MAP.get(core.toLowerCase());
  if (!fix) return token;
  let out = fix;
  if (core[0] === core[0].toUpperCase() && core[0] !== core[0].toLowerCase()) {
    out = fix.charAt(0).toUpperCase() + fix.slice(1);
  }
  return m[1] + out + m[3];
}

function normalizeText(raw) {
  let t = String(raw == null ? '' : raw);

  // 1. Unicode: apostrophe, quote, dash, khoảng trắng đặc biệt
  t = t.replace(/[\u2018\u2019\u02BC\u0060\u00B4]/g, "'");
  t = t.replace(/[\u201C\u201D\u00AB\u00BB]/g, '"');
  t = t.replace(/[\u2013\u2014]/g, '—');
  t = t.replace(/\u00A0/g, ' ');
  t = t.replace(/[\u200B\u200C\u200D\uFEFF]/g, '');

  // 2. Sửa lỗi dính từ đã xác minh
  t = t.split(/\s+/).map(repairToken).join(' ');

  // 3. www .example.com -> www.example.com
  t = t.replace(/\bwww\s+\./gi, 'www.');

  // 4. Dấu phẩy/chấm phẩy/hai chấm dính chữ: "chemistry,and" -> "chemistry, and"
  t = t.replace(/([,;:])(?=[A-Za-z])/g, '$1 ');

  // 5. Dấu kết câu dính chữ HOA: "rock.The" -> "rock. The" (an toàn với a.m./p.m.)
  t = t.replace(/([.!?])(?=[A-Z][a-z])/g, '$1 ');

  // 6. Gạch nối dài --- (ngắt giọng) -> " — "
  t = t.replace(/\s*-{2,}\s*/g, ' — ');
  t = t.replace(/\s+—\s+/g, ' — ');

  // 7. Chuẩn hóa khoảng trắng
  t = t.replace(/\s+/g, ' ').trim();

  return t;
}

function countWords(text) {
  return String(text || '').split(/\s+/).filter(function (w) {
    return /[A-Za-z0-9]/.test(w);
  }).length;
}

function pad2(n) { return String(n).padStart(2, '0'); }

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function localAudioPath(book, audioFileName) {
  return LPTD_DIR_PREFIX + ' ' + book + '/Audio + Transcipt/' + audioFileName;
}

function loadSource() {
  if (!fs.existsSync(SRC)) {
    throw new Error('Không tìm thấy nguồn: ' + SRC);
  }
  const raw = JSON.parse(fs.readFileSync(SRC, 'utf8'));
  if (!Array.isArray(raw)) throw new Error('Nguồn phải là một mảng unit');
  return raw;
}

function build() {
  const source = loadSource();
  const seen = new Set();
  const lessons = [];
  const problems = [];

  source.forEach(function (u) {
    const book = Number(u.book);
    const unit = Number(u.unit);
    if (!book || book < 1 || book > 4) problems.push('book không hợp lệ: ' + JSON.stringify(u.book));
    if (!unit || unit < 1 || unit > 40) problems.push('unit không hợp lệ: ' + book + '/' + u.unit);

    const id = 'lptd-' + book + '-' + pad2(unit);
    if (seen.has(id)) problems.push('trùng id: ' + id);
    seen.add(id);

    const title = normalizeText(u.title || ('Unit ' + unit));
    const audioFileName = String(u.audioFileName || '').trim();
    if (!audioFileName) problems.push('thiếu audioFileName: ' + id);

    const lines = (u.lines || []).map(function (l, i) {
      return {
        no: Number(l.no) || i + 1,
        speaker: normalizeText(l.speaker || '').toUpperCase(),
        text: normalizeText(l.text),
      };
    }).filter(function (l) { return l.text; });
    if (!lines.length) problems.push('unit rỗng: ' + id);

    const wordCount = lines.reduce(function (sum, l) { return sum + countWords(l.text); }, 0);
    const cdnName = 'LPTD' + book + 'U' + pad2(unit) + '.mp3';

    lessons.push({
      id: id,
      book: book,
      unit: unit,
      title: title,
      slug: slugify(title),
      audioFileName: audioFileName,
      cdnName: cdnName,
      localPath: localAudioPath(book, audioFileName),
      lines: lines,
      lineCount: lines.length,
      wordCount: wordCount,
    });
  });

  lessons.sort(function (a, b) { return a.book - b.book || a.unit - b.unit; });

  // Kiểm tra MP3 + tài liệu local tồn tại trên đĩa
  lessons.forEach(function (l) {
    if (!fs.existsSync(path.join(ROOT, l.localPath.replace(/\//g, path.sep)))) {
      problems.push('thiếu MP3 local: ' + l.localPath);
    }
  });
  [1, 2, 3, 4].forEach(function (b) {
    var meta = BOOK_META[b];
    [meta.bookPdf, meta.transcriptPdf].concat((meta.extraDocs || []).map(function (d) { return d.file; }))
      .filter(Boolean)
      .forEach(function (rel) {
        if (!fs.existsSync(path.join(ROOT, rel.replace(/\//g, path.sep)))) {
          problems.push('thiếu tài liệu local: ' + rel);
        }
      });
  });

  // Kiểm tra phân bố
  var byBook = { 1: 0, 2: 0, 3: 0, 4: 0 };
  lessons.forEach(function (l) { byBook[l.book]++; });
  Object.keys(byBook).forEach(function (b) {
    if (byBook[b] !== 40) problems.push('Số unit cuốn ' + b + ' = ' + byBook[b] + ' (cần 40)');
  });
  if (lessons.length !== 160) problems.push('Tổng unit = ' + lessons.length + ' (cần 160)');

  var totalLines = lessons.reduce(function (s, l) { return s + l.lineCount; }, 0);
  var totalWords = lessons.reduce(function (s, l) { return s + l.wordCount; }, 0);

  var books = [1, 2, 3, 4].map(function (b) {
    var meta = BOOK_META[b];
    var units = lessons.filter(function (l) { return l.book === b; });
    return {
      book: b,
      title: meta.title,
      level: meta.level,
      units: units.length,
      lines: units.reduce(function (s, l) { return s + l.lineCount; }, 0),
      words: units.reduce(function (s, l) { return s + l.wordCount; }, 0),
      bookPdf: meta.bookPdf || '',
      transcriptPdf: meta.transcriptPdf || '',
      extraDocs: meta.extraDocs || [],
    };
  });

  var payload = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: 'Agnes/data/lptd-lessons.json',
    cdnBase: CDN_BASE,
    totals: {
      books: 4,
      units: lessons.length,
      lines: totalLines,
      words: totalWords,
    },
    books: books,
    lessons: lessons,
  };

  return { payload: payload, problems: problems, byBook: byBook };
}

function csvEscape(value) {
  var s = String(value == null ? '' : value);
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function buildCsv(payload) {
  var rows = [['book', 'unit', 'id', 'title', 'cdnName', 'cdnUrl', 'localPath', 'audioFileName', 'lineCount', 'wordCount']];
  payload.lessons.forEach(function (l) {
    rows.push([
      l.book, l.unit, l.id, l.title, l.cdnName,
      CDN_BASE + '/' + l.cdnName,
      l.localPath, l.audioFileName, l.lineCount, l.wordCount,
    ]);
  });
  return rows.map(function (r) { return r.map(csvEscape).join(','); }).join('\r\n') + '\r\n';
}

function writeFile(rel, content) {
  var full = path.join(OP, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  var size = fs.statSync(full).size;
  console.log('  ✓ ' + rel + '  (' + (size / 1024).toFixed(1) + ' KB)');
}

function jsArrayData(payload) {
  return JSON.stringify(payload.lessons);
}

function main() {
  console.log('== build-lptd-data ==');
  console.log('Nguồn: ' + path.relative(ROOT, SRC));

  var built = build();
  if (built.problems.length) {
    console.error('\n✗ Dữ liệu nguồn có lỗi:');
    built.problems.slice(0, 40).forEach(function (p) { console.error('  - ' + p); });
    process.exit(1);
  }

  var payload = built.payload;
  console.log('  • ' + payload.totals.units + ' unit / ' + payload.totals.lines + ' câu / ' + payload.totals.words + ' từ');
  [1, 2, 3, 4].forEach(function (b) {
    var info = payload.books[b - 1];
    console.log('  • Cuốn ' + b + ': ' + info.units + ' unit, ' + info.lines + ' câu, ' + info.words + ' từ');
  });

  if (CHECK_ONLY) {
    console.log('\n✓ --check: dữ liệu hợp lệ, không ghi file.');
    return;
  }

  console.log('\nGhi file:');
  writeFile('data/lptd-lessons.json', JSON.stringify(payload, null, 2) + '\n');

  var stats = {
    generatedAt: payload.generatedAt,
    source: payload.source,
    cdnBase: payload.cdnBase,
    totals: payload.totals,
    books: payload.books,
    quality: {
      missingAudioFileNames: 0,
      checkedAgainstDisk: true,
    },
  };
  writeFile('data/lptd-stats.json', JSON.stringify(stats, null, 2) + '\n');
  writeFile('data/lptd-cdn-manifest.csv', buildCsv(payload));

  var localJs = [
    '/* =========================================================',
    '   AUTO-GENERATED by op/tools/build-lptd-data.js — KHÔNG SỬA TAY.',
    '   Nguồn: ' + payload.source,
    '   Sinh lúc: ' + payload.generatedAt,
    '   ' + payload.totals.units + ' unit · ' + payload.totals.lines + ' câu · ' + payload.totals.words + ' từ',
    '   ========================================================= */',
    '(function (global) {',
    '  "use strict";',
    '  global.LPTD_LESSONS_RAW = ' + jsArrayData(payload) + ';',
    '  global.LPTD_LESSONS_META = {',
    '    schemaVersion: ' + payload.schemaVersion + ',',
    '    generatedAt: ' + JSON.stringify(payload.generatedAt) + ',',
    '    cdnBase: ' + JSON.stringify(payload.cdnBase) + ',',
    '    totals: ' + JSON.stringify(payload.totals) + ',',
    '    books: ' + JSON.stringify(payload.books, null, 2).replace(/\n/g, '\n    ') + '',
    '  };',
    '})(typeof window !== "undefined" ? window : this);',
    '',
  ].join('\n');
  writeFile('app/lptd-lessons-data.js', localJs);

  var gas = [
    '/**',
    ' * AUTO-GENERATED by op/tools/build-lptd-data.js — KHÔNG SỬA TAY.',
    ' * Nguồn: ' + payload.source,
    ' * Sinh lúc: ' + payload.generatedAt,
    ' * ' + payload.totals.units + ' unit · ' + payload.totals.lines + ' câu · ' + payload.totals.words + ' từ',
    ' */',
    '',
    'function LPTD_LESSONS_META() {',
    '  return ' + JSON.stringify({
      schemaVersion: payload.schemaVersion,
      generatedAt: payload.generatedAt,
      cdnBase: payload.cdnBase,
      totals: payload.totals,
      books: payload.books,
    }, null, 2).replace(/\n/g, '\n  ') + ';',
    '}',
    '',
    'function LPTD_LESSONS() {',
    '  return ' + JSON.stringify(payload.lessons) + ';',
    '}',
    '',
  ].join('\n');
  writeFile('app/LptdData.gs', gas);

  console.log('\n✓ Đủ 160/160 MP3 local + tài liệu PDF.');
  console.log('✓ Hoàn tất build.');
}

main();
