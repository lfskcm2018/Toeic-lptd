/**
 * build-advanced-content.js — trích nội dung "English Pronunciation in Use Advanced"
 * (PDF có text layer) + audio đã tách sẵn trong "CD A".."CD E".
 *
 * Đầu ra: work/data/pm-advanced-content.json
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const TEXT = path.join(ROOT, 'work', 'text');
const DATA = path.join(ROOT, 'work', 'data');
fs.mkdirSync(DATA, { recursive: true });

const TOC = require(path.join(DATA, 'adv-toc.js')).ADV_TOC;
const TOC_E = require(path.join(DATA, 'adv-toc.js')).ADV_TOC_E;

const P = (n) => path.join(TEXT, `p${String(n).padStart(3, '0')}.txt`);
const pageText = (n) => (fs.existsSync(P(n)) ? fs.readFileSync(P(n), 'utf8') : '');
const lines = (n) => pageText(n).split(/\r?\n/).map((s) => s.replace(/\s+/g, ' ').trim());

/* số bài bị OCR tách rời: "1 0 . 1" -> "10.1" */
const NUM_ONLY = /^(\d(?:\s?\d)?)\s*\.\s*(\d(?:\s?\d)?)\s*$/;
const NUM_INLINE = /^(\d(?:\s?\d)?)\s*\.\s*(\d(?:\s?\d)?)\s+(\S.*)$/;
function numParts(l) {
  let m = l.match(NUM_ONLY);
  if (m) {
    const a = m[1].replace(/\s+/g, '');
    const b = m[2].replace(/\s+/g, '');
    if (/^\d{1,2}$/.test(a) && /^\d{1,2}$/.test(b)) return [a, b];
    return null;
  }
  m = l.match(NUM_INLINE);
  if (m) {
    const a = m[1].replace(/\s+/g, '');
    const b = m[2].replace(/\s+/g, '');
    if (/^\d{1,2}$/.test(a) && /^\d{1,2}$/.test(b)) return [a, b, m[3]];
  }
  return null;
}

