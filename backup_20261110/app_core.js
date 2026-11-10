/* =========================================================
   core.js — Logic SPA: Dictation & Shadowing
   Chạy trên cả GAS (google.script.run) và local (LocalBackend).
   ========================================================= */
'use strict';

/* ---------- 0. Backend adapter ---------- */
var GAS_OK = typeof google !== "undefined" && google.script && google.script.run;
var GSR = GAS_OK ? google.script.run : null;

function gasCall(fnName, args, cb) {
  GSR.withSuccessHandler(function (r) { cb(null, r); })
     .withFailureHandler(function (e) { cb(e); })[fnName].apply(null, args);
}

var api = {
  getLessonsList: function (userId, cb) {
    if (GAS_OK) return gasCall("getLessonsList", [userId], cb);
    setTimeout(function () {
      try { cb(null, LocalBackend.getLessonsList(userId)); }
      catch (e) { cb(e); }
    }, 60);
  },
  getLessonData: function (userId, day, cb) {
    if (GAS_OK) return gasCall("getLessonData", [userId, day], cb);
    setTimeout(function () {
      try { cb(null, LocalBackend.getLessonData(userId, day)); }
      catch (e) { cb(e); }
    }, 60);
  },
  getETSResourceLinks: function (cb) {
    if (GAS_OK) return gasCall("getETSResourceLinks", [], cb);
    cb(null, null);
  },
  saveUserProgress: function (userId, day, mode, score, completed) {
    if (GAS_OK) { GSR.saveUserProgress(userId, day, mode, score, completed); return; }
    try { LocalBackend.saveUserProgress(userId, day, mode, score, completed); } catch (e) {}
  },
};

/* ---------- 1. State ---------- */
var app = {
  parts: [],
  progress: {},        // { "<day>": { dictation:{score,completed}, shadowing:{...} } }
  userId: null,
  currentDay: null,
  currentPart: null,
  mode: "dictation",   // dictation | shadowing
  trackIndex: 0,       // chỉ số track (DAY>=10 có 2 track)
  lesson: null,        // dữ liệu DAY đang mở
  audio: null,
  audioUrl: null,
  etsMode: false,
  etsTest: 1,
  etsPart: 1,
  etsCurrentClip: null,
  etsLinksLoaded: false,
  etsMissingAssets: null,
  reviewMode: false,
  settings: { speed: 1, theme: "light", replays: 3 },
  checked: false,
  repeatTimer: null,
};

const LS = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};

function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function escHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

/* ---------- 2. Khởi động ---------- */
document.addEventListener("DOMContentLoaded", function () {
  app.settings = Object.assign({ speed: 1, theme: "light", replays: 3 }, LS.get("toeic_settings", {}));
  app.userId = LS.get("toeic_userId", null) || ("local_" + Date.now().toString(36));
  LS.set("toeic_userId", app.userId);
  applyTheme();

  app.audio = new Audio();
  app.audio.preload = "auto";
  app.audio.addEventListener("timeupdate", onTimeUpdate);
  app.audio.addEventListener("ended", onAudioEnded);
  app.audio.addEventListener("loadedmetadata", onAudioEnded);
  app.audio.addEventListener("error", function () {
    var err = app.audio.error;
    var detail = err ? { code: err.code, message: err.message } : "no error object";
    console.log('[AUDIO ERROR EVENT]', JSON.stringify(detail), '| src:', app.audio.src, '| readyState:', app.audio.readyState, '| networkState:', app.audio.networkState);
    $("#playHint").textContent = "Lỗi audio: code=" + (err ? err.code : "?") + " msg=" + (err ? err.message : "Không xác định");
  });

  bindStaticEvents();
  loadLessons();
});

function loadLessons() {
  api.getLessonsList(app.userId, function (err, data) {
    if (err || !data) {
      var msg = err ? String(err) : 'Không có dữ liệu trả về.';
      document.querySelector(".sidebar-nav").innerHTML =
        '<div class="empty-state"><div class="big">⚠️</div>Không tải được dữ liệu bài học.<br>' +
        '<div style="margin-top:8px;color:rgb(var(--danger));font-size:13px;max-width:400px;white-space:pre-wrap">' +
        escHtml(msg) + '</div>' +
        (GAS_OK ? "<br><br>Hãy chạy hàm <code>setupDatabase()</code> hoặc <code>debugGetLessonsList()</code> trong Apps Script Editor để xem chi tiết lỗi.</div>" : "Chạy local-study.html nằm cùng cấp thư mục app/</div>");
      return;
    }
    app.parts = data.parts || [];
    app.progress = data.progress || {};
    renderSidebar();
    var startDay = app.currentDay || localStorage.getItem("toeic_lastDay");
    if (startDay || app.parts[0].days[0]) openDay(Number(startDay) || app.parts[0].days[0].day);
  });
}

/* ---------- 3. Sidebar ---------- */
function partFor(day) {
  for (var i = 0; i < app.parts.length; i++) {
    if (app.parts[i].days.some(function (d) { return d.day === day; })) return app.parts[i];
  }
  return null;
}

function dayStatus(day) {
  var p = app.progress[String(day)];
  if (!p) return "";
  if ((p.dictation && p.dictation.completed) || (p.shadowing && p.shadowing.completed)) return "done";
  var tried = (p.dictation && p.dictation.score != null) || (p.shadowing && p.shadowing.score != null);
  return tried ? "progress" : "";
}

function renderSidebar() {
  var nav = document.querySelector(".sidebar-nav");
  var filter = ($(".header-search input").value || "").trim().toLowerCase();
  var html = "";
  app.parts.forEach(function (part) {
    var days = part.days.filter(function (d) {
      return !filter || String(d.day).indexOf(filter) !== -1 || part.label.toLowerCase().indexOf(filter) !== -1;
    });
    if (!days.length) return;
    html += '<div class="nav-part" data-part="' + part.key + '">';
    html += '<div class="part-title" onclick="togglePart(this)"><span>' + part.icon + "</span><span>" + escHtml(part.label) + '</span><span class="part-count">' + days.length + "</span></div>";
    html += '<div class="part-items">';
    days.forEach(function (d) {
      var st = dayStatus(d.day);
      var icon = st === "done" ? "✅" : st === "progress" ? "📖" : "";
      var title = st === "done" ? "Đã hoàn thành" : st === "progress" ? "Đang học" : "";
      html += '<div class="nav-item' + (app.currentDay === d.day ? " active" : "") + '" data-day="' + d.day + '" onclick="openDay(' + d.day + ')" title="' + title + '">';
      html += '<span class="item-day">DAY ' + pad2(d.day) + "</span>";
      html += (d.tracks.length > 1 ? '<span class="item-status">(2 track)</span>' : "");
      html += '<span class="item-status ' + st + '">' + icon + "</span>";
      html += "</div>";
    });
    html += "</div></div>";
  });
  nav.innerHTML = html || '<div class="empty-state">Không tìm thấy bài học nào.</div>';
  renderSidebarProgress();
}

