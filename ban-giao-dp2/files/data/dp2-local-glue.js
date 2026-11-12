/* =========================================================
   dp2-local-glue.js — nạp Dictation Part 2 cho BẢN LOCAL (local-study.html)

   Thứ tự nạp:
     1. app/dictation-part2-lessons-data.js   (window.DP2_LESSONS)
     2. app/lptd-lessons-data.js              (window.LPTD_LESSONS_RAW)
     3. app/dp2-local-glue.js                 (file này — nối vào RAW)
     4. app/lptd-data.js                      (tự gọi loadLocal)
     5. app/lptd-ui.js
   ========================================================= */
(function (global) {
  'use strict';

  var DP2_BOOK = 6;
  var DP2_CDN = 'https://toeic-audio.netlify.app/audio/dictation-part2';

  var src = global.DP2_LESSONS;
  if (!Array.isArray(src)) {
    if (global.console) console.warn('[DP2] Thiếu window.DP2_LESSONS — nạp dictation-part2-lessons-data.js trước.');
    return;
  }

  var mapped = src.map(function (u) {
    return {
      id: u.id,
      book: DP2_BOOK,
      unit: u.unit,
      title: u.title,
      slug: u.slug,
      audioFileName: u.audioFileName,
      cdnName: u.cdnName,
      localPath: u.localPath,
      lines: u.lines,
      lineCount: u.lineCount,
      wordCount: u.wordCount,
      cdnUrl: DP2_CDN + '/' + u.cdnName
    };
  });

  var raw = global.LPTD_LESSONS_RAW;
  if (!Array.isArray(raw)) {
    global.LPTD_LESSONS_RAW = mapped;
    return;
  }

  var seen = {};
  raw.forEach(function (u) { if (u && u.id) seen[u.id] = true; });
  mapped.forEach(function (u) { if (!seen[u.id]) raw.push(u); });
})(typeof window !== 'undefined' ? window : this);
