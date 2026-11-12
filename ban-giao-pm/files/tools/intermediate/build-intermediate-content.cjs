/**
 * build-intermediate-content.js — trích nội dung "English Pronunciation in Use – Intermediate"
 * (Mark Hancock) từ OCR + audio đã tách theo .cue.
 *
 * Cấu trúc sách (đọc từ trang "To the student", PDF p5):
 *   - 60 unit, mỗi unit 2 trang: trang trái = giải thích, trang phải = bài tập
 *   - unit N: trang dạy = PDF (2N+8), trang bài tập = PDF (2N+9)
 *   - Section A 1–20, B 21–40, C 41–60, D = reference (dùng CD4)
 *   - Marker âm thanh: "A1" = CD A track 1 (theo .cue)
 *
 * Đầu ra: work/data/pm-intermediate-content.json
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const OCR = path.join(ROOT, 'work', 'ocr');
const DATA = path.join(ROOT, 'work', 'data');
const AUDIO = path.join(ROOT, 'work', 'audio');
fs.mkdirSync(DATA, { recursive: true });

const lines = (p) => {
  const f = path.join(OCR, `page-${p}.txt`);
  if (!fs.existsSync(f)) return [];
  return fs.readFileSync(f, 'utf8').split(/\r?\n/).map((s) => s.replace(/\s+/g, ' ').trim());
};

/* ---------------- audio: đọc manifest .cue ---------------- */
const audioManifest = JSON.parse(fs.readFileSync(path.join(AUDIO, 'manifest.json'), 'utf8'));
const cdOf = { 1: 'A', 2: 'B', 3: 'C', 4: 'D' };
const byCdTrack = {};
audioManifest.tracks.forEach((t) => {
  const cd = cdOf[t.cdFile.replace('CD', '')];
  const n = t.index != null ? t.index : parseInt(String(t.marker || '').replace(/^[A-E]/, ''), 10);
  (byCdTrack[cd] = byCdTrack[cd] || {})[n] = t.file;
});
/* danh sách marker theo thứ tự .cue */
const markersByCd = {};
audioManifest.tracks.forEach((t) => {
  const cd = cdOf[t.cdFile.replace('CD', '')];
  const n = t.index != null ? t.index : parseInt(String(t.marker || '').replace(/^[A-E]/, ''), 10);
  (markersByCd[cd] = markersByCd[cd] || []).push(n);
});

/* ---------------- marker OCR: ứng viên sạch [A-D] + 1-2 chữ số ---------------- */
const CAND = /(?<![A-Za-z0-9])([A-E])(\d{1,2})(?![A-Za-z0-9])/g;
function candidatesRaw(p) {
  const out = [];
  for (const l of lines(p)) {
    CAND.lastIndex = 0;
    let m;
    while ((m = CAND.exec(l))) out.push({ cd: m[1], track: parseInt(m[2], 10) });
  }
  return out;
}

/* ---------------- 1. marker cuối mỗi unit (đơn điệu + ràng buộc) ---------------- */
function unitCd(no) { return no <= 20 ? 'A' : no <= 40 ? 'B' : 'C'; }

/* OCR hay đọc chữ "A" thành "D" → chấp nhận cả hai nếu khớp CD của unit */
const CONFUSE = { A: ['A', 'D'], B: ['B'], C: ['C'], D: ['D', 'A'] };

function candidates(p, cd) {
  const out = [];
  const ok = CONFUSE[cd] || [cd];
  for (const l of lines(p)) {
    CAND.lastIndex = 0;
    let m;
    while ((m = CAND.exec(l))) {
      if (ok.indexOf(m[1]) < 0) continue;
      const before = l.slice(0, m.index).trim();
      const after = l.slice(m.index + m[0].length).trim();
      if (/^(Section|Unit|Page|p)$/i.test(before)) continue;
      if (/^(and|or|to|the|a|an|is|are|in|of)$/i.test(after)) continue;
      out.push(parseInt(m[2], 10));
    }
  }
  return out;
}

