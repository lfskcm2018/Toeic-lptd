/* =========================================================
   Code.gs — Backend API cho Web App Dictation & Shadowing
   Google Apps Script + Google Sheets
   Deploy: tạo Project Apps Script mới → dán this + Data.gs →
   Deploy > New deployment > Web app (Execute as: Me).
   ========================================================= */

var SHEET_LESSONS = 'Lessons';
var SHEET_PROGRESS = 'Progress';
var SHEET_SETTINGS = 'Settings';

/* ---------------------------------------------------------
   do  Get: render SPA hoặc proxy audio MP3 từ Drive
   --------------------------------------------------------- */
function doGet(e) {
  if (e.parameter && e.parameter.audioId) {
    return proxyAudio_(e.parameter.audioId);
  }
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('Hackers TOEIC 700+ — Dictation & Shadowing')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Proxy file MP3 từ Google Drive với header phù hợp cho HTML5 <audio> */
function proxyAudio_(fileId) {
  try {
    var file = DriveApp.getFileById(fileId);
    var blob = file.getBlob();
    blob.setContentType('audio/mpeg');
    Logger.log('[PROXY] fileId=' + fileId + ' name=' + file.getName() + ' bytes=' + blob.getBytes().length);
    return ContentService.createOutput(blob)
      .setMimeType('audio/mpeg')
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'public, max-age=3600',
        'Content-Disposition': 'inline'
      });
  } catch (e) {
    Logger.log('[PROXY ERROR] fileId=' + fileId + ' err=' + e.toString());
    return ContentService.createTextOutput('Audio proxy error: ' + e.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

/** Helper để Index.html include Stylesheet/JavaScript */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/* ---------------------------------------------------------
   Database (Spreadsheet) — tạo lần đầu + cache
   --------------------------------------------------------- */
var dbCache_ = null;

function getDb_() {
  if (dbCache_) return dbCache_;
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('DB_SPREADSHEET_ID');
  var ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.create('Hackers TOEIC DB — Dictation & Shadowing');
  if (!id) {
    props.setProperty('DB_SPREADSHEET_ID', ss.getId());
    setupDatabase_Into_(ss);
  }
  dbCache_ = ss;
  return ss;
}

function getSheet_(ss, name) {
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    setHeaders_(sh, name);
  }
  return sh;
}

function setHeaders_(sh, name) {
  var headers = name === SHEET_LESSONS
    ? ['day', 'track', 'no', 'transcript_full', 'translation', 'audio_track_name', 'speaker']
    : name === SHEET_PROGRESS
      ? ['user_id', 'day', 'mode', 'score', 'completed', 'updated_at']
      : ['key', 'value'];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  sh.setFrozenRows(1);
}

/** Chạy 1 lần (từ menu/nút trong editor): tạo Sheet Lessons + Progress + seed 20 DAY */
function setupDatabase() {
  var ss = getDb_();
  setupDatabase_Into_(ss);
  var url = ss.getUrl();
  Logger.log('DB Spreadsheet: ' + url);
  return url;
}

function setupDatabase_Into_(ss) {
  var ls = getSheet_(ss, SHEET_LESSONS);
  getSheet_(ss, SHEET_PROGRESS);
  getSheet_(ss, SHEET_SETTINGS);

  // Nâng cấp sheet cũ (6 cột) lên 7 cột có speaker
  if (ls.getLastColumn() < 7 || String(ls.getRange(1, 7).getValue()) !== 'speaker') {
    ls.getRange(1, 7).setValue('speaker');
  }

  if (ls.getLastRow() > 1) return; // đã có dữ liệu

  // Seed toàn bộ transcript 20 DAY từ LessonData.gs.
  // Nếu chưa thêm file LessonData.gs, tạo khung trống để nhập tay.
  var rows = [];
  if (typeof LESSON_DATA !== 'undefined') {
    Object.keys(LESSON_DATA).map(Number).sort(function (a, b) { return a - b; }).forEach(function (d) {
      var day = LESSON_DATA[d];
      (day.items || []).forEach(function (it) {
        rows.push([
          d,
          String(it.track || '1'),
          Number(it.no) || rows.length + 1,
          it.en || '',
          it.vi || '',
          AUDIO_NAME_(d, String(it.track || '1')),
          it.spk || '',
        ]);
      });
    });
  }

  if (!rows.length) {
    // Fallback: khung trống 10 câu/track để nhập transcript thủ công
    for (var d2 = 1; d2 <= 20; d2++) {
      var tracks = (d2 >= 10) ? ['1', '2'] : ['1'];
      tracks.forEach(function (tr) {
        for (var i = 1; i <= 10; i++) {
          rows.push([d2, tr, i, '', '', AUDIO_NAME_(d2, tr), '']);
        }
      });
    }
  }
  ls.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

/* ---------------------------------------------------------
   API 1/3: getLessonsList(userId) → phân loại 20 DAY theo Part
   --------------------------------------------------------- */
function getLessonsList(userId) {
  var uid = String(userId || 'anonymous');
  var parts = PARTS_OFFICIAL.map(function (part) {
    return {
      key: part.key,
      label: part.label,
      icon: part.icon,
      days: part.days.map(function (d) {
        return {
          day: d,
          part: part.key,
          title: (typeof LESSON_DATA !== 'undefined' && LESSON_DATA[d]) ? LESSON_DATA[d].title : '',
          tracks: audioTracksForDay_(d),
        };
      }),
    };
  });
  return { parts: parts, progress: loadProgress_(uid), uid: uid };
}

/* Wraps DAY -> [{key, name, url}] giống frontend local (data.js) */
function audioTracksForDay_(day) {
  var names = (day >= 10) ? ['DAY_' + pad0_(day) + '_1', 'DAY_' + pad0_(day) + '_2'] : ['DAY_' + pad0_(day)];
  return names.map(function (n, i) {
    return { key: String(i + 1), name: n, url: audioUrl_(n) };
  });
}

/* ---------------------------------------------------------
   API 2/3: getLessonData(userId, day) → audio + items + progress
   --------------------------------------------------------- */
function getLessonData(userId, day) {
  var uid = String(userId || 'anonymous');
  day = Number(day);
  var d = (typeof LESSON_DATA !== 'undefined' && LESSON_DATA[day]) ? LESSON_DATA[day] : null;
  return {
    day: day,
    title: d ? d.title : '',
    tracks: audioTracksForDay_(day),
    items: readLessonItems_(day),
    progress: loadProgress_(uid)[String(day)] || null,
  };
}

/* ---------------------------------------------------------
   API 3/3: saveUserProgress(userId, dayId, mode, score, completed)
   --------------------------------------------------------- */
function saveUserProgress(userId, dayId, mode, score, completed) {
  var uid = String(userId || 'anonymous');
  var day = Number(dayId);
  mode = String(mode || 'dictation');
  var ss = getDb_();
  var sh = getSheet_(ss, SHEET_PROGRESS);
  var values = sh.getDataRange().getValues();
  var now = new Date();

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === uid && Number(values[i][1]) === day && values[i][2] === mode) {
      sh.getRange(i + 1, 4, 1, 3).setValues([[
        score === null ? values[i][3] : Number(score),
        score === null ? values[i][4] : !!completed,
        now,
      ]]);
      return true;
    }
  }
  sh.appendRow([uid, day, mode, score, !!completed, now]);
  return true;
}

