import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const mupdf = await import('mupdf');
const Tesseract = (await import('tesseract.js')).default;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const PDF = path.join(ROOT, 'Marks - English Pronunciation in Use - Elementary.pdf');
const OUT = path.join(ROOT, 'work', 'ocr', 'strips');
fs.mkdirSync(OUT, { recursive: true });

/* crop: x0,y0,x1,y1 theo tỉ lệ 0..1 của trang */
const P = parseInt(process.argv[2], 10);
const X0 = parseFloat(process.argv[3]);
const Y0 = parseFloat(process.argv[4]);
const X1 = parseFloat(process.argv[5]);
const Y1 = parseFloat(process.argv[6]);
const SCALE = parseFloat(process.argv[7] || '4');
const TAG = process.argv[8] || 'strip';

const doc = mupdf.Document.openDocument(PDF, 'application/pdf');
const page = doc.loadPage(P - 1);
const b = page.getBounds();
const w = b[2] - b[0];
const h = b[3] - b[1];
const clip = new mupdf.Rect(b[0] + w * X0, b[1] + h * Y0, b[0] + w * X1, b[1] + h * Y1);

const pix = page.toPixmap(mupdf.Matrix.scale(SCALE, SCALE), mupdf.ColorSpace.DeviceRGB, false, true);
const png = pix.asPNG();
const tmp = path.join(OUT, `_tmp.png`);
fs.writeFileSync(tmp, png);
console.log('strip png:', path.join(OUT, `${TAG}-${P}.png`));
fs.copyFileSync(tmp, path.join(OUT, `${TAG}-${P}.png`));

const result = await Tesseract.recognize(tmp, 'eng', { logger: () => {}, tessedit_pageseg_mode: '6' });
fs.writeFileSync(path.join(OUT, `${TAG}-${P}.txt`), result.data.text, 'utf8');
fs.unlinkSync(tmp);
console.log('---', TAG, P, '---');
console.log(result.data.text.trim());
