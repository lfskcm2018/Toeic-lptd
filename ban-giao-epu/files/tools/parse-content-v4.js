const fs = require('fs');
const path = require('path');

const OCR = 'English Pronunciation in Use Elementary [1999]/work/ocr';
const printedToPdf = (p) => p + 1;
const unitPages = (u) => {
  const first = 10 + (u - 1) * 2;
  return [printedToPdf(first), printedToPdf(first + 1)];
};
const readPage = (p, tag = 'hires') => {
  const f = path.join(OCR, `${tag}-${p}.txt`);
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
};
const clean = (s) => String(s || '').replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim();

/* ---------- chấm câu shadowing ---------- */
const INSTR_VOCAB = /\b(mouth|lips|tongue|teeth|throat|palate|jaw|diaphragm|voicing|vibrate|diagram|phoneme)\b/i;

function score(t) {
  const s = String(t || '');
  if (s.length < 8 || s.length > 220) return -1;
  const letters = (s.match(/[A-Za-z]/g) || []).length;
  if (letters / s.length < 0.70) return -1;
  const bad = (s.match(/[^A-Za-z0-9 ,.;:'’!?()\-–—&+*$%@#"]/g) || []).length;
  if (bad / s.length > 0.05) return -1;
  if (!/[a-z]/.test(s) || !/[A-Z]/.test(s)) return -1;
  if (!/[.?!'\"’”]$/.test(s.trim())) return -1;          /* phải kết thúc bằng dấu câu */
  if (/\/[a-zA-Zɐɑɒæʌʊθðʃʒŋɪɛɔɜːˈˌ]/.test(s)) return -1;
  if (INSTR_VOCAB.test(s)) return -1;
  const w = s.split(/\s+/).filter(Boolean);
  if (w.length < 2 || w.length > 35) return -1;
  return w.length;
}

/* ---------- cue ---------- */
const CUE_RE = /(listen|say the|repeat|go back and)/i;

/* ---------- lệnh dạy (đóng khối) ---------- */
const INSTR = /^(listen|look|note|check|write|circle|underline|match|complete|put|read|say|repeat|try|remember|now|then|also|some|important|here|think|find|make|choose|cross|tick|use|identify|count|decide|explain|discuss|ask|answer|give|how|explanation|pronunciation|syllable|letter|alphabet|vowel|consonant|diphthong|question|example|unit|section|page|key|exercise|do not|don't|if you|when you)\b/i;

const NUM_ITEM = /(?:^|\s)(\d{1,2})[.)]\s+(?=[A-Z"'(])/g;
function splitNumbered(line) {
  const out = [];
  let last = 0, m;
  NUM_ITEM.lastIndex = 0;
  while ((m = NUM_ITEM.exec(line))) {
    if (m.index > last) out.push({ no: null, text: line.slice(last, m.index) });
    out.push({ no: parseInt(m[1], 10), text: line.slice(m.index + m[0].length - m[0].trimStart().length) });
    last = m.index + m[0].length;
  }
  out.push({ no: null, text: line.slice(last) });
  return out;
}

function extractSentences(text) {
  const lines = text.split(/\r?\n/).map(clean);
  const out = [];
  const seen = new Set();
  const push = (no, txt, cont) => {
    let t = String(txt || '')
      .replace(/\s*[«»‹›|~_*©ƒ]+\s*$/, '')
      .replace(/\s*\(\s*\d+\s*\)\s*$/, '')
      .trim();
    if (!t) return;
    if (cont && out.length) {
      const last = out[out.length - 1];
      if (score(t) >= 0) { last.text += ' ' + t; return; }
      return;
    }
    if (score(t) < 0) return;
    const key = t.slice(0, 45);
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ no: no == null ? null : no, text: t });
  };

  let inBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!l) { inBlock = false; continue; }

    const cm = l.match(CUE_RE);
    if (cm) {
      inBlock = true;
      push(null, l.slice(cm.index + cm[0].length));
      continue;
    }
    if (/^(A|B|C|D|E)\s?\d{1,2}\b/.test(l)) { inBlock = false; continue; }
    if (/^\d{1,2}\.\d{1,2}\s/.test(l)) { inBlock = false; continue; }
    if (/^(Section|Exercises|Key|English Pronunciation|Contents|To the|Map of)/i.test(l)) { inBlock = false; continue; }
    if (!inBlock) continue;
    if (INSTR.test(l)) { inBlock = false; continue; }

    /* dòng hội thoại A:/B: → nối vào câu trước */
    if (/^[AB]:/.test(l)) { push(null, l, true); continue; }

    for (const part of splitNumbered(l)) {
      if (part.no == null && out.length && /^[A-Za-z]/.test(part.text) && score(part.text) < 0) continue;
      push(part.no, part.text);
    }
  }
  return out;
}

/* ---------- từ vựng ---------- */
function extractWords(text) {
  const lines = text.split(/\r?\n/).map(clean);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/listen and (say|repeat) these (other )?words/i.test(lines[i])) continue;
    for (let k = i + 1; k < Math.min(i + 8, lines.length); k++) {
      const s = lines[k];
      if (!s) break;
      if (/^(A|B|C|D|E)\s?\d{1,2}\b|listen and|Note:|Important|^\d{1,2}\.\d{1,2}\s|Exercises$|^Check/i.test(s)) break;
      for (const it of s.split(/\s{2,}/).map((x) => x.trim()).filter(Boolean)) {
        const w = it.replace(/\s*\(.*?\)\s*$/, '').trim();
        if (/^[a-zA-Z][a-zA-Z'’\-]{1,24}$/.test(w)) out.push(w);
      }
      if (out.length > 10) break;
    }
  }
  return [...new Set(out)].slice(0, 16);
}

/* ---------- bài tập ---------- */
function parseExercises(text) {
  const seen = new Set();
  const ex = [];
  for (const l of text.split(/\r?\n/).map(clean)) {
    const m = l.match(/^(\d{1,2})\.(\d{1,2})\s+(.{8,})$/);
    if (!m) continue;
    const n = m[1] + '.' + m[2];
    if (seen.has(n)) continue;
    seen.add(n);
    ex.push({ n, prompt: clean(m[3]).slice(0, 320) });
  }
  return ex;
}

/* ---------- Key ---------- */
function parseKey() {
  const answers = {};
  for (let p = 139; p <= 167; p++) {
    const t = readPage(p, 'key');
    if (!t) continue;
    const lines = t.split(/\r?\n/).map(clean);
    let cur = null;
    for (const l of lines) {
      if (!l) continue;
      if (/^(Key|English Pronunciation in Use|Exercise)/i.test(l)) continue;
      const m = l.match(/^(\d{1,2}\.\d{1,2})\s+(.+)$/);
      if (m) {
        cur = m[1];
        answers[cur] = (answers[cur] ? answers[cur] + ' | ' : '') + clean(m[2]);
        continue;
      }
      if (cur && /^[A-Za-z0-9]/.test(l) && !/^\d/.test(l)) answers[cur] += ' ' + l;
    }
  }
  return answers;
}

const answers = parseKey();
const units = [];
for (let u = 1; u <= 50; u++) {
  const pages = unitPages(u);
  const left = readPage(pages[0]);
  const right = readPage(pages[1]);
  const ex = parseExercises(right).map((e) => ({
    n: e.n, prompt: e.prompt, answer: (answers[e.n] || '').replace(/\s*\|\s*/g, ' ').trim(),
  }));
  units.push({
    unit: u, pages,
    sentences: extractSentences(left),
    words: extractWords(left),
    exercises: ex,
  });
}

fs.writeFileSync(path.join(OCR, 'units-content-v4.json'), JSON.stringify({ units }, null, 2));
let s = 0, e = 0, a = 0, w = 0;
for (const u of units) { s += u.sentences.length; e += u.exercises.length; a += u.exercises.filter((x) => x.answer).length; w += u.words.length; }
console.log(`units ${units.length} | sentences ${s} | words ${w} | exercises ${e} | có đáp án ${a}`);
for (const u of units) {
  console.log(`U${String(u.unit).padStart(2, '0')} s=${String(u.sentences.length).padStart(2)} w=${String(u.words.length).padStart(2)} ex=${String(u.exercises.length).padStart(2)}(${u.exercises.filter((x) => x.answer).length}) | ${(u.sentences[0] || {}).text || ''}`.slice(0, 130));
}
