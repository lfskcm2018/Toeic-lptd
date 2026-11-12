/* =========================================================
   Code.gs — EPI Elementary Section A MVP web app
   ========================================================= */

var EPI_DEFAULT_CDN_BASE = 'https://lfskcm2018.github.io/Toeic-lptd/epu-audio';
var EPI_DEFAULT_RECORDING_ENGINE_URL = 'https://lfskcm2018.github.io/Toeic-lptd/recording-engine/';

function doGet() {
  var template = HtmlService.createTemplateFromFile('Index');
  template.RECORDING_ENGINE_URL = epiRecordingEngineUrl_();
  return template.evaluate()
    .setTitle('EPI Elementary — Section A')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function epiProp_(key, fallback) {
  try {
    var value = PropertiesService.getScriptProperties().getProperty(key);
    if (value != null && String(value).trim() !== '') return String(value).trim();
  } catch (e) { /* bỏ qua */ }
  return fallback || '';
}

function epiCdnBase_() {
  return String(epiProp_('EPI_AUDIO_CDN_BASE', EPI_DEFAULT_CDN_BASE)).replace(/\/+$/, '');
}

function epiRecordingEngineUrl_() {
  var url = String(epiProp_('EPI_RECORDING_ENGINE_URL', EPI_DEFAULT_RECORDING_ENGINE_URL)).trim();
  return url || EPI_DEFAULT_RECORDING_ENGINE_URL;
}

function epiUnitsWithUrls_() {
  var base = epiCdnBase_();
  return EPI_UNITS().map(function (u) {
    return {
      id: u.id,
      unit: u.unit,
      title: u.title,
      focus: u.focus,
      sounds: u.sounds,
      explanation: u.explanation,
      sentences: u.sentences,
      exercises: u.exercises,
      audioTracks: (u.audioTracks || []).map(function (t) { return base + '/CD1-Track' + t + '.mp3'; })
    };
  });
}

function getEPIBootstrap() {
  var units = epiUnitsWithUrls_();
  return {
    configured: true,
    cdnBase: epiCdnBase_(),
    meta: EPI_UNITS_META(),
    lessonCount: units.length,
    lessons: units
  };
}

function debugEPI() {
  var units = epiUnitsWithUrls_();
  var lines = 0, words = 0;
  units.forEach(function (u) {
    lines += u.sentences.length + u.exercises.length;
    u.sentences.forEach(function (s) { words += s.split(/\s+/).length; });
  });
  Logger.log('EPI Elementary Section A: %s unit | %s câu | %s từ', units.length, lines, words);
  Logger.log('CDN: %s', epiCdnBase_());
  [0, 4, 9].forEach(function (i) {
    var u = units[i];
    if (!u) return;
    Logger.log('Unit %s — %s', u.unit, u.title);
    try {
      var res = UrlFetchApp.fetch(u.audioTracks[0], { method: 'get', headers: { Range: 'bytes=0-0' }, muteHttpExceptions: true });
      Logger.log('  audio -> HTTP %s', res.getResponseCode());
    } catch (e) {
      Logger.log('  audio -> LỖI %s', e.message);
    }
  });
}
