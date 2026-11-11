'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const rawPath = path.join(root, 'extract', 'hacker1-raw.txt');
const raw = fs.readFileSync(rawPath, 'utf8').replace(/\r\n/g, '\n');

function clean(s) {
  return String(s || '')
    .replace(/\uFFFD/g, "'")
    .replace(/[\u2019\u2018]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\t+/g, ' ')
    .replace(/[ \u00A0]+/g, ' ')
    .replace(/ \n/g, '\n')
    .trim();
}

const text = clean(raw);
const headerRe = /^TEST\s+(\d{2})\s*\|\s*Part\s+(.+)$/gm;
const headers = [];
let m;
while ((m = headerRe.exec(text)) !== null) {
  const partRaw = m[2].trim().replace(/\s+/g, ' ');
  headers.push({ test: Number(m[1]), part: partRaw, index: m.index, end: headerRe.lastIndex });
}

function cleanChunk(chunk) {
  chunk = chunk.replace(/-- \d+ of 31 --/g, '\n');
  chunk = chunk.split('\n').filter(l => {
    const t = l.trim();
    if (!t) return true;
    if (/^\d+\.\s*TEST\s+\d+/i.test(t)) return false;
    if (/^\d{1,2}$/.test(t)) return false;
    return true;
  }).join('\n');
  return chunk.trim();
}

function blockContent(i) {
  const start = i === 0 ? 0 : headers[i - 1].end;
  const end = headers[i].index;
  return cleanChunk(text.slice(start, end));
}

function pad2(n) { return String(n).padStart(2, '0'); }
function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }

function parsePart12(block) {
  const lines = [];
  const qa = {};
  const qaRe = /^0(\d)\.\s+Q:\s*(.+)\nA:\s*(.+)$/gm;
  let qm;
  while ((qm = qaRe.exec(block)) !== null) {
    qa[Number(qm[1])] = { q: qm[2].trim(), a: qm[3].trim() };
  }
  const st = {};
  const stRe = /^0(\d)\.\s+(?!Q:)(.+)$/gm;
  let sm;
  while ((sm = stRe.exec(block)) !== null) st[Number(sm[1])] = sm[2].trim();
  for (let i = 1; i <= 4; i++) {
    if (qa[i]) {
      lines.push({ speaker: 'Q', text: qa[i].q });
      lines.push({ speaker: 'A', text: qa[i].a });
    } else if (st[i]) {
      lines.push({ speaker: '', text: st[i] });
    }
  }
  if (!lines.length) {
    block.split('\n').forEach(l => {
      const t = l.trim();
      if (!t || /^(TEST|\d+$)/.test(t)) return;
      const qam = t.match(/^(Q|A):\s*(.*)$/);
      if (qam) lines.push({ speaker: qam[1], text: qam[2].trim() });
      else if (/^0?\d+\./.test(t)) lines.push({ speaker: '', text: t.replace(/^0?\d+\.\s*/, '').trim() });
    });
  }
  return lines.map((x, i) => ({ no: i + 1, speaker: x.speaker || '', text: x.text }));
}

