/* =========================================================
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
  return String(fallback).replace(/\/+$/, '');
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
