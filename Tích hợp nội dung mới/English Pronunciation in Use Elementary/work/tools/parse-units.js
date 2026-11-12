const fs = require('fs');
const path = require('path');

const ROOT = 'English Pronunciation in Use Elementary [1999]';
const OCR = path.join(ROOT, 'work', 'ocr');

const printedToPdf = (p) => p + 1;
function unitPages(unitNo) {
  const first = 10 + (unitNo - 1) * 2;
  return [printedToPdf(first), printedToPdf(first + 1)];
}
function readPage(p, tag = 'page') {
  const f = path.join(OCR, `${tag}-${p}.txt`);
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
}

/* ---------- Marker âm thanh (A/B/C/D/E + số track) ---------- */
function markers(text) {
  const out = [];
  const re = /(?<![A-Za-z])([ABCDE])\s?(\d{1,2})\s?([a-z])?(?![A-Za-z])/g;
  let m;
  while ((m = re.exec(text))) {
    const track = parseInt(m[2], 10);
    if (track >= 1 && track <= 99) out.push({ cd: m[1], track, part: m[3] || '' });
  }
  return out;
}

/* ---------- Làm sạch text OCR ---------- */
function clean(s) {
  return String(s || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
/* Loại ký tự rác đầu dòng do OCR (ký hiệu tai nghe, bullet) */
function stripLeadingNoise(s) {
  return String(s || '')
    .replace(/^[^A-Za-z0-9(./"']+/, '')
    .replace(/^[|~«»‹›\-–—_=•*#›»]+\s*/, '')
    .trim();
}

const CD_FOR_UNIT = (u) => (u <= 12 ? 'A' : u <= 27 ? 'B' : u <= 43 ? 'C' : 'D');

/* ---------- Trích từ trang trái (dạy) ---------- */
function parseLeft(text) {
  const lines = text.split(/\r?\n/);
  const res = { title: '', focus: '', explanation: '', sentences: [], words: [] };

  /* 2 dòng đầu: tiêu đề + focus (âm) */
  let i = 0;
  const head = [];
  while (i < lines.length && head.length < 4) {
    const l = clean(lines[i]);
    if (!l) { i++; continue; }
    if (/^(Section [A-E]|Exercises|Contents|To the student|To the teacher|Map of contents)/i.test(l)) break;
    if (/English Pronunciation in Use \(Elementary\)/i.test(l)) break;
    head.push(l);
    i++;
  }
  res.title = head[0] || '';
  res.focus = head[1] || '';
  /* Nếu dòng 2 không phải âm, dòng 3 mới là focus */
  if (!/\//.test(res.focus) && /\//.test(head[2] || '')) res.focus = head[2];

  /* Explanation: sau "How to make the sound" */
  const joined = lines.map(clean);
  const hi = joined.findIndex((l) => /how to make the sound/i.test(l));
  if (hi !== -1) {
    const ex = [];
    for (let k = hi; k < Math.min(hi + 8, joined.length); k++) {
      const l = joined[k];
      if (!l) break;
      if (/^(A|B|C|D)\d|\d+\.\d+\s|Listen to|Note:|Now listen|Sound and spelling|^\d+$/.test(l)) break;
      ex.push(l);
    }
    res.explanation = ex.join(' ').replace(/^How to make the sound[^.]*\.\s*/, '').trim();
  }

  /* Sentences: sau "listen and say these sentences" / "listen and repeat these sentences" */
  const sIdx = joined.findIndex((l) => /listen and (say|repeat) these (sentences|phrases)/i.test(l));
  if (sIdx !== -1) {
    const sents = [];
    for (let k = sIdx + 1; k < joined.length; k++) {
      const l = joined[k];
      if (!l) break;
      if (/^(A|B|C|D)\d|^\d+\.\d+\s|Exercises$|Section [A-E]|English Pronunciation in Use/i.test(l)) break;
      const m = l.match(/^(\d{1,2})[.)]\s*(.+)$/);
      if (m) { sents.push({ no: parseInt(m[1], 10), text: clean(m[2]) }); continue; }
      if (/^(Now listen|Listen|Then listen|Also listen|Some|Note|Important|D|C4a|E3%|\d+\.\d+)/i.test(l)) break;
      if (sents.length && !/^[A-Za-z"'(]/.test(l)) break;
    }
    res.sentences = sents;
  }
  return res;
}

/* ---------- Trích bài tập từ trang phải ---------- */
function parseRight(text) {
  const lines = text.split(/\r?\n/).map(clean);
  const ex = [];
  const seen = new Set();
  for (const l of lines) {
    const m = l.match(/^(\d{1,2}\.\d{1,2})\s+(.{4,})$/);
    if (m && !seen.has(m[1])) { seen.add(m[1]); ex.push({ n: m[1], prompt: clean(m[2]) }); }
  }
  return ex;
}

/* ---------- Key: đáp án ---------- */
function parseKey() {
  const answers = {};
  for (let p = 139; p <= 167; p++) {
    const t = readPage(p, 'key');
    if (!t) continue;
    for (const l of t.split(/\r?\n/).map(clean)) {
      const m = l.match(/^(\d{1,2}\.\d{1,2})\s+(.{1,})$/);
      if (m && !answers[m[1]]) answers[m[1]] = clean(m[2]);
    }
  }
  return answers;
}

/* ---------- Main ---------- */
const answers = parseKey();
const units = [];
for (let u = 1; u <= 50; u++) {
  const pages = unitPages(u);
  const left = parseLeft(readPage(pages[0]));
  const right = parseRight(readPage(pages[1]));
  const mk = markers(readPage(pages[0]) + '\n' + readPage(pages[1])).filter((m) => m.cd === CD_FOR_UNIT(u));
  const tracks = [...new Set(mk.map((m) => m.track))].sort((a, b) => a - b);
  const exercises = right.map((e) => ({ n: e.n, prompt: e.prompt, answer: answers[e.n] || '' }));
  units.push({
    unit: u, cd: CD_FOR_UNIT(u), pages,
    title: left.title, focus: left.focus, explanation: left.explanation,
    sentences: left.sentences, exercises, tracks,
  });
}

fs.writeFileSync(path.join(OCR, 'units-raw.json'), JSON.stringify(units, null, 2));
console.log('units parsed:', units.length);
for (const u of units) {
  console.log(`U${String(u.unit).padStart(2, '0')} ${u.title.slice(0, 46).padEnd(48)} | sents=${u.sentences.length} ex=${u.exercises.length} ans=${u.exercises.filter((e) => e.answer).length} tracks=[${u.tracks.join(',')}]`);
}
