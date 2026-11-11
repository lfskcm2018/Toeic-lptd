/* =========================================================
   op/gas-standalone/Code.gs
   GAS app ĐỘC LẬP: Listening Practice Through Dictation 1–4.

   Không phụ thuộc project TOEIC hiện tại, không dùng core.js,
   không dùng dữ liệu Hackers / ETS, không dùng Google Drive.

   Cấu hình tùy chọn (Project Settings → Script properties):
     LPTD_AUDIO_CDN_BASE = https://toeic-audio.netlify.app/audio/lptd
     LPTD_DOCS_CDN_BASE  = (để trống nếu chưa có PDF trên CDN)
     LPTD_RECORDING_ENGINE_URL = https://lfskcm2018.github.io/Toeic-lptd/recording-engine/

   Deploy: Deploy → New deployment → Web app
     Execute as: Me
     Who has access: Anyone (hoặc Anyone with Google account)
   ========================================================= */

var LPTD_DEFAULT_CDN_BASE = 'https://toeic-audio.netlify.app/audio/lptd';
var LPTD_DEFAULT_RECORDING_ENGINE_URL = 'https://lfskcm2018.github.io/Toeic-lptd/recording-engine/';

/** Trang web app. */
function doGet() {
  var template = HtmlService.createTemplateFromFile('Index');
  /* URL popup ghi âm (Recording Engine) — ghi đè được bằng Script Property. */
  template.RECORDING_ENGINE_URL = lptdRecordingEngineUrl_();
  return template.evaluate()
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

/** Lấy 1 unit theo book/unit. */
function getLptdUnit(book, unit) {
  var id = 'lptd-' + Number(book) + '-' + ('0' + Number(unit)).slice(-2);
  var list = lptdLessonsWithUrls_(lptdCdnBase_());
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
}

/* ---------- API lưu/lấy bản ghi âm Shadowing ---------- */

/**
 * Chạy MỘT LẦN trong Script Editor (chọn hàm → Run → Allow) để cấp quyền
 * Drive cho script. Sau đó web app mới lưu được bản ghi lên Drive.
 */
function authorizeLptdDrive() {
  try {
    var root = DriveApp.getRootFolder();
    Logger.log('Drive OK: ' + root.getName());
    return true;
  } catch (e) {
    Logger.log('LỖI Drive: ' + e.message);
    return false;
  }
}

/**
 * Quy ước khóa lưu bản ghi LPTD (dùng chung với UI):
 *   day        = book   (1..4)
 *   itemIndex  = unit * 100 + lineIndex   (unit 1..40, line 0..~10)
 * Ví dụ LPTD 2, Unit 17, câu 3 → day=2, itemIndex=1703.
 */
function lptdRecordingKey_(userId, day, itemIndex) {
  return 'recording:' + String(userId || 'anonymous') + ':' + Number(day) + ':' + Number(itemIndex);
}

/** Lưu bản ghi âm (.webm base64) lên Google Drive, trả URL phát lại. */
function saveUserRecording(userId, day, itemIndex, audioBase64, mimeType) {
  var uid = String(userId || 'anonymous');
  var d = Number(day);
  var idx = Number(itemIndex);
  var fileName = 'REC_' + uid + '_D' + String(d).padStart(2, '0') + '_I' + String(idx).padStart(2, '0') + '.webm';

  var bytes = Utilities.base64Decode(audioBase64);
  var blob = Utilities.newBlob(bytes, mimeType || 'audio/webm', fileName);

  var settings = {};
  try { settings = JSON.parse(PropertiesService.getScriptProperties().getProperty('RECORDING_SETTINGS') || '{}'); } catch (e) {}
  var recFolderId = settings.RECORDING_FOLDER_ID || '';
  var folder = null;
  if (recFolderId) {
    try { folder = DriveApp.getFolderById(recFolderId); } catch (e) { folder = null; }
  }
  if (!folder) {
    folder = DriveApp.getRootFolder();
  }

  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  var fileUrl = file.getUrl();
  var fileId = file.getId();

  // Lưu metadata vào PropertiesService (key: recording:{uid}:{d}:{idx})
  var metaKey = lptdRecordingKey_(uid, d, idx);
  var meta = {};
  try { meta = JSON.parse(PropertiesService.getScriptProperties().getProperty(metaKey) || '{}'); } catch (e) {}
  /* Ghi đè: dọn file cũ của cùng câu để Drive không bị đầy. */
  if (meta.fileId && meta.fileId !== fileId) {
    try { DriveApp.getFileById(meta.fileId).setTrashed(true); } catch (e) {}
  }
  meta.url = fileUrl;
  meta.fileId = fileId;
  meta.fileName = fileName;
  meta.userId = uid;
  meta.day = d;
  meta.itemIndex = idx;
  meta.ts = new Date().toISOString();
  PropertiesService.getScriptProperties().setProperty(metaKey, JSON.stringify(meta));

  return { url: fileUrl, fileId: fileId, fileName: fileName };
}

/** Lấy URL bản ghi âm đã lưu (nếu có). */
function getUserRecording(userId, day, itemIndex) {
  var uid = String(userId || 'anonymous');
  var d = Number(day);
  var idx = Number(itemIndex);
  var metaKey = lptdRecordingKey_(uid, d, idx);
  var meta = {};
  try { meta = JSON.parse(PropertiesService.getScriptProperties().getProperty(metaKey) || '{}'); } catch (e) {}
  return { url: String(meta.url || ''), fileId: String(meta.fileId || ''), fileName: String(meta.fileName || '') };
}

/**
 * Lấy TẤT CẢ URL bản ghi của 1 unit — một round-trip cho cả unit.
 * Trả: { "<lineIndex>": { url, ts } }
 */
function getUserRecordings(userId, day, unit) {
  var uid = String(userId || 'anonymous');
  var d = Number(day);
  var u = Number(unit);
  var prefix = 'recording:' + uid + ':' + d + ':';
  var out = {};
  try {
    var all = PropertiesService.getScriptProperties().getProperties() || {};
    Object.keys(all).forEach(function (key) {
      if (key.indexOf(prefix) !== 0) return;
      var idx = Number(key.slice(prefix.length));
      if (!isFinite(idx)) return;
      if (Math.floor(idx / 100) !== u) return;
      try {
        var meta = JSON.parse(all[key] || '{}');
        if (meta && meta.url) out[idx % 100] = { url: String(meta.url), ts: String(meta.ts || '') };
      } catch (e) {}
    });
  } catch (e) {}
  return out;
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
  Logger.log('Recording Engine: ' + lptdRecordingEngineUrl_());

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
