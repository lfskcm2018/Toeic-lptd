const fs = require('fs');
const path = require('path');

const ROOT = 'English Pronunciation in Use Elementary [1999]';
const OCR = path.join(ROOT, 'work', 'ocr');
const DATA = path.join(ROOT, 'work', 'data');
const CDN = 'https://lfskcm2018.github.io/Toeic-lptd/epu-audio';

/* nạp file data dạng "var X = ..." */
function loadJs(file, names) {
  const src = fs.readFileSync(path.join(DATA, file), 'utf8');
  const mod = { exports: {} };
  const fn = new Function('module', 'exports', src + '\n; module.exports = { ' + names.join(', ') + ' };');
  fn(mod, mod.exports);
  return mod.exports;
}

const META = loadJs('epu-units-meta.js', ['EPI_UNITS_META', 'EPI_SECTION_E_META', 'EPI_CD_TRACK_COUNT']);
const MAP = loadJs('epu-track-map.js', ['EPI_CD_OF_UNIT', 'EPI_UNIT_TRACKS', 'EPI_SECTION_E_TRACKS', 'EPI_CD_FILE_NO']);
const SE = loadJs('epu-section-e.js', ['EPI_SECTION_E']);

/* nội dung unit (câu mẫu + bài tập + đáp án) đã parse từ OCR hires */
const CONTENT = JSON.parse(fs.readFileSync(path.join(OCR, 'units-content-v4.json'), 'utf8'));
const contentByUnit = {};
CONTENT.units.forEach((u) => { contentByUnit[u.unit] = u; });

const cdFile = (cd) => `CD${MAP.EPI_CD_FILE_NO[cd]}-Track`;

const units = META.EPI_UNITS_META.map((m) => {
  const cd = MAP.EPI_CD_OF_UNIT[m.unit] || m.cd;
  const range = MAP.EPI_UNIT_TRACKS[m.unit] || [1, 1];
  const tracks = [];
  for (let t = range[0]; t <= range[1]; t++) tracks.push(`${cdFile(cd)}${String(t).padStart(2, '0')}.mp3`);
  const c = contentByUnit[m.unit] || { sentences: [], words: [], exercises: [] };
  return {
    id: `epu-u${String(m.unit).padStart(2, '0')}`,
    unit: m.unit,
    section: m.section,
    cd,
    title: m.title,
    focus: m.focus,
    sounds: m.sounds,
    page: m.page,
    sentences: c.sentences,
    words: c.words,
    exercises: c.exercises,
    audioTracks: tracks,
    trackRange: range,
    trackConfirmed: true,
  };
});

/* Section E: gắn audio track */
const sectionE = SE.EPI_SECTION_E.map((e) => {
  const o = Object.assign({}, e);
  if (e.ref === 'E3') {
    o.pairs = e.pairs.map((p) => ({ n: p[0], a: p[1], b: p[2], audio: `CD5-Track${String(p[0] + 1).padStart(2, '0')}.mp3` }));
    o.audioTracks = ['CD5-Track01.mp3'];
  }
  return o;
});

const meta = {
  schemaVersion: 3,
  sourceId: 'epu-elementary',
  sourceName: 'English Pronunciation in Use Elementary',
  author: 'Jonathan Marks',
  publisher: 'Cambridge University Press (2007)',
  cdnBase: CDN,
  totals: {
    units: units.length,
    sentences: units.reduce((a, u) => a + u.sentences.length, 0),
    exercises: units.reduce((a, u) => a + u.exercises.length, 0),
    answers: units.reduce((a, u) => a + u.exercises.filter((e) => e.answer).length, 0),
    words: units.reduce((a, u) => a + u.words.length, 0),
    sectionE: sectionE.length,
    audioTracks: Object.keys(META.EPI_CD_TRACK_COUNT).reduce((a, cd) => a + META.EPI_CD_TRACK_COUNT[cd], 0),
    unitAudioTracks: units.reduce((a, u) => a + u.audioTracks.length, 0),
  },
  cdTrackCount: META.EPI_CD_TRACK_COUNT,
  generatedAt: new Date().toISOString(),
};

fs.mkdirSync(DATA, { recursive: true });
fs.writeFileSync(path.join(DATA, 'epu-lessons.json'), JSON.stringify({ meta, units, sectionE }, null, 2));

console.log('== EPI dataset ==');
console.log(`units ${meta.totals.units} | sentences ${meta.totals.sentences} | words ${meta.totals.words} | exercises ${meta.totals.exercises} (${meta.totals.answers} có đáp án) | sectionE ${sectionE.length}`);
console.log(`audio: ${meta.totals.audioTracks} track trên 5 CD | ${meta.totals.unitAudioTracks} track gắn cho unit`);
for (const u of units) {
  console.log(`U${String(u.unit).padStart(2, '0')} ${u.section}/${u.cd} CD${MAP.EPI_CD_FILE_NO[u.cd]}-T${u.trackRange[0]}..${u.trackRange[1]} (${u.audioTracks.length}) s=${u.sentences.length} ex=${u.exercises.length} | ${u.title.slice(0, 40)}`);
}
