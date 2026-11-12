const fs = require('fs');
const path = require('path');

/* ====== 1. Marker âm thanh: CD letter + track number (+ part) ====== */
/* Marker nằm ở đầu dòng, ngay trước dòng lệnh ("Listen…", "Note:", "Look…") */

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
const CD_RANGE = { A: 81, B: 92, C: 85, D: 55, E: 38 };

/* Dòng bắt đầu bằng "ký hiệu tai nghe" mà OCR đọc thành nhiều kiểu:
   "A14a", "(B14a", "814a", "B|4a", "8 ©", "14a" ...  */
const MARKER_LINE = /^(?:[^A-Za-z0-9]{0,3}|[A-Za-z])?\s?(\d{1,2})\s?([a-z])?[\s:»©|]*$/;
const INSTR = /(listen|look at|note:|say the|sound and spelling|how to make|now listen|some words|important|check with|spell these|read this|put these|circle|write|match|listen and)/i;

function rawMarkers(text) {
  const out = [];
  for (const raw of text.split(/\r?\n/)) {
    const l = clean(raw);
    if (!l) continue;
    if (!INSTR.test(l)) continue;
    const m = l.match(MARKER_LINE);
    if (!m) continue;
    const track = parseInt(m[1], 10);
    const part = m[2] || '';
    if (track >= 1 && track <= 99) out.push({ track, part, line: l.slice(0, 60) });
  }
  return out;
}

/* ====== 2. Gom marker theo unit, lọc theo CD, giữ nguyên thứ tự ====== */
const perUnit = [];
for (let u = 1; u <= 50; u++) {
  const pages = unitPages(u);
  const cd = CD_OF(u);
  const all = [];
  for (const p of pages) for (const m of rawMarkers(readPage(p))) all.push(m);
  /* giữ marker có số track hợp lệ theo CD và tăng dần */
  const valid = all.filter((m) => m.track <= CD_RANGE[cd]);
  /* loại trùng số liên tiếp giữ nguyên (a,b,c là các phần của 1 track) */
  const seq = [];
  for (const m of valid) {
    const last = seq[seq.length - 1];
    if (last && last.track === m.track) { last.part = (last.part + m.part); continue; }
    seq.push({ track: m.track, part: m.part });
  }
  perUnit.push({ unit: u, cd, pages, seq });
}

/* ====== 3. Nội suy ranh giới (marker OCR có thể thiếu) ====== */
/* Mỗi CD: các unit liên tiếp có dải track liên tiếp. Dùng "first/last marker" của
   unit làm mốc, rồi nội suy cho unit không có marker. */
function rangesFor(cd, unitList) {
  const max = CD_RANGE[cd];
  const rows = unitList.map((r) => {
    const t = r.seq.map((s) => s.track);
    return { unit: r.unit, first: t.length ? Math.min(...t) : null, last: t.length ? Math.max(...t) : null };
  });
  /* ước lượng đơn giản: số track / số unit */
  const per = max / rows.length;
  const out = [];
  let cursor = 1;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    let start, end;
    if (r.first != null) {
      start = r.first;
      end = r.last != null ? r.last : start;
      /* nếu đơn vị có nhiều track liên tiếp thì mở rộng theo tỷ lệ */
      const span = Math.max(1, Math.round(per));
      if (end - start + 1 < Math.min(span, 2)) end = start + Math.max(0, span - 1);
    } else {
      start = cursor;
      end = cursor + Math.max(0, Math.round(per) - 1);
    }
    if (end > max) end = max;
    out.push({ unit: r.unit, start, end, confirmed: r.first != null });
    cursor = end + 1;
  }
  return out;
}

const result = {};
for (const cd of ['A', 'B', 'C', 'D']) {
  const list = perUnit.filter((r) => r.cd === cd);
  result[cd] = rangesFor(cd, list);
}

console.log('=== Dải track theo CD (ước lượng từ marker sách) ===');
for (const cd of ['A', 'B', 'C', 'D']) {
  console.log('CD', cd, '(tổng', CD_RANGE[cd], 'track)');
  for (const r of result[cd]) console.log(`  U${String(r.unit).padStart(2, '0')}  track ${String(r.start).padStart(2)}..${String(r.end).padStart(2)}  ${r.confirmed ? '[marker]' : '[nội suy]'}`);
}
fs.writeFileSync(path.join(OCR, 'track-ranges.json'), JSON.stringify(result, null, 2));
console.log('\nwritten track-ranges.json');
