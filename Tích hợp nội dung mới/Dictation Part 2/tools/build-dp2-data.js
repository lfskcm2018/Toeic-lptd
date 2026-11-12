#!/usr/bin/env node
/* =========================================================
   build-dp2-data.js — sinh dữ liệu Dictation Part 2 từ PDF gốc

   Nguồn:
     Dictation Part 2/<pdf>            (PDF 64 trang, song ngữ Anh–Hàn)
     Dictation Part 2/MP3/*.mp3       (11 track)

   Sinh ra (trong op/Tích hợp nội dung mới/Dictation Part 2/):
     dictation-part2-lessons.json      dữ liệu chuẩn
     dictation-part2-meta.json         metadata/tổng hợp
     dictation-part2-source.json       inventory nguồn + hash
     dictation-part2-lessons-data.js   window.DP2_LESSONS cho bản local
     dictation-part2-lessons.js        bản tương thích LPTD_* (legacy)
     gas/DP2Data.gs                    dữ liệu cho GAS (DP2_*)
     audio-cdn/upload-manifest.json    manifest upload CDN
     audio-cdn/upload-manifest.csv
     extract/dp2-raw.txt               text PDF đã trích (để audit)

   Cách chạy (tại gốc dự án):
     node "op/Tích hợp nội dung mới/Dictation Part 2/tools/build-dp2-data.js"
   ========================================================= */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pdf = require('pdf-parse');

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'Dictation Part 2');
const OUT_DIR = path.join(ROOT, 'op/Tích hợp nội dung mới/Dictation Part 2');
const AUDIO_DIR = path.join(SRC_DIR, 'MP3');

const CDN_BASE = 'https://toeic-audio.netlify.app/audio/dictation-part2';
const SCHEMA_VERSION = 1;

const SECTION_TITLES = [
  { ko: 'When 의문문', en: 'When Questions', slug: 'when-questions' },
  { ko: 'Where 의문문', en: 'Where Questions', slug: 'where-questions' },
  { ko: 'Who 의문문', en: 'Who Questions', slug: 'who-questions' },
  { ko: 'Why 의문문', en: 'Why Questions', slug: 'why-questions' },
  { ko: 'Which 의문문', en: 'Which Questions', slug: 'which-questions' },
  { ko: 'What 의문문', en: 'What Questions', slug: 'what-questions' },
  { ko: 'How 의문문', en: 'How Questions', slug: 'how-questions' },
  { ko: '일반·부가·간접 의문문', en: 'General, Tag & Indirect Questions', slug: 'general-tag-indirect-questions' },
  { ko: '권유·제안 의문문', en: 'Suggestions & Offers', slug: 'suggestions-offers' },
  { ko: '평서문', en: 'Declarative Sentences', slug: 'declarative-sentences' },
  { ko: '선택 의문문', en: 'Alternative Questions', slug: 'alternative-questions' },
];

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}
function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}
function write(p, content) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content, 'utf8');
  console.log('  +', path.relative(ROOT, p));
}
function wordsOf(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}
function findPdf() {
  const name = fs.readdirSync(SRC_DIR).find((n) => /\.pdf$/i.test(n));
  if (!name) throw new Error('Không tìm thấy PDF trong ' + SRC_DIR);
  return path.join(SRC_DIR, name);
}
function isEnglish(text) {
  return /[A-Za-z]/.test(text) && !/[\uAC00-\uD7AF]/.test(text);
}

/* ---------- 1. Trích text PDF ---------- */
async function extractPdf(pdfPath) {
  const data = await pdf(fs.readFileSync(pdfPath));
  const text = data.text.replace(/\r\n/g, '\n');
  console.log('PDF:', path.basename(pdfPath), '| pages:', data.numpages, '| chars:', text.length);
  return { text, pages: data.numpages };
}

/* ---------- 2. Parse 11 section Q/A ---------- */
function parseSections(text) {
  const chunks = text.split(/\nDictation\s*\n/).slice(1);
  if (chunks.length !== SECTION_TITLES.length) {
    throw new Error('Số section PDF = ' + chunks.length + ', kỳ vọng ' + SECTION_TITLES.length);
  }

  return chunks.map((chunk, idx) => {
    const lines = chunk.split('\n');
    const titleKo = lines[0].trim();
    const mapped = SECTION_TITLES[idx];
    if (!titleKo.includes(mapped.ko.split(' ')[0])) {
      console.warn('  ⚠️ Section', idx + 1, 'title lạ:', JSON.stringify(titleKo));
    }

    const pairs = [];
    let pendingQ = null;
    for (const line of lines) {
      const q = line.match(/^\s*Q\s*:\s*(.*)$/);
      const a = line.match(/^\s*A\s*:\s*(.*)$/);
      if (q) {
        pendingQ = q[1].trim();
        continue;
      }
      if (a && pendingQ !== null) {
        const ans = a[1].trim();
        if (isEnglish(pendingQ) && isEnglish(ans)) {
          pairs.push({ q: pendingQ, a: ans });
        }
        pendingQ = null;
      }
    }

    if (!pairs.length) throw new Error('Section ' + (idx + 1) + ' không có cặp Q/A tiếng Anh.');
    return { ...mapped, titleKo, pairs };
  });
}