/* ---------------------------------------------------------
   API 4/4: saveUserRecording(userId, day, itemIndex, audioBase64, mimeType)
   Lưu bản ghi âm Shadowing lên Google Drive, trả URL phát lại.
   --------------------------------------------------------- */
function saveUserRecording(userId, day, itemIndex, audioBase64, mimeType) {
  var uid = String(userId || 'anonymous');
  var d = Number(day);
  var idx = Number(itemIndex);
  var ss = getDb_();
  var sh = getSheet_(ss, SHEET_PROGRESS);
  var values = sh.getDataRange().getValues();
  var now = new Date();
  var fileName = 'REC_' + uid + '_D' + String(d).padStart(2, '0') + '_I' + String(idx).padStart(2, '0') + '.webm';

  var bytes = Utilities.base64Decode(audioBase64);
  var blob = Utilities.newBlob(bytes, mimeType || 'audio/webm', fileName);

  var settings = settingsMap_();
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

  var found = false;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === uid && Number(values[i][1]) === d && Number(values[i][2]) === idx) {
      sh.getRange(i + 1, 4, 1, 2).setValues([[fileUrl, now]]);
      found = true;
      break;
    }
  }
  if (!found) {
    sh.appendRow([uid, d, idx, fileUrl, now]);
  }

  return { url: fileUrl, fileId: fileId, fileName: fileName };
}

