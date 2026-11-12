/* =========================================================
   Code.h600.gs — server helper cho 600+
   Standalone: book 1; tích hợp dự án tổng: book 7.
   ========================================================= */

var H600_BOOK = 1;
var H600_BOOK_INTEGRATED = 7;
var H600_DEFAULT_CDN_BASE = 'https://toeic-audio.netlify.app/audio/600plus';

function h600CdnBase_() {
  var base = '';
  try {
    if (typeof lptdProp_ === 'function') {
      base = lptdProp_('H600_AUDIO_CDN_BASE', H600_DEFAULT_CDN_BASE);
    } else {
      base = PropertiesService.getScriptProperties().getProperty('H600_AUDIO_CDN_BASE') || H600_DEFAULT_CDN_BASE;
    }
  } catch (e) { base = H600_DEFAULT_CDN_BASE; }
  return String(base || H600_DEFAULT_CDN_BASE).replace(/\/+$/, '').trim();
}

function h600LessonsWithUrls_(cdnBase) {
  var base = String(cdnBase || h600CdnBase_()).replace(/\/+$/, '');
  return H600_LESSONS().map(function (u) {
    return {
      id: u.id,
      book: H600_BOOK_INTEGRATED,
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

function h600MetaWithBook_() {
  var meta = H600_LESSONS_META() || {};
  return {
    sourceId: 'h600',
    book: H600_BOOK_INTEGRATED,
    title: '600+ · Dictation & Shadowing',
    level: '20 ngày · 32 audio',
    units: meta.totals ? meta.totals.units : 32,
    lines: meta.totals ? meta.totals.lines : 0,
    words: meta.totals ? meta.totals.words : 0,
    cdnBase: h600CdnBase_(),
  };
}

function getH600Lessons() { return h600LessonsWithUrls_(); }

function debugH600() {
  var list = h600LessonsWithUrls_();
  var lines = 0, words = 0;
  list.forEach(function (u) { lines += u.lineCount || 0; words += u.wordCount || 0; });
  Logger.log('600+: %s unit | %s dòng | %s từ | book=%s', list.length, lines, words, H600_BOOK_INTEGRATED);
  Logger.log('CDN: %s', h600CdnBase_());
  [0, 15, 31].forEach(function (i) {
    var u = list[i];
    if (!u) return;
    try {
      var res = UrlFetchApp.fetch(u.cdnUrl, { method: 'get', headers: { Range: 'bytes=0-0' }, muteHttpExceptions: true });
      Logger.log('  %s → HTTP %s · %s', u.cdnName, res.getResponseCode(), res.getHeaders()['Content-Type']);
    } catch (e) {
      Logger.log('  %s → LỖI %s', u.cdnName, e.message);
    }
  });
}
