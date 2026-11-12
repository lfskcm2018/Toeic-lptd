import fs from 'fs';
import path from 'path';

const mupdf = await import('mupdf');
const Tesseract = (await import('tesseract.js')).default;

const ROOT = 'English Pronunciation in Use Elementary [1999]';
const PDF = path.join(ROOT, 'Marks - English Pronunciation in Use - Elementary.pdf');
const OUT = path.join(ROOT, 'work', 'ocr');

for (const p of [11, 12]) {
  const doc = mupdf.Document.openDocument(PDF, 'application/pdf');
  const page = doc.loadPage(p - 1);
  const pixmap = page.toPixmap(mupdf.Matrix.scale(5, 5), mupdf.ColorSpace.DeviceRGB, false, true);
  const file = path.join(OUT, `hires-${p}.png`);
  fs.writeFileSync(file, pixmap.asPNG());
  console.log('rendered hi-res page', p);
  const result = await Tesseract.recognize(file, 'eng', { logger: () => {}, tessedit_pageseg_mode: '6' });
  fs.writeFileSync(path.join(OUT, `hires-${p}.txt`), result.data.text, 'utf8');
  console.log('--- page', p, '---');
  console.log(result.data.text.slice(0, 700));
}