/* ---------------------------------------------------------
   API 5/5: getUserRecording(userId, day, itemIndex)
   Lấy URL bản ghi âm đã lưu (nếu có).
   --------------------------------------------------------- */
function getUserRecording(userId, day, itemIndex) {
  var uid = String(userId || 'anonymous');
  var d = Number(day);
  var idx = Number(itemIndex);
  var ss = getDb_();
  var sh = getSheet_(ss, SHEET_PROGRESS);
  var values = sh.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === uid && Number(values[i][1]) === d && Number(values[i][2]) === idx) {
      return { url: String(values[i][3] || '') };
    }
  }
  return { url: '' };
}

/** Resolve ETS assets from configured Drive folders. Files must be direct children. */
function getETSResourceLinks() {
  var settings = settingsMap_();
  var audioFolderId = settings.ETS_AUDIO_FOLDER_ID || '';
  var docsFolderId = settings.ETS_DOCS_FOLDER_ID || '';
  // M13: ưu tiên CDN (Netlify default, hoặc R2/GCS nếu Settings khác)
  var r2Base = audioCdnBase_();
  if (r2Base) {
    var audioR2 = {};
    for (var t = 1; t <= 10; t++) {
      var code = 'E26-T' + ('0' + t).slice(-2) + '-';
      for (var q = 1; q <= 31; q++) audioR2[code + ('0' + q).slice(-2) + '.mp3'] = r2Base + '/ets/' + code + ('0' + q).slice(-2) + '.mp3';
      for (var g = 32; g <= 98; g += 3) {
        // KHỚP FRONTEND (ets-data.js, etsPad): nhóm cuối = "98-100" (3 số), KHÔNG phải "98-00"
        var end = g + 2;
        var gl = ('0' + g).slice(-2) + '-' + (end >= 100 ? end : ('0' + end).slice(-2));
        audioR2[code + gl + '.mp3'] = r2Base + '/ets/' + code + gl + '.mp3';
      }
    }
    // [M13-fix] Tài liệu vẫn lấy từ Drive, NHƯNG không được chặn audio:
    // scan lỗi → documents = {} (clip material bị disable, audio vẫn chạy từ CDN).
    var docs = {};
    try { if (docsFolderId) docs = scanETSFolder_(docsFolderId, false); } catch (e) { docs = {}; }
    return {
      configured: true,
      source: 'r2',
      audio: audioR2,
      documents: docs,
    };
  }
  if (!audioFolderId || !docsFolderId) {
    return {
      configured: false,
      missingSettings: [
        !audioFolderId ? 'ETS_AUDIO_FOLDER_ID' : '',
        !docsFolderId ? 'ETS_DOCS_FOLDER_ID' : '',
      ].filter(String),
    };
  }
  return {
    configured: true,
    audio: scanETSFolder_(audioFolderId, true),
    documents: scanETSFolder_(docsFolderId, false),
  };
}

/* ============ Tiện ích ============ */

function loadProgress_(uid) {
  var sh = getSheet_(getDb_(), SHEET_PROGRESS);
  var values = sh.getDataRange().getValues();
  var out = {};
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) !== uid) continue;
    var day = String(values[i][1]);
    out[day] = out[day] || {};
    out[day][values[i][2]] = {
      score: values[i][3],
      completed: !!values[i][4],
      updated_at: String(values[i][5] || ''),
    };
  }
  return out;
}