function renderSidebarProgress() {
  var total = 0, done = 0;
  app.parts.forEach(function (p) { total += p.days.length; });
  Object.keys(app.progress).forEach(function (d) { if (dayStatus(Number(d)) === "done") done++; });
  var pct = total ? Math.round(done / total * 100) : 0;
  var lab = $("#navCount"), fill = $("#navFill");
  if (fill) { fill.style.width = pct + "%"; lab.textContent = done + " / " + total; }
}

function togglePart(titleEl) {
  var items = titleEl.parentElement.querySelector(".part-items");
  if (!items) return;
  var closed = items.style.display === "none";
  items.style.display = closed ? "flex" : "none";
  titleEl.querySelector(".part-count").textContent = closed ? "" : "";
  titleEl.dataset.arrow = closed ? "▾" : "▸";
}

function pad2(n) { return String(n).padStart(2, "0"); }

/* ---------- 4. Mở 1 bài học ---------- */
function openDay(day) {
  var part = partFor(day);
  if (!part) return;
  app.etsMode = false;
  app.reviewMode = false;
  app.currentDay = day;
  app.currentPart = part;
  app.trackIndex = 0;
  app.checked = false;
  localStorage.setItem("toeic_lastDay", String(day));
  closeSidebarMobile();

  api.getLessonData(app.userId, day, function (err, lesson) {
    if (err || !lesson) { alert("Không tải được bài " + day); return; }
    app.lesson = lesson;
    app.progress[String(day)] = Object.assign({}, app.progress[String(day)], lesson.progress || {});
    buildTrackSelect();
    updateHero();
    setMode(app.mode, true);
    renderSidebar();
  });
}

function updateHero() {
  var t = currentTrack();
  var st = dayStatus(app.currentDay);
  var stText = st === "done" ? "✅ Đã hoàn thành" : st === "progress" ? "📖 Tiến độ đang học" : "🆕 Chưa học";
  $("#heroTitle").textContent = "DAY " + pad2(app.currentDay);
  $("#heroSub").textContent = (app.currentPart ? app.currentPart.label : "") +
    (app.lesson && app.lesson.title ? "  •  " + app.lesson.title : "") +
    "  •  Hackers TOEIC 700+";
  $("#heroStatus").textContent = stText;
  $("#heroDictationBadge").classList.remove("hidden");
  $("#heroShadowingBadge").classList.remove("hidden");
  $("#heroBadgeCount").textContent = "🎧 20 DAYs · 31 track MP3";
  $("#trackLabel").textContent = t ? t.name : "Audio DAY " + pad2(app.currentDay);
  $("#headerTitle").textContent = "DAY " + pad2(app.currentDay);
  $("#headerSub").textContent = app.currentPart ? app.currentPart.icon + " " + app.currentPart.label : "";
}

function buildTrackSelect() {
  var wrap = $("#trackSelect");
  if (!app.lesson || app.lesson.tracks.length < 2) { wrap.innerHTML = ""; return; }
  wrap.innerHTML = app.lesson.tracks.map(function (t, i) {
    return '<button class="tbtn' + (app.trackIndex === i ? " active" : "") + '" onclick="selectTrack(' + i + ')">' +
           "Track " + t.key + " — " + escHtml(t.name) + "</button>";
  }).join("");
}

function selectTrack(i) {
  app.trackIndex = i;
  app.checked = false;
  stopAudio();
  buildTrackSelect();
  setMode(app.mode, true);
}

/* ---------- 5. Audio player ---------- */
function currentTrack() {
  if (app.etsMode) return app.etsCurrentClip;
  var t = (app.lesson && app.lesson.tracks) || [];
  return t.length ? t[Math.min(app.trackIndex, t.length - 1)] : null;
}

// Chỉ lấy item thuộc track đang chọn (DAY 10–20 có 2 track)
function currentItems() {
  if (app.etsMode) return [];
  var all = (app.lesson && app.lesson.items) || [];
  var t = currentTrack();
  if (!t) return all;
  return all.filter(function (it) { return String(it.track || "1") === String(t.key); });
}

function escMultiline(s) { return escHtml(s).replace(/\n/g, "<br>"); }
function spkBadge(spk) { return spk ? '<span class="spk-badge">' + escHtml(spk) + "</span> " : ""; }

// Render 1 câu thành các ô trống; giữ xuống dòng giữa Q/A hoặc từng lượt thoại
function renderBlanks(text, idx) {
  var inpIndex = 0;
  return String(text).split("\n").map(function (line) {
    var blanks = makeBlanks(line);
    var out = blanks.map(function (b) {
      if (!b.blank) return escHtml(b.token);
      var w = b.answer.length;
      var size = "style=\"--len:" + (Math.max(4, Math.ceil(w * 0.9))) + "\"";
      var id = "q" + idx + "b" + inpIndex;
      return "<input id=\"" + id + "\" class=\"blank-input\"" + size +
             " data-q=\"" + idx + "\" data-b=\"" + (inpIndex++) + "\"" +
             " data-answer=\"" + escHtml(b.answer) + "\"" +
             " autocomplete=\"off\" spellcheck=\"false\" aria-label=\"ô điền từ\">";
    }).join(" ");
    return out.replace(/\s+([,.!?;:])/g, "$1");
  }).join("<br>");
}

/* M14 — blank TƯỜNG MINH: dictation (câu có "-----------" + "N)") + blanks[answer]
 * thay từng "-----------" bằng ô input có data-answer = blanks[i] (theo thứ tự). */
function renderExplicitBlanks(dictation, blanks, idx) {
  var bidx = 0;                 // index chạy trong blanks
  var inpIndex = 0;
  return String(dictation).split("\n").map(function (line) {
    var segs = line.split(/-{5,}/);
    var out = [];
    segs.forEach(function (seg, si) {
      out.push(escHtml(seg));
      if (si < segs.length - 1 && bidx < blanks.length) {
        var b = blanks[bidx];
        var w = (b.answer || "").length;
        var size = "style=\"--len:" + (Math.max(4, Math.ceil(w * 0.9))) + "\"";
        var id = "q" + idx + "b" + inpIndex;
        out.push("<input id=\"" + id + "\" class=\"blank-input\"" + size +
          " data-q=\"" + idx + "\" data-b=\"" + (inpIndex++) + "\"" +
          " data-answer=\"" + escHtml(b.answer) + "\"" +
          " autocomplete=\"off\" spellcheck=\"false\" aria-label=\"ô điền từ (blank " + (b.num != null ? b.num : (bidx + 1)) + ")\">");
        bidx++;
      }
    });
    return out.join(" ").replace(/\s+([,.!?;:])/g, "$1");
  }).join("<br>");
}

/* Chọn renderer: item có dictation+blanks (M14) → tường minh; không thì auto-blank (legacy). */
function renderDictationBlanks(it, idx) {
  if (it.dictation && Array.isArray(it.blanks) && it.blanks.length) {
    return renderExplicitBlanks(it.dictation, it.blanks, idx);
  }
  return renderBlanks(it.en, idx);
}

/* [AGNES-1] resolve URL tương đối ("?audioId=...") về tuyệt đối trước khi fetch */
function resolveAudioUrl(u) {
  if (!u) return u;
  if (/^https?:/i.test(u)) return u;
  return new URL(u, window.location.href).href;
}

