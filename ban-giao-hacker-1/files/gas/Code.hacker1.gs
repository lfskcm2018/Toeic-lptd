/* =========================================================
   HACKER 1 — SNIPPET TÍCH HỢP SERVER (Google Apps Script)
   Dự án tổng đã có: LptdData.gs (LPTD 1-4), Code.gs, LptdUI.html.

   CÁCH DÙNG
   1. Thêm file Hacker1Data.gs (bản bàn giao) vào project tổng.
   2. Dán nội dung file này vào cuối Code.gs (hoặc file .gs mới).
   3. Sửa getLptdBootstrap() theo hướng dẫn trong patches/01-SERVER-CODE.md.
   4. KHÔNG copy các wrapper LPTD_LESSONS_META/LPTD_LESSONS từ bản standalone.

   GHI CHÚ
   - Hacker 1 dùng book = 5 trong dự án tổng (LPTD đang dùng book 1-4).
   - Dữ liệu gốc Hacker1Data.gs có book = 1; hàm dưới đây remap sang book 5
     tại thời điểm trả về UI, không cần sửa file dữ liệu.
   - Audio nằm ở CDN riêng /audio/hacker1, nên mỗi lesson trả kèm cdnUrl.
   ========================================================= */

/** Book id dành cho Hacker 1 trong dự án tổng (LPTD: 1-4). */
var HACKER1_BOOK = 5;

/** CDN mặc định của Hacker 1. Có thể override bằng Script Property HACKER1_AUDIO_CDN_BASE. */
var HACKER1_DEFAULT_CDN_BASE = 'https://toeic-audio.netlify.app/audio/hacker1';

/** Base CDN audio Hacker 1. */
function hacker1CdnBase_() {
  var base = '';
  try {
    /* Dự án tổng có helper lptdProp_(key, default). */
    if (typeof lptdProp_ === 'function') {
      base = lptdProp_('HACKER1_AUDIO_CDN_BASE', HACKER1_DEFAULT_CDN_BASE);
    } else {
      base = PropertiesService.getScriptProperties().getProperty('HACKER1_AUDIO_CDN_BASE') || HACKER1_DEFAULT_CDN_BASE;
    }
  } catch (e) { base = HACKER1_DEFAULT_CDN_BASE; }
  return String(base || HACKER1_DEFAULT_CDN_BASE).replace(/\/+$/, '').trim();
}

/** 30 track Hacker 1 kèm cdnUrl, book remap = HACKER1_BOOK. */
function hacker1LessonsWithUrls_(cdnBase) {
  var base = String(cdnBase || hacker1CdnBase_()).replace(/\/+$/, '');
  return HACKER1_LESSONS().map(function (u) {
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
      cdnUrl: base + '/' + u.cdnName,
    };
  });
}

/** Meta riêng cho Hacker 1 (dùng nếu cần hiển thị thống kê nguồn). */
function hacker1MetaWithBook_() {
  var meta = HACKER1_LESSONS_META() || {};
  return {
    sourceId: 'hacker-1',
    book: HACKER1_BOOK,
    title: 'Hackers TOEIC 1000 LC — Hacker 1',
    level: '10 TEST · 30 track (Part 1-2, 3, 4)',
    units: (meta.lessonCount || (meta.totals && meta.totals.units) || 30),
    lines: meta.totalLines || (meta.totals && meta.totals.lines) || 0,
    words: meta.totalWords || (meta.totals && meta.totals.words) || 0,
    cdnBase: hacker1CdnBase_(),
  };
}

/** API tương thích nếu UI/dự án khác cần gọi riêng. */
function getHacker1Lessons() {
  return hacker1LessonsWithUrls_();
}

/** Debug nhanh trong Script Editor → View → Logs. */
function debugHacker1() {
  var list = hacker1LessonsWithUrls_();
  var lines = 0, words = 0;
  list.forEach(function (u) { lines += u.lineCount || 0; words += u.wordCount || 0; });
  Logger.log('Hacker 1: %s track | %s câu | %s từ | book=%s', list.length, lines, words, HACKER1_BOOK);
  Logger.log('CDN: %s', hacker1CdnBase_());
  [0, 14, 29].forEach(function (i) {
    var u = list[i];
    if (!u) return;
    try {
      var res = UrlFetchApp.fetch(u.cdnUrl, {
        method: 'get',
        headers: { Range: 'bytes=0-0' },
        muteHttpExceptions: true,
      });
      Logger.log('  %s → HTTP %s · %s', u.cdnName, res.getResponseCode(), res.getHeaders()['Content-Type']);
    } catch (e) {
      Logger.log('  %s → LỖI %s', u.cdnName, e.message);
    }
  });
}
