#!/usr/bin/env node
/* =========================================================
   build-600-data.js — sinh dữ liệu 600+ từ PDF gốc

   Nguồn:
     600+/한권으로끝내는해커스토익_600+...pdf  (33 trang)
     600+/MP3/*.mp3                              (32 file)

   Kết quả: 32 unit (8 ngày Part 1/2: 10 câu; 24 file Part 3/4: 4-6 câu)
   ========================================================= */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pdf = require('pdf-parse');

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'op/Tích hợp nội dung mới/600+');
const OUT_DIR = SRC_DIR;
const AUDIO_DIR = path.join(SRC_DIR, 'MP3');
const CDN_BASE = 'https://toeic-audio.netlify.app/audio/600plus';

function sha256(buf) { return crypto.createHash('sha256').update(buf).digest('hex'); }
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function write(p, content) { ensureDir(path.dirname(p)); fs.writeFileSync(p, content, 'utf8'); console.log('  +', path.relative(ROOT, p)); }
function wordsOf(text) { return String(text || '').trim().split(/\s+/).filter(Boolean).length; }
function norm(s) { return s.replace(/\s+/g, ' ').trim(); }

async function extractPdf(pdfPath) {
  const data = await pdf(fs.readFileSync(pdfPath));
  const text = data.text.replace(/\r\n/g, '\n');
  console.log('PDF:', path.basename(pdfPath), '| pages:', data.numpages, '| chars:', text.length);
  ensureDir(path.join(OUT_DIR, 'extract'));
  fs.writeFileSync(path.join(OUT_DIR, 'extract/600-raw.txt'), text, 'utf8');
  return { text, pages: data.numpages };
}

function answerBlock(chunk) {
  let b = chunk.split('받아쓰기\n세 번씩')[0];
  b = b.replace(/받아쓰기_[^\n]*\.mp3/, '')
    .replace(/정답확인 및 쉐도잉/, '')
    .replace(/받아쓰기의 정답과 해석을 확인한 후 다시 들으면서 쉐도잉\(듣고 따라 말하기\)을 하세요\./, '');
  // For Part 3/4, cut before Korean translation (first Hangul after header removal)
  // But Part 1/2 has inline Korean; handled in parsePart12.
  return b;
}

function blankBlock(chunk) {
  const idx = chunk.indexOf('받아쓰기\n세 번씩');
  return idx !== -1 ? chunk.slice(idx) : '';
}

function parsePart12(block) {
  const lines = block.split(/\r?\n/);
  const res = [];
  for (const line of lines) {
    const m = line.match(/^\s*(\d+)\.\s+(.+)$/);
    if (!m) continue;
    const no = m[1];
    let rest = m[2].trim();
    const koIdx = rest.search(/[가-힣]/);
    if (koIdx !== -1) rest = rest.slice(0, koIdx).trim();
    if (/[A-Za-z]/.test(rest) && rest.length > 5) {
      if (!res.find(x => x.no === Number(no))) res.push({ no: Number(no), text: rest });
    }
  }
  return res;
}

function parsePart34(answerNorm, blankNorm) {
  const nums = [...answerNorm.matchAll(/(\d+)\)/g)].map(x => x[1]);
  const uniq = []; for (const n of nums) if (!uniq.includes(n)) uniq.push(n);
  const lines = [];
  for (const n of uniq) {
    const idx = answerNorm.indexOf(n + ')');
    let rest = answerNorm.slice(idx + n.length + 1).trim();
    const nextNum = rest.search(/\d+\)/);
    if (nextNum !== -1) rest = rest.slice(0, nextNum).trim();
    const nextSpk = rest.search(/\b[WMSABC]:/);
    if (nextSpk !== -1) rest = rest.slice(0, nextSpk).trim();
    const bre = new RegExp(n + '\\)\\s*(.*?)(?=\\d+\\)|$)', 's');
    const bm = blankNorm.match(bre);
    let tail = bm ? bm[1].trim() : '';
    const tailKey = tail.replace(/^[.,\s]+/, '').trim().slice(0, 30).toLowerCase();
    if (tailKey.length >= 4) {
      const pos = rest.toLowerCase().indexOf(tailKey);
      if (pos !== -1) rest = rest.slice(0, pos).trim();
    }
    rest = rest.replace(/\s+/g, ' ').trim();
    if (rest.length > 2) lines.push({ no: Number(n), text: rest });
  }
  return lines;
}

function partForDay(day) {
  if (day <= 2) return 'Part 1';
  if (day <= 8) return 'Part 2';
  if (day <= 15) return 'Part 3';
  return 'Part 4';
}