/* M13: URL phát DÒNG TRỰC TIẾP (R2/CDN HTTPS, CORS=*, hỗ trợ HTTP Range)
 * — stream từ server, không cần tải cả blob về → tua được, loading nhẹ.
 * Drive (uc?export=download) vẫn giữ path blob cũ để chắc chắn hoạt động. */
function isDirectStreamUrl(u) {
  if (!u || !/^https?:/i.test(u)) return false;
  if (u.indexOf("drive.google.com") !== -1) return false; // Drive: fallback blob
  return true; // R2_AUDIO_BASE_URL / custom domain CDN
}

function ensureAudioSrc() {
  var t = currentTrack();
  if (!t) return null;
  if (app.audioUrl !== t.url) {
    app.audioUrl = t.url;
    app.audioReady = false;               // [AGNES-1]
    var srcUrl = resolveAudioUrl(t.url);   // [AGNES-1]

    if (isDirectStreamUrl(srcUrl)) {
      // M13 — R2/CDN: stream trực tiếp (support seek/HTTP Range), chờ "loadedmetadata"
      app.audio.src = srcUrl;
      app.audio.preload = "metadata";      // không tải cả file
      app.audio.load();
      console.log('[AUDIO] direct-stream src:', srcUrl);
      // loadedmetadata listener (đã bind ở DOMContentLoaded) sẽ set audioReady
      // qua onAudioEnded? — xử lý: dùng một lần 'canplay' để đánh dấu ready
      app.audio.onloadedmetadata = function () {
        if (app.audioUrl !== t.url) return; // user đổi track trong lúc tải
        app.audioReady = true;
        console.log('[AUDIO] metadata ready:', srcUrl, 'dur=', app.audio.duration);
        if (typeof app.audioPendingPlay === "function") {
          var fn = app.audioPendingPlay; app.audioPendingPlay = null; fn();
        }
      };
    } else {
      // Drive (fallback): giữ nguyên path blob cũ
      fetch(srcUrl)
        .then(function (response) {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.blob();
        })
        .then(function (blob) {
          if (app.audioUrl !== t.url) return;
          var url = URL.createObjectURL(blob);
          app.audio.src = url;
          app.audio.load();
          app.audioReady = true;
          console.log('[AUDIO] blob ready:', t.url);
          if (typeof app.audioPendingPlay === "function") {
            var fn = app.audioPendingPlay; app.audioPendingPlay = null; fn();
          }
        })
        .catch(function (e) {
          if (app.audioUrl !== t.url) return;
          $("#playHint").textContent = "Lỗi tải audio: " + e.message;
          console.log('[AUDIO FETCH ERROR]', { url: t.url, error: e });
        });
    }
  }
  app.audio.playbackRate = app.settings.speed;
  return t;
}

function togglePlay() {
  var t = ensureAudioSrc();
  if (!t) {
    $("#playHint").textContent = "Không có audio URL cho track này. Kiểm tra AUDIO_FOLDER_ID trong Sheet Settings.";
    return;
  }
  var doPlay = function () { // [AGNES-2] chờ blob xong mới play (fix "bấm lần 1 không có tiếng")
    app.audio.play().catch(function (e) {
      var msg = "Không phát được audio: " + e.message;
      if (!app.audioUrl) msg = "Audio URL trống — kiểm tra AUDIO_FOLDER_ID và tên file MP3 trong Drive.";
      $("#playHint").textContent = msg;
      console.log('[AUDIO ERROR]', { url: app.audioUrl, error: e });
    });
    $("#btnPlay").textContent = "⏸";
  };
  if (app.audio.paused) {
    if (app.audioReady) doPlay();
    else app.audioPendingPlay = doPlay;    // [AGNES-2]
  } else {
    app.audio.pause();
    $("#btnPlay").textContent = "▶";
  }
}

function replay3() {
  if (!ensureAudioSrc()) return;
  stopRepeat();
  var start = function () { // [AGNES-3]
    app.audio.currentTime = 0;
    var remaining = app.settings.replays;
    var handler = function () {
      remaining--;
      if (remaining > 0) { app.audio.currentTime = 0; app.audio.play(); }
      else { app.audio.removeEventListener("ended", handler); }
    };
    app.audio.addEventListener("ended", handler);
    app.repeatHandler = handler;
    app.audio.play();
    toastHint("▶ Phát lại " + app.settings.replays + " lần (chuẩn audio sách Hackers)");
  };
  if (app.audioReady) start(); else app.audioPendingPlay = start; // [AGNES-3]
}

function stopRepeat() {
  if (app.repeatHandler) { app.audio.removeEventListener("ended", app.repeatHandler); app.repeatHandler = null; }
}

function stopAudio() { try { app.audio.pause(); app.audio.currentTime = 0; stopRepeat(); } catch (e) {} $("#btnPlay").textContent = "▶"; }

/* [AGNES-5] Self-check audio (chạy trong web app sau khi load xong bài học).
 * Fetch thử URL audio của track hiện tại + in chẩn đoán ra console. */
function agnesSelfCheck() {
  try {
    var t = currentTrack();
    var report = {
      pageUrl: window.location.href,
      day: app.currentDay,
      trackName: t ? t.name : null,
      trackUrl: t ? t.url : null,
      trackUrlAbsolute: t ? resolveAudioUrl(t.url) : null,
      ts: new Date().toISOString(),
    };
    console.log("[AGNES-SELF-CHECK] start", report);
    if (!t || !t.url) {
      report.result = "FAIL: track URL rỗng — backend không trả URL (kiểm tra AUDIO_FOLDER_ID trong Sheet Settings + folder Drive chứa 31 MP3)";
      console.log("[AGNES-SELF-CHECK]", report.result);
      agnesSelfCheckBanner(report.result, false);
      return;
    }
    var abs = report.trackUrlAbsolute;
    fetch(abs, { method: "GET" })
      .then(function (res) {
        var ct = res.headers.get("content-type") || "";
        report.httpStatus = res.status;
        report.contentType = ct;
        return res.arrayBuffer().then(function (buf) {
          var bytes = new Uint8Array(buf).slice(0, 4);
          var head = Array.from(bytes).map(function (b) { return String.fromCharCode(b); }).join("");
          report.firstBytes = head;
          var looksMp3 = res.status === 200 && (ct.indexOf("audio") !== -1 || /ID3/.test(head) || head.charCodeAt(0) === 255);
          report.result = looksMp3 ? ("PASS: audio tải được (" + (buf.byteLength / 1024 | 0) + " KB, " + ct + ")")
            : ("FAIL: response không phải MP3 (http " + res.status + ", ct=" + ct + ", head=\"" + head + "\"). Nếu head chứa 'DOCTYPE'/'html' -> drive proxy trả trang login; nếu 'Audio proxy error' -> Drive không đọc được file");
          console.log("[AGNES-SELF-CHECK]", report);
          agnesSelfCheckBanner(report.result, looksMp3);
        });
      })
      .catch(function (e) {
        report.result = "FAIL: fetch lỗi — " + e + " (nếu là TypeError/Failed to fetch -> CORS hoặc URL sai; kiểm tra deployment)";
        console.log("[AGNES-SELF-CHECK]", report);
        agnesSelfCheckBanner(report.result, false);
      });
  } catch (e) {
    console.log("[AGNES-SELF-CHECK] error:", e);
  }
}
function agnesSelfCheckBanner(msg, ok) {
  var host = $("#modeBody");
  if (!host) return;
  var bar = document.createElement("div");
  bar.id = "agnesCheckBar";
  bar.style.cssText = "margin:8px 0;padding:6px 10px;font-size:12px;border-radius:8px;background:" +
    (ok ? "rgba(46,164,104,.12)" : "rgba(240,100,60,.15)") +
    ";border:1px solid " + (ok ? "rgba(46,164,104,.5)" : "rgba(240,100,60,.5)") + ";";
  bar.innerHTML = (ok ? "✅ " : "⚠️ ") + "Agnes self-check: " + escHtml(msg).slice(0, 160) +
    " <a href=\"#\" style=\"text-decoration:underline\" id=\"agnesCheckMore\">Chi tiết (console)</a>";
  host.insertBefore(bar, host.firstChild);
  var more = $("#agnesCheckMore");
  if (more) more.addEventListener("click", function (e) {
    e.preventDefault();
    alert("Mở DevTools (F12) -> tab Console -> lọc \"[AGNES-SELF-CHECK]\" để xem toàn bộ chẩn đoán.\n\n" + msg);
  });
  if (ok) setTimeout(function () { if (bar.parentNode) bar.parentNode.removeChild(bar); }, 6000);
}

