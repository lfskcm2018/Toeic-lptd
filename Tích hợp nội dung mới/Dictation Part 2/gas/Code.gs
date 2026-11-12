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
 * Chẩn đoán quyền: chạy hàm này trong Script Editor rồi xem Execution log.
 * - status NOT_REQUIRED nhưng Drive vẫn lỗi → manifest chưa nạp (F5 editor).
 * - status REQUIRED → mở authUrl rồi Allow.
 * - tokenInfo không có .../auth/drive → chưa được cấp scope Drive.
 */
function lptdAuthDiagnostics() {
  var out = {};
  try {
    var info = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
    out.status = String(info.getAuthorizationStatus());
    out.authUrl = out.status.indexOf('REQUIRED') === 0 ? info.getAuthorizationUrl() : '';
  } catch (e) {
    out.scriptAppError = e.message;
  }
  try {
    var token = ScriptApp.getOAuthToken();
    var res = UrlFetchApp.fetch(
      'https://oauth2.googleapis.com/tokeninfo?access_token=' + encodeURIComponent(token),
      { muteHttpExceptions: true }
    );
    var j = {};
    try { j = JSON.parse(res.getContentText()); } catch (e2) { j = { raw: res.getContentText().slice(0, 300) }; }
    out.scopes = j.scope || j.raw || null;
    out.hasDriveScope = !!(j.scope && j.scope.indexOf('/auth/drive') !== -1);
  } catch (e) {
    out.tokenError = e.message;
  }
  try {
    out.driveRoot = DriveApp.getRootFolder().getName();
  } catch (e) {
    out.driveError = String(e.message).slice(0, 220);
  }
  Logger.log(JSON.stringify(out, null, 2));
  return out;
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

/**
 * Thư mục Drive chứa bản ghi (mặc định "LPTD Recordings" ở My Drive).
 * Có thể chỉ định thư mục khác: Script Property RECORDING_FOLDER_ID = <folderId>.
 */
function lptdRecordingFolder_() {
  var props = PropertiesService.getScriptProperties();
  var settings = {};
  try { settings = JSON.parse(props.getProperty('RECORDING_SETTINGS') || '{}'); } catch (e) { settings = {}; }
  var folderId = settings.RECORDING_FOLDER_ID || props.getProperty('RECORDING_FOLDER_ID') || '';
  if (folderId) {
    try { return DriveApp.getFolderById(folderId); } catch (e) {}
  }
  var name = 'LPTD Recordings';
  var it = DriveApp.getFoldersByName(name);
  var folder = it.hasNext() ? it.next() : DriveApp.createFolder(name);
  settings.RECORDING_FOLDER_ID = folder.getId();
  props.setProperty('RECORDING_SETTINGS', JSON.stringify(settings));
  return folder;
}

/** Lưu bản ghi âm (.webm base64) lên Google Drive, trả URL phát lại. */
function saveUserRecording(userId, day, itemIndex, audioBase64, mimeType) {
  var uid = String(userId || 'anonymous');
  var d = Number(day);
  var idx = Number(itemIndex);
  var mime = String(mimeType || 'audio/webm');
  var ext = 'webm';
  if (/wav/i.test(mime)) ext = 'wav';
  else if (/mp4|m4a|aac/i.test(mime)) ext = 'm4a';
  else if (/ogg|opus/i.test(mime)) ext = 'ogg';
  else if (/mpeg|mp3/i.test(mime)) ext = 'mp3';
  var fileName = 'REC_' + uid + '_D' + String(d).padStart(2, '0') + '_I' + String(idx).padStart(2, '0') + '.' + ext;

  var bytes = Utilities.base64Decode(audioBase64);
  var blob = Utilities.newBlob(bytes, mime, fileName);

  var folder = lptdRecordingFolder_();

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

/** Xoá 1 bản ghi (trash file Drive + xoá metadata) — dùng khi người học muốn ghi lại/xoá. */
function lptdDeleteRecording(userId, day, itemIndex) {
  var uid = String(userId || 'anonymous');
  var d = Number(day);
  var idx = Number(itemIndex);
  var props = PropertiesService.getScriptProperties();
  var key = lptdRecordingKey_(uid, d, idx);
  var meta = {};
  try { meta = JSON.parse(props.getProperty(key) || '{}'); } catch (e) {}
  if (meta.fileId) { try { DriveApp.getFileById(meta.fileId).setTrashed(true); } catch (e) {} }
  try { props.deleteProperty(key); } catch (e) {}
  return { deleted: true };
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

  ['DP2U01.mp3', 'DP2U06.mp3', 'DP2U11.mp3'].forEach(function (name) {
    var url = lptdCdnBase_() + '/' + name;
    try {
      var res = UrlFetchApp.fetch(url, { method: 'get', headers: { Range: 'bytes=0-0' }, muteHttpExceptions: true });
      Logger.log('  ' + url + ' → HTTP ' + res.getResponseCode());
    } catch (e) {
      Logger.log('  ' + url + ' → LỖI: ' + e.message);
    }
  });
}


/* ---------- Alias tương thích UI bundle (LPTD_*) ---------- */
function LPTD_LESSONS_META() { return DP2_LESSONS_META(); }
function LPTD_LESSONS() { return DP2_LESSONS(); }
