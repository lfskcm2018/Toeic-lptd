/* =========================================================
   hacker1-local-glue.js — nạp Hacker 1 cho BẢN LOCAL (local-study.html)

   Thứ tự nạp (BẮT BUỘC đúng thứ tự):
     1. app/hacker-1-lessons-data.js      (window.HACKER1_LESSONS)
     2. app/lptd-lessons-data.js          (window.LPTD_LESSONS_RAW)
     3. app/hacker1-local-glue.js         (file này — nối vào RAW)
     4. app/lptd-data.js                  (tự gọi loadLocal)
     5. app/lptd-ui.js

   Việc cần làm: remap book 1 → 5, gắn cdnUrl riêng /audio/hacker1,
   rồi nối vào window.LPTD_LESSONS_RAW để LPTD.loadLocal() nhận luôn.
   Idempotent: nạp lại không sinh bản ghi trùng.
   ========================================================= */
(function (global) {
  'use strict';

  var HACKER1_BOOK = 5;
  var HACKER1_CDN = 'https://toeic-audio.netlify.app/audio/hacker1';

  var src = global.HACKER1_LESSONS;
  if (!Array.isArray(src)) {
    if (global.console) console.warn('[Hacker1] Thiếu window.HACKER1_LESSONS — nạp hacker-1-lessons-data.js trước.');
    return;
  }

  var mapped = src.map(function (u) {
    return {
      id: u.id,
      book: HACKER1_BOOK,
      unit: u.unit,
      title: u.title,
      slug: u.slug,
      audioFileName: u.audioFileName,
      cdnName: u.cdnName,
      localPath: u.localPath,
      lines: u.lines,
      lineCount: u.lineCount,
      wordCount: u.wordCount,
      cdnUrl: HACKER1_CDN + '/' + u.cdnName
    };
  });

  var raw = global.LPTD_LESSONS_RAW;
  if (!Array.isArray(raw)) {
    /* Cho phép nạp glue trước lptd-lessons-data.js. */
    global.LPTD_LESSONS_RAW = mapped;
    return;
  }

  var seen = {};
  raw.forEach(function (u) { if (u && u.id) seen[u.id] = true; });
  mapped.forEach(function (u) { if (!seen[u.id]) raw.push(u); });
})(typeof window !== 'undefined' ? window : this);