function onTimeUpdate() {
  var a = app.audio, bar = $("#seekBar");
  if (!a.duration || !bar) return;
  bar.value = a.currentTime / a.duration;
  $("#timeNow").textContent = fmtT(a.currentTime);
  $("#timeTotal").textContent = fmtT(a.duration);
}
function onAudioEnded() {
  var a = app.audio, bar = $("#seekBar");
  if (bar && a.duration) bar.value = 0;
}
function fmtT(s) {
  if (!isFinite(s)) return "0:00";
  s = Math.floor(s);
  return Math.floor(s / 60) + ":" + pad2(s % 60);
}
function seekTo(e) { var v = Number(e.target.value); if (app.audio.duration) app.audio.currentTime = v * app.audio.duration; }
function setSpeed(v) {
  app.settings.speed = Number(v); LS.set("toeic_settings", app.settings);
  if (app.audio) app.audio.playbackRate = Number(v);
}

/* ---------- 6. Dictation ---------- */
function makeBlanks(sentence, every) {
  // Cắt câu thành các token, chừa chữ có số thứ tự bội của `every` làm blank
  var everyN = every || 4;
  var tokens = sentence.trim().split(/\s+/);
  var tw = 0, out = [];
  tokens.forEach(function (tok) {
    // Nhãn người nói / Q / A không tính là từ và không tạo ô trống
    if (/^[A-Za-z]\d?:$/.test(tok)) { out.push({ blank: false, token: tok }); return; }
    var bare = tok.replace(/[^a-zA-Z']/g, "");
    if (bare && (tw % everyN === everyN - 1)) {
      out.push({ blank: true, answer: bare, token: tok });
      tw++;
    } else {
      out.push({ blank: false, token: tok });
      if (bare) tw++;
    }
  });
  return out;
}

function renderDictation() {
  var host = $("#modeBody");
  var t = currentTrack();
  var items = currentItems();

  if (!items.length) {
    host.innerHTML =
      '<div class="empty-state">' +
      '<div class="big">📝</div>' +
      "<b>DAY " + app.currentDay + " — Chưa có câu hỏi dictation</b><br>" +
      "Bài này chưa nhập transcript. Bạn vẫn có thể <b>nghe audio</b> ở phía trên và chép chính tả ra giấy<br>" +
      "<span class='small-note' style='display:block;margin-top:8px'>Ghi chú: gọi hàm <code>setupDatabase()</code> trong Apps Script và nhập nội dung vào Sheet " +
      "<b>Lessons</b> (cột transcript_full, translation) theo đúng cấu trúc trên.</span></div>";
    $("#quizFooter").classList.add("hidden");
    return;
  }
  $("#quizFooter").classList.remove("hidden");
  app.checked = false;

  var html = '<div class="card-list">';
  items.forEach(function (it, idx) {
    html += '<div class="quiz-card" id="qc-' + idx + '">';
    html += '<div class="q-number">' + (it.no || idx + 1) + "</div>";
    html += '<div class="q-body">';
    html += '<div class="q-sentence">' + spkBadge(it.spk) + renderDictationBlanks(it, idx) + "</div>";
    html += '<div class="q-status" id="qs-' + idx + '"></div>';
    html += '<div class="q-answer" id="qa-' + idx + '">';
    html += '<div class="ans-en">🇬🇧 ' + spkBadge(it.spk) + escMultiline(it.en) + "</div>";
    if (it.vi) html += '<div class="ans-vi">🇻🇳 ' + escMultiline(it.vi) + "</div>";
    if (it.ko) html += '<div class="ans-vi">🇰🇷 ' + escMultiline(it.ko) + "</div>";
    html += "</div></div></div>";
  });
  html += "</div>";
  host.innerHTML = html;

  $all(".blank-input", host).forEach(function (inp) {
    inp.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); checkDictation(true); var all = $all(".blank-input"); var i = all.indexOf(inp); if (all[i + 1]) all[i + 1].focus(); }
      if (e.key === "Tab" && e.shiftKey) checkDictation(true);
    });
  });
  var first = $(".blank-input", host);
  if (first) first.focus();
  $("#scoreChip").innerHTML = "";
}

function checkDictation(silentFull) {
  if (!app.lesson) return;
  var correct = 0, total = 0;
  $all(".blank-input").forEach(function (inp) {
    var ans = String(inp.dataset.answer || "");
    total++;
    var user = inp.value || "";
    if (norm(user) === norm(ans)) { inp.classList.remove("wrong"); inp.classList.add("correct"); correct++; }
    else { inp.classList.add("wrong"); inp.classList.remove("correct"); }
  });
  recordDictationMistakes();
  app.checked = true;
  var items = currentItems();
  var score = total ? Math.round(correct / total * 100) : 0;
  items.forEach(function (_, i) {
    var el = $("#qs-" + i);
    if (el) {
      var card = $("#qc-" + i);
      var cardCorrect = $all(".blank-input", card).every(function (x) { return x.classList.contains("correct"); });
      var cardBlank = $all(".blank-input", card).length === 0;
      if (!cardBlank) {
        el.className = "q-status " + (cardCorrect ? "ok" : "no");
        el.textContent = cardCorrect ? "✔ Đúng hết" : "✘ Còn sai — xem đáp án bên dưới";
      }
    }
  });
  $("#scoreChip").innerHTML = "<small>Điểm Dictation:</small> " + correct + " / " + total + " (" + score + "%) " + (score >= 70 ? "🎉" : score >= 40 ? "💪" : "🔁");
  saveProgress("dictation", score, correct === total && total > 0);
}

