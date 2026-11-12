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
const X0 = parseFloat(process.argv[3] || '0.04');
const X1 = parseFloat(process.argv[4] || '0.22');
const SCALE = parseFloat(process.argv[5] || '6');
const WHITELIST = process.argv[6] || 'ABCDEabcde0123456789';

const doc = mupdf.Document.openDocument(PDF, 'application/pdf');
const page = doc.loadPage(P - 1);
const b = page.getBounds();
const w = b[2] - b[0];
const h = b[3] - b[1];

const cx0 = b[0] + w * X0;
const cx1 = b[0] + w * X1;
const clip = [cx0, b[1], cx1, b[1] + h];

const pix = new mupdf.Pixmap(mupdf.ColorSpace.DeviceRGB, clip, false);
/* page → device: (p - clipOrigin) * SCALE */
const matrix = [SCALE, 0, 0, SCALE, -cx0 * SCALE, -b[1] * SCALE];
const device = new mupdf.DrawDevice(matrix, pix);
page.run(device, matrix);

const tmp = path.join(OUT, '_tmp.png');
fs.writeFileSync(tmp, pix.asPNG());
const result = await Tesseract.recognize(tmp, 'eng', {
  logger: () => {},
  tessedit_pageseg_mode: '6',
  tessedit_char_whitelist: WHITELIST,
});
fs.writeFileSync(path.join(OUT, `marker-${P}.txt`), result.data.text, 'utf8');
fs.unlinkSync(tmp);
console.log('--- markers page', P, '---');
console.log(result.data.text.trim());
