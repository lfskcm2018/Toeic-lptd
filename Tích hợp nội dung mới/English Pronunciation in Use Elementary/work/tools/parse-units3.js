const fs = require('fs');
const path = require('path');

const OCR = 'English Pronunciation in Use Elementary [1999]/work/ocr';
const printedToPdf = (p) => p + 1;
function unitPages(u) {
  const first = 10 + (u - 1) * 2;
  return [printedToPdf(first), printedToPdf(first + 1)];
}
function readPage(p, tag = 'page') {
  const f = path.join(OCR, `${tag}-${p}.txt`);
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
}
const clean = (s) => String(s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

function noiseRatio(s) {
  const t = String(s || '');
  if (!t) return 1;
  const bad = (t.match(/[^A-Za-z0-9 ,.;:'’!?()\-–/&+]/g) || []).length;
  return bad / t.length;
}
function looksEnglish(s) {
  const t = String(s || '');
  if (t.length < 6) return false;
  const letters = (t.match(/[A-Za-z]/g) || []).length;
  if (letters / t.length < 0.7) return false;
  if (noiseRatio(t) > 0.14) return false;
  if (/[가-힣]/.test(t)) return false;
  if (!/[a-z]/.test(t) || !/[A-Z]/.test(t)) return false;
  /* phải có dấu kết câu hoặc dấu nháy để là câu hoàn chỉnh */
  return /[.?!'"’”]/.test(t);
}

/* Câu mẫu (shadowing): dòng "N <câu>" hoặc "N. <câu>" trên trang trái */
function extractSentences(text) {
  const out = [];
  const seen = new Set();
  for (const raw of text.split(/\r?\n/)) {
    const l = clean(raw);
    const m = l.match(/^(\d{1,2})[.)]?\s+(.{8,})$/);
    if (!m) continue;
    let txt = m[2]
      .replace(/\s*[«»‹›|~_*]{1,}\s*$/, '')
      .replace(/\s*\(\s*\d+\s*\)\s*$/, '')
      .trim();
    if (!looksEnglish(txt)) continue;
    const key = m[1] + '|' + txt.slice(0, 30);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ no: parseInt(m[1], 10), text: txt });
  }
  return out;
}

/* Marker âm thanh ở đầu dòng: "A2a", "(B14a", "C 5" */
function markers(text) {
  const out = [];
  for (const raw of text.split(/\r?\n/)) {
    const l = clean(raw);
    const m = l.match(/^[^A-Za-z0-9]{0,4}([ABCDE])\s?(\d{1,2})\s?([a-z])?/);
    if (m) {
      const track = parseInt(m[2], 10);
      if (track >= 1 && track <= 99) out.push({ cd: m[1], track, part: m[3] || '' });
    }
  }
  return out;
}

/* Từ vựng: sau "Listen and say these words" */
function extractWords(text) {
  const lines = text.split(/\r?\n/).map(clean);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/listen and (say|repeat) these (other )?words/i.test(lines[i])) continue;
    for (let k = i + 1; k < Math.min(i + 6, lines.length); k++) {
      const s = lines[k];
      if (!s) break;
      if (/^(A|B|C|D)\s?\d|listen and|Note:|Important|^\d{1,2}\.\d{1,2}\s|Exercises$/i.test(s)) break;
      for (const it of s.split(/\s{2,}/).map((x) => x.trim()).filter(Boolean)) {
        const w = it.replace(/\s*\(.*?\)\s*$/, '').trim();
        if (/^[a-zA-Z][a-zA-Z'’\-]{1,22}$/.test(w)) out.push(w);
      }
      if (out.length > 6) break;
    }
  }
  return [...new Set(out)];
}

/* Bài tập trang phải */
function parseRight(text) {
  const seen = new Set();
  const ex = [];
  for (const l of text.split(/\r?\n/).map(clean)) {
    const m = l.match(/^(\d{1,2}\.\d{1,2})\s+(.{6,})$/);
    if (m && !seen.has(m[1])) { seen.add(m[1]); ex.push({ n: m[1], prompt: clean(m[2]) }); }
  }
  return ex;
}

/* Key */
function parseKey() {
  const answers = {};
  for (let p = 139; p <= 167; p++) {
    const t = readPage(p, 'key');
    if (!t) continue;
    for (const l of t.split(/\r?\n/).map(clean)) {
      const m = l.match(/^(\d{1,2}\.\d{1,2})\s+(.{1,})$/);
      if (m && !answers[m[1]] && !/^\d/.test(m[2])) answers[m[1]] = clean(m[2]);
    }
  }
  return answers;
}

const answers = parseKey();
const units = [];
const markerLog = [];
for (let u = 1; u <= 50; u++) {
  const pages = unitPages(u);
  const left = readPage(pages[0]);
  const right = readPage(pages[1]);
  const cd = u <= 12 ? 'A' : u <= 27 ? 'B' : u <= 43 ? 'C' : 'D';
  const mk = markers(left).concat(markers(right)).filter((m) => m.cd === cd);
  markerLog.push({ unit: u, cd, markers: mk });
  const exercises = parseRight(right).map((e) => ({ n: e.n, prompt: e.prompt, answer: answers[e.n] || '' }));
  units.push({ unit: u, cd, pages, sentences: extractSentences(left), words: extractWords(left), exercises, markers: mk });
}

fs.writeFileSync(path.join(OCR, 'units-raw.json'), JSON.stringify({ units, markerLog }, null, 2));
let s = 0, e = 0, a = 0, m = 0;
for (const u of units) { s += u.sentences.length; e += u.exercises.length; a += u.exercises.filter((x) => x.answer).length; m += u.markers.length; }
console.log('units', units.length, '| sentences', s, '| exercises', e, '| có đáp án', a, '| markers', m);
for (const u of units) {
  console.log(`U${String(u.unit).padStart(2, '0')} ${u.cd} s=${String(u.sentences.length).padStart(2)} w=${String(u.words.length).padStart(2)} ex=${u.exercises.length}(${u.exercises.filter((x) => x.answer).length}) mk=[${u.markers.map((x) => x.track + x.part).join(' ')}]`);
}