function recordDictationMistakes() {
  var mistakes = LS.get("toeic_dictation_mistakes", {});
  var items = currentItems();
  var track = currentTrack();
  var timestamp = Date.now();
  var changed = false;
  $all(".blank-input").forEach(function (input) {
    if (norm(input.value) === norm(input.dataset.answer)) return;
    var word = String(input.dataset.answer || "").trim();
    var key = norm(word);
    if (!key) return;
    var item = items[Number(input.dataset.q)] || {};
    var entry = mistakes[key] || { word: word, misses: 0, lastInput: "", lastSeen: 0, examples: [] };
    entry.misses = (Number(entry.misses) || 0) + 1;
    entry.lastInput = String(input.value || "").trim();
    entry.lastSeen = timestamp;
    var example = {
      day: app.currentDay,
      track: track ? track.key : "1",
      no: Number(item.no) || Number(input.dataset.q) + 1,
      blank: Number(input.dataset.b) || 0,
      sentence: item.en || "",
      translation: item.vi || "",
    };
    entry.examples = (entry.examples || []).filter(function (saved) {
      return !(saved.day === example.day && saved.track === example.track && saved.no === example.no && saved.blank === example.blank);
    });
    entry.examples.unshift(example);
    entry.examples = entry.examples.slice(0, 3);
    mistakes[key] = entry;
    changed = true;
  });
  if (changed) LS.set("toeic_dictation_mistakes", mistakes);
}

function showAnswers() {
  $all(".blank-input").forEach(function (inp) {
    inp.value = inp.dataset.answer;
    inp.classList.remove("wrong", "correct");
  });
  $("#scoreChip").innerHTML = "<small>Đáp án:</small> đã mở hết — hãy bấm ▶ nghe lại và tự chấm.";
  saveProgress("dictation", null, false, true);
}

function norm(s) {
  return String(s || "").toLowerCase().replace(/^[^\w']+|[^\w']+$/g, "").replace(/[’‘]/g, "'").trim();
}

function saveProgress(mode, score, completed) {
  if (score === null) { // chỉ ghi chú "đã xem đáp án"
    var p = app.progress[String(app.currentDay)] || (app.progress[String(app.currentDay)] = {});
    p.dictation_viewed = true;
    api.saveUserProgress(app.userId, app.currentDay, "dictation", null, false);
    renderSidebarProgress();
    renderSidebar();
    return;
  }
  app.progress[String(app.currentDay)] = app.progress[String(app.currentDay)] || {};
  app.progress[String(app.currentDay)][mode] = { score: score, completed: !!completed };
  api.saveUserProgress(app.userId, app.currentDay, mode, score, !!completed);
  renderSidebarProgress();
  renderSidebar();
}

/* ---------- 7. Shadowing ---------- */
var recorder = null, recChunks = [], recBlobs = {}, speechRec = null, recTarget = null;

function shadowAssessMode() { return "webkitSpeechRecognition" in window || "SpeechRecognition" in window; }

function renderShadowing() {
  var host = $("#modeBody");
  var items = currentItems();
  if (!items.length) {
    host.innerHTML = '<div class="empty-state"><div class="big">🎤</div>Chưa có câu Shadowing — nhập transcript vào Sheet như chế độ Dictation.</div>';
    $("#quizFooter").classList.add("hidden");
    return;
  }
  $("#quizFooter").classList.remove("hidden");
  var canAssess = shadowAssessMode();
  var html = items.map(function (it, i) {
    return '<div class="shadow-card" id="sc-' + i + '">' +
      '<div class="shadow-top"><div class="q-number">' + (it.no || i + 1) + "</div>" +
      '<div style="flex:1;min-width:0"><div class="shadow-sentence">' + spkBadge(it.spk) + escMultiline(it.en) + "</div>" +
      (it.vi ? '<div class="shadow-trans">' + escMultiline(it.vi) + "</div>" : "") + "</div></div>" +
      '<div class="shadow-tools">' +
      '<button class="btn btn-outline btn-sm" onclick="playShadowItem(' + i + ')">🔊 Nghe lại</button>' +
      '<button class="btn btn-primary btn-sm" id="recBtn-' + i + '" onclick="toggleRecord(' + i + ')">🎙 Ghi âm</button>' +
      '<span class="rec-indicator" id="recInd-' + i + '"><span class="rec-dot"></span>Đang ghi…</span>' +
      '<button class="btn btn-outline btn-sm" id="playRecBtn-' + i + '" onclick="playRecording(' + i + ')" disabled>▶ Nghe bản ghi</button>' +
      (canAssess ? '<button class="btn btn-success btn-sm" id="assessBtn-' + i + '" onclick="assessSpeech(' + i + ')">🗣 So sánh câu nói</button>' : "") +
      "</div>" +
      '<div class="acc-result" id="accRes-' + i + '"></div></div>';
  }).join("");
  host.innerHTML =
    '<div style="margin-bottom:12px;color:var(--muted-foreground);font-size:13px">' +
    "Cách luyện &nbsp;1️⃣ 🔊 Nghe câu &nbsp;→&nbsp; 2️⃣ 🎙 Ghi âm đọc lại theo câu &nbsp;→&nbsp; 3️⃣ ▶ Nghe bản ghi của chính mình &nbsp;→&nbsp; 4️⃣ 🗣 Chấm độ chính xác (Chrome).</div>" +
    html;
  var note = "";
  if (!canAssess) note = "⚠️ Trình duyệt không hỗ trợ Web Speech API (SpeechRecognition). Dùng Chrome/Edge trên desktop để chấm điểm chính xác.";
  else if (!navigator.onLine) note = "⚠️ Web Speech API cần kết nối mạng (Google Speech).";
  if (note) {
    var banner = document.createElement("div");
    banner.className = "small-note"; banner.style.color = "rgb(var(--warning))";
    banner.textContent = note;
    host.insertBefore(banner, host.firstChild);
  }
  $("#quizFooter").classList.remove("hidden");
}

function playShadowItem() { // audio track dài — dùng "Play Again x3" để luyện từng câu
  replay3();
}

function playRecording(i) {
  if (reRecordingUrl) {
    var audio = new Audio(reRecordingUrl);
    audio.play().catch(function (e) {
      console.error('[RE] Play error', e);
      toastHint('❌ Không phát được bản ghi: ' + e.message);
    });
    return;
  }
  var blob = recBlobs[i];
  if (!blob) return;
  var audio = new Audio(URL.createObjectURL(blob));
  audio.play();
}

function saveUserBlob(i, blob) {
  recBlobs[i] = blob;
  var btn = $("#playRecBtn-" + i); if (btn) btn.disabled = false;
}

/* ===== Recording Engine integration (khắc phục lỗi micro trên GAS iframe) ===== */
var reSessionId = null;
var reItemIndex = null;
var reRecordingUrl = null;