function splitIntoSentences(textIn) {
  let t = String(textIn || '').replace(/\s+/g, ' ').trim();
  if (!t) return [];
  const prot = [];
  function protect(re) { t = t.replace(re, (m) => { prot.push(m); return `__P${prot.length - 1}__`; }); }
  protect(/\bhttps?:\/\/[^\s]+?(?=[)\]"']*(?:\s|$))/gi);
  protect(/\bwww\.[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*?)?(?=[.,!?;:)\]"']*(?:\s|$)|$)/gi);
  protect(/\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi);
  protect(/\b\d{1,2}\s*[ap]\.m\./gi);
  protect(/\b\d{1,2}:\d{2}\s*(?:[ap]\.m\.)?/gi);
  protect(/\b(?:Mr|Mrs|Ms|Dr|Prof|St|Ave|vs|etc|e\.g|i\.e|No|Vol|Fig)\./gi);
  protect(/\.\s*\.\s*\./g);
  protect(/uhm\s*\.\s*\.\s*\./gi);
  const parts = t.match(/[^.!?]+[.!?]+(?:["')\]]+)?|[^.!?]+$/g) || [t];
  return parts.map(s => {
    let out = s.trim();
    out = out.replace(/__P(\d+)__/g, (_, i) => prot[Number(i)] || '');
    return out.replace(/\s+/g, ' ').trim();
  }).filter(Boolean);
}

function splitScriptLines(textBlock) {
  const out = [];
  const rawLines = textBlock.split('\n').map(l => l.trim()).filter(Boolean);
  let cur = null;
  function pushCur() {
    if (cur && cur.text && cur.text.trim()) {
      const t = cur.text.replace(/\s+/g, ' ').trim();
      if (t) out.push({ speaker: cur.speaker || '', text: t });
    }
    cur = null;
  }
  const isNarrStart = (l) => /^(Can I have|Attention|This message|Good evening|Good morning|Good afternoon|Hello|Hi[, ]|Welcome|Looking|Worried|Are you|Do you|Thank you|We are|We'd like|I'd like|I'm calling|I am calling|This is|As you|Please)/i.test(l);
  rawLines.forEach(l => {
    if (/^\d{1,2}$/.test(l)) return;
    const sm = l.match(/^([WM]\d*|[WM])\s*:\s*(.*)$/);
    if (sm) { pushCur(); cur = { speaker: sm[1], text: sm[2] || '' }; return; }
    if (!cur && isNarrStart(l)) { cur = { speaker: '', text: l }; return; }
    if (cur) cur.text += ' ' + l;
    else cur = { speaker: '', text: l };
  });
  pushCur();
  return out.map((x, i) => ({ no: i + 1, speaker: x.speaker, text: x.text }));
}

function blankScore(lines) {
  let s = 0;
  const txt = lines.map(l => l.text).join(' ');
  const blanks = txt.match(/\d\)\s*(?=[.,?]|$|\s{2,})/g) || [];
  s += blanks.length * 3;
  s += (txt.match(/\d\)\s*\./g) || []).length * 2;
  return s;
}
function filledScore(lines) {
  let s = 0;
  const txt = lines.map(l => l.text).join(' ');
  const filled = txt.match(/\d\)\s+[A-Za-z][^.,]{2,}/g) || [];
  s += filled.length * 3;
  return s;
}

function takeFilledScript(block) {
  const lines = block.split('\n');
  const norm = (s) => s.trim().replace(/\s+/g, ' ').slice(0, 28).toLowerCase().replace(/\d+\)\s*[^a-z]*/g, '');
  const isStart = (t) => /^[WM]\d*\s*:/.test(t) || /^1\)\s+/.test(t) || /^(Can I have|Attention|This message|Good evening|Good morning|Good afternoon|Hello|Hi[, ]|Welcome|Looking|Worried|I['’]m calling|This is|Thanks for)/i.test(t);
  const starts = [];
  lines.forEach((l, i) => { if (isStart(l.trim())) starts.push(i); });
  if (starts.length >= 2) {
    const first = norm(lines[starts[0]]);
    for (let k = 1; k < starts.length; k++) {
      const nk = norm(lines[starts[k]]);
      if (first && nk === first && starts[k] > starts[0] + 1) {
        return lines.slice(starts[k]).join('\n');
      }
    }
    const oneStarts = starts.filter(i => /^1\)\s+/.test(lines[i].trim()));
    if (oneStarts.length >= 2) return lines.slice(oneStarts[oneStarts.length - 1]).join('\n');
  }
  const plain = block.replace(/\s+/g, ' ').trim();
  const openers = ['Good evening, everyone', 'Good morning, everyone', 'Attention shoppers', 'This message is for', 'Can I have everyone', 'Hello, everyone', 'Welcome', 'Looking for', 'Worried about', 'Are you looking', 'Thanks for coming', '1) Thanks'];
  for (const op of openers) {
    const idx1 = plain.toLowerCase().indexOf(op.toLowerCase());
    if (idx1 >= 0) {
      const idx2 = plain.toLowerCase().indexOf(op.toLowerCase(), idx1 + op.length);
      if (idx2 > idx1 + 20) return plain.slice(idx2);
    }
  }
  const oneIdxs = [];
  lines.forEach((l, i) => { if (/^\s*1\)/.test(l)) oneIdxs.push(i); });
  if (oneIdxs.length >= 2 && oneIdxs[oneIdxs.length - 1] > oneIdxs[0]) {
    return lines.slice(oneIdxs[oneIdxs.length - 1]).join('\n');
  }
  return block;
}

function dedupeBlankFilled(parsed) {
  const skeleton = (t) => String(t || '').toLowerCase().replace(/\s+/g, ' ')
    .replace(/\d+\)\s*/g, ' ').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const lineBlankness = (t) => { const x = String(t); let n = 0; const r1 = /\d\)\s*(?=[.,;:]?(\s|$))/g; const r2 = /\d\)\s*\./g; if (x.match(r1)) n += x.match(r1).length; if (x.match(r2)) n += x.match(r2).length * 2; return n; };
  const firstSig = (t) => skeleton(t).split(' ').filter(Boolean).slice(0, 5).join(' ');

  if (parsed.length >= 4) {
    const sigN = (t,n)=>skeleton(t).split(' ').filter(Boolean).slice(0,n).join(' ');
    const sig0 = sigN(parsed[0].text,4);
    if (sig0.length >= 12) {
      for (let k = 2; k <= parsed.length - 2; k++) {
        if (sigN(parsed[k].text,4) === sig0) {
          const a = parsed.slice(0, k), b = parsed.slice(k);
          const aB = blankScore(a), bB = blankScore(b), aF = filledScore(a), bF = filledScore(b);
          if (aB > bB && bF >= aF) return b;
          if (bB > aB && aF >= bF) return a;
          // common workbook pattern: blank template followed by filled script
          if (aB >= bB + 2) return b;
          if (bB >= aB + 2) return a;
          if (Math.abs(a.length - b.length) <= 2) {
            if (bF - bB > aF - aB) return b;
            if (aF - aB > bF - bB) return a;
          }
        }
      }
    }
    if (parsed.length % 2 === 0) {
      const h = parsed.length / 2;
      const a = parsed.slice(0, h), b = parsed.slice(h);
      let matches = 0;
      for (let i = 0; i < h; i++) { const sa = firstSig(a[i].text).slice(0, 18), sb = firstSig(b[i].text).slice(0, 18); if (sa && sa === sb) matches++; }
      if (matches >= Math.max(2, Math.floor(h * 0.6))) {
        const aB = blankScore(a), bB = blankScore(b), aF = filledScore(a), bF = filledScore(b);
        if (aB >= bB || bF >= aF) return b;
        if (bB > aB || aF > bF) return a;
      }
    }
  }
  const keep = new Array(parsed.length).fill(true);
  const sig = (t) => skeleton(t).split(' ').filter(Boolean).slice(0, 5).join(' ');
  for (let i = 0; i < parsed.length; i++) {
    if (!keep[i]) continue;
    const si = sig(parsed[i].text);
    if (si.length < 15) continue;
    for (let j = i + 1; j < parsed.length; j++) {
      if (!keep[j]) continue;
      if (si !== sig(parsed[j].text)) continue;
      const bi = lineBlankness(parsed[i].text), bj = lineBlankness(parsed[j].text);
      const fi = (parsed[i].text.match(/\d\)\s+[A-Za-z]{2,}/g) || []).length;
      const fj = (parsed[j].text.match(/\d\)\s+[A-Za-z]{2,}/g) || []).length;
      const scoreI = fi * 3 - bi * 3 + parsed[i].text.length * 0.01;
      const scoreJ = fj * 3 - bj * 3 + parsed[j].text.length * 0.01;
      if (scoreJ >= scoreI) { keep[i] = false; break; } else { keep[j] = false; }
    }
  }
  return parsed.filter((_, i) => keep[i]);
}