/* ---------- 3. Build lesson data ---------- */
function buildLessons(sections) {
  return sections.map((sec, idx) => {
    const unit = idx + 1;
    const lines = [];
    sec.pairs.forEach((p, i) => {
      lines.push({ no: i * 2 + 1, speaker: 'Q', text: p.q });
      lines.push({ no: i * 2 + 2, speaker: 'A', text: p.a });
    });
    const wordCount = lines.reduce((n, l) => n + wordsOf(l.text), 0);
    return {
      id: 'dp2-1-' + String(unit).padStart(2, '0'),
      book: 1,
      unit,
      title: sec.en,
      titleKo: sec.titleKo,
      slug: sec.slug,
      audioFileName: null, // điền sau, lấy từ MP3 thực tế
      cdnName: 'DP2U' + String(unit).padStart(2, '0') + '.mp3',
      localPath: null,     // điền sau
      lines,
      lineCount: lines.length,
      wordCount,
    };
  });
}

/* ---------- 4. Ghép audio ---------- */
function attachAudio(lessons) {
  const mp3s = fs.readdirSync(AUDIO_DIR).filter((n) => /\.mp3$/i.test(n)).sort();
  if (mp3s.length !== lessons.length) {
    throw new Error('Số MP3 (' + mp3s.length + ') ≠ số unit (' + lessons.length + ')');
  }
  const audioFiles = [];
  lessons.forEach((u, i) => {
    const original = mp3s[i];
    const full = path.join(AUDIO_DIR, original);
    const buf = fs.readFileSync(full);
    u.audioFileName = original;
    u.localPath = 'Dictation Part 2/MP3/' + original;
    audioFiles.push({
      unit: u.unit,
      audioFileName: original,
      cdnName: u.cdnName,
      localPath: u.localPath,
      url: CDN_BASE + '/' + u.cdnName,
      bytes: buf.length,
      sha256: sha256(buf),
    });
  });
  return audioFiles;
}

/* ---------- 5. Sinh file ---------- */
function buildOutputs(lessons, meta, source, audioFiles, rawText) {
  console.log('== Ghi dữ liệu ==');
  write(path.join(OUT_DIR, 'dictation-part2-lessons.json'), JSON.stringify(lessons, null, 2) + '\n');
  write(path.join(OUT_DIR, 'dictation-part2-meta.json'), JSON.stringify(meta, null, 2) + '\n');
  write(path.join(OUT_DIR, 'dictation-part2-source.json'), JSON.stringify(source, null, 2) + '\n');
  write(path.join(OUT_DIR, 'extract/dp2-raw.txt'), rawText);

  /* Bản local: DP2_* (không có wrapper LPTD_*) */
  const localJs =
    '/* AUTO-GENERATED by tools/build-dp2-data.js — KHÔNG SỬA TAY.\n' +
    '   Nguồn: Dictation Part 2 PDF + 11 MP3.\n' +
    '   ' + meta.totals.units + ' unit · ' + meta.totals.lines + ' dòng · ' + meta.totals.words + ' từ.\n' +
    '*/\n' +
    '(function (global) {\n' +
    '  "use strict";\n' +
    '  global.DP2_LESSONS_META = ' + JSON.stringify(meta, null, 2) + ';\n' +
    '  global.DP2_LESSONS = ' + JSON.stringify(lessons, null, 2) + ';\n' +
    '})(typeof window !== "undefined" ? window : this);\n';
  write(path.join(OUT_DIR, 'dictation-part2-lessons-data.js'), localJs);

  /* Bản tương thích cũ: LPTD_LESSONS_META / LPTD_LESSONS */
  const legacyJs =
    '/**\n' +
    ' * AUTO-GENERATED by tools/build-dp2-data.js — KHÔNG SỬA TAY.\n' +
    ' * BẢN TƯƠNG THÍCH: có wrapper LPTD_LESSONS_META()/LPTD_LESSONS().\n' +
    ' * Chỉ dùng cho web app standalone cũ; KHÔNG copy vào dự án tổng.\n' +
    ' */\n\n' +
    'function LPTD_LESSONS_META() {\n  return ' + JSON.stringify(meta, null, 2) + ';\n}\n\n' +
    'function LPTD_LESSONS() {\n  return ' + JSON.stringify(lessons, null, 2) + ';\n}\n';
  write(path.join(OUT_DIR, 'dictation-part2-lessons.js'), legacyJs);

  /* GAS: DP2_* (không wrapper) */
  const gs =
    '/**\n' +
    ' * DP2Data.gs — Dictation Part 2 (11 unit).\n' +
    ' * AUTO-GENERATED by tools/build-dp2-data.js — KHÔNG SỬA TAY.\n' +
    ' * Chỉ khai báo DP2_*; không chứa wrapper LPTD_*.\n' +
    ' */\n\n' +
    'function DP2_LESSONS_META() {\n  return ' + JSON.stringify(meta, null, 2) + ';\n}\n\n' +
    'function DP2_LESSONS() {\n  return ' + JSON.stringify(lessons, null, 2) + ';\n}\n';
  write(path.join(OUT_DIR, 'gas/DP2Data.gs'), gs);

  /* Manifest audio */
  const audioManifest = { base: CDN_BASE, count: audioFiles.length, files: audioFiles };
  write(path.join(OUT_DIR, 'audio-cdn/upload-manifest.json'), JSON.stringify(audioManifest, null, 2) + '\n');
  const csv = ['unit,audioFileName,cdnName,localPath,url,bytes,sha256']
    .concat(audioFiles.map((f) =>
      [f.unit, f.audioFileName, f.cdnName, f.localPath, f.url, f.bytes, f.sha256]
        .map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(',')
    ))
    .join('\n') + '\n';
  write(path.join(OUT_DIR, 'audio-cdn/upload-manifest.csv'), csv);
}

