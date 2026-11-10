/* =========================================================
   op/gas-standalone/Code.gs
   GAS app ĐỘC LẬP: Listening Practice Through Dictation 1–4.

   Không phụ thuộc project TOEIC hiện tại, không dùng core.js,
   không dùng dữ liệu Hackers / ETS, không dùng Google Drive.

   Cấu hình tùy chọn (Project Settings → Script properties):
     LPTD_AUDIO_CDN_BASE = https://toeic-audio.netlify.app/audio/lptd
     LPTD_DOCS_CDN_BASE  = (để trống nếu chưa có PDF trên CDN)

   Deploy: Deploy → New deployment → Web app
     Execute as: Me
     Who has access: Anyone (hoặc Anyone with Google account)
   ========================================================= */

var LPTD_DEFAULT_CDN_BASE = 'https://toeic-audio.netlify.app/audio/lptd';

/** Trang web app. */
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('LPTD 1–4 — Dictation & Shadowing')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    /* Cho phép nhúng iframe (Google Sites / app khác). Bỏ dòng này nếu không cần. */
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Dùng trong Index.html: <?!= include('Styles'); ?> */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/* ---------- Cấu hình ---------- */
function lptdProp_(key, fallback) {
  try {
    var value = PropertiesService.getScriptProperties().getProperty(key);
    if (value != null && String(value).trim() !== '') return String(value).trim();
  } catch (e) { /* bỏ qua */ }
  return fallback || '';
}

/** Base CDN audio LPTD. */
function lptdCdnBase_() {
  return String(lptdProp_('LPTD_AUDIO_CDN_BASE', LPTD_DEFAULT_CDN_BASE)).replace(/\/+$/, '');
}

/** Base CDN tài liệu PDF (tùy chọn). Trả '' nếu chưa cấu hình. */
function lptdDocsBase_() {
  return String(lptdProp_('LPTD_DOCS_CDN_BASE', '')).replace(/\/+$/, '');
}

/* ---------- Dữ liệu ---------- */
/** Gắn cdnUrl vào từng unit (không sửa dữ liệu gốc trong LptdData.gs). */
function lptdLessonsWithUrls_(cdnBase) {
  var base = String(cdnBase || lptdCdnBase_()).replace(/\/+$/, '');
  return LPTD_LESSONS().map(function (u) {
    return {
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
  });
}

/**
 * API chính cho UI: cấu hình + toàn bộ 160 unit kèm URL CDN.
 * Một round-trip duy nhất để giảm thời gian tải.
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

/* ---------- Kiểm tra nhanh trong Script Editor ---------- */
function debugLptd() {
  var meta = LPTD_LESSONS_META();
  Logger.log('=== LPTD standalone ===');
  Logger.log('Tổng unit: ' + meta.totals.units + ' | câu: ' + meta.totals.lines + ' | từ: ' + meta.totals.words);
  (meta.books || []).forEach(function (b) {
    Logger.log('Cuốn ' + b.book + ': ' + b.units + ' unit, ' + b.lines + ' câu, ' + b.words + ' từ');
  });
  Logger.log('Audio CDN: ' + lptdCdnBase_());
  Logger.log('Docs CDN : ' + (lptdDocsBase_() || '(chưa cấu hình — PDF sẽ bị ẩn)'));

  ['LPTD1U01.mp3', 'LPTD2U20.mp3', 'LPTD3U40.mp3', 'LPTD4U40.mp3'].forEach(function (name) {
    var url = lptdCdnBase_() + '/' + name;
    try {
      var res = UrlFetchApp.fetch(url, { method: 'get', headers: { Range: 'bytes=0-0' }, muteHttpExceptions: true });
      Logger.log('  ' + url + ' → HTTP ' + res.getResponseCode());
    } catch (e) {
      Logger.log('  ' + url + ' → LỖI: ' + e.message);
    }
  });
}
