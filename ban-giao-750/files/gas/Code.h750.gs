/* =========================================================
   Code.h750.gs — server helper cho 750+
   Standalone: book 1; tích hợp dự án tổng: book 8.
   ========================================================= */

var H750_BOOK = 8;
var H750_BOOK_INTEGRATED = 8;
var H750_DEFAULT_CDN_BASE = 'https://toeic-audio.netlify.app/audio/750plus';

function h750CdnBase_() {
  var base = '';
  try {
    if (typeof lptdProp_ === 'function') {
      base = lptdProp_('H750_AUDIO_CDN_BASE', H750_DEFAULT_CDN_BASE);
    } else {
      base = PropertiesService.getScriptProperties().getProperty('H750_AUDIO_CDN_BASE') || H750_DEFAULT_CDN_BASE;
    }
  } catch (e) { base = H750_DEFAULT_CDN_BASE; }
  return String(base || H750_DEFAULT_CDN_BASE).replace(/\/+$/, '').trim();
}

function h750LessonsWithUrls_(cdnBase) {
  var base = String(cdnBase || h750CdnBase_()).replace(/\/+$/, '');
  return H750_LESSONS().map(function (u) {
    return {
      id: u.id,
      book: H750_BOOK_INTEGRATED,
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

function h750MetaWithBook_() {
  var meta = H750_LESSONS_META() || {};
  return {
    sourceId: 'h750',
    book: H750_BOOK_INTEGRATED,
    title: '750+ · Dictation & Shadowing',
    level: '20 ngày · 20 audio',
    units: meta.totals ? meta.totals.units : 20,
    lines: meta.totals ? meta.totals.lines : 0,
    words: meta.totals ? meta.totals.words : 0,
    cdnBase: h750CdnBase_(),
  };
}

function getH750Lessons() { return h750LessonsWithUrls_(); }

function debugH750() {
  var list = h750LessonsWithUrls_();
  var lines = 0, words = 0;
  list.forEach(function (u) { lines += u.lineCount || 0; words += u.wordCount || 0; });
  Logger.log('750+: %s unit | %s dòng | %s từ | book=%s', list.length, lines, words, H750_BOOK_INTEGRATED);
  Logger.log('CDN: %s', h750CdnBase_());
  [0, 9, 19].forEach(function (i) {
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
