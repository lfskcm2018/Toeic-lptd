#!/usr/bin/env node
/* =========================================================
   build-main-app-epu.js
   Tích hợp "English Pronunciation in Use Elementary" (EPI)
   vào app tổng (module LPTD) dưới dạng **book 9**.

   Sinh:  app/EpiData.gs, app/EpiServer.gs
   Patch: app/LptdServer.gs, app/lptd-data.js, app/lptd-ui.js
   Build: app/LptdUI.html (gọi tools/build-lptdui-integrated.js)

   Idempotent: chạy lại nhiều lần vẫn an toàn.
   ========================================================= */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');      // gốc repo dự án tổng
const SRC = path.resolve(__dirname, '..', '..');             // .../English Pronunciation in Use Elementary [1999]
const DATA = path.join(SRC, 'work', 'data');
const APP = path.join(ROOT, 'app');

function log(...a) { console.log(...a); }
function read(p) { return fs.readFileSync(p, 'utf8'); }
function write(p, s) { fs.writeFileSync(p, s, 'utf8'); log('  wrote ' + path.relative(ROOT, p) + ' (' + (s.length / 1024).toFixed(1) + ' KB)'); }

/* ---------- 1. Nạp dataset EPI ---------- */
const d = JSON.parse(read(path.join(DATA, 'epu-lessons.json')));

const CD_FILE = { A: 1, B: 2, C: 3, D: 4, E: 5 };
const pad2 = (n) => String(n).padStart(2, '0');

function linesOf(sentences) {
  return (sentences || []).map((s, i) => ({ no: i + 1, speaker: '', text: s.text || s }));
}
function countWords(lines) {
  let w = 0;
  lines.forEach((l) => { w += String(l.text || '').split(/\s+/).filter(Boolean).length; });
  return w;
}

const lessons = d.units.map((u) => {
  const lines = linesOf(u.sentences);
  const first = u.audioTracks[0] || '';
  return {
    id: u.id,
    source: 'epu',
    book: 9,
    unit: u.unit,
    title: 'Unit ' + pad2(u.unit) + ' — ' + u.title,
    slug: u.id,
    audioFileName: first,
    cdnName: first,
    localPath: '',
    lines,
    lineCount: lines.length,
    wordCount: countWords(lines),
    epi: {
      section: u.section,
      cd: u.cd,
      focus: u.focus,
      sounds: u.sounds || [],
      page: u.page,
      trackRange: u.trackRange,
      audioTracks: u.audioTracks,
      exercises: u.exercises || [],
    },
  };
});

/* Section E → 8 unit bổ sung (unit 51..58) để dùng được dictation/shadowing */
const eUnits = [];
(d.sectionE || []).forEach((e, i) => {
  const lines = [];
  if (e.pairs) {
    e.pairs.forEach((p) => lines.push({ no: lines.length + 1, speaker: '', text: p.a + ' ↔ ' + p.b }));
  } else if (e.groups) {
    e.groups.forEach((g) => g.items.forEach((it) => lines.push({ no: lines.length + 1, speaker: '', text: it })));
  }
  const first = (e.audioTracks && e.audioTracks[0]) || '';
  eUnits.push({
    id: 'epu-' + e.ref.toLowerCase(),
    source: 'epu',
    book: 9,
    unit: 51 + i,
    title: e.ref + ' — ' + e.title,
    slug: 'epu-' + e.ref.toLowerCase(),
    audioFileName: first,
    cdnName: first,
    localPath: '',
    lines,
    lineCount: lines.length,
    wordCount: countWords(lines),
    epi: {
      section: 'E',
      cd: e.cd || '',
      focus: e.desc || '',
      sounds: [],
      page: e.page,
      trackRange: [0, 0],
      audioTracks: e.audioTracks || [],
      exercises: [],
      ref: e.ref,
      groups: e.groups || [],
      pairs: e.pairs || [],
    },
  });
});
lessons.push(...eUnits);

