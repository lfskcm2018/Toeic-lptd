/* =========================================================
   op/gas-standalone/Code.gs
   GAS app ĐỘC LẬP: Dictation Part 2 (TOEIC Part 2).

   Không phụ thuộc project TOEIC hiện tại, không dùng core.js,
   không dùng dữ liệu Hackers / ETS / LPTD. Audio Dictation Part 2 từ Netlify CDN.

   Cấu hình tùy chọn (Project Settings → Script properties):
     LPTD_AUDIO_CDN_BASE = https://toeic-audio.netlify.app/audio/dictation-part2
     LPTD_DOCS_CDN_BASE  = (để trống nếu chưa có PDF trên CDN)
     LPTD_RECORDING_ENGINE_URL = https://lfskcm2018.github.io/Toeic-lptd/recording-engine/

   Deploy: Deploy → New deployment → Web app
     Execute as: Me
     Who has access: Anyone (hoặc Anyone with Google account)
   ========================================================= */

var LPTD_DEFAULT_CDN_BASE = 'https://toeic-audio.netlify.app/audio/dictation-part2';
var LPTD_DEFAULT_RECORDING_ENGINE_URL = 'https://lfskcm2018.github.io/Toeic-lptd/recording-engine/';

/** Trang web app. */
function doGet() {
  var template = HtmlService.createTemplateFromFile('Index');
  /* URL popup ghi âm (Recording Engine) — ghi đè được bằng Script Property. */
  template.RECORDING_ENGINE_URL = lptdRecordingEngineUrl_();
  return template.evaluate()
    .setTitle('Dictation Part 2 — TOEIC Part 2')
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

/** URL trang Recording Engine (popup ghi âm ngoài iframe GAS). */
function lptdRecordingEngineUrl_() {
  var url = String(lptdProp_('LPTD_RECORDING_ENGINE_URL', LPTD_DEFAULT_RECORDING_ENGINE_URL)).trim();
  return url || LPTD_DEFAULT_RECORDING_ENGINE_URL;
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

/** Danh sách cuốn Dictation Part 2. */
function getDp2Books() {
  var meta = DP2_LESSONS_META();
  return meta.books || [];
}

/** Tương thích: chỉ trả danh sách unit DP2 (kèm cdnUrl). */
function getDp2Lessons() {
  var dp2CdnBase = 'https://toeic-audio.netlify.app/audio/dictation-part2';
  return DP2_LESSONS().map(function (u) {
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
      cdnUrl: dp2CdnBase + '/' + u.cdnName,
    };
  });
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

