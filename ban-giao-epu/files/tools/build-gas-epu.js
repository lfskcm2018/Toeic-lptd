const fs = require('fs');
const path = require('path');

const ROOT = 'English Pronunciation in Use Elementary [1999]';
const DATA = path.join(ROOT, 'work', 'data');
const GAS = path.join(ROOT, 'work', 'gas');

const d = JSON.parse(fs.readFileSync(path.join(DATA, 'epu-lessons.json'), 'utf8'));

/* rút gọn: bỏ field thừa */
const units = d.units.map((u) => ({
  id: u.id,
  unit: u.unit,
  section: u.section,
  cd: u.cd,
  title: u.title,
  focus: u.focus,
  sounds: u.sounds,
  page: u.page,
  sentences: u.sentences.map((s) => s.text),
  words: u.words,
  exercises: u.exercises.map((e) => ({ n: e.n, prompt: e.prompt, answer: e.answer })),
  audioTracks: u.audioTracks,
  trackRange: u.trackRange,
}));

const sectionE = d.sectionE;

const js = JSON.stringify(sectionE, null, 1);
const meta = {
  schemaVersion: 3,
  sourceId: 'epu-elementary',
  sourceName: 'English Pronunciation in Use Elementary',
  author: 'Jonathan Marks',
  publisher: 'Cambridge University Press (2007)',
  type: 'pronunciation-course',
  language: 'en',
  sections: ['A', 'B', 'C', 'D', 'E'],
  units: units.length,
  sectionECount: sectionE.length,
  cdnBase: d.meta.cdnBase,
  cdTrackCount: d.meta.cdTrackCount,
  totals: d.meta.totals,
  generatedAt: d.meta.generatedAt,
};

const out = `/**
 * EPIData.gs — English Pronunciation in Use Elementary (Cambridge, 2007)
 *
 * 50 unit (Section A/B/C/D) + Section E (E1–E8).
 * Audio: 5 CD (351 track) phát trực tiếp từ GitHub Pages.
 *
 * Nguồn dữ liệu: work/data/epu-lessons.json (sinh bởi work/tools/build-epu-data.js)
 * Mapping audio ↔ unit: đọc marker <CD><số><phần> trong sách (xem work/data/epu-track-map.js)
 *
 * @author 2026 Nguyễn Văn Quyết
 */

function EPI_META() { return ${JSON.stringify(meta, null, 2)}; }

function EPI_UNITS() { return ${JSON.stringify(units, null, 1)}; }

function EPI_SECTION_E() { return ${js}; }
`;

fs.writeFileSync(path.join(GAS, 'EPIData.gs'), out);
console.log('EPIData.gs:', (out.length / 1024).toFixed(1), 'KB | units', units.length, '| sectionE', sectionE.length);