/* ---------- 2. app/EpiData.gs ---------- */
const meta = {
  schemaVersion: 1,
  sourceId: 'epu-elementary',
  sourceName: 'English Pronunciation in Use Elementary',
  author: 'Jonathan Marks',
  publisher: 'Cambridge University Press (2007)',
  type: 'pronunciation-course',
  language: 'en',
  book: 9,
  units: lessons.length,
  realUnits: d.units.length,
  sectionECount: (d.sectionE || []).length,
  cdnBase: d.meta.cdnBase,
  cdTrackCount: d.meta.cdTrackCount,
  totals: d.meta.totals,
  generatedAt: d.meta.generatedAt,
};

const epiData = `/**
 * EpiData.gs — English Pronunciation in Use Elementary (Cambridge, 2007)
 *
 * 50 unit (Section A–D) + Section E (E1–E8) — book 9 của module LPTD.
 * Audio: 5 CD / 351 track trên GitHub Pages.
 *
 * Nguồn: work/data/epu-lessons.json
 * Mapping audio ↔ unit: đối chiếu marker <CD><số><phần> trong sách.
 *
 * @author 2026 Nguyễn Văn Quyết
 */

function EPI_LESSONS_META() { return ${JSON.stringify(meta, null, 2)}; }

function EPI_LESSONS() { return ${JSON.stringify(lessons, null, 1)}; }
`;
write(path.join(APP, 'EpiData.gs'), epiData);

/* ---------- 3. app/EpiServer.gs ---------- */
const epiServer = `/* =========================================================
   EpiServer.gs — helper server cho "English Pronunciation in Use Elementary"
   (book 9 của module LPTD).

   Dữ liệu: EpiData.gs (EPI_LESSONS_META, EPI_LESSONS)
   ========================================================= */
var EPI_BOOK = 9;
var EPI_DEFAULT_CDN_BASE = 'https://lfskcm2018.github.io/Toeic-lptd/epu-audio';

/** Base CDN audio EPI (có thể override bằng Script Property EPI_AUDIO_CDN_BASE). */
function epiCdnBase_() {
  var fallback = EPI_DEFAULT_CDN_BASE;
  try {
    var v = PropertiesService.getScriptProperties().getProperty('EPI_AUDIO_CDN_BASE');
    if (v != null && String(v).trim() !== '') fallback = String(v).trim();
  } catch (e) { /* bỏ qua */ }
  return String(fallback).replace(/\\/+$/, '');
}

/** Gắn URL CDN cho từng unit EPI (kèm toàn bộ track của unit). */
function epiLessonsWithUrls_() {
  var base = epiCdnBase_();
  return EPI_LESSONS().map(function (u) {
    var o = {};
    Object.keys(u).forEach(function (k) { o[k] = u[k]; });
    var e = {};
    Object.keys(u.epi || {}).forEach(function (k) { e[k] = u.epi[k]; });
    e.audioTracks = ((u.epi && u.epi.audioTracks) || []).map(function (t) { return base + '/' + t; });
    o.epi = e;
    o.cdnUrl = base + '/' + (u.cdnName || '');
    return o;
  });
}

/** Meta kèm book id. */
function epiMetaWithBook_() {
  var m = EPI_LESSONS_META();
  m.book = EPI_BOOK;
  return m;
}

/** API riêng (dùng cho web app EPI độc lập hoặc kiểm thử). */
function getEpiLessons() {
  return epiLessonsWithUrls_();
}

/** Chẩn đoán nhanh — chạy trong Script Editor. */
function debugEPI() {
  var list = epiLessonsWithUrls_();
  var lines = 0, words = 0;
  list.forEach(function (u) { lines += u.lineCount || 0; words += u.wordCount || 0; });
  Logger.log('EPI Elementary: %s unit | %s câu | %s từ | book %s', list.length, lines, words, EPI_BOOK);
  Logger.log('CDN: %s', epiCdnBase_());
  [0, 24, 49, 57].forEach(function (i) {
    var u = list[i];
    if (!u) return;
    var url = u.cdnUrl;
    if (!url) { Logger.log('  unit %s — không có audio', u.unit); return; }
    try {
      var res = UrlFetchApp.fetch(url, { method: 'get', headers: { Range: 'bytes=0-0' }, muteHttpExceptions: true });
      Logger.log('  unit %s -> HTTP %s', u.unit, res.getResponseCode());
    } catch (e) {
      Logger.log('  unit %s -> LỖI %s', u.unit, e.message);
    }
  });
}
`;
write(path.join(APP, 'EpiServer.gs'), epiServer);