function parsePart34(block) {
  let scriptBlock = takeFilledScript(block);
  let parsed = splitScriptLines(scriptBlock);
  parsed = parsed.filter(x => x.text && x.text.length > 2);
  parsed = parsed.filter(x => !/^1\)\s*$/.test(x.text));
  if (parsed.length === 1 && parsed[0].text.split(/\s+/).length > 40) {
    const sp = parsed[0].speaker || '';
    const sents = splitIntoSentences(parsed[0].text);
    if (sents.length > 1) parsed = sents.map(s => ({ speaker: sp, text: s }));
  }
  parsed = dedupeBlankFilled(parsed);
  if (!parsed.length) parsed = splitScriptLines(block).filter(x => x.text && x.text.length > 2);
  return parsed.map((x, i) => ({ no: i + 1, speaker: x.speaker || '', text: x.text.replace(/\s+/g, ' ').trim() }));
}

const lessons = [];
headers.forEach((h, i) => {
  const content = blockContent(i);
  const p = h.part;
  const partNorm = (/^1[\s\-]*2$/.test(p) || /^1\s*$/.test(p) || (/1/.test(p) && /2/.test(p))) ? '1-2' : (/^3$/.test(p) ? '3' : (/^4$/.test(p) ? '4' : p));
  const partCode = partNorm === '1-2' ? '12' : partNorm;
  const audioFile = `TEST${pad2(h.test)}_Part${partNorm}.mp3`;
  let lines = [];
  if (partNorm === '1-2') lines = parsePart12(content);
  else lines = parsePart34(content);
  const cleaned = [];
  lines.forEach(l => {
    let t = String(l.text || '').replace(/\s+/g, ' ').trim();
    const sp = l.speaker || '';
    if (!t) return;
    if (/^(com\.?|org\.?|net\.?)$/i.test(t)) return;
    if (/^\d+\)\s*[.?!,;:]*$/.test(t)) return;
    if (/^[.?!,;:]+$/.test(t)) return;
    if (cleaned.length && cleaned[cleaned.length - 1].text === t && cleaned[cleaned.length - 1].speaker === sp) return;
    if (t.length <= 4 && cleaned.length && /^[a-z0-9)/.]+$/i.test(t)) { cleaned[cleaned.length - 1].text += ' ' + t; return; }
    cleaned.push({ no: cleaned.length + 1, speaker: sp, text: t });
  });
  const textJoined = cleaned.map(l => l.text).join(' ');
  const wordCount = textJoined ? textJoined.split(/\s+/).filter(Boolean).length : 0;
  const cdnName = `HACKER1_T${pad2(h.test)}_P${partCode}.mp3`;
  lessons.push({
    id: `hacker1-t${pad2(h.test)}-p${partCode}`,
    source: 'hacker-1',
    book: 1,
    test: h.test,
    part: partNorm,
    unit: lessons.length + 1,
    title: `TEST ${pad2(h.test)} · Part ${partNorm}`,
    slug: slug(`test-${pad2(h.test)}-part-${partNorm}`),
    audioFileName: audioFile,
    cdnName,
    localPath: `Hacker 1/Hackers_Toeic_1000_1_LC_3rd_workbook(mp3)/${audioFile}`,
    lines: cleaned,
    lineCount: cleaned.length,
    wordCount,
  });
});

