import fs from 'fs';
import path from 'path';

const mupdf = await import('mupdf');

const ROOT = 'English Pronunciation in Use Elementary [1999]';
const PDF = path.join(ROOT, 'Marks - English Pronunciation in Use - Elementary.pdf');
const OUT = path.join(ROOT, 'work', 'ocr', 'crops');
fs.mkdirSync(OUT, { recursive: true });

const doc = mupdf.Document.openDocument(PDF, 'application/pdf');
for (const p of [13, 23, 29]) {
  const page = doc.loadPage(p - 1);
  const box = page.getBounds();
  // strip trái 32% chiều ngang, toàn bộ chiều cao
  const r = new mupdf.Rect(box[0], box[1], box[0] + box[2] * 0.34, box[3]);
  const pix = page.toPixmap(mupdf.Matrix.scale(4, 4), mupdf.ColorSpace.DeviceRGB, false, true);
  fs.writeFileSync(path.join(OUT, `p${p}-left.png`), pix.asPNG());
  console.log('cropped', p, 'box', box.join(','));
}