/* ---------- 4. Patch app/LptdServer.gs ---------- */
{
  const p = path.join(APP, 'LptdServer.gs');
  let t = read(p);
  const MARK = '  var epiLessons = safe(function () { return typeof EPI_LESSONS === \'function\' ? epiLessonsWithUrls_() : []; }) || [];';
  if (!t.includes(MARK)) {
    const anchor = '  var h750Lessons = safe(function () { return typeof H750_LESSONS === \'function\' ? h750LessonsWithUrls_() : []; }) || [];';
    if (!t.includes(anchor)) throw new Error('LptdServer.gs: không tìm thấy anchor h750Lessons');
    t = t.replace(anchor, anchor + '\n' + MARK);
    const anchor2 = '  var h750Meta = safe(function () { return typeof H750_LESSONS === \'function\' ? h750MetaWithBook_() : null; });';
    t = t.replace(anchor2, anchor2 + '\n  var epiMeta = safe(function () { return typeof EPI_LESSONS === \'function\' ? epiMetaWithBook_() : null; });');
    const anchor3 = '    h750CdnBase: (typeof h750CdnBase_ === \'function\' ? h750CdnBase_() : \'\'),';
    t = t.replace(anchor3, anchor3 + '\n    epiLessons: epiLessons,\n    epiMeta: epiMeta,\n    epiLessonCount: epiLessons.length,\n    epiCdnBase: (typeof epiCdnBase_ === \'function\' ? epiCdnBase_() : \'\'),');
    write(p, t);
  } else {
    log('  skip LptdServer.gs (đã patch)');
  }
}

/* ---------- 5. Patch app/lptd-data.js ---------- */
{
  const p = path.join(APP, 'lptd-data.js');
  let t = read(p);
  if (!t.includes("code: 'EPI Elementary'")) {
    const anchor = `    {
      book: 8,
      code: '750+',
      title: '750+ · Dictation & Shadowing',
      short: '750+',
      level: '20 ngày · 20 audio',
      icon: '📘',
      accent: '#8b5cf6',
      units: 20,
    },`;
    if (!t.includes(anchor)) throw new Error('lptd-data.js: không tìm thấy anchor book 8');
    const add = anchor + `
    {
      book: 9,
      code: 'EPI Elementary',
      title: 'English Pronunciation in Use Elementary',
      short: 'EPI',
      level: '50 unit + Section E · 351 audio',
      icon: '🗣️',
      accent: '#ec4899',
      units: ${lessons.length},
    },`;
    t = t.replace(anchor, add);
    write(p, t);
  } else {
    log('  skip lptd-data.js (đã có book 9)');
  }
}

