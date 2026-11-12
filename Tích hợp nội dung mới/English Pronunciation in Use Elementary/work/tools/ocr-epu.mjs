import fs from 'fs';
import path from 'path';

const mupdf = await import('mupdf');
const Tesseract = (await import('tesseract.js')).default;

const ROOT = 'English Pronunciation in Use Elementary [1999]';
const PDF = path.join(ROOT, 'Marks - English Pronunciation in Use - Elementary.pdf');
const OUT = path.join(ROOT, 'work', 'ocr');

const START = parseInt(process.argv[2] || '10', 10);
const END = parseInt(process.argv[3] || '29', 10);

fs.mkdirSync(OUT, { recursive: true });

const doc = mupdf.Document.openDocument(PDF, 'application/pdf');
console.log('pages', 168);

for (let p = START; p <= END; p++) {
  const page = doc.loadPage(p - 1); // 0-based
  const pixmap = page.toPixmap(mupdf.Matrix.scale(2, 2), mupdf.ColorSpace.DeviceRGB, false, true);
  const png = pixmap.asPNG();
  fs.writeFileSync(path.join(OUT, `page-${p}.png`), png);
  console.log('rendered page', p);
}

for (let p = START; p <= END; p++) {
  const file = path.join(OUT, `page-${p}.png`);
  const result = await Tesseract.recognize(file, 'eng', { logger: () => {} });
  const text = result.data.text;
  fs.writeFileSync(path.join(OUT, `page-${p}.txt`), text, 'utf8');
  console.log('--- page', p, '---');
  console.log(text.slice(0, 200));
}
