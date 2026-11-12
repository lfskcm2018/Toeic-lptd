/* dp2? no, h600-local-glue.js */
(function (global) {
  'use strict';
  var H600_BOOK = 7;
  var H600_CDN = 'https://toeic-audio.netlify.app/audio/600plus';
  var src = global.H600_LESSONS;
  if (!Array.isArray(src)) { if (global.console) console.warn('[600+] Thiếu window.H600_LESSONS'); return; }
  var mapped = src.map(function (u) {
    return { id: u.id, book: H600_BOOK, unit: u.unit, title: u.title, slug: u.slug, audioFileName: u.audioFileName, cdnName: u.cdnName, localPath: u.localPath, lines: u.lines, lineCount: u.lineCount, wordCount: u.wordCount, cdnUrl: H600_CDN + '/' + u.cdnName };
  });
  var raw = global.LPTD_LESSONS_RAW;
  if (!Array.isArray(raw)) { global.LPTD_LESSONS_RAW = mapped; return; }
  var seen = {}; raw.forEach(function (u) { if (u && u.id) seen[u.id] = true; });
  mapped.forEach(function (u) { if (!seen[u.id]) raw.push(u); });
})(typeof window !== 'undefined' ? window : this);
