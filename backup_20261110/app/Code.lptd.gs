/* =========================================================
   op/app/Code.lptd.gs
   Backend Google Apps Script cho module Listening Practice Through Dictation 1–4.

   Cách dùng:
     1) Dán toàn bộ nội dung file này vào project GAS (một file .gs mới).
     2) Đảm bảo đã có LptdData.gs (do op/tools/build-lptd-data.js sinh).
     3) Deploy lại Web App.

   Không phụ thuộc Google Drive. Audio phát từ CDN Netlify:
     https://toeic-audio.netlify.app/audio/lptd/LPTD{B}U{NN}.mp3

   Settings (Sheet Settings, key/value — tùy chọn):
     LPTD_AUDIO_CDN_BASE  = base CDN audio LPTD (mặc định lấy audioCdnBase_() + '/lptd')
     LPTD_DOCS_CDN_BASE   = base CDN cho PDF (nếu sau này upload tài liệu lên CDN)
   ========================================================= */

var LPTD_DEFAULT_CDN_BASE = 'https://toeic-audio.netlify.app/audio/lptd';

/** Base CDN audio LPTD. Ưu tiên Settings LPTD_AUDIO_CDN_BASE. */
function lptdCdnBase_() {
  var settings = {};
  try { settings = settingsMap_() || {}; } catch (e) { settings = {}; }

  var custom = String(settings.LPTD_AUDIO_CDN_BASE || '').replace(/\/+$/, '').trim();
  if (custom) return custom;

  /* Dùng chung base audio của app: <base>/lptd (base thường là .../audio). */
  try {
    var base = audioCdnBase_();
    if (base) return String(base).replace(/\/+$/, '') + '/lptd';
  } catch (e) { /* bỏ qua */ }

  return LPTD_DEFAULT_CDN_BASE;
}

/** Base CDN tài liệu PDF LPTD (tùy chọn). Trả '' nếu chưa cấu hình. */
function lptdDocsBase_() {
  var settings = {};
  try { settings = settingsMap_() || {}; } catch (e) { settings = {}; }
  return String(settings.LPTD_DOCS_CDN_BASE || '').replace(/\/+$/, '').trim();
}

/** Gắn cdnUrl vào từng unit (không sửa dữ liệu gốc). */
function lptdLessonsWithUrls_(cdnBase) {
  var base = String(cdnBase || lptdCdnBase_()).replace(/\/+$/, '');
  return LPTD_LESSONS().map(function (u) {
    var row = {
      id: u.id,
      book: u.book,
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
    return row;
  });
}

/**
 * API chính cho UI: trả cấu hình + toàn bộ 160 unit kèm URL CDN.
 * Dùng 1 lần gọi duy nhất để giảm round-trip google.script.run.
 */
function getLptdBootstrap() {
  var cdnBase = lptdCdnBase_();
  var lessons = lptdLessonsWithUrls_(cdnBase);
  var meta = LPTD_LESSONS_META();
  return {
    configured: true,
    cdnBase: cdnBase,
    docsCdnBase: lptdDocsBase_(),
    meta: meta,
    lessonCount: lessons.length,
    lessons: lessons,
  };
}

/** Tương thích: chỉ trả danh sách unit (kèm cdnUrl). */
function getLptdLessons() {
  return lptdLessonsWithUrls_(lptdCdnBase_());
}

/** Danh sách 4 cuốn + thống kê. */
function getLptdBooks() {
  var meta = LPTD_LESSONS_META();
  return meta.books || [];
}

/** Lấy 1 unit theo book/unit. */
function getLptdUnit(book, unit) {
  var id = 'lptd-' + Number(book) + '-' + ('0' + Number(unit)).slice(-2);
  var list = lptdLessonsWithUrls_(lptdCdnBase_());
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
}

/** Chạy từ GAS Editor: kiểm tra nhanh dữ liệu + URL CDN mẫu. */
function debugLptd() {
  var meta = LPTD_LESSONS_META();
  Logger.log('=== LPTD ===');
  Logger.log('Tổng unit: ' + meta.totals.units + ' | câu: ' + meta.totals.lines + ' | từ: ' + meta.totals.words);
  (meta.books || []).forEach(function (b) {
    Logger.log('Cuốn ' + b.book + ': ' + b.units + ' unit, ' + b.lines + ' câu, ' + b.words + ' từ');
  });
  Logger.log('CDN base: ' + lptdCdnBase_());
  Logger.log('Docs base: ' + (lptdDocsBase_() || '(chưa cấu hình)'));

  var samples = [
    lptdCdnBase_() + '/LPTD1U01.mp3',
    lptdCdnBase_() + '/LPTD2U20.mp3',
    lptdCdnBase_() + '/LPTD3U40.mp3',
    lptdCdnBase_() + '/LPTD4U40.mp3',
  ];
  samples.forEach(function (url) {
    try {
      var res = UrlFetchApp.fetch(url, { method: 'get', headers: { Range: 'bytes=0-0' }, muteHttpExceptions: true });
      Logger.log('  ' + url + ' → ' + res.getResponseCode() + ' · ' + res.getHeaders()['Content-Type']);
    } catch (e) {
      Logger.log('  ' + url + ' → LỖI: ' + e.message);
    }
  });
}

/** Chạy từ GAS Editor: kiểm tra 160 URL CDN (chậm hơn, dùng khi cần). */
function debugLptdAllUrls() {
  var base = lptdCdnBase_();
  var bad = [];
  var list = LPTD_LESSONS();
  list.forEach(function (u) {
    var url = base + '/' + u.cdnName;
    try {
      var res = UrlFetchApp.fetch(url, { method: 'get', headers: { Range: 'bytes=0-0' }, muteHttpExceptions: true });
      var code = res.getResponseCode();
      if (code !== 200 && code !== 206) bad.push(u.cdnName + ' → HTTP ' + code);
    } catch (e) {
      bad.push(u.cdnName + ' → ' + e.message);
    }
  });
  Logger.log('Kiểm tra ' + list.length + ' URL: ' + (list.length - bad.length) + ' OK, ' + bad.length + ' lỗi.');
  bad.slice(0, 30).forEach(function (x) { Logger.log('  ' + x); });
}