/** Đọc câu hỏi dictation của 1 DAY.
 * M14: ưu tiên LESSON_DATA (LessonData.gs — có dictation + blanks tường minh).
 * Falls back Sheet Lessons (legacy, không có dictation) khi LESSON_DATA thiếu. */
function readLessonItems_(day) {
  var items = [];
  // (1) Ưu tiên LESSON_DATA (schema M14: en/dictation/blanks)
  if (typeof LESSON_DATA !== 'undefined' && LESSON_DATA[day]) {
    items = (LESSON_DATA[day].items || []).map(function (it) {
      return {
        no: Number(it.no) || 0,
        track: String(it.track || '1'),
        en: String(it.en || ''),
        vi: String(it.vi || ''),
        spk: String(it.spk || ''),
        dictation: String(it.dictation || ''),
        blanks: Array.isArray(it.blanks) ? it.blanks : [],
      };
    });
    if (items.length) return items;
  }
  // (2) Dự phòng: Sheet Lessons (legacy transcript_full, không có dictation/blanks)
  var sh = getSheet_(getDb_(), SHEET_LESSONS);
  var values = sh.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (Number(values[i][0]) !== day) continue;
    if (!values[i][3]) continue;
    items.push({
      no: Number(values[i][2]) || items.length + 1,
      track: String(values[i][1] || '1'),
      en: String(values[i][3]),
      vi: String(values[i][4] || ''),
      spk: String(values[i][6] || ''),
      dictation: '',
      blanks: [],
    });
  }
  return items;
}

/**
 * URL audio Drive.
 * 2 cách cấu hình trong Sheet Settings (key/value):
 *  - AUDIO_URL_PREFIX: folder Drive công khai chứa MP3, dùng dạng folder id
 *    (được phép: https://drive.google.com/uc?export=download&id=<FILE_ID>)
 *  - AUDIO_FILE_<KC: dạng ['DAY_01','<file_id>',...] ngắt dòng.
 * Nếu thiếu trả về rỗng → frontend hiện cảnh báo.
 */
function audioUrl_(name) {
  // M13: ưu tiên Cloudflare R2 nếu đã cấu hình R2_AUDIO_BASE_URL (không phụ thuộc Drive)
  var r2 = r2AudioUrlFor_('hackers', name + '.mp3');
  if (r2) return r2;
  var map = audioFileMap_();
  var id = map[name];
  if (!id) return '';
  // M12 v24 — fallback Drive: direct Drive URL (nặc danh, CORS=*, confirm=t chặn
  // virus-scan interstitial). WEBAPP_URL không còn dùng cho audio (proxy bị login-wall).
  return 'https://drive.google.com/uc?export=download&confirm=t&id=' + encodeURIComponent(id);
}

/** M13/Netlify: base URL audio CDN.
 * - Mặc định (Settings trống): Netlify https://toeic-audio.netlify.app/audio (731 MP3, free,
 *   không login-wall, CORS=*, HTTP Range → tua được).
 * - Override: Sheet Settings `R2_AUDIO_BASE_URL` = 1 URL khác (VD GCS/R2 sau này).
 * - Rollback về Drive (M12 v24): `applyR2BaseUrl('DISABLE')` → Settings = 'DISABLE'. */
function audioCdnBase_() {
  var s = String(settingsMap_().R2_AUDIO_BASE_URL || '').replace(/\/+$/, '').trim();
  if (!s) return 'https://toeic-audio.netlify.app/audio'; // M13: Netlify là nguồn audio chính
  if (s === 'DISABLE') return '';                         // rollback Drive
  return s;
}

/* M13 (Cloudflare R2/CDN): trả URL phát trực tiếp từ CDN (base = audioCdnBase_).
 * Trả '' → caller tự fallback Drive. Cấu trúc object key: <base>/hackers/<name>.mp3 */
