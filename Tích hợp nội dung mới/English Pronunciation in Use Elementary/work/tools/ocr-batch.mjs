import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const mupdf = await import('mupdf');
const Tesseract = (await import('tesseract.js')).default;

/* Gốc = thư mục cha của work/ (chứa PDF + MP3) */
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const PDF = path.join(ROOT, 'Marks - English Pronunciation in Use - Elementary.pdf');
const OUT = path.join(ROOT, 'work', 'ocr');
fs.mkdirSync(OUT, { recursive: true });

const START = parseInt(process.argv[2] || '31', 10);
const END = parseInt(process.argv[3] || '138', 10);
const SCALE = parseFloat(process.argv[4] || '2');
const TAG = process.argv[5] || 'page';

const doc = mupdf.Document.openDocument(PDF, 'application/pdf');
console.log('range', START + '-' + END, '| scale', SCALE);

for (let p = START; p <= END; p++) {
  const txtFile = path.join(OUT, `${TAG}-${p}.txt`);
  if (fs.existsSync(txtFile)) { console.log('skip', p); continue; }
  const page = doc.loadPage(p - 1);
  const pix = page.toPixmap(mupdf.Matrix.scale(SCALE, SCALE), mupdf.ColorSpace.DeviceRGB, false, true);
  const pngFile = path.join(OUT, `_tmp-${p}.png`);
  fs.writeFileSync(pngFile, pix.asPNG());
  const result = await Tesseract.recognize(pngFile, 'eng', { logger: () => {} });
  fs.writeFileSync(txtFile, result.data.text, 'utf8');
  fs.unlinkSync(pngFile);
  console.log('page', p, 'chars', result.data.text.length);
}
console.log('DONE');
