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

const CD_OF = (u) => (u <= 12 ? 'A' : u <= 27 ? 'B' : u <= 43 ? 'C' : 'D');
const CD_TOTAL = { A: 81, B: 92, C: 85, D: 55, E: 38 };

/* Marker trong sách = <CD><số track><phần> (vd "B14a").
   OCR thường đọc phần CD thành ký tự lạ → chấp nhận cả dạng chỉ có số. */
const MARKER = /^[^A-Za-z0-9]{0,4}(?:([ABCDE])\s?)?(\d{1,2})\s?([a-z])?(?![A-Za-z0-9])/;
const INSTR = /(listen|look at|note:|say the|sound and spelling|how to make|now listen|some words|important|check with|spell these|read this|put these|circle|write|match|listen and|this is|they are|you are|it is|there is|a:|q:|example|now listen to)/i;

function pageMarkers(text) {
  const out = [];
  for (const raw of text.split(/\r?\n/)) {
    const l = clean(raw);
    if (!l || !INSTR.test(l)) continue;
    const m = l.match(MARKER);
    if (!m) continue;
    const track = parseInt(m[2], 10);
    if (track < 1 || track > 99) continue;
    out.push({ cd: m[1] || null, track, part: m[3] || '' });
  }
  return out;
}

/* Gom theo unit, chỉ giữ track hợp lệ theo CD của unit */
const raw = [];
for (let u = 1; u <= 50; u++) {
  const pages = unitPages(u);
  const cd = CD_OF(u);
  const all = [];
  for (const p of pages) for (const m of pageMarkers(readPage(p))) all.push(m);
  const withCd = all.filter((m) => m.cd === cd).map((m) => m.track);
  const noCd = all.filter((m) => !m.cd).map((m) => m.track);
  const tracks = [...new Set([...withCd, ...noCd])].sort((a, b) => a - b);
  raw.push({ unit: u, cd, pages, tracks, withCd, noCd });
}

/* Ràng buộc đơn điệu: track của unit sau phải lớn hơn unit trước trong cùng CD */
for (const cd of ['A', 'B', 'C', 'D']) {
  const list = raw.filter((r) => r.cd === cd);
  let maxSeen = 0;
  for (const r of list) {
    const keep = r.tracks.filter((t) => t > maxSeen);
    r.cleanTracks = keep;
    if (keep.length) maxSeen = Math.max(...keep);
  }
}

/* Phân bổ dải track cho các unit chưa có marker */
function allocate(list, cd) {
  const total = CD_TOTAL[cd];
  const n = list.length;
  const out = list.map((r, i) => ({
    unit: r.unit, cd,
    start: null, end: null, confirmed: false,
  }));
  list.forEach((r, i) => {
    const t = r.cleanTracks || [];
    if (t.length) {
      out[i].start = Math.min(...t);
      out[i].end = Math.max(...t);
      out[i].confirmed = true;
    }
  });
  /* lấp chỗ trống */
  for (let i = 0; i < out.length; i++) {
    if (out[i].start != null) continue;
    let prev = -1;
    for (let k = i - 1; k >= 0; k--) if (out[k].end != null) { prev = k; break; }
    let next = -1;
    for (let k = i + 1; k < out.length; k++) if (out[k].start != null) { next = k; break; }
    if (prev !== -1 && next !== -1) {
      const gap = out[next].start - out[prev].end - 1;
      const cnt = next - prev;
      const span = Math.max(1, Math.round(gap / cnt));
      out[i].start = out[prev].end + 1;
      out[i].end = out[i].start + span - 1;
    } else if (prev !== -1) {
      const cnt = out.length - prev - 1;
      const left = total - out[prev].end;
      const span = Math.max(1, Math.round(left / cnt));
      out[i].start = out[prev].end + 1;
      out[i].end = out[i].start + span - 1;
    } else if (next !== -1) {
      const cnt = next + 1;
      const span = Math.max(1, Math.round((out[next].start - 1) / cnt));
      out[i].start = 1;
      out[i].end = span;
    } else {
      out[i].start = 1;
      out[i].end = total;
    }
  }
  /* không chồng lấn, phủ hết CD */
  for (let i = 1; i < out.length; i++) {
    if (out[i].start <= out[i - 1].end) out[i].start = out[i - 1].end + 1;
    if (out[i].end < out[i].start) out[i].end = out[i].start;
  }
  if (out[0].start > 1) { out[0].end = out[0].start - 1; out[0].start = 1; }
  const last = out[out.length - 1];
  if (last.end > total) last.end = total;
  return out;
}

const result = {};
for (const cd of ['A', 'B', 'C', 'D']) {
  const list = raw.filter((r) => r.cd === cd);
  result[cd] = allocate(list, cd);
  const sum = result[cd].reduce((a, r) => a + (r.end - r.start + 1), 0);
  console.log(`\nCD ${cd} — ${list.length} unit, phân bổ ${sum}/${CD_TOTAL[cd]} track`);
  for (const r of result[cd]) {
    const rawT = (raw.find((x) => x.unit === r.unit).cleanTracks || []).join(',');
    console.log(`  U${String(r.unit).padStart(2, '0')}  track ${String(r.start).padStart(2)}..${String(r.end).padStart(2)} (${String(r.end - r.start + 1).padStart(2)})  ${r.confirmed ? 'marker=' + rawT : 'nội suy'}`);
  }
}
fs.writeFileSync(path.join(OCR, 'track-map.json'), JSON.stringify({ result, raw }, null, 2));
console.log('\nwritten track-map.json');
