const fs = require('fs');
const path = require('path');
const OCR = 'English Pronunciation in Use Elementary [1999]/work/ocr';
const read = (p, tag) => {
  const f = path.join(OCR, `${tag}-${p}.txt`);
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
};

/* ---- 1. tiêu đề sound pair: "Sound pair N: X and Y" ---- */
const pairs = {};
for (let p = 114; p <= 127; p++) {
  for (const raw of read(p, 'ehires').split(/\r?\n/)) {
    const l = raw.replace(/\s+/g, ' ').trim();
    const m = l.match(/Sound pair (\d{1,2}):\s*(.{2,40}?)\s*$/);
    if (m) {
      const n = parseInt(m[1], 10);
      const desc = m[2]
        .replace(/[\[\]()]/g, '/')
        .replace(/\s+/g, ' ')
        .trim();
      if (!pairs[n]) pairs[n] = { n, desc, items: [] };
    }
  }
}

/* ---- 2. word items từ Key (trang 159-161) ---- */
for (let p = 159; p <= 161; p++) {
  const lines = read(p, 'key').split(/\r?\n/).map((s) => s.replace(/\s+/g, ' ').trim());
  let cur = null;
  for (const l of lines) {
    const m = l.match(/^Sound pair (\d{1,2})$/);
    if (m) { cur = parseInt(m[1], 10); continue; }
    if (cur == null) continue;
    const im = l.match(/^(\d{1,2})\s+(.{1,40})$/);
    if (im && !pairs[cur]) pairs[cur] = { n: cur, desc: '', items: [] };
    if (im && pairs[cur]) pairs[cur].items.push(im[2].trim());
  }
}

const list = Object.keys(pairs).map(Number).sort((a, b) => a - b).map((n) => pairs[n]);
console.log('sound pairs found:', list.length);
for (const s of list) console.log(`  #${s.n}  ${s.desc}  | items=${s.items.length} : ${s.items.slice(0, 4).join(' / ')}`);

fs.writeFileSync(path.join(OCR, 'sound-pairs.json'), JSON.stringify(list, null, 2));

/* ---- 3. E6 numbers ---- */
for (const p of [133, 134, 135]) {
  console.log('\n===== E6 page ' + p + ' =====');
  console.log(read(p, 'ehires').slice(0, 1800));
}