function r2AudioUrlFor_(subdir, fileName) {
  var base = audioCdnBase_();
  if (!base) return '';
  return base + '/' + subdir + '/' + fileName;
}

/** Đọc bảng ánh xạ tên-file → fileId. Hỗ trợ: gõ tay trong Settings, hoặc
 *  tự dò trong folder Drive nếu định nghĩa AUDIO_FOLDER_ID. */
function audioFileMap_() {
  var sh = getSheet_(getDb_(), SHEET_SETTINGS);
  var values = sh.getDataRange().getValues();
  var map = {};
  var folderId = '';
  for (var i = 1; i < values.length; i++) {
    var k = String(values[i][0] || '').trim();
    var v = String(values[i][1] || '').trim();
    if (k === 'AUDIO_FOLDER_ID') folderId = v;
    else if (k.indexOf('AUDIO_FILE_') === 0) {
      var rawKey = k.slice(11);
      map[rawKey] = v;
      var stdKey = rawKey.replace(/^받아쓰기_/, '');
      stdKey = stdKey.replace(/^DAY_?(\d{2})_?(\d+)?$/, function (m, d, t) {
        return 'DAY_' + d + (t ? '_' + t : '');
      });
      if (stdKey !== rawKey) map[stdKey] = v;
    }
  }
  // Quét Drive để lấy danh sách file mới nhất (luôn làm khi có folderId)
  // Không sửa Sheet ở đây — chỉ sửa Sheet khi gọi forceRescanAudio() rõ ràng
  if (folderId) {
    var scanned = scanDriveFolder_(folderId);
    Object.keys(scanned).forEach(function (k) { map[k] = scanned[k]; });
  }
  return map;
}

function settingsMap_() {
  var values = getSheet_(getDb_(), SHEET_SETTINGS).getDataRange().getValues();
  var settings = {};
  for (var i = 1; i < values.length; i++) {
    var key = String(values[i][0] || '').trim();
    if (key) settings[key] = String(values[i][1] || '').trim();
  }
  return settings;
}

/* M12 v24 + M13: audio trả direct Drive URL (nặc danh, CORS=*); docs giữ URL Drive public. */
function scanETSFolder_(folderId, audioOnly) {
  var files = DriveApp.getFolderById(folderId).getFiles();
  var result = {};
  while (files.hasNext()) {
    var file = files.next();
    var name = String(file.getName());
    if (audioOnly && !/\.mp3$/i.test(name)) continue;
    if (!audioOnly && !/\.(pdf|docx)$/i.test(name)) continue;
    if (audioOnly) {
      result[name] = 'https://drive.google.com/uc?export=download&confirm=t&id=' + encodeURIComponent(file.getId());
    } else {
      result[name] = file.getUrl();
    }
  }
  return result;
}

/** Quét folder Drive lấy tất cả file .mp3: tên không đuôi → fileId */
function scanDriveFolder_(folderId) {
  var it = DriveApp.getFolderById(folderId).getFiles();
  var map = {};
  while (it.hasNext()) {
    var f = it.next();
    var name = String(f.getName()).replace(/\.mp3$/i, '');
    // Chuẩn hóa: bỏ prefix '받아쓰기_' nếu có
    var stdName = name.replace(/^받아쓰기_/, '');
    // Chuẩn hóa tên file: DAY01, DAY_01, DAY11_1, DAY_11_1 → DAY_01, DAY_11_1
    var m = stdName.match(/^DAY_?(\d{2})_?(\d+)?$/);
    if (m) {
      stdName = 'DAY_' + m[1] + (m[2] ? '_' + m[2] : '');
    }
    map[stdName] = f.getId();
  }
  return map;
}

function AUDIO_NAME_(day, track) {
  return (day >= 10 ? 'DAY_' + pad0_(day) + '_' + track : 'DAY_' + pad0_(day));
}
function pad0_(n) { return ('0' + Number(n)).slice(-2); }

/* ============ Debug / Diagnostic ============ */

