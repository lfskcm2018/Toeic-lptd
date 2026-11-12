const fs = require('fs');
const path = require('path');

const OCR = 'English Pronunciation in Use Elementary [1999]/work/ocr';
const printedToPdf = (p) => p + 1;
const unitPages = (u) => {
  const first = 10 + (u - 1) * 2;
  return [printedToPdf(first), printedToPdf(first + 1)];
};
const readPage = (p, tag = 'page') => {
  const f = path.join(OCR, `${tag}-${p}.txt`);
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
};
const clean = (s) => String(s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

/* Heuristic chất lượng câu tiếng Anh */
function score(s) {
  const t = String(s || '');
  if (t.length < 8) return -1;
  const letters = (t.match(/[A-Za-z]/g) || []).length;
  if (letters / t.length < 0.78) return -1;
  if (/[가-힣]/.test(t)) return -1;
  /* ký tự rác đặc trưng OCR (| ~ « » ‹ › © ƒ ı ả ễ ... ) */
  const bad = (t.match(/[^A-Za-z0-9 ,.;:'’!?()\-–—/&+*$%@#]/g) || []).length;
  if (bad / t.length > 0.06) return -1;
  if (!/[a-z]/.test(t) || !/[A-Z]/.test(t)) return -1;
  /* phải kết thúc bằng dấu câu */
  if (!/[.?!'"’”]/.test(t)) return -1;
  /* số từ hợp lý */
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 40) return -1;
  return words.length;
}

/* Marker âm thanh (đầu dòng) */
function markers(text) {
  const out = [];
  for (const raw of text.split(/\r?\n/)) {
    const l = clean(raw);
    const m = l.match(/^[^A-Za-z0-9]{0,3}([ABCDE])\s?(\d{1,2})\s?([a-z])?(?![A-Za-z0-9])/);
    if (m) {
      const track = parseInt(m[2], 10);
      if (track >= 1 && track <= 99) out.push({ cd: m[1], track, part: m[3] || '' });
    }
  }
  return out;
}

/* Câu mẫu (shadowing): dòng bắt đầu bằng số */
function extractSentences(text) {
  const out = [];
  const seen = new Set();
  for (const raw of text.split(/\r?\n/)) {
    const l = clean(raw);
    const m = l.match(/^(\d{1,2})[.)]?\s+(.{8,})$/);
    if (!m) continue;
    let txt = m[2]
      .replace(/\s*[«»‹›|~_*©ƒıảẻễọỏụủũỳỵỷỹ]+\s*$/, '')
      .replace(/\s*\(\s*\d+\s*\)\s*$/, '')
      .trim();
    const sc = score(txt);
    if (sc < 0) continue;
    const key = m[1] + '|' + txt.slice(0, 40);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ no: parseInt(m[1], 10), text: txt });
  }
  return out;
}

/* Từ vựng: sau "Listen and say these words" */
function extractWords(text) {
  const lines = text.split(/\r?\n/).map(clean);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/listen and (say|repeat) these (other )?words/i.test(lines[i])) continue;
    for (let k = i + 1; k < Math.min(i + 7, lines.length); k++) {
      const s = lines[k];
      if (!s) break;
      if (/^(A|B|C|D)\s?\d|listen and|Note:|Important|^\d{1,2}\.\d{1,2}\s|Exercises$/i.test(s)) break;
      for (const it of s.split(/\s{2,}/).map((x) => x.trim()).filter(Boolean)) {
        const w = it.replace(/\s*\(.*?\)\s*$/, '').trim();
        if (/^[a-zA-Z][a-zA-Z'’\-]{1,22}$/.test(w)) out.push(w);
      }
      if (out.length > 8) break;
    }
  }
  return [...new Set(out)].slice(0, 12);
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

/* Key: đáp án (có thể nhiều dòng cho 1 bài) */
function parseKey() {
  const answers = {};
  for (let p = 139; p <= 167; p++) {
    const t = readPage(p, 'key');
    if (!t) continue;
    const lines = t.split(/\r?\n/).map(clean);
    let cur = null;
    for (const l of lines) {
      const m = l.match(/^(\d{1,2}\.\d{1,2})\s+(.{1,})$/);
      if (m) {
        cur = m[1];
        if (!answers[cur]) answers[cur] = clean(m[2]);
        else answers[cur] += ' | ' + clean(m[2]);
      } else if (cur && l && !/^(Key|English Pronunciation|Exercise)/i.test(l) && !/^\d/.test(l)) {
        answers[cur] += ' | ' + l;
      }
    }
  }
  return answers;
}

const CD_OF = (u) => (u <= 12 ? 'A' : u <= 27 ? 'B' : u <= 43 ? 'C' : 'D');
const answers = parseKey();
const units = [];
for (let u = 1; u <= 50; u++) {
  const pages = unitPages(u);
  const left = readPage(pages[0]);
  const right = readPage(pages[1]);
  const cd = CD_OF(u);
  const mk = markers(left).concat(markers(right)).filter((m) => m.cd === cd);
  const tracks = [...new Set(mk.map((m) => m.track))].sort((a, b) => a - b);
  const exercises = parseRight(right).map((e) => ({ n: e.n, prompt: e.prompt, answer: (answers[e.n] || '').trim() }));
  units.push({
    unit: u, cd, pages,
    sentences: extractSentences(left),
    words: extractWords(left),
    exercises,
    tracks,
    markers: mk,
  });
}

fs.writeFileSync(path.join(OCR, 'units-content.json'), JSON.stringify({ units }, null, 2));
let s = 0, e = 0, a = 0, t = 0;
for (const u of units) { s += u.sentences.length; e += u.exercises.length; a += u.exercises.filter((x) => x.answer).length; t += u.tracks.length; }
console.log(`units ${units.length} | sentences ${s} | exercises ${e} | có đáp án ${a} | track refs ${t}`);
for (const u of units) {
  console.log(`U${String(u.unit).padStart(2, '0')} ${u.cd} s=${String(u.sentences.length).padStart(2)} w=${String(u.words.length).padStart(2)} ex=${u.exercises.length}(${u.exercises.filter((x) => x.answer).length}) tr=[${u.tracks.join(',')}]`);
}