/* ---------- 1. dò trang dạy của mỗi unit theo tiêu đề ---------- */
function norm(s) {
  return String(s || '').toLowerCase()
    .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"')
    .replace(/[^a-z0-9']/g, '').trim();
}
const pageIndex = [];
for (let p = 6; p <= 160; p++) {
  const head = lines(p).filter(Boolean).slice(0, 3).join(' ');
  pageIndex.push({ p, norm: norm(head) });
}

const unitPage = {};
for (const [no, sec, title] of TOC) {
  const key = norm(title);
  let best = null;
  for (const pi of pageIndex) {
    if (pi.norm.indexOf(key) >= 0) { best = pi.p; break; }
  }
  unitPage[no] = best;
}

/* Dò trang của từng unit bằng SỐ BÀI (N.M) — chắc chắn hơn dò tiêu đề.
   Thân sách: PDF 6..143. */
function unitPagesByEx() {
  const map = {};
  for (let p = 6; p <= 143; p++) {
    for (const l of lines(p)) {
      const mp = numParts(l);
      if (!mp) continue;
      const no = parseInt(mp[0], 10);
      if (no < 1 || no > 60) continue;
      (map[no] = map[no] || new Set()).add(p);
    }
  }
  const out = {};
  for (const k of Object.keys(map)) {
    const ps = [...map[k]].sort((a, b) => a - b);
    /* thêm trang dạy (trang ngay trước trang bài tập đầu tiên) */
    const first = ps[0];
    const all = [];
    if (first - 1 >= 6 && !ps.includes(first - 1)) all.push(first - 1);
    ps.forEach((p) => all.push(p));
    out[k] = all;
  }
  return out;
}
const PAGES_BY_EX = unitPagesByEx();

function unitRange(no) {
  if (PAGES_BY_EX[no]) return PAGES_BY_EX[no];
  /* fallback: trang theo tiêu đề */
  const start = unitPage[no];
  if (!start) return [];
  const out = [start];
  for (let p = start + 1; p <= start + 3 && p <= 160; p++) {
    out.push(p);
    if (/Exercises/.test(pageText(p).slice(0, 300))) break;
  }
  return out;
}

/* ---------- 2. bài tập: dòng số "N.M" đứng riêng ---------- */
function extractExercises(pageNums, unitNo) {
  const ex = [];
  const seen = new Set();
  for (const p of pageNums) {
    const ls = lines(p);
    for (let i = 0; i < ls.length; i++) {
      const mp = numParts(ls[i]);
      if (!mp) continue;
      if (parseInt(mp[0], 10) !== unitNo) continue;
      const n = mp[0] + '.' + mp[1];
      if (seen.has(n)) continue;
      seen.add(n);
      /* prompt = phần ngay sau số (nếu inline) hoặc các dòng kế tiếp */
      const parts = [];
      if (mp[2]) parts.push(mp[2].trim());
      for (let k = i + 1; k < ls.length && parts.length < 3; k++) {
        const t = ls[k];
        if (!t) break;
        if (numParts(t)) break;
        if (/^(Section|Key|English Pronunciation in Use)/i.test(t)) break;
        if (/^\d{1,2}\s*\.\s*\d{1,2}/.test(t)) break;
        parts.push(t);
        if (parts.join(' ').length > 320) break;
      }
      const prompt = parts.join(' ').trim();
      if (prompt.length < 8) continue;
      ex.push({ n, page: p, prompt: prompt.slice(0, 360) });
    }
  }
  return ex;
}

/* ---------- 3. Key ---------- */
function parseKey() {
  const ans = {};
  for (let p = 144; p <= 191; p++) {
    const ls = lines(p);
    let cur = null;
    for (let i = 0; i < ls.length; i++) {
      const l = ls[i];
      const mp = numParts(l);
      if (mp) {
        cur = mp[0] + '.' + mp[1];
        ans[cur] = '';
        continue;
      }
      if (cur && l && l.length > 1 && !/^(U\s?n\s?it|Key|Section|English Pronunciation)/i.test(l)) {
        if (ans[cur].length < 260) ans[cur] = (ans[cur] ? ans[cur] + ' ' : '') + l;
      }
    }
  }
  return ans;
}

/* ---------- 4. marker âm thanh ---------- */
const MARK_RE = /(?<![A-Za-z0-9])([ABCDE])(\d{1,2})(?![A-Za-z0-9])/g;
function pageMarkers(p) {
  const out = [];
  for (const l of lines(p)) {
    MARK_RE.lastIndex = 0;
    let m;
    while ((m = MARK_RE.exec(l))) {
      const before = l.slice(0, m.index).trim();
      const after = l.slice(m.index + m[0].length).trim();
      /* bỏ "Section E2", "page 12", "E1." */
      if (/Section$/i.test(before)) continue;
      if (/^(in|and|or|to|of|the|a|an|page|p)$/i.test(before)) continue;
      if (/^(and|or|to|the|a|an)$/i.test(after)) continue;
      out.push({ cd: m[1], track: parseInt(m[2], 10), line: l });
    }
  }
  return out;
}

/* ---------- 5. audio ---------- */
function audioFiles() {
  const out = [];
  const cds = { A: 'CD A', B: 'CD B', C: 'CD C', D: 'CD D', E: 'CD E' };
  for (const cd of Object.keys(cds)) {
    const dir = path.join(ROOT, cds[cd]);
    if (!fs.existsSync(dir)) continue;
    const fl = fs.readdirSync(dir).filter((n) => /\.mp3$/i.test(n)).map((n) => {
      const m = n.match(/(\d+)/);
      return { no: m ? parseInt(m[1], 10) : 0, name: n };
    }).sort((a, b) => a.no - b.no);
    fl.forEach((f) => out.push({ cd, track: f.no, file: `ADV-CD${cd}-Track${String(f.no).padStart(2, '0')}.mp3`, orig: f.name }));
  }
  return out;
}

/* ---- nội suy audio cho unit không tìm thấy marker ---- */
function interpolateAudio() {
  /* marker đầu / cuối mỗi unit theo thứ tự sách */
  const firstM = {}, lastM = {};
  units.forEach((u) => {
    const ms = u._markers || [];
    if (!ms.length) return;
    firstM[u.no] = ms[0];
    lastM[u.no] = ms[ms.length - 1];
  });
  const order = units.map((u) => u.no);
  units.forEach((u) => {
    if (u.audio.length) return;
    const i = order.indexOf(u.no);
    let prev = null, next = null;
    for (let k = i - 1; k >= 0; k--) { if (lastM[order[k]]) { prev = lastM[order[k]]; break; } }
    for (let k = i + 1; k < order.length; k++) { if (firstM[order[k]]) { next = firstM[order[k]]; break; } }
    if (prev && next && prev.cd === next.cd && next.track > prev.track) {
      for (let t = prev.track; t < next.track; t++) {
        if (byCdTrack[prev.cd][t]) u.audio.push(byCdTrack[prev.cd][t]);
      }
    } else if (prev) {
      /* đơn vị cuối của CD → lấy các track còn lại */
      const cd = prev.cd;
      const maxT = Math.max.apply(null, Object.keys(byCdTrack[cd]).map(Number));
      for (let t = prev.track; t <= maxT; t++) if (byCdTrack[cd][t]) u.audio.push(byCdTrack[cd][t]);
    }
  });
}

/* ---- build ---- */
const key = parseKey();
const audio = audioFiles();
const byCdTrack = {};
audio.forEach((a) => { (byCdTrack[a.cd] = byCdTrack[a.cd] || {})[a.track] = a.file; });

const units = [];
for (const [no, sec, title, examples] of TOC) {  const pages = unitRange(no);
  const ms = [];
  const seenM = new Set();
  pages.forEach((p) => pageMarkers(p).forEach((m) => {
    const k = m.cd + m.track;
    if (!byCdTrack[m.cd] || seenM.has(k)) return;
    seenM.add(k);
    ms.push({ cd: m.cd, track: m.track });
  }));
  ms.sort((a, b) => (a.cd + String(a.track).padStart(3, '0')).localeCompare(b.cd + String(b.track).padStart(3, '0')));
  const tracks = ms.map((m) => byCdTrack[m.cd][m.track]);

  const exs = extractExercises(pages, no).map((e) => ({
    id: `adv-${e.n.replace('.', '-')}`,
    n: e.n, unit: no, type: 'multiple_choice',
    prompt: e.prompt, options: [], answer: (key[e.n] || '').trim(), scoringRule: 'exact',
  }));

  units.push({
    no,
    id: `pm-adv-u${String(no).padStart(2, '0')}`,
    kind: 'unit',
    section: sec,
    title,
    topic: title,
    examples: examples ? examples.split(/[,;]/).map((s) => s.trim()).filter(Boolean) : [],
    page: pages.length ? pages[0] - 1 : null,
    objective: `Rèn luyện: ${title}`,
    ipa: [],
    words: examples ? examples.split(/[,;]/).map((s) => s.trim()).filter(Boolean) : [],
    sentences: [],
    audio: tracks,
    exercises: exs,
    _markers: ms,
  });
}

interpolateAudio();
units.forEach((u) => { delete u._markers; });

/* Section E — 5 mục tham khảo (không có bài tập, dùng làm tra cứu) */
const reference = TOC_E.map(([ref, title, printed]) => ({
  ref, title, page: printed,
  desc: 'Tài liệu tham khảo ' + ref,
  groups: [], rows: [],
}));

const out = {
  meta: {
    id: 'PRON_ADVANCED',
    title: 'English Pronunciation in Use – Advanced',
    edition: 'Advanced (Martin Hewings, Cambridge 2007)',
    level: 'Advanced',
    units: units.length,
    audioTracks: audio.length,
  },
  sections: [
    { code: 'A', title: 'A · Getting started', units: [1, 2, 3, 4, 5, 6] },
    { code: 'B', title: 'B · Pronunciation of words and phrases', units: Array.from({ length: 19 }, (_, i) => 7 + i) },
    { code: 'C', title: 'C · Pronunciation in conversation', units: Array.from({ length: 28 }, (_, i) => 26 + i) },
    { code: 'D', title: 'D · Pronunciation in formal settings', units: Array.from({ length: 7 }, (_, i) => 54 + i) },
  ],
  units,
  reference,
};

fs.writeFileSync(path.join(DATA, 'pm-advanced-content.json'), JSON.stringify(out, null, 2));

console.log('units:', units.length, '| exercises:', units.reduce((a, u) => a + u.exercises.length, 0),
  '| with answer:', units.reduce((a, u) => a + u.exercises.filter((e) => e.answer).length, 0),
  '| with audio:', units.filter((u) => u.audio.length).length, '/', units.length,
  '| audio files:', audio.length);
for (const u of units) {
  console.log(`U${String(u.no).padStart(2, '0')} ${u.section} p${u.page} pdf=${u.pages || ''} audio=${String(u.audio.length).padStart(2)} ex=${u.exercises.length}(${u.exercises.filter((e) => e.answer).length}) | ${u.title.slice(0, 46)}`);
}