function toggleRecord(i) {
  if (window.RE && window.RE.isReady() && reSessionId) {
    window.RE.send({ type: 'STOP_RECORDING' });
    return;
  }
  if (!window.RE || !window.RE.isReady()) {
    alert('Recording Engine chưa sẵn sàng. Cấu hình RECORDING_ENGINE_URL trong Index.html.');
    return;
  }
  reItemIndex = i;
  reSessionId = 're_' + Date.now() + '_' + i;
  var reFrame = document.getElementById('reFrame');
  if (reFrame) { reFrame.style.display = 'block'; }
  window.RE.send({
    type: 'START_RECORDING',
    sessionId: reSessionId,
    itemIndex: i
  });
  setRecUI(i, true);
  toastHint('🎙 Recording Engine sẵn sàng — nói vào micro trên trang ghi âm.');
}

window.addEventListener('message', function (event) {
  var data = event.data || {};
  if (data.type !== 'RECORDING_READY') return;
  if (!data.sessionId || data.sessionId !== reSessionId) return;
  var audioBase64 = data.audioBase64;
  var mimeType = data.mimeType || 'audio/webm';
  if (GAS_OK) {
    forgeGASUpload(reItemIndex, audioBase64, mimeType);
  } else {
    var blob = base64ToBlob(audioBase64, mimeType);
    saveUserBlob(reItemIndex, blob);
    reRecordingUrl = URL.createObjectURL(blob);
    setRecUI(reItemIndex, false);
    reSessionId = null;
    toastHint('🎧 Đã ghi xong (local) — bấm ▶ Nghe bản ghi');
  }
});

function base64ToBlob(base64, mimeType) {
  var byteChars = window.atob(base64);
  var byteArrays = [];
  for (var offset = 0; offset < byteChars.length; offset += 512) {
    var slice = byteChars.slice(offset, offset + 512);
    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }
  return new Blob(byteArrays, { type: mimeType });
}

function setRecUI(i, on) {
  var ind = $("#recInd-" + i), but = $("#recBtn-" + i);
  if (ind) ind.classList.toggle("on", on);
  if (but) but.textContent = on ? "⏹ Dừng ghi" : "🎙 Ghi âm";
  if (!on) {
    $all(".rec-indicator").forEach(function (x) { if (x.id !== "recInd-" + String(i)) x.classList.remove("on"); });
    $all("[id^='recBtn-']").forEach(function (b) { if (b.id !== "recBtn-" + String(i)) b.textContent = "🎙 Ghi âm"; });
  }
}

function forgeGASUpload(i, audioBase64, mimeType) {
  gasCall('saveUserRecording', [app.userId, app.currentDay, i, audioBase64, mimeType], function (err, result) {
    if (err) {
      console.error('[RE] Save recording error', err);
      toastHint('❌ Lưu bản ghi thất bại: ' + err);
      setRecUI(i, false);
      reSessionId = null;
      return;
    }
    reRecordingUrl = result.url || null;
    setRecUI(i, false);
    reSessionId = null;
    toastHint('🎧 Đã ghi xong và lưu bản ghi — bấm ▶ Nghe bản ghi');
  });
}

function assessSpeech(i) {
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var r = new SR();
  r.lang = "en-US"; r.interimResults = false; r.maxAlternatives = 1;
  var target = ((currentItems()[i]) || {}).en || "";
  var box = $("#accRes-" + i);
  box.classList.add("show");
  box.innerHTML = '<span class="text-muted">🗣 Đang nghe… (đọc to câu trên sau khoảng 1 giây)</span>';
  setTimeout(function () { try { r.start(); } catch (e) { box.innerHTML = "Không mở SpeechRecognition được: " + escHtml(e.message); } }, 1000);
  r.onresult = function (e) {
    var transcript = e.results[0][0].transcript;
    var pct = exactMatch(transcript, target);
    var color = pct >= 80 ? "rgb(var(--success))" : pct >= 50 ? "rgb(var(--warning))" : "rgb(var(--danger))";
    box.innerHTML =
      '<b style="color:' + color + '">Độ chính xác: ' + pct + "%</b>" +
      '<div class="acc-bar"><div class="acc-fill" style="width:' + pct + "%;background:" + color + '"></div></div>' +
      'Bản ghi nhận được: <span class="acc-transcript">“' + escHtml(transcript) + "”</span>" +
      '<div class="small-note">Câu chuẩn: ' + escHtml(target) + "</div>";
    saveProgress("shadowing", pct, pct >= 60);
  };
  r.onerror = function (e) { box.innerHTML = "Lỗi nhận giọng nói: " + escHtml(e.error) + " (cần Chrome + mạng)"; };
}

// So sánh theo từ: số từ khớp / tổng số từ câu chuẩn
function exactMatch(said, target) {
  var a = norm(said).split(/\s+/).filter(Boolean), b = norm(target).split(/\s+/).filter(Boolean);
  if (!b.length) return 0;
  var matched = 0, bCopy = b.slice();
  a.forEach(function (w) { var ix = bCopy.indexOf(w); if (ix !== -1) { matched++; bCopy.splice(ix, 1); } });
  return Math.round(matched / b.length * 100);
}

/* ---------- 8. Chuyển chế độ ---------- */
function setMode(mode, force) {
  app.etsMode = false;
  app.reviewMode = false;
  $(".mode-tabs").classList.remove("hidden");
  $("#playerCard").classList.remove("hidden");
  $("#btnETSLibrary").classList.remove("active");
  $("#btnMistakeReview").classList.remove("active");
  if (!app.lesson && !force) mode = "dictation";
  app.mode = mode;
  stopAudio();
  stopAllRecording();
  $all(".mode-tab").forEach(function (t) { t.classList.toggle("active", t.dataset.mode === mode); });
  if (mode === "dictation") renderDictation(); else renderShadowing();
}

function openMistakeReview() {
  app.etsMode = false;
  app.reviewMode = true;
  stopAudio();
  stopAllRecording();
  closeSidebarMobile();
  $("#btnETSLibrary").classList.remove("active");
  $("#btnMistakeReview").classList.add("active");
  $(".mode-tabs").classList.add("hidden");
  $("#playerCard").classList.add("hidden");
  $("#quizFooter").classList.add("hidden");
  $("#heroTitle").textContent = "Ôn từ sai";
  $("#heroSub").textContent = "Các từ Dictation bạn đã nhập chưa chính xác";
  $("#heroDictationBadge").classList.add("hidden");
  $("#heroShadowingBadge").classList.add("hidden");
  $("#heroBadgeCount").textContent = "Lưu trên trình duyệt này";
  $("#headerTitle").textContent = "Ôn từ sai";
  $("#headerSub").textContent = "Dictation review";
  renderMistakeReview();
}

