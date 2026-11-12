#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pdf = require('pdf-parse');

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'op/Tích hợp nội dung mới/750+');
const OUT_DIR = SRC_DIR;
const AUDIO_DIR = path.join(SRC_DIR, 'MP3');
const CDN_BASE = 'https://toeic-audio.netlify.app/audio/750plus';

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
  fs.writeFileSync(path.join(OUT_DIR, 'extract/750-raw.txt'), text, 'utf8');
  return { text, pages: data.numpages };
}

function answerBlock(chunk) {
  const parts = chunk.split('정답확인 및 쉐도잉');
  let b = parts.length > 1 ? parts[1] : chunk;
  b = b.replace(/받아쓰기의 정답과 해석을 확인한 후 음성을 다시 들으면서 쉐도잉\(듣고 따라 말하기\)을 하세요\./, '');
  const koStart = b.search(/[가-힣]/);
  if (koStart !== -1) b = b.slice(0, koStart);
  return b;
}
function blankBlock(chunk) {
  const parts = chunk.split('정답확인 및 쉐도잉');
  return parts.length > 1 ? parts[0] : chunk;
}
function parsePart12(block) {
  const re = /(\d{2})\.\s*\n\s*([A-Za-z][^\n]+?)\s*\n/g;
  const matches = [...block.matchAll(re)];
  const seen = new Set();
  const res = [];
  for (const mm of matches) {
    const no = mm[1];
    let text = mm[2].trim();
    const koIdx = text.search(/[가-힣]/);
    if (koIdx !== -1) text = text.slice(0, koIdx).trim();
    if (text.length > 3 && !seen.has(no)) { seen.add(no); res.push({ no: Number(no), text }); }
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

(async () => {
  console.log('== build-750-data ==');
  const pdfPath = fs.readdirSync(SRC_DIR).find(n => /\.pdf$/i.test(n));
  const pdfFull = path.join(SRC_DIR, pdfPath);
  const { text, pages } = await extractPdf(pdfFull);

  const markers = [...text.matchAll(/D\d+\.mp3/g)];
  const sections = markers.map((m, i) => ({ marker: m[0], chunk: text.slice(m.index, i + 1 < markers.length ? markers[i+1].index : text.length) }));
  console.log('sections (audio files):', sections.length);

  const audioNames = fs.readdirSync(path.join(SRC_DIR, 'MP3')).filter(n => /\.mp3$/i.test(n)).sort((a, b) => {
    const na = a.match(/D(\d+)\.mp3/i); const nb = b.match(/D(\d+)\.mp3/i);
    return parseInt(na[1]) - parseInt(nb[1]);
  });
  if (audioNames.length !== sections.length) throw new Error('Audio count ' + audioNames.length + ' != sections ' + sections.length);

  const lessons = [];
  let unitCounter = 0;
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    const day = parseInt(s.marker.match(/D(\d+)/)[1]);
    const isSimple = day <= 6; // Part 1/2
    const ab = s.chunk.split('정답확인 및 쉐도잉')[1] || s.chunk;
    const bb = s.chunk.split('정답확인 및 쉐도잉')[0] || s.chunk;
    const lines = isSimple
      ? parsePart12(ab)
      : parsePart34(norm(ab), norm(bb));
    // Actually for Part 3/4 use answerBlock with Korean cut:
    let finalLines = lines;
    if (!isSimple) {
      let b = s.chunk.split('정답확인 및 쉐도잉')[1] || '';
      b = b.replace(/받아쓰기의 정답과 해석을 확인한 후 음성을 다시 들으면서 쉐도잉\(듣고 따라 말하기\)을 하세요\./, '');
      const koStart = b.search(/[가-힣]/);
      if (koStart !== -1) b = b.slice(0, koStart);
      finalLines = parsePart34(norm(b), norm(bb));
    }

    unitCounter++;
    const audioFileName = audioNames[i];
    const cdnName = `H750D${String(day).padStart(2, '0')}.mp3`;
    const localPath = `750+/받아쓰기 워크북/${audioFileName}`;
    const title = `750+ · Day ${String(day).padStart(2, '0')}`;
    const wordCount = finalLines.reduce((n, l) => n + wordsOf(l.text), 0);
    const lessonLines = finalLines.map(l => ({ no: l.no, speaker: l.speaker || '', text: l.text }));

    lessons.push({
      id: `h750-d${String(day).padStart(2, '0')}`,
      source: 'h750',
      book: 1,
      unit: unitCounter,
      day,
      title,
      slug: `h750-d${String(day).padStart(2, '0')}`,
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
    sourceId: 'h750',
    sourceName: '750+',
    officialWorkbook: 'Hackers TOEIC 750+ Dictation & Shadowing Workbook',
    type: 'dictation-shadowing-workbook',
    language: 'en',
    generatedAt: new Date().toISOString(),
    cdnBase: CDN_BASE,
    totals: { books: 1, units: totals.units, lines: totals.lines, words: totals.words, days: 20, audioFiles: 20 },
    books: [{ book: 1, title: '750+', level: 'TOEIC 750+', units: totals.units, lines: totals.lines, words: totals.words, bookPdf: '750+/토익 750+ 받아쓰기&쉐도잉 워크북.pdf', transcriptPdf: '', extraDocs: [] }],
  };

  const pdfBuf = fs.readFileSync(path.join(SRC_DIR, fs.readdirSync(SRC_DIR).find(n => /\.pdf$/i.test(n))));
  const source = {
    sourceId: 'h750',
    sourceName: '750+',
    officialWorkbook: meta.officialWorkbook,
    sourceRoot: '750+',
    pdf: fs.readdirSync(SRC_DIR).find(n => /\.pdf$/i.test(n)),
    pdfPages: pages,
    audioFiles: 20,
    days: 20,
    totals: meta.totals,
    units: lessons.map(u => ({ id: u.id, day: u.day, lines: u.lineCount, words: u.wordCount, audioFileName: u.audioFileName, cdnName: u.cdnName })),
    generatedAt: new Date().toISOString(),
  };

  console.log('== Ghi dữ liệu ==');
  const OUT = SRC_DIR;
  fs.mkdirSync(path.join(OUT, 'audio-cdn'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'extract'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'gas'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'tools'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'reports'), { recursive: true });

  fs.writeFileSync(path.join(OUT, 'h750-lessons.json'), JSON.stringify(lessons, null, 2) + '\n');
  console.log('  + h750-lessons.json');
  fs.writeFileSync(path.join(OUT, 'h750-meta.json'), JSON.stringify(meta, null, 2) + '\n');
  console.log('  + h750-meta.json');
  fs.writeFileSync(path.join(OUT, 'h750-source.json'), JSON.stringify(source, null, 2) + '\n');
  console.log('  + h750-source.json');
  fs.writeFileSync(path.join(OUT, 'extract/750-raw.txt'), text, 'utf8');
  console.log('  + extract/750-raw.txt');

  const localJs = `/* AUTO-GENERATED by tools/build-750-data.js */\n(function (global) {\n  'use strict';\n  global.H750_LESSONS_META = ${JSON.stringify(meta, null, 2)};\n  global.H750_LESSONS = ${JSON.stringify(lessons, null, 2)};\n})(typeof window !== 'undefined' ? window : this);\n`;
  fs.writeFileSync(path.join(OUT, 'h750-lessons-data.js'), localJs);
  console.log('  + h750-lessons-data.js');

  const legacyJs = `function LPTD_LESSONS_META() { return ${JSON.stringify(meta, null, 2)}; }\n\nfunction LPTD_LESSONS() { return ${JSON.stringify(lessons, null, 2)}; }\n`;
  fs.writeFileSync(path.join(OUT, 'h750-lessons.js'), legacyJs);
  console.log('  + h750-lessons.js');

  const gs = `function H750_LESSONS_META() { return ${JSON.stringify(meta, null, 2)}; }\n\nfunction H750_LESSONS() { return ${JSON.stringify(lessons, null, 2)}; }\n`;
  fs.writeFileSync(path.join(OUT, 'gas/H750Data.gs'), gs);
  console.log('  + gas/H750Data.gs');

  // audio copy + manifest
  const audioDir = path.join(OUT, '_deploy_audio/audio/750plus');
  fs.mkdirSync(audioDir, { recursive: true });
  const audioFiles = [];
  for (const u of lessons) {
    const srcFile = path.join(AUDIO_DIR, u.audioFileName);
    const buf = fs.readFileSync(srcFile);
    const dstFile = path.join(audioDir, u.cdnName);
    fs.writeFileSync(dstFile, buf);
    audioFiles.push({ unit: u.unit, id: u.id, day: u.day, audioFileName: u.audioFileName, cdnName: u.cdnName, localPath: u.localPath, url: CDN_BASE + '/' + u.cdnName, bytes: buf.length, sha256: sha256(buf), lines: u.lineCount, words: u.wordCount });
  }
  const audioManifest = { base: CDN_BASE, count: audioFiles.length, files: audioFiles };
  fs.writeFileSync(path.join(OUT, 'audio-cdn/upload-manifest.json'), JSON.stringify(audioManifest, null, 2) + '\n');
  console.log('  + audio-cdn/upload-manifest.json');
  const csv = ['unit,id,day,audioFileName,cdnName,localPath,url,bytes,sha256,lines,words']
    .concat(audioFiles.map(f => [f.unit, f.id, f.day, f.audioFileName, f.cdnName, f.localPath, f.url, f.bytes, f.sha256, f.lines, f.words].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')))
    .join('\n') + '\n';
  fs.writeFileSync(path.join(OUT, 'audio-cdn/upload-manifest.csv'), csv);
  console.log('  + audio-cdn/upload-manifest.csv');

  console.log('== Tổng hợp ==');
  console.log('units:', totals.units, '| lines:', totals.lines, '| words:', totals.words);
  console.log('audio:', audioFiles.length, '| CDN:', CDN_BASE);
  console.log('days:', 20, '| Part1/2:', lessons.filter(u => u.day <= 6).length, 'units,', 'Part3/4:', lessons.filter(u => u.day >= 7).length, 'units');
})().catch(err => { console.error('LỖI:', err.stack || err.message); process.exit(1); });