/** Chạy từ GAS Editor để kiểm tra cài đặt audio: log Settings + file map */
function debugAudioSetup() {
  var settings = settingsMap_();
  Logger.log('=== Settings keys ===');
  Object.keys(settings).forEach(function (k) { Logger.log(k + ' = ' + settings[k]); });
  var folderId = settings.AUDIO_FOLDER_ID || '';
  Logger.log('AUDIO_FOLDER_ID: "' + folderId + '"');
  var map = audioFileMap_();
  Logger.log('=== Audio file map (' + Object.keys(map).length + ' entries) ===');
  Object.keys(map).sort().forEach(function (k) { Logger.log(k + ' -> ' + map[k]); });
  var missing = [];
  for (var d = 1; d <= 20; d++) {
    var names = (d >= 10) ? ['DAY_' + pad0_(d) + '_1', 'DAY_' + pad0_(d) + '_2'] : ['DAY_' + pad0_(d)];
    names.forEach(function (n) { if (!map[n]) missing.push(n); });
  }
  Logger.log('=== Missing track names (' + missing.length + ') ===');
  missing.forEach(function (m) { Logger.log(m); });
}

/** Chạy từ GAS Editor để kiểm tra getLessonsList có lỗi gì */
function debugGetLessonsList() {
  try {
    var result = getLessonsList('debug_user');
    Logger.log('=== getLessonsList result ===');
    Logger.log('parts count: ' + (result.parts ? result.parts.length : 0));
    if (result.parts) {
      result.parts.forEach(function (part) {
        Logger.log('Part: ' + part.key + ' - ' + part.label);
        part.days.forEach(function (d) {
          var tracks = d.tracks || [];
          Logger.log('  DAY ' + d.day + ' tracks: ' + tracks.map(function (t) { return t.key + ':' + (t.url ? 'HAS_URL' : 'NO_URL'); }).join(', '));
        });
      });
    }
    return result;
  } catch (e) {
    Logger.log('=== getLessonsList ERROR ===');
    Logger.log(e.toString());
    Logger.log(e.stack);
    throw e;
  }
}

/** Buộc quét lại folder Drive và ghi cache AUDIO_FILE_* trong Sheet Settings */
function forceRescanAudio(folderId) {
  if (!folderId) {
    var settings = settingsMap_();
    folderId = settings.AUDIO_FOLDER_ID || '';
  }
  if (!folderId) return 'Lỗi: thiếu AUDIO_FOLDER_ID';
  var map = scanDriveFolder_(folderId);
  var sh = getSheet_(getDb_(), SHEET_SETTINGS);
  var values = sh.getDataRange().getValues();
  var rowsToDelete = [];
  for (var i = values.length - 1; i >= 1; i--) {
    if (String(values[i][0] || '').trim().indexOf('AUDIO_FILE_') === 0) rowsToDelete.push(i + 1);
  }
  rowsToDelete.forEach(function (r) { sh.deleteRow(r); });
  var rows = Object.keys(map).map(function (k) { return ['AUDIO_FILE_' + k, map[k]]; });
  if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, 2).setValues(rows);
  Logger.log('Đã quét ' + Object.keys(map).length + ' file MP3 từ folder ' + folderId);
  return 'Đã quét ' + Object.keys(map).length + ' file MP3.';
}

