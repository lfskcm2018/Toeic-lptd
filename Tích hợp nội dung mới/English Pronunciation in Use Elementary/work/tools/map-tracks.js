const fs = require('fs');
const path = require('path');

const OCR = 'English Pronunciation in Use Elementary [1999]/work/ocr';

/* Marker trong sách: biểu tượng tai nghe + số track trên CD (A/B/C/D/E).
   OCR thường đọc thành: "A2a", "(A5", "A10b", "B3" ...
   → ta chuẩn hoá thành { cd: 'A', track: 2, part: 'a' } */

/* Trang PDF = trang in + 1 */
const printedToPdf = (p) => p + 1;

/* Unit 1..50: mỗi unit 2 trang in (trái = dạy, phải = bài tập) */
function unitPages(unitNo) {
  const firstPrinted = 10 + (unitNo - 1) * 2;
  return [printedToPdf(firstPrinted), printedToPdf(firstPrinted + 1)];
}

const CD_FOR_UNIT = (unitNo) => {
  if (unitNo <= 12) return 'A';
  if (unitNo <= 27) return 'B';
  if (unitNo <= 43) return 'C';
  return 'D';
};

/* Marker: chữ cái CD + số track (1-3 chữ số) + hậu tố letter tuỳ chọn */
const MARKER_RE = /\b([ABCDE])\s?(\d{1,2})\s?([a-z])?\b/g;

function extractMarkers(text) {
  const out = [];
  let m;
  MARKER_RE.lastIndex = 0;
  while ((m = MARKER_RE.exec(text))) {
    const cd = m[1];
    const track = parseInt(m[2], 10);
    const part = m[3] || '';
    if (track < 1 || track > 99) continue;
    /* Bỏ các từ đơn chữ cái + số dính nhau từ text thường (vd "A2a" ok,
       nhưng "a5" trong câu tiếng Anh sẽ bị loại vì không có CD hợp lệ ở ngữ cảnh) */
    out.push({ cd, track, part, raw: m[0], index: m.index });
  }
  return out;
}

const report = [];
for (let u = 1; u <= 50; u++) {
  const pages = unitPages(u);
  const texts = [];
  for (const p of pages) {
    const f = path.join(OCR, `page-${p}.txt`);
    if (fs.existsSync(f)) texts.push({ p, t: fs.readFileSync(f, 'utf8') });
  }
  const markers = [];
  for (const { p, t } of texts) {
    for (const mk of extractMarkers(t)) markers.push({ ...mk, page: p });
  }
  /* chỉ giữ marker thuộc CD đúng của unit */
  const cd = CD_FOR_UNIT(u);
  const mine = markers.filter((m) => m.cd === cd);
  const tracks = [...new Set(mine.map((m) => m.track))].sort((a, b) => a - b);
  report.push({ unit: u, cd, pages, tracks, parts: mine.map((m) => m.track + (m.part || '')) });
}

for (const r of report) {
  console.log(`U${String(r.unit).padStart(2, '0')} CD${r.cd} p${r.pages.join(',')} tracks=[${r.tracks.join(',')}] parts=${r.parts.join(' ')}`);
}
fs.writeFileSync(path.join(OCR, 'unit-track-map.json'), JSON.stringify(report, null, 2));
console.log('\nwritten unit-track-map.json');