const lastTrack = {};
{
  const last = { A: 0, B: 0, C: 0 };
  const cdUnits = { A: 20, B: 20, C: 20 };
  for (let no = 1; no <= 60; no++) {
    const cd = unitCd(no);
    const total = markersByCd[cd].length;
    const unitIdx = cd === 'A' ? no : cd === 'B' ? no - 20 : no - 40;
    const avg = Math.round(total / cdUnits[cd]);
    const cands = [];
    [2 * no + 8, 2 * no + 9].forEach((p) => candidates(p, cd).forEach((t) => cands.push(t)));
    cands.sort((a, b) => a - b);
    /* chọn ứng viên lớn nhất còn hợp lệ */
    let pick = last[cd];
    for (const t of cands) {
      if (t > last[cd] && t <= total - (cdUnits[cd] - unitIdx) * 1) pick = t;
    }
    /* không có ứng viên → nội suy theo trung bình */
    if (pick === last[cd]) pick = Math.min(last[cd] + avg, total - (cdUnits[cd] - unitIdx));
    last[cd] = pick;
    lastTrack[no] = pick;
  }
}

/* ---------------- 2. dải track mỗi unit ---------------- */
const ranges = {};
let prevEnd = { A: 0, B: 0, C: 0 };
for (let no = 1; no <= 60; no++) {
  const cd = unitCd(no);
  const end = lastTrack[no] || prevEnd[cd];
  const start = prevEnd[cd] + 1;
  const tracks = [];
  for (let t = start; t <= end; t++) if (byCdTrack[cd][t]) tracks.push(byCdTrack[cd][t]);
  ranges[no] = tracks;
  prevEnd[cd] = Math.max(end, start);
}

/* ---------------- 3. tiêu đề + bài tập ---------------- */
const NUM_ONLY = /^(\d{1,2})\s*\.\s*(\d{1,2})\s*$/;
const NUM_INLINE = /^(\d{1,2})\s*\.\s*(\d{1,2})\s+(\S.*)$/;
function numParts(l) {
  let m = l.match(NUM_ONLY);
  if (m) return [m[1], m[2], ''];
  m = l.match(NUM_INLINE);
  if (m) return [m[1], m[2], m[3]];
  return null;
}