/* ---------- 6. Main ---------- */
(async () => {
  console.log('== build-dp2-data ==');
  const pdfPath = findPdf();
  const { text, pages } = await extractPdf(pdfPath);
  const sections = parseSections(text);
  const lessons = buildLessons(sections);
  const audioFiles = attachAudio(lessons);

  const totals = lessons.reduce((acc, u) => {
    acc.lines += u.lineCount;
    acc.words += u.wordCount;
    return acc;
  }, { units: lessons.length, lines: 0, words: 0 });

  const meta = {
    schemaVersion: SCHEMA_VERSION,
    sourceId: 'dictation-part-2',
    sourceName: 'Dictation Part 2',
    workbook: '파트2 출제표현 정리집 (TOEIC Part 2 expression collection)',
    generatedAt: new Date().toISOString(),
    cdnBase: CDN_BASE,
    totals: { books: 1, units: totals.units, lines: totals.lines, words: totals.words },
    books: [{
      book: 1,
      title: 'Dictation Part 2',
      level: 'TOEIC Part 2',
      units: totals.units,
      lines: totals.lines,
      words: totals.words,
      bookPdf: 'Dictation Part 2/' + path.basename(pdfPath),
      transcriptPdf: '',
      extraDocs: [],
    }],
  };

  const pdfBuf = fs.readFileSync(pdfPath);
  const source = {
    sourceId: 'dictation-part-2',
    sourceName: 'Dictation Part 2',
    workbook: meta.workbook,
    pdfFile: path.basename(pdfPath),
    pdfPages: pages,
    audioRoot: 'Dictation Part 2/MP3',
    totals: meta.totals,
    tests: 0,
    sections: sections.map((s, i) => ({
      unit: i + 1,
      title: s.en,
      titleKo: s.titleKo,
      slug: s.slug,
      pairs: s.pairs.length,
      lines: s.pairs.length * 2,
    })),
    files: [
      { type: 'pdf', path: path.basename(pdfPath), bytes: pdfBuf.length, sha256: sha256(pdfBuf) },
    ].concat(audioFiles.map((f) => ({
      type: 'mp3',
      path: f.localPath,
      bytes: f.bytes,
      sha256: f.sha256,
    }))),
    generatedAt: new Date().toISOString(),
  };

  buildOutputs(lessons, meta, source, audioFiles, text);

  console.log('== Tổng hợp ==');
  console.log('units:', totals.units, '| lines:', totals.lines, '| words:', totals.words);
  console.log('audio:', audioFiles.length, '| CDN:', CDN_BASE);
})().catch((err) => {
  console.error('LỖI:', err.stack || err.message);
  process.exit(1);
});