const meta = {
  sourceId: 'hacker-1',
  sourceName: 'Hacker 1',
  workbook: 'Hackers TOEIC 1000 1 LC 3rd workbook',
  type: 'test-workbook',
  tests: 10,
  lessonCount: lessons.length,
  totalLines: lessons.reduce((a, l) => a + l.lineCount, 0),
  totalWords: lessons.reduce((a, l) => a + l.wordCount, 0),
  audioRoot: 'Hacker 1/Hackers_Toeic_1000_1_LC_3rd_workbook(mp3)',
  pdfFile: 'Hackers_Toeic_1000_1_LC_3rd_workbook_(PDF).pdf',
  parts: ['1-2', '3', '4'],
  generatedAt: new Date().toISOString(),
};

fs.writeFileSync(path.join(root, 'hacker-1-meta.json'), JSON.stringify(meta, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.join(root, 'hacker-1-lessons.json'), JSON.stringify(lessons, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.join(root, 'hacker-1-lessons-data.js'),
  '(function(global){\n  "use strict";\n  global.HACKER1_LESSONS_META = ' + JSON.stringify(meta, null, 2) + ';\n  global.HACKER1_LESSONS = ' + JSON.stringify(lessons, null, 2) + ';\n})(typeof window!=="undefined"?window:this);\n', 'utf8');

const gasDir = path.join(root, 'gas');
if (!fs.existsSync(gasDir)) fs.mkdirSync(gasDir, { recursive: true });
const gasData =
  "function HACKER1_LESSONS_META() {\n  return " + JSON.stringify(meta, null, 2) + ";\n}\n\n" +
  "function HACKER1_LESSONS() {\n  return " + JSON.stringify(lessons, null, 2) + ";\n}\n\n" +
  "function LPTD_LESSONS_META() { return HACKER1_LESSONS_META(); }\n" +
  "function LPTD_LESSONS() { return HACKER1_LESSONS(); }\n";
fs.writeFileSync(path.join(gasDir, 'Hacker1Data.gs'), gasData, 'utf8');

console.log(JSON.stringify(meta, null, 2));
lessons.forEach(l => console.log(l.id, l.title, 'lines=', l.lineCount, 'words=', l.wordCount));