function cleanTitle(s) {
  return String(s || '')
    .replace(/^[^\w(]+/, '')            /* bỏ ký tự đầu (số trang, =, …) */
    .replace(/^\d{1,2}\s+/, '')
    .trim();
}

function extractExercises(pageNo, unitNo) {
  const ls = lines(pageNo);
  const out = [];
  const seen = new Set();
  for (let i = 0; i < ls.length; i++) {
    const mp = numParts(ls[i]);
    if (!mp) continue;
    if (parseInt(mp[0], 10) !== unitNo) continue;
    const n = mp[0] + '.' + mp[1];
    if (seen.has(n)) continue;
    seen.add(n);
    const parts = [];
    if (mp[2]) parts.push(mp[2].trim());
    for (let k = i + 1; k < ls.length && parts.length < 3; k++) {
      const t = ls[k];
      if (!t) break;
      if (numParts(t)) break;
      if (/^(Section|Key|English Pronunciation)/i.test(t)) break;
      parts.push(t);
      if (parts.join(' ').length > 300) break;
    }
    const prompt = parts.join(' ').trim();
    if (prompt.length < 8) continue;
    out.push({ n, prompt: prompt.slice(0, 340) });
  }
  return out;
}

/* ---------------- 4. Key: dò trang có "Key" ---------------- */
function findKeyPages() {
  const pages = [];
  for (let p = 129; p <= 201; p++) {
    const l = lines(p);
    if (l.some((x) => /^Key$/i.test(x) || /^Key\b/i.test(x))) pages.push(p);
  }
  return pages;
}
const keyPages = findKeyPages();
function parseKey() {
  const ans = {};
  for (const p of keyPages) {
    const ls = lines(p);
    let cur = null;
    for (const l of ls) {
      const mp = numParts(l);
      if (mp) { cur = mp[0] + '.' + mp[1]; ans[cur] = mp[2] || ''; continue; }
      if (cur && l && l.length > 1 && !/^(Key|Section|English Pronunciation|Unit \d+$)/i.test(l)) {
        if ((ans[cur] || '').length < 240) ans[cur] = (ans[cur] ? ans[cur] + ' ' : '') + l;
      }
    }
  }
  return ans;
}
const key = parseKey();

/* ---------------- 5. dựng unit ---------------- */
const SECTION = (no) => (no <= 20 ? 'A' : no <= 40 ? 'B' : 'C');
const SECTION_TITLE = {
  A: 'A · Letters and sounds',
  B: 'B · Syllables, words and sentences',
  C: 'C · Conversation',
};

const units = [];
for (let no = 1; no <= 60; no++) {
  const teachPage = 2 * no + 8;
  const exPage = 2 * no + 9;
  const tl = lines(teachPage).filter(Boolean);
  let title = '';
  for (const l of tl.slice(0, 3)) {
    const t = cleanTitle(l);
    if (t.length >= 6 && /[a-zA-Z]{4}/.test(t)) { title = t; break; }
  }
  if (!title) title = 'Unit ' + no;

  const exs = extractExercises(exPage, no).map((e) => ({
    id: `int-${e.n.replace('.', '-')}`,
    n: e.n, unit: no, type: 'multiple_choice',
    prompt: e.prompt, options: [], answer: (key[e.n] || '').trim(), scoringRule: 'exact',
  }));

  units.push({
    no,
    id: `pm-int-u${String(no).padStart(2, '0')}`,
    kind: 'unit',
    section: SECTION(no),
    title,
    topic: title,
    examples: [],
    page: teachPage - 1,
    objective: `Luyện: ${title}`,
    ipa: [],
    words: [],
    sentences: [],
    audio: ranges[no] || [],
    exercises: exs,
  });
}

/* Section D — reference (dùng CD4) */
const reference = [
  { ref: 'D1', title: 'Introduction to phonemic symbols', page: 129, desc: 'Bảng ký hiệu ngữ âm và các câu đố.', groups: [], rows: [] },
  { ref: 'D3', title: 'Guide for speakers of specific languages', page: 145, desc: 'Hướng dẫn cho người học theo bản ngữ.', groups: [], rows: [] },
  { ref: 'D4', title: 'Sound pairs', page: 150, desc: 'Các cặp âm dễ nhầm.', groups: [], rows: [] },
];

const out = {
  meta: {
    id: 'PRON_INTERMEDIATE_2000',
    title: 'English Pronunciation in Use – Intermediate',
    edition: 'Intermediate (Mark Hancock, Cambridge 2003)',
    level: 'Intermediate',
    units: units.length,
    audioTracks: audioManifest.total,
  },
  sections: [
    { code: 'A', title: SECTION_TITLE.A, units: Array.from({ length: 20 }, (_, i) => 1 + i) },
    { code: 'B', title: SECTION_TITLE.B, units: Array.from({ length: 20 }, (_, i) => 21 + i) },
    { code: 'C', title: SECTION_TITLE.C, units: Array.from({ length: 20 }, (_, i) => 41 + i) },
  ],
  units,
  reference,
};

fs.writeFileSync(path.join(DATA, 'pm-intermediate-content.json'), JSON.stringify(out, null, 2));

console.log('units:', units.length, '| exercises:', units.reduce((a, u) => a + u.exercises.length, 0),
  '| with answer:', units.reduce((a, u) => a + u.exercises.filter((e) => e.answer).length, 0),
  '| with audio:', units.filter((u) => u.audio.length).length, '/', units.length,
  '| key pages:', keyPages.join(','));
for (const u of units) {
  console.log(`U${String(u.no).padStart(2, '0')} ${u.section} p${u.page} audio=${String(u.audio.length).padStart(2)} ex=${u.exercises.length}(${u.exercises.filter((e) => e.answer).length}) | ${u.title.slice(0, 50)}`);
}
