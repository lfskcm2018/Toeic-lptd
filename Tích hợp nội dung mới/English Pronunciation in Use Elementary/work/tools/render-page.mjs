import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const mupdf = await import('mupdf');

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const PDF = path.join(ROOT, 'Marks - English Pronunciation in Use - Elementary.pdf');
const OUT = path.join(ROOT, 'work', 'ocr', 'crops');
fs.mkdirSync(OUT, { recursive: true });

const P = parseInt(process.argv[2] || '11', 10);
const SCALE = parseFloat(process.argv[3] || '2');

const doc = mupdf.Document.openDocument(PDF, 'application/pdf');
const page = doc.loadPage(P - 1);
const pix = page.toPixmap(mupdf.Matrix.scale(SCALE, SCALE), mupdf.ColorSpace.DeviceRGB, false, true);
const file = path.join(OUT, `page-${P}.png`);
fs.writeFileSync(file, pix.asPNG());
console.log(file);
