/**
 * Code.gs — Pronunciation Master (core dùng chung Intermediate + Advanced).
 *
 * Kiến trúc: nội dung tĩnh trong PMContent.gs · audio trên CDN · tiến độ ở client.
 * Không phụ thuộc Google Sheets / Drive nên chạy được ngay sau khi deploy.
 */

/** Nhúng file HTML khác (Styles, App). */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function doGet(e) {
  var page = (e && e.parameter && e.parameter.page) || 'dashboard';
  /* --- Kiểm tra tình trạng cấu hình (trả JSON để debug nhanh) --- */
  if (page === 'health') {
    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      app: Config.APP_NAME,
      version: Config.APP_VERSION,
      cdnBase: Config.CDN_BASE,
      courseId: Config.COURSE_ID,
      units: (typeof PM_COURSE === 'function' ? PM_COURSE().units.length : 0),
      sections: (typeof PM_COURSE === 'function' ? PM_COURSE().sections.length : 0),
      timestamp: new Date().toISOString(),
    }, null, 2)).setMimeType(ContentService.MimeType.JSON);
  }

  var template = HtmlService.createTemplateFromFile('Index');
  template.page = page;
  template.config = {
    appName: Config.APP_NAME,
    appVersion: Config.APP_VERSION,
    cdnBase: Config.CDN_BASE,
    courseId: Config.COURSE_ID,
    recordingEngineUrl: Config.RECORDING_ENGINE_URL,
  };

  return template.evaluate()
    .setTitle(Config.APP_NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