/** M13: chẩn đoán audio (R2 ưu tiên, Drive fallback) — chạy trong GAS Editor */
function diagnoseAudio() {
  var out = { check: 'diagnoseAudio (Agnes)', ts: new Date().toISOString() };
  try {
    var settings = settingsMap_();
    out.settingsKeys = Object.keys(settings);
    out.R2_AUDIO_BASE_URL = settings.R2_AUDIO_BASE_URL || '(trống → dùng CDN mặc định Netlify)';
    out.audioCdnBase_ = audioCdnBase_() + ' (mặc định Netlify, hoặc Settings, hoặc DISABLE=Drive)';
    out.AUDIO_FOLDER_ID = settings.AUDIO_FOLDER_ID || '(THIẾU)';
    out.ETS_AUDIO_FOLDER_ID = settings.ETS_AUDIO_FOLDER_ID || '(THIẾU)';
    out.ETS_DOCS_FOLDER_ID = settings.ETS_DOCS_FOLDER_ID || '(THIẾU)';
    out.scriptId = ScriptApp.getScriptId();
    var map = audioFileMap_();
    out.audioMapSize = Object.keys(map).length;
    ['DAY_01', 'DAY_10_1', 'DAY_10_2', 'DAY_20_2'].forEach(function (n) {
      out[n] = 'url: ' + audioUrl_(n) || '(KHÔNG CÓ)';
    });
  } catch (e) { out.ERROR = String(e); }
  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

/** Chạy trong GAS Editor: kiểm tra Drive có đọc được 1 MP3. */
function testAudioProxy() {
  try {
    var id = audioFileMap_()['DAY_01'] || '';
    if (!id) return 'THẤT BẠI: không tìm thấy DAY_01 trong map. Kiểm tra AUDIO_FOLDER_ID (chạy diagnoseAudio()).';
    var file = DriveApp.getFileById(id);
    var blob = file.getBlob();
    return 'OK: đọc được "' + file.getName() + '" (' + Math.round(blob.getBytes().length / 1024) + ' KB, ' +
      blob.getContentType() + '). File có thể share "Anyone with the link" để dùng direct Drive URL fallback.';
  } catch (e) {
    return 'LỖI: ' + e;
  }
}

/** M13: kiểm tra quick base audio CDN (mặc định Netlify, hoặc Settings). */
function testR2Audio() {
  var base = audioCdnBase_();
  if (!base) return 'CDN DISABLE → đang dùng fallback Drive (M12 v24).';
  return 'Audio CDN base = ' + base + ' (mặc định Netlify. Verify: node Agnes/tools/verify-audio-base.js ' + base + ')';
}

/** M13: SET/XOÁ/ROLBACK base audio CDN trong Sheet Settings (chạy trong GAS Editor).
 * - activate CDN:  applyR2BaseUrl('https://toeic-audio.netlify.app/audio')
 * - rollback Drive: applyR2BaseUrl('DISABLE')  (Settings = DISABLE → audioCdnBase_() trả ''
 *   → code tự fallback Drive M12 v24, không cần redeploy)
 * - dùng mặc định Netlify: applyR2BaseUrl('')  (xóa Settings → fallback default Netlify) */
function applyR2BaseUrl(url) {
  url = String(url || '').trim();
  var sh = getSheet_(getDb_(), SHEET_SETTINGS);
  var values = sh.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0] || '').trim() === 'R2_AUDIO_BASE_URL') {
      if (url) {
        sh.getRange(i + 1, 2).setValue(url);
        return 'Đã CẬP NHẬT R2_AUDIO_BASE_URL = ' + url;
      } else {
        sh.getRange(i + 1, 2).clear();
        return 'Đã XÓA R2_AUDIO_BASE_URL (rollback Drive M12 v24).';
      }
    }
  }
  if (!url) return 'R2_AUDIO_BASE_URL không tồn tại — không cần làm gì.';
  sh.appendRow(['R2_AUDIO_BASE_URL', url]);
  return 'Đã THÊM R2_AUDIO_BASE_URL = ' + url + ' vào Sheet Settings.';
}

/* ============ Cấu trúc giáo trình (const) ============ */
var PARTS_OFFICIAL = [
  { key: 'basics', label: 'Listening Basics', icon: '🎧', days: [1, 2] },
  { key: 'part1',  label: 'Part 1 — Mô tả hình ảnh', icon: '📸', days: [3, 4] },
  { key: 'part2',  label: 'Part 2 — Hỏi & Đáp', icon: '❓', days: [5, 6, 7, 8, 9] },
  { key: 'part3',  label: 'Part 3 — Hội thoại ngắn', icon: '🗣️', days: [10, 11, 12, 13, 14, 15] },
  { key: 'part4',  label: 'Part 4 — Bài nói ngắn', icon: '📢', days: [16, 17, 18, 19, 20] },
];


