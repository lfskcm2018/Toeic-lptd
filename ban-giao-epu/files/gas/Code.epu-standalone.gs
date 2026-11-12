/* =========================================================
   Code.gs — EPI Elementary web app (50 unit + Section E)
   ========================================================= */

var EPI_DEFAULT_CDN_BASE = 'https://lfskcm2018.github.io/Toeic-lptd/epu-audio';
var EPI_DEFAULT_RECORDING_ENGINE_URL = 'https://lfskcm2018.github.io/Toeic-lptd/recording-engine/';

function doGet() {
  var template = HtmlService.createTemplateFromFile('Index');
  template.RECORDING_ENGINE_URL = epiRecordingEngineUrl_();
  return template.evaluate()
    .setTitle('EPI Elementary — 50 unit + Section E')
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
      section: u.section,
      cd: u.cd,
      title: u.title,
      focus: u.focus,
      sounds: u.sounds,
      page: u.page,
      sentences: u.sentences,
      words: u.words,
      exercises: u.exercises,
      trackRange: u.trackRange,
      audioTracks: (u.audioTracks || []).map(function (t) { return base + '/' + t; })
    };
  });
}

function epiSectionEWithUrls_() {
  var base = epiCdnBase_();
  return EPI_SECTION_E().map(function (e) {
    var o = {};
    Object.keys(e).forEach(function (k) { o[k] = e[k]; });
    o.audioTracks = (e.audioTracks || []).map(function (t) { return base + '/' + t; });
    if (o.pairs) {
      o.pairs = o.pairs.map(function (p) {
        return { n: p.n, a: p.a, b: p.b, audio: base + '/' + p.audio };
      });
    }
    return o;
  });
}

function getEPIBootstrap() {
  var units = epiUnitsWithUrls_();
  var sectionE = epiSectionEWithUrls_();
  return {
    configured: true,
    cdnBase: epiCdnBase_(),
    meta: EPI_META(),
    lessonCount: units.length,
    lessons: units,
    sectionE: sectionE,
    sectionECount: sectionE.length
  };
}

function debugEPI() {
  var units = epiUnitsWithUrls_();
  var sectionE = epiSectionEWithUrls_();
  var lines = 0, words = 0, answers = 0;
  units.forEach(function (u) {
    lines += u.sentences.length + u.exercises.length;
    u.sentences.forEach(function (s) { words += s.split(/\s+/).length; });
    answers += u.exercises.filter(function (e) { return !!e.answer; }).length;
  });
  Logger.log('EPI Elementary: %s unit | %s dòng | %s từ | %s đáp án | Section E %s mục',
    units.length, lines, words, answers, sectionE.length);
  Logger.log('CDN: %s', epiCdnBase_());
  var samples = [
    units[0] && units[0].audioTracks[0],
    units[24] && units[24].audioTracks[0],
    units[49] && units[49].audioTracks[0],
    sectionE[0] && sectionE[0].audioTracks[0],
    sectionE[2] && sectionE[2].pairs && sectionE[2].pairs[0] && sectionE[2].pairs[0].audio
  ];
  samples.forEach(function (u) {
    if (!u) return;
    try {
      var res = UrlFetchApp.fetch(u, { method: 'get', headers: { Range: 'bytes=0-0' }, muteHttpExceptions: true });
      Logger.log('  %s -> HTTP %s', u.split('/').pop(), res.getResponseCode());
    } catch (e) {
      Logger.log('  %s -> LỖI %s', u.split('/').pop(), e.message);
    }
  });
}