/* ---------- 6. Patch app/lptd-ui.js ---------- */
{
  const p = path.join(APP, 'lptd-ui.js');
  let t = read(p);

  const a1 = `        var h750 = Array.isArray(res.h750Lessons) ? res.h750Lessons : [];
        L.setLessons(res.lessons.concat(h1).concat(dp2).concat(h600).concat(h750));`;
  const b1 = `        var h750 = Array.isArray(res.h750Lessons) ? res.h750Lessons : [];
        var epi = Array.isArray(res.epiLessons) ? res.epiLessons : [];
        L.setLessons(res.lessons.concat(h1).concat(dp2).concat(h600).concat(h750).concat(epi));`;
  if (!t.includes(b1)) {
    if (!t.includes(a1)) throw new Error('lptd-ui.js: không tìm thấy anchor concat');
    t = t.replace(a1, b1);
  }

  /* Panel EPI: danh sách track audio + bài tập, chèn trước #lptdUnitBody */
  const a2 = `    html += '<div id="lptdUnitBody"></div>';`;
  const b2 = `    if (u.epi && u.epi.audioTracks && u.epi.audioTracks.length) {
      html += '<section class="card" id="epiPanel"><div class="lptd-eyebrow">🗣️ English Pronunciation in Use Elementary</div>' +
        '<div class="lptd-muted">CD ' + esc(u.epi.cd) + ' · track ' + u.epi.trackRange[0] + '–' + u.epi.trackRange[1] + ' · sách trang ' + u.epi.page + '</div>' +
        '<div class="epi-tracks" id="epiTracks">';
      u.epi.audioTracks.forEach(function (src) {
        var nm = String(src).split('/').pop().replace('.mp3', '');
        html += '<button type="button" class="btn btn-outline btn-sm epi-track-btn" data-src="' + esc(src) + '">▶ ' + esc(nm) + '</button>';
      });
      html += '</div>';
      if (u.epi.exercises && u.epi.exercises.length) {
        html += '<div class="lptd-muted" style="margin-top:10px">📝 Bài tập (' + u.epi.exercises.length + ')</div>';
        u.epi.exercises.forEach(function (ex, i) {
          html += '<div class="epi-ex"><b>Exercise ' + esc(ex.n) + '</b><br>' + esc(ex.prompt) +
            (ex.answer ? '<div><button type="button" class="btn btn-outline btn-sm epi-reveal" data-ex="' + i + '">Xem đáp án</button></div>' +
              '<div class="epi-answer lptd-hidden" id="epi-ans-' + i + '">' + esc(ex.answer) + '</div>' : '') +
            '</div>';
        });
      }
      html += '</section>';
    }

    html += '<div id="lptdUnitBody"></div>';`;
  if (!t.includes("id=\"epiPanel\"")) {
    if (!t.includes(a2)) throw new Error('lptd-ui.js: không tìm thấy anchor #lptdUnitBody');
    t = t.replace(a2, b2);

    /* bind panel */
    const a3 = `    syncVolumeUI();
    renderUnitBody();
  }`;
    const b3 = `    qa('.epi-track-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var a = new Audio(b.getAttribute('data-src'));
        a.play().catch(function () {});
      });
    });
    qa('.epi-reveal').forEach(function (b) {
      b.addEventListener('click', function () {
        var el = document.getElementById('epi-ans-' + b.getAttribute('data-ex'));
        if (el) el.classList.toggle('lptd-hidden');
      });
    });

    syncVolumeUI();
    renderUnitBody();
  }`;
    if (!t.includes(a3)) throw new Error('lptd-ui.js: không tìm thấy anchor syncVolumeUI');
    t = t.replace(a3, b3);
  }

  /* CSS panel EPI */
  const a4 = `  function ensureCss() {`;
  const b4 = `  function ensureEpiCss() {
    if (document.getElementById('epiPanelCss')) return;
    var st = document.createElement('style');
    st.id = 'epiPanelCss';
    st.textContent = '.epi-tracks{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}'
      + '.epi-ex{padding:8px 10px;border:1px solid rgb(var(--border));border-radius:10px;margin:8px 0;font-size:13px;}'
      + '.epi-answer{margin-top:6px;color:rgb(var(--muted-foreground));font-size:12px;white-space:pre-wrap;}';
    document.head.appendChild(st);
  }

  function ensureCss() {`;
  if (!t.includes('epiPanelCss')) {
    if (!t.includes(a4)) throw new Error('lptd-ui.js: không tìm thấy anchor ensureCss');
    t = t.replace(a4, b4);
    const a5 = `  function ensureCss() {
    if (doc.getElementById('lptdStyle')) return;`;
    const b5 = `  function ensureCss() {
    ensureEpiCss();
    if (doc.getElementById('lptdStyle')) return;`;
    t = t.replace(a5, b5);
  }

  write(p, t);
}

/* ---------- 7. Build app/LptdUI.html ---------- */
const builderCands = [
  path.join(ROOT, 'op', 'tools', 'build-lptdui-integrated.js'),
  path.join(ROOT, 'op', 'ban-giao-750', 'files', 'tools', 'build-lptdui-integrated.js'),
  path.join(ROOT, 'op', 'ban-giao-600', 'files', 'tools', 'build-lptdui-integrated.js'),
];
const builder = builderCands.find((p) => fs.existsSync(p));
if (builder) {
  const { execFileSync } = require('child_process');
  execFileSync(process.execPath, [builder, '--root', ROOT], { stdio: 'inherit' });
} else {
  log('  (bỏ qua build LptdUI.html — không tìm thấy builder)');
}

log('== build-main-app-epu OK: ' + lessons.length + ' unit EPI (book 9) ==');
