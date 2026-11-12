/* =========================================================
   Code.dp2.gs — server helper cho web app Dictation Part 2
   (bản độc lập; khi tích hợp dự án tổng sẽ remap book)

   Phụ thuộc:
     - DP2Data.gs  (DP2_LESSONS_META, DP2_LESSONS)
     - include()/doGet() của app GAS hiện tại

   Script Property (tùy chọn):
     DP2_AUDIO_CDN_BASE = https://toeic-audio.netlify.app/audio/dictation-part2
   ========================================================= */

/** Book id khi chạy standalone. */
var DP2_BOOK = 1;

/** Book id khi tích hợp dự án tổng (LPTD 1-4 = 1-4, Hacker 1 = 5). */
var DP2_BOOK_INTEGRATED = 6;

var DP2_DEFAULT_CDN_BASE = 'https://toeic-audio.netlify.app/audio/dictation-part2';

/** Base CDN audio Dictation Part 2. */
function dp2CdnBase_() {
  var base = '';
  try {
    if (typeof lptdProp_ === 'function') {
      base = lptdProp_('DP2_AUDIO_CDN_BASE', DP2_DEFAULT_CDN_BASE);
    } else {
      base = PropertiesService.getScriptProperties().getProperty('DP2_AUDIO_CDN_BASE') || DP2_DEFAULT_CDN_BASE;
    }
  } catch (e) { base = DP2_DEFAULT_CDN_BASE; }
  return String(base || DP2_DEFAULT_CDN_BASE).replace(/\/+$/, '').trim();
}

/** 11 unit kèm cdnUrl (giữ book gốc = 1). */
function dp2LessonsWithUrls_(cdnBase) {
  var base = String(cdnBase || dp2CdnBase_()).replace(/\/+$/, '');
  return DP2_LESSONS().map(function (u) {
    return {
      id: u.id,
      book: u.book,
      unit: u.unit,
      title: u.title,
      titleKo: u.titleKo || '',
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

/** Meta hiển thị. */
function dp2MetaWithBook_() {
  var meta = DP2_LESSONS_META() || {};
  return {
    sourceId: 'dictation-part-2',
    book: DP2_BOOK,
    title: 'Dictation Part 2',
    level: 'TOEIC Part 2 · 11 chuyên đề',
    units: meta.totals ? meta.totals.units : 11,
    lines: meta.totals ? meta.totals.lines : 0,
    words: meta.totals ? meta.totals.words : 0,
    cdnBase: dp2CdnBase_(),
  };
}

/** API chính cho UI standalone. */
function getDp2Bootstrap() {
  var lessons = dp2LessonsWithUrls_();
  return {
    configured: true,
    cdnBase: dp2CdnBase_(),
    meta: DP2_LESSONS_META(),
    lessonCount: lessons.length,
    lessons: lessons,
  };
}

/** Tương thích: chỉ trả danh sách unit. */
function getDp2Lessons() {
  return dp2LessonsWithUrls_();
}

/** Danh sách "cuốn" (1 book). */
function getDp2Books() {
  var meta = DP2_LESSONS_META();
  return (meta && meta.books) || [];
}

/** Debug: kiểm tra 11 unit + 3 URL audio mẫu. */
function debugDp2() {
  var list = dp2LessonsWithUrls_();
  var lines = 0, words = 0;
  list.forEach(function (u) { lines += u.lineCount || 0; words += u.wordCount || 0; });
  Logger.log('Dictation Part 2: %s unit | %s dòng | %s từ | book=%s', list.length, lines, words, DP2_BOOK);
  Logger.log('CDN: %s', dp2CdnBase_());
  [0, 4, 10].forEach(function (i) {
    var u = list[i];
    if (!u) return;
    try {
      var res = UrlFetchApp.fetch(u.cdnUrl, {
        method: 'get',
        headers: { Range: 'bytes=0-0' },
        muteHttpExceptions: true,
      });
      Logger.log('  %s → HTTP %s · %s', u.cdnName, res.getResponseCode(), res.getHeaders()['Content-Type']);
    } catch (e) {
      Logger.log('  %s → LỖI %s', u.cdnName, e.message);
    }
  });
}