function renderMistakeReview() {
  var mistakes = LS.get("toeic_dictation_mistakes", {});
  var entries = Object.keys(mistakes).map(function (key) { return mistakes[key]; })
    .sort(function (a, b) { return (Number(b.misses) || 0) - (Number(a.misses) || 0) || (Number(b.lastSeen) || 0) - (Number(a.lastSeen) || 0); });
  $("#heroStatus").textContent = entries.length + " từ cần ôn";
  if (!entries.length) {
    $("#modeBody").innerHTML = '<div class="empty-state"><div class="big">🧠</div><b>Chưa có từ sai</b><br>Các từ bạn nhập sai trong Dictation sẽ được lưu tại đây.</div>';
    return;
  }
  var html = '<div class="mistake-toolbar"><span>' + entries.length + ' từ · sắp xếp theo số lần sai</span><button type="button" class="btn btn-outline btn-sm" data-clear-mistakes>Xóa thống kê</button></div>';
  html += '<div class="mistake-table-wrap"><table class="mistake-table"><thead><tr><th>Từ cần ôn</th><th>Lần sai</th><th>Nhập gần nhất</th><th>Ngữ cảnh</th><th></th></tr></thead><tbody>';
  entries.forEach(function (entry) {
    var example = (entry.examples || [])[0] || {};
    var inputText = entry.lastInput || "(để trống)";
    var context = example.sentence ? escMultiline(example.sentence) : "";
    if (example.translation) context += '<div class="mistake-translation">' + escMultiline(example.translation) + '</div>';
    var day = Number(example.day) || 1;
    html += '<tr><td class="mistake-word">' + escHtml(entry.word) + '</td>';
    html += '<td>' + (Number(entry.misses) || 0) + '</td><td>' + escHtml(inputText) + '</td>';
    html += '<td><div class="mistake-context">' + context + '</div><small>DAY ' + pad2(day) + ' · câu ' + (Number(example.no) || "-") + '</small></td>';
    html += '<td><button type="button" class="btn btn-outline btn-sm" data-review-day="' + day + '">Mở bài</button></td></tr>';
  });
  html += '</tbody></table></div>';
  $("#modeBody").innerHTML = html;
}

function clearMistakeReview() {
  if (!window.confirm("Xóa toàn bộ thống kê từ sai trên trình duyệt này?")) return;
  LS.set("toeic_dictation_mistakes", {});
  renderMistakeReview();
}

/* ---------- ETS 2026 local library ---------- */
function openETSLibrary() {
  if (typeof ETS_TESTS === "undefined") return;
  app.etsMode = true;
  app.reviewMode = false;
  app.etsTest = Number(LS.get("toeic_ets_test", 1)) || 1;
  app.etsPart = Number(LS.get("toeic_ets_part", 1)) || 1;
  if (app.etsPart < 1 || app.etsPart > 4) app.etsPart = 1;
  app.etsCurrentClip = null;
  stopAudio();
  stopAllRecording();
  closeSidebarMobile();
  $("#btnETSLibrary").classList.add("active");
  $("#btnMistakeReview").classList.remove("active");
  $(".mode-tabs").classList.add("hidden");
  $("#playerCard").classList.remove("hidden");
  $("#heroDictationBadge").classList.add("hidden");
  $("#heroShadowingBadge").classList.add("hidden");
  $("#quizFooter").classList.add("hidden");
  $("#heroTitle").textContent = "ETS 2026 — Listening Tests";
  $("#heroSub").textContent = "Test 1–10 · Audio clip và tài liệu nguồn";
  $("#heroStatus").textContent = "540 audio clips";
  $("#heroBadgeCount").textContent = "🎧 10 Tests · 540 audio clips";
  $("#headerTitle").textContent = "ETS 2026";
  $("#headerSub").textContent = "Listening practice tests";
  $("#trackLabel").textContent = "Chọn một clip để phát";
  $("#trackSelect").innerHTML = "";
  if (GAS_OK && !app.etsLinksLoaded) {
    $("#modeBody").innerHTML = '<div class="empty-state">Đang tải tài nguyên ETS từ Google Drive…</div>';
    api.getETSResourceLinks(function (err, resources) {
      if (err) {
        showETSSetupError("Không thể đọc tài nguyên Drive. Kiểm tra quyền truy cập của ứng dụng.");
        return;
      }
      if (!resources || !resources.configured) {
        showETSSetupError("Hãy thêm ETS_AUDIO_FOLDER_ID và ETS_DOCS_FOLDER_ID vào Sheet Settings.");
        return;
      }
      applyETSResourceLinks(resources);
      app.etsLinksLoaded = true;
      renderETSLibrary();
    });
    return;
  }
  renderETSLibrary();
}

function showETSSetupError(message) {
  $("#modeBody").innerHTML = '<div class="empty-state"><div class="big">🎧</div>' + escHtml(message) + '<br><button type="button" class="btn btn-outline btn-sm" data-ets-retry>Thử lại</button></div>';
}

function applyETSResourceLinks(resources) {
  var audio = resources.audio || {};
  var documents = resources.documents || {};
  var missingAudio = 0, missingDocumentFiles = {};
  ETS_TESTS.forEach(function (test) {
    test.clips.forEach(function (clip) {
      clip.url = (audio[clip.fileName] || "");
      if (clip.url && !/^https?:/i.test(clip.url)) clip.url = resolveAudioUrl(clip.url); // [AGNES-4] relative ?audioId=
      if (!clip.url) missingAudio++;
    });
    test.materials.forEach(function (material) {
      material.url = documents[material.fileName] || "";
      if (!material.url) missingDocumentFiles[material.fileName] = true;
    });
  });
  app.etsMissingAssets = { audio: missingAudio, documents: Object.keys(missingDocumentFiles).length };
}

function renderETSLibrary() {
  var test = ETS_TESTS[app.etsTest - 1];
  if (!test) return;
  var ranges = [
    { part: 1, label: "Part 1", range: "1-6" },
    { part: 2, label: "Part 2", range: "7-31" },
    { part: 3, label: "Part 3", range: "32-70" },
    { part: 4, label: "Part 4", range: "71-100" },
  ];
  var clips = test.clips.filter(function (clip) { return clip.part === app.etsPart; });
  var html = '<div class="ets-library">';
  html += '<div class="ets-toolbar"><label for="etsTestSelect">Bài thi</label><select id="etsTestSelect" class="ets-select">';
  ETS_TESTS.forEach(function (item) {
    html += '<option value="' + item.test + '"' + (item.test === app.etsTest ? " selected" : "") + '>Test ' + item.test + '</option>';
  });
  html += '</select><div class="ets-materials">';
  test.materials.forEach(function (material) {
    html += material.url
      ? '<a class="btn btn-outline btn-sm" href="' + escHtml(material.url) + '" target="_blank" rel="noopener">' + escHtml(material.label) + '</a>'
      : '<span class="btn btn-outline btn-sm ets-disabled">' + escHtml(material.label) + '</span>';
  });
  html += '</div></div><div class="ets-part-tabs" role="group" aria-label="Listening part">';
  ranges.forEach(function (item) {
    html += '<button type="button" class="btn btn-outline btn-sm' + (item.part === app.etsPart ? " active" : "") + '" data-ets-part="' + item.part + '">' + item.label + ' <span>' + item.range + '</span></button>';
  });
  html += '</div><div class="ets-section-title">Test ' + test.test + ' · ' + ranges[app.etsPart - 1].label + '</div><div class="ets-clip-list">';
  clips.forEach(function (clip) {
    var label = clip.from === clip.to ? "Câu " + clip.from : "Câu " + clip.from + "-" + clip.to;
    html += '<button type="button" class="ets-clip' + (app.etsCurrentClip === clip ? " active" : "") + '" data-ets-clip="' + clip.index + '"' + (clip.url ? "" : " disabled") + '><span>▶</span><span>' + label + '</span></button>';
  });
  html += '</div>';
  if (app.etsMissingAssets) {
    html += '<p class="ets-note">Còn thiếu ' + app.etsMissingAssets.audio + ' audio clip và ' + app.etsMissingAssets.documents + ' tài liệu trong Drive.</p>';
    if (app.etsMissingAssets.audio || app.etsMissingAssets.documents) html += '<button type="button" class="btn btn-outline btn-sm" data-ets-retry>Tải lại từ Drive</button>';
  }
  html += '<p class="ets-note">Transcript và đề được mở từ các file nguồn. App không sao chép nội dung transcript vào dữ liệu riêng.</p></div>';
  $("#modeBody").innerHTML = html;
}

