/* h750-local-glue.js */
(function (global) {
  'use strict';
  var H750_BOOK = 8;
  var H750_CDN = 'https://toeic-audio.netlify.app/audio/750plus';
  var src = global.H750_LESSONS;
  if (!Array.isArray(src)) { if (global.console) console.warn('[750+] Thiếu window.H750_LESSONS'); return; }
  var mapped = src.map(function (u) {
    return { id: u.id, book: H750_BOOK, unit: u.unit, title: u.title, slug: u.slug, audioFileName: u.audioFileName, cdnName: u.cdnName, localPath: u.localPath, lines: u.lines, lineCount: u.lineCount, wordCount: u.wordCount, cdnUrl: H750_CDN + '/' + u.cdnName };
  });
  var raw = global.LPTD_LESSONS_RAW;
  if (!Array.isArray(raw)) { global.LPTD_LESSONS_RAW = mapped; return; }
  var seen = {}; raw.forEach(function (u) { if (u && u.id) seen[u.id] = true; });
  mapped.forEach(function (u) { if (!seen[u.id]) raw.push(u); });
})(typeof window !== 'undefined' ? window : this);
