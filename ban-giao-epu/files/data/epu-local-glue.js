/* Glue EPI Elementary (book 9) vào bản local của app LPTD.
   Đặt SAU app/lptd-lessons-data.js và TRƯỚC app/lptd-data.js. */
(function (global) {
  'use strict';
  var raw = global.EPU_LESSONS_RAW || [];
  var BASE = 'https://lfskcm2018.github.io/Toeic-lptd/epu-audio';
  raw.forEach(function (u) {
    u.book = 9;
    u.cdnUrl = BASE + '/' + (u.cdnName || '');
    if (u.epi && u.epi.audioTracks) {
      u.epi.audioTracks = u.epi.audioTracks.map(function (t) { return BASE + '/' + t; });
    }
  });
  global.EPU_LESSONS_RAW = raw;
  if (global.LPTD_LESSONS_RAW) {
    global.LPTD_LESSONS_RAW = global.LPTD_LESSONS_RAW.concat(raw);
  }
})(typeof window !== 'undefined' ? window : this);