function onETSChange(event) {
  if (event.target.id !== "etsTestSelect") return;
  app.etsTest = Number(event.target.value);
  app.etsPart = 1;
  app.etsCurrentClip = null;
  LS.set("toeic_ets_test", app.etsTest);
  stopAudio();
  $("#trackLabel").textContent = "Chọn một clip để phát";
  renderETSLibrary();
}

function onETSClick(event) {
  if (event.target.closest("[data-ets-retry]")) {
    app.etsLinksLoaded = false;
    app.etsMissingAssets = null;
    openETSLibrary();
    return;
  }
  var partButton = event.target.closest("[data-ets-part]");
  if (partButton) {
    app.etsPart = Number(partButton.dataset.etsPart);
    LS.set("toeic_ets_part", app.etsPart);
    renderETSLibrary();
    return;
  }
  var clipButton = event.target.closest("[data-ets-clip]");
  if (clipButton) {
    playETSClip(Number(clipButton.dataset.etsClip));
    return;
  }
  var dayButton = event.target.closest("[data-review-day]");
  if (dayButton) {
    openDay(Number(dayButton.dataset.reviewDay));
    return;
  }
  if (event.target.closest("[data-clear-mistakes]")) clearMistakeReview();
}

function playETSClip(index) {
  var test = ETS_TESTS[app.etsTest - 1];
  var clip = test && test.clips[index];
  if (!clip) return;
  if (!clip.url) {
    toastHint("Clip này chưa được ánh xạ trong Drive.");
    return;
  }
  app.etsCurrentClip = clip;
  var srcUrl = resolveAudioUrl(clip.url);
  $("#trackLabel").textContent = "Test " + test.test + " · Câu " + clip.label;
  $all(".ets-clip").forEach(function (button) { button.classList.toggle("active", Number(button.dataset.etsClip) === index); });

  var startPlay = function () {
    app.audio.playbackRate = app.settings.speed;
    app.audio.play().then(function () { $("#btnPlay").textContent = "⏸"; }).catch(function () {
      $("#playHint").textContent = "Không phát được clip. Kiểm tra đường dẫn và quyền truy cập file.";
      console.log('[AUDIO ETS ERROR]', { url: srcUrl });
    });
  };

  if (isDirectStreamUrl(srcUrl)) {
    // M13 — R2/CDN: stream trực tiếp
    app.audioUrl = srcUrl;
    app.audio.src = srcUrl;
    app.audio.preload = "metadata";
    app.audio.onloadedmetadata = startPlay;
    app.audio.load();
    console.log('[AUDIO ETS] direct-stream src:', srcUrl);
  } else {
    // Drive (fallback): giữ blob
    app.audioUrl = srcUrl;
    fetch(srcUrl)
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.blob();
      })
      .then(function (blob) {
        var url = URL.createObjectURL(blob);
        app.audio.src = url;
        app.audio.load();
        console.log('[AUDIO ETS] blob ready from:', srcUrl);
        startPlay();
      })
      .catch(function (e) {
        $("#playHint").textContent = "Lỗi tải clip: " + e.message;
        console.log('[AUDIO ETS FETCH ERROR]', { url: srcUrl, error: e });
      });
  }
}

function stopAllRecording() {
  if (recorder && recorder.state === "recording") try { recorder.stop(); } catch (e) {}
  if (window.RE && window.RE.isReady()) {
    window.RE.send({ type: 'STOP_RECORDING' });
  }
  $all(".rec-indicator").forEach(function (x) { x.classList.remove("on"); });
}

/* ---------- 9. Trợ giúp UI ---------- */
function toastHint(msg) {
  var el = $("#playHint");
  el.textContent = msg;
  clearTimeout(app._hintT);
  app._hintT = setTimeout(function () { el.textContent = ""; }, 4000);
}

function applyTheme() {
  document.documentElement.setAttribute("data-theme", app.settings.theme);
  var b = $("#btnTheme"); if (b) b.textContent = app.settings.theme === "dark" ? "☀️" : "🌙";
}
function toggleTheme() {
  app.settings.theme = app.settings.theme === "dark" ? "light" : "dark";
  applyTheme(); LS.set("toeic_settings", app.settings);
}

function toggleSidebar() {
  var s = document.querySelector(".sidebar");
  if (window.matchMedia("(max-width: 900px)").matches) {
    var open = !s.classList.contains("open");
    s.classList.toggle("open", open);
    $("#overlay").classList.toggle("show", open);
  } else {
    s.classList.toggle("collapsed");
  }
}
function closeSidebarMobile() {
  if (window.matchMedia("(max-width: 900px)").matches) {
    $(".sidebar").classList.remove("open");
    $("#overlay").classList.remove("show");
  }
}

/* ---------- 10. Bind sự kiện tĩnh ---------- */
function bindStaticEvents() {
  $("#btnPlay").addEventListener("click", togglePlay);
  $("#btnReplay").addEventListener("click", replay3);
  $("#speedSelect").addEventListener("change", function (e) { setSpeed(e.target.value); });
  $("#seekBar").addEventListener("input", seekTo);
  $("#speedSelect").value = String(app.settings.speed);
  $all(".mode-tab").forEach(function (t) {
    t.addEventListener("click", function () { setMode(t.dataset.mode); });
  });
  $(".header-search input").addEventListener("input", function () {
    clearTimeout(app._searchT);
    app._searchT = setTimeout(renderSidebar, 120);
  });
  $("#btnTheme").addEventListener("click", toggleTheme);
  var etsButton = $("#btnETSLibrary");
  if (typeof ETS_TESTS === "undefined") etsButton.classList.add("hidden");
  else etsButton.addEventListener("click", openETSLibrary);
  $("#btnMistakeReview").addEventListener("click", openMistakeReview);
  $("#modeBody").addEventListener("change", onETSChange);
  $("#modeBody").addEventListener("click", onETSClick);
  $("#btnSidebar").addEventListener("click", toggleSidebar);
  $("#overlay").addEventListener("click", function () {
    $(".sidebar").classList.remove("open");
    $("#overlay").classList.remove("show");
  });
}
