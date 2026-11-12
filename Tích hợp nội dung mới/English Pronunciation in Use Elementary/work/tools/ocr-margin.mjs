import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const mupdf = await import('mupdf');
const Tesseract = (await import('tesseract.js')).default;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const PDF = path.join(ROOT, 'Marks - English Pronunciation in Use - Elementary.pdf');
const OUT = path.join(ROOT, 'work', 'ocr', 'markers');
fs.mkdirSync(OUT, { recursive: true });

const P = parseInt(process.argv[2], 10);
const X0 = parseFloat(process.argv[3] || '0.06');
const X1 = parseFloat(process.argv[4] || '0.16');
const SCALE = parseFloat(process.argv[5] || '5');
const WHITELIST = process.argv[6] || '';

const doc = mupdf.Document.openDocument(PDF, 'application/pdf');
const page = doc.loadPage(P - 1);
const b = page.getBounds();
const w = b[2] - b[0];
const h = b[3] - b[1];

const cx0 = b[0] + w * X0;
const cx1 = b[0] + w * X1;
const clip = [cx0, b[1], cx1, b[1] + h];

const pix = new mupdf.Pixmap(mupdf.ColorSpace.DeviceRGB, clip, false);
const matrix = [SCALE, 0, 0, SCALE, -cx0 * SCALE, -b[1] * SCALE];
const device = new mupdf.DrawDevice(matrix, pix);
page.run(device, matrix);

const file = path.join(OUT, `strip-${P}.png`);
fs.writeFileSync(file, pix.asPNG());
console.log('png:', file);

const opts = { logger: () => {}, tessedit_pageseg_mode: '6' };
if (WHITELIST) opts.tessedit_char_whitelist = WHITELIST;
const result = await Tesseract.recognize(file, 'eng', opts);
fs.writeFileSync(path.join(OUT, `strip-${P}.txt`), result.data.text, 'utf8');
console.log('--- strip page', P, '---');
console.log(result.data.text.trim());
