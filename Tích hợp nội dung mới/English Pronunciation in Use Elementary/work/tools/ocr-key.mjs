import fs from 'fs';
import path from 'path';

const mupdf = await import('mupdf');
const Tesseract = (await import('tesseract.js')).default;

const ROOT = 'English Pronunciation in Use Elementary [1999]';
const PDF = path.join(ROOT, 'Marks - English Pronunciation in Use - Elementary.pdf');
const OUT = path.join(ROOT, 'work', 'ocr');

const START = parseInt(process.argv[2] || '138', 10);
const END = parseInt(process.argv[3] || '160', 10);

fs.mkdirSync(OUT, { recursive: true });
const doc = mupdf.Document.openDocument(PDF, 'application/pdf');

for (let p = START; p <= END; p++) {
  const page = doc.loadPage(p - 1);
  const pixmap = page.toPixmap(mupdf.Matrix.scale(2, 2), mupdf.ColorSpace.DeviceRGB, false, true);
  fs.writeFileSync(path.join(OUT, `key-page-${p}.png`), pixmap.asPNG());
  console.log('rendered page', p);
}

for (let p = START; p <= END; p++) {
  const result = await Tesseract.recognize(path.join(OUT, `key-page-${p}.png`), 'eng', { logger: () => {} });
  fs.writeFileSync(path.join(OUT, `key-page-${p}.txt`), result.data.text, 'utf8');
  console.log('--- page', p, '---');
  console.log(result.data.text.slice(0, 150));
}
