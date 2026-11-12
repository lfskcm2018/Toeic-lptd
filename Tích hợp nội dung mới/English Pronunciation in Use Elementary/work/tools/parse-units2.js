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

/* Heuristic: tỉ lệ ký tự "OCR rác" trong 1 dòng */
function noiseRatio(s) {
  const t = String(s || '');
  if (!t) return 1;
  const bad = (t.match(/[^A-Za-z0-9 ,.;:'’!?()\-–/&+]/g) || []).length;
  return bad / t.length;
}
function looksEnglish(s) {
  const t = String(s || '');
  if (t.length < 4) return false;
  const letters = (t.match(/[A-Za-z]/g) || []).length;
  if (letters / t.length < 0.72) return false;
  if (noiseRatio(t) > 0.12) return false;
  if (/[가-힣]/.test(t)) return false;
  return /[a-z]/.test(t) && /[A-Z]/.test(t);
}

/* Marker âm thanh: dạng "A2a", "(B14a", "C 5" ở đầu dòng */
function markers(text) {
  const out = [];
  for (const raw of text.split(/\r?\n/)) {
    const l = clean(raw);
    const m = l.match(/^[^A-Za-z0-9]{0,3}([ABCDE])\s?(\d{1,2})\s?([a-z])?/);
    if (m) {
      const track = parseInt(m[2], 10);
      if (track >= 1 && track <= 99) out.push({ cd: m[1], track, part: m[3] || '' });
    }
  }
  return out;
}

/* Câu / cụm từ: sau dòng "Listen and say these sentences/phrases" */
function extractSentences(text) {
  const lines = text.split(/\r?\n/).map(clean);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!/listen and (say|repeat) these (sentences|phrases)/i.test(l)) continue;
    /* bỏ qua nếu chỉ là "Now listen and say these sentences with /x/ and /y/." (có "with") */
    for (let k = i + 1; k < Math.min(i + 14, lines.length); k++) {
      const s = lines[k];
      if (!s) break;
      if (/^(A|B|C|D)\s?\d|^\d{1,2}\.\d{1,2}\s|Exercises$|Section [A-E]|English Pronunciation in Use/i.test(s)) break;
      const m = s.match(/^(\d{1,2})[.)]\s+(.{6,})$/);
      if (m && looksEnglish(m[2])) {
        const txt = m[2]
          .replace(/\s*[«»‹›|~]{1,}\s*$/, '')
          .replace(/\s*\(\s*\d+\s*\)\s*$/, '')
          .trim();
        if (looksEnglish(txt)) out.push({ no: parseInt(m[1], 10), text: txt });
        continue;
      }
      if (out.length) break;
    }
  }
  return out;
}

/* Từ vựng: sau "Listen and say these words" */
function extractWords(text) {
  const lines = text.split(/\r?\n/).map(clean);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!/listen and (say|repeat) these (other )?words/i.test(l)) continue;
    for (let k = i + 1; k < Math.min(i + 8, lines.length); k++) {
      const s = lines[k];
      if (!s) break;
      if (/^(A|B|C|D)\s?\d|listen and|Note:|Important|^\d{1,2}\.\d{1,2}\s|Exercises$/i.test(s)) break;
      const items = s.split(/\s{2,}/).filter(Boolean);
      for (const it of items) {
        const w = it.replace(/\s*\(.*?\)\s*$/, '').trim();
        if (/^[a-zA-Z][a-zA-Z'’\- ]{1,24}$/.test(w) && !/^(Listen|Now|Then|Also|Some|Note|Important|and|or)$/i.test(w)) out.push(w);
      }
      if (out.length > 3) break;
    }
  }
  return out;
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

/* Marker theo unit + CD */
const CD_FOR_UNIT = (u) => (u <= 12 ? 'A' : u <= 27 ? 'B' : u <= 43 ? 'C' : 'D');

const answers = parseKey();
const units = [];
const markerLog = [];
for (let u = 1; u <= 50; u++) {
  const pages = unitPages(u);
  const left = readPage(pages[0]);
  const right = readPage(pages[1]);
  const cd = CD_FOR_UNIT(u);
  const mk = markers(left).concat(markers(right)).filter((m) => m.cd === cd);
  markerLog.push({ unit: u, cd, markers: mk });

  const exercises = parseRight(right).map((e) => ({ n: e.n, prompt: e.prompt, answer: answers[e.n] || '' }));
  units.push({
    unit: u, cd, pages,
    sentences: extractSentences(left),
    words: extractWords(left),
    exercises,
    markers: mk,
  });
}

fs.writeFileSync(path.join(OCR, 'units-raw.json'), JSON.stringify({ units, markerLog }, null, 2));
let s = 0, e = 0, a = 0, m = 0;
for (const u of units) { s += u.sentences.length; e += u.exercises.length; a += u.exercises.filter((x) => x.answer).length; m += u.markers.length; }
console.log('units', units.length, '| sentences', s, '| exercises', e, '| có đáp án', a, '| markers', m);
for (const u of units) {
  console.log(`U${String(u.unit).padStart(2, '0')} ${u.cd} s=${String(u.sentences.length).padStart(2)} w=${String(u.words.length).padStart(2)} ex=${u.exercises.length}(${u.exercises.filter((x) => x.answer).length}) mk=[${u.markers.map((x) => x.track + x.part).join(' ')}]`);
}