(async () => {
  console.log('== build-600-data ==');
  const pdfPath = fs.readdirSync(SRC_DIR).find(n => /\.pdf$/i.test(n));
  const pdfFull = path.join(SRC_DIR, pdfPath);
  const { text, pages } = await extractPdf(pdfFull);

  const markers = [...text.matchAll(/받아쓰기[^\n]*\.mp3/g)];
  const sections = markers.map((m, i) => ({ marker: m[0], chunk: text.slice(m.index, i + 1 < markers.length ? markers[i+1].index : text.length) }));
  console.log('sections (audio files):', sections.length);

  // audio files sorted to match section order
  const audioNames = fs.readdirSync(AUDIO_DIR).filter(n => /\.mp3$/i.test(n)).sort();
  if (audioNames.length !== sections.length) {
    throw new Error('Audio count ' + audioNames.length + ' != sections ' + sections.length);
  }

  const lessons = [];
  let unitCounter = 0;
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    const isPart12 = /DAY\d{2}\.mp3$/.test(s.marker);
    const ab = answerBlock(s.chunk);
    const bb = blankBlock(s.chunk);
    const lines = isPart12
      ? parsePart12(ab)
      : parsePart34(norm(ab), norm(bb));
    // for Part 1/2, ab still has Korean inline; parsePart12 strips per line. But answerBlock did not cut Korean globally. Good.
    // For Part 3/4, answerBlock did not cut Korean globally (we removed that). Need cut now:
    // Actually answerBlockPart34 should cut Korean. Re-evaluate: for Part3/4, cut at first Hangul after header removal.
    let finalLines = lines;
    if (!isPart12) {
      // re-parse with Korean cut
      let b = s.chunk.split('받아쓰기\n세 번씩')[0];
      b = b.replace(/받아쓰기_DAY[^\n]*\.mp3/, '').replace(/정답확인 및 쉐도잉/, '').replace(/받아쓰기의 정답과 해석을 확인한 후 다시 들으면서 쉐도잉\(듣고 따라 말하기\)을 하세요\./, '');
      const koStart = b.search(/[가-힣]/);
      if (koStart !== -1) b = b.slice(0, koStart);
      finalLines = parsePart34(norm(b), norm(bb));
    }

    // determine day and part index
    const dayMatch = s.marker.match(/DAY(\d{2})/);
    const day = parseInt(dayMatch[1], 10);
    const partIdx = s.marker.includes('②') ? 2 : (s.marker.includes('①') ? 1 : 0);
    const partLabel = partIdx === 1 ? ' (①)' : (partIdx === 2 ? ' (②)' : '');
    const partName = partForDay(day);

    unitCounter++;
    const unitNum = unitCounter;
    const id = partIdx > 0
      ? `h600-d${String(day).padStart(2, '0')}${partIdx === 1 ? 'a' : 'b'}`
      : `h600-d${String(day).padStart(2, '0')}`;
    const cdnName = partIdx > 0
      ? `H600D${String(day).padStart(2, '0')}${partIdx === 1 ? 'A' : 'B'}.mp3`
      : `H600D${String(day).padStart(2, '0')}.mp3`;
    const audioFileName = audioNames[i];
    const localPath = `600+/Hackers_Toeic_600_write/${audioFileName}`;
    const title = partIdx > 0
      ? `600+ · Day ${String(day).padStart(2, '0')} ${partLabel.trim()}`
      : `600+ · Day ${String(day).padStart(2, '0')}`;

    const wordCount = finalLines.reduce((n, l) => n + wordsOf(l.text), 0);
    const lessonLines = finalLines.map((l, idx) => ({
      no: l.no,
      speaker: l.speaker || '',
      text: l.text,
    }));

    lessons.push({
      id,
      source: 'h600',
      book: 1,
      unit: unitNum,
      day,
      part: partName,
      audioPart: partIdx,
      title,
      slug: id,
      audioFileName,
      cdnName,
      localPath,
      lines: lessonLines,
      lineCount: lessonLines.length,
      wordCount,
    });
  }

  const totals = lessons.reduce((acc, u) => {
    acc.lines += u.lineCount;
    acc.words += u.wordCount;
    return acc;
  }, { units: lessons.length, lines: 0, words: 0 });

  const meta = {
    schemaVersion: 1,
    sourceId: 'h600',
    sourceName: '600+',
    officialWorkbook: '한권으로 끝내는 해커스 토익 600+ 받아쓰기&쉐도잉 워크북',
    type: 'dictation-shadowing-workbook',
    language: 'en',
    generatedAt: new Date().toISOString(),
    cdnBase: CDN_BASE,
    totals: { books: 1, units: totals.units, lines: totals.lines, words: totals.words, days: 20, audioFiles: 32 },
    books: [{
      book: 1,
      title: '600+',
      level: 'TOEIC 600+',
      units: totals.units,
      lines: totals.lines,
      words: totals.words,
      bookPdf: '600+/한권으로끝내는해커스토익_600+_받아쓰기쉐도잉워크북. (1).pdf',
      transcriptPdf: '',
      extraDocs: [],
    }],
  };

  // source inventory
  const pdfBuf = fs.readFileSync(pdfFull);
  const source = {
    sourceId: 'h600',
    sourceName: '600+',
    officialWorkbook: meta.officialWorkbook,
    sourceRoot: '600+',
    pdf: path.basename(pdfFull),
    pdfPages: pages,
    audioFiles: 32,
    days: 20,
    totals: meta.totals,
    units: lessons.map(u => ({ id: u.id, day: u.day, audioPart: u.audioPart, lines: u.lineCount, words: u.wordCount, audioFileName: u.audioFileName, cdnName: u.cdnName })),
    generatedAt: new Date().toISOString(),
  };

  // write outputs
  console.log('== Ghi dữ liệu ==');
  write(path.join(OUT_DIR, 'h600-lessons.json'), JSON.stringify(lessons, null, 2) + '\n');
  write(path.join(OUT_DIR, 'h600-meta.json'), JSON.stringify(meta, null, 2) + '\n');
  write(path.join(OUT_DIR, 'h600-source.json'), JSON.stringify(source, null, 2) + '\n');

  // local data JS
  const localJs = `/* AUTO-GENERATED by tools/build-600-data.js — KHÔNG SỬA TAY. */\n(function (global) {\n  'use strict';\n  global.H600_LESSONS_META = ${JSON.stringify(meta, null, 2)};\n  global.H600_LESSONS = ${JSON.stringify(lessons, null, 2)};\n})(typeof window !== 'undefined' ? window : this);\n`;
  write(path.join(OUT_DIR, 'h600-lessons-data.js'), localJs);

  // legacy LPTD wrappers
  const legacyJs = `function LPTD_LESSONS_META() { return ${JSON.stringify(meta, null, 2)}; }\n\nfunction LPTD_LESSONS() { return ${JSON.stringify(lessons, null, 2)}; }\n`;
  write(path.join(OUT_DIR, 'h600-lessons.js'), legacyJs);

  // GAS data
  const gs = `function H600_LESSONS_META() { return ${JSON.stringify(meta, null, 2)}; }\n\nfunction H600_LESSONS() { return ${JSON.stringify(lessons, null, 2)}; }\n`;
  write(path.join(OUT_DIR, 'gas/H600Data.gs'), gs);

  // audio manifest
  const audioDir = path.join(OUT_DIR, '_deploy_audio/audio/600plus');
  // copy mp3s with ASCII names
  fs.mkdirSync(audioDir, { recursive: true });
  const audioFiles = [];
  for (const u of lessons) {
    const srcFile = path.join(AUDIO_DIR, u.audioFileName);
    const buf = fs.readFileSync(srcFile);
    const dstFile = path.join(audioDir, u.cdnName);
    fs.writeFileSync(dstFile, buf);
    audioFiles.push({
      unit: u.unit,
      id: u.id,
      day: u.day,
      audioPart: u.audioPart,
      audioFileName: u.audioFileName,
      cdnName: u.cdnName,
      localPath: u.localPath,
      url: CDN_BASE + '/' + u.cdnName,
      bytes: buf.length,
      sha256: sha256(buf),
      lines: u.lineCount,
      words: u.wordCount,
    });
  }
  const audioManifest = { base: CDN_BASE, count: audioFiles.length, files: audioFiles };
  write(path.join(OUT_DIR, 'audio-cdn/upload-manifest.json'), JSON.stringify(audioManifest, null, 2) + '\n');
  const csv = ['unit,id,day,audioPart,audioFileName,cdnName,localPath,url,bytes,sha256,lines,words']
    .concat(audioFiles.map(f => [f.unit, f.id, f.day, f.audioPart, f.audioFileName, f.cdnName, f.localPath, f.url, f.bytes, f.sha256, f.lines, f.words]
      .map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')))
    .join('\n') + '\n';
  write(path.join(OUT_DIR, 'audio-cdn/upload-manifest.csv'), csv);

  // tools copy
  ensureDir(path.join(OUT_DIR, 'tools'));
  // build-600-data.js itself is already there; nothing else.

  console.log('== Tổng hợp ==');
  console.log('units:', totals.units, '| lines:', totals.lines, '| words:', totals.words);
  console.log('audio:', audioFiles.length, '| CDN:', CDN_BASE);
  console.log('days:', 20, '| Part1/2:', lessons.filter(u => u.day <= 8).length, 'units,', 'Part3/4:', lessons.filter(u => u.day >= 9).length, 'units');
})().catch(err => { console.error('LỖI:', err.stack || err.message); process.exit(1); });
