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

function score(s) {
  const t = String(s || '');
  if (t.length < 8) return -1;
  const letters = (t.match(/[A-Za-z]/g) || []).length;
  if (letters / t.length < 0.78) return -1;
  if (/[가-힣]/.test(t)) return -1;
  const bad = (t.match(/[^A-Za-z0-9 ,.;:'’!?()\-–—/&+*$%@#]/g) || []).length;
  if (bad / t.length > 0.06) return -1;
  if (!/[a-z]/.test(t) || !/[A-Z]/.test(t)) return -1;
  if (!/[.?!'"’”]/.test(t)) return -1;
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 40) return -1;
  return words.length;
}

/* Câu mẫu: trong 1 dòng OCR có thể gộp nhiều câu "1 Xxx 2 Yyy" → tách theo số đứng đầu */
const SENT_SPLIT = /(?:^|\s)(\d{1,2})[.)]?\s+(?=[A-Z])/g;
function extractSentences(text) {
  const out = [];
  const seen = new Set();
  for (const raw of text.split(/\r?\n/)) {
    const l = clean(raw);
    if (!l) continue;
    /* bỏ dòng toàn header/bài tập */
    if (/^\d{1,2}\.\d{1,2}\s/.test(l)) continue;
    if (/^(Section|Exercises|Key|English Pronunciation|Contents|To the)/i.test(l)) continue;
    const parts = [];
    let last = 0;
    let m;
    SENT_SPLIT.lastIndex = 0;
    while ((m = SENT_SPLIT.exec(l))) {
      if (m.index > last) parts.push({ no: null, text: l.slice(last, m.index) });
      parts.push({ no: parseInt(m[1], 10), text: l.slice(m.index + m[0].length - (m[0].length - m[0].trimStart().length)) });
      last = m.index + m[0].length;
    }
    parts.push({ no: null, text: l.slice(last) });
    for (const p of parts) {
      let txt = p.text
        .replace(/^\d{1,2}[.)]?\s*/, '')
        .replace(/\s*[«»‹›|~_*©ƒıảẻễọỏụủũỳỵỷỹ]+\s*$/, '')
        .replace(/\s*\(\s*\d+\s*\)\s*$/, '')
        .trim();
      const sc = score(txt);
      if (sc < 0) continue;
      const key = txt.slice(0, 40);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ no: p.no, text: txt });
    }
  }
  return out;
}

/* Marker âm thanh */
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

const CD_OF = (u) => (u <= 12 ? 'A' : u <= 27 ? 'B' : u <= 43 ? 'C' : 'D');
const units = [];
for (let u = 1; u <= 50; u++) {
  const pages = unitPages(u);
  const left = readPage(pages[0]);
  const right = readPage(pages[1]);
  const cd = CD_OF(u);
  const mk = markers(left).concat(markers(right)).filter((m) => m.cd === cd);
  units.push({ unit: u, cd, pages, sentences: extractSentences(left), markers: mk });
}
fs.writeFileSync(path.join(OCR, 'units-sentences.json'), JSON.stringify(units, null, 2));
let s = 0;
for (const u of units) { s += u.sentences.length; console.log(`U${String(u.unit).padStart(2, '0')} ${u.cd} s=${u.sentences.length}`); }
console.log('total sentences', s);
