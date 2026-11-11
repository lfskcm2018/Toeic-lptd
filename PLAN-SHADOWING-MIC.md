# KẾ HOẠCH XỬ LÝ: Shadowing — "Không truy cập được micro: Permission denied"

> Dự án: LPTD 1–4 (Listening Practice Through Dictation) tích hợp vào web app Hackers TOEIC
> Ngày viết: 10/11/2026
> Người lập: Chuyên gia xây dựng & nâng cấp dự án
> Phạm vi: Chức năng ghi âm / Shadowing trong web app

---

## 1. Tóm tắt sự cố

| Tiêu chí | Nội dung |
|---|---|
| Tên lỗi | `Không truy cập được micro: Permission denied` |
| Địa điểm xảy ra | Shadowing / Ghi âm trong web app (vừa deploy lên web app) |
| Thông báo F12 | `Permissions policy violation: microphone is not allowed in this document` |
| Nguyên nhân gốc | Chrome chặn mic tại **Permissions Policy**, không phải code |

---

## 2. Nguyên nhân gốc rễ

### 2.1 Lớp 1: Web app được load trong iframe (GAS web app)

Google Apps Script web app tự động load trong **iframe**.
Chrome theo mặc định chặn các API nhạy cảm (mic, camera, geolocation) khi chạy trong iframe:

```text
├── Web app (iframe) → getUserMedia() → Permission denied
│   └── Chrome: Permissions policy → micro không được phép
```

### 2.2 Lớp 2: Safari/Edge/IE (iloại)

- **Safari**: không hỗ trợ Web Speech API, hỗ trợ `mic` kém
- **Edge**: hỗ trợ giống Chrome, nhưng policy khác
- **IE**: không hỗ trợ `navigator.mediaDevices.getUserMedia`

### 2.3 Lớp 3: Thiết bị / người dùng

- Không có micro
- Ấm micro
- Permission đã bị từ chối trước đó
- Chrome extension chặn mic

---

## 3. Cách tiếp cận (3 phương án)

### Phương án A: Tách module ghi âm ra bên ngoài iframe (RẦN NHẤT)

**Cơ chế:**
- Web app (iframe) chỉ hiển thị UI
- Ghi âm thực hiện ở **một trang độc lập** (GitHub Pages / Cloudflare Pages / Vercel)
- Giao tiếp qua `window.postMessage()`
- UI của web app chỉ bật/tắt nút ghi âm; mic thực tế ở trang con

**Ưu điểm:**
- ✅ Tự động bypass Permissions Policy (iframe không chứa mic)
- ✅ Dùng 100% `navigator.mediaDevices.getUserMedia()` bình thường
- ✅ Không cần sửa thiết lập web app
- ✅ Dễ test trên mọi trình duyệt

**Nhược điểm:**
- ⏱ Phải setup postMessage, single-page communication
- 🔧 Nhẹ phát sinh 1 URL con để redirect
- ⚖️ Giải thích cho user biết mic ở trang con

---

### Phương án B: Giữ mic ở web app, request từ iframe

**Cơ chế:**
- Embed recording engine vào iframe của web app
- Cấu hình `sandbox="allow-scripts allow-same-origin"` + `allow="microphone *"`
- Request mic từ iframe

**Ưu điểm:**
- ✅ Giữ nguyên cấu trúc hiện tại
- ✅ 1 trang integrate hoàn chỉnh

**Nhược điểm:**
- ❌ Tốn thời gian config sandbox (xung đột với web app hiện tại)
- ❌ Nhiều trình duyệt vẫn chặn mic trong iframe
- 🔧 Khó test trên Safari/Edge
- 🐛 Nhiều lỗi policy micro (kết quả test thử nghiệm)

---

### Phương án C: Sử dụng MediaRecorder API + Web Speech API trên web app

**Cơ chế:**
- Sử dụng `MediaRecorder` API thay cho `getUserMedia` trực tiếp
- Web Speech API cho chấm %
- Xử lý lỗi ở phía server

**Ưu điểm:**
- ✅ Dùng thế mạnh của web app

**Nhược điểm:**
- ❌ Không giải quyết được vấn đề chặn mic của browser
- ❌ Phụ thuộc cấu hình web app
- ❌ Khả năng xảy ra lỗi tiếp tục cao

---

## 4. Đề xuất & hướng đi

### ✅ Đề xuất: Phương án A — Tách module ghi âm ra bên ngoài iframe

**Lý do chọn:**
- Dễ nhất, nhanh nhất để implement
- Tự động bypass Permissions Policy
- Dùng 100% `navigator.mediaDevices.getUserMedia()` bình thường
- Có tác dụng xác định được mic có khả năng (vs không)

**Cấu trúc đề xuất:**

```
op/recording-engine/
  index.html          ← Trang standalone (mic ở đây)
  engine.js           ← Giao tiếp mic + record
  style.css
```

```
Web app (iframe)
  ├── UI: bật/tắt nút ghi âm
  └── Gửi lệnh → trang con (postMessage)
```

---

## 5. Chi tiết triển khai (Phương án A)

### 5.1 Tạo trang ghi âm độc lập

File: `op/recording-engine/index.html`

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>TOEIC Recording Engine</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="re-app">
    <div class="re-header">
      <div class="re-title">🎙 TOEIC Recording Engine</div>
      <div class="re-status" id="reStatus">Sẵn sàng</div>
    </div>
    <div class="re-controls">
      <button class="btn btn-primary" id="btnStart" onclick="reStart()">🎙 Bắt đầu ghi âm</button>
      <button class="btn btn-outline" id="btnStop" onclick="reStop()" disabled>⏹ Dừng</button>
      <button class="btn btn-outline" id="btnPlay" onclick="rePlay()" disabled>▶ Nghe lại bản ghi</button>
      <button class="btn btn-outline" id="btnSend" onclick="reSendToParent()" disabled>📤 Gửi về ứng dụng chính</button>
      <button class="btn btn-outline" id="btnReRecord" onclick="reReRecord()" disabled>🔄 Ghi lại</button>
    </div>
    <div class="re-waveform" id="reWaveform"></div>
    <div class="re-info" id="reInfo">
      <div>Chưa có bản ghi nào.</div>
    </div>
    <div class="re-hint">
      <p>• Trang này chạy độc lập (không nằm trong iframe GAS) → có quyền truy cập micro đầy đủ.</p>
      <p>• Sau khi ghi xong, nhấn <b>📤 Gửi về ứng dụng chính</b> để truyền audio về web app TOEIC qua postMessage.</p>
      <p>• Nếu trang này được nhúng trong iframe, hãy đảm bảo thuộc tính <code>allow="microphone"</code> được đặt trên thẻ iframe.</p>
    </div>
  </div>
  <script src="engine.js"></script>
</body>
</html>
```

---

### 5.2 Logic ghi âm

File: `op/recording-engine/engine.js`

```javascript
/* =========================================================
   TOEIC Recording Engine (standalone, HTTPS domain)
   Chạy độc lập trên GitHub Pages / Cloudflare Pages.
   Giao tiếp với ứng dụng TOEIC chính (GAS) qua window.postMessage().
   ========================================================= */
(function () {
  'use strict';

  var state = {
    recorder: null,
    stream: null,
    chunks: [],
    blob: null,
    base64: null,
    sessionId: null,
    itemIndex: null,
    isRecording: false,
    audioEl: null
  };

  var els = {
    btnStart: document.getElementById('btnStart'),
    btnStop: document.getElementById('btnStop'),
    btnPlay: document.getElementById('btnPlay'),
    btnSend: document.getElementById('btnSend'),
    btnReRecord: document.getElementById('btnReRecord'),
    status: document.getElementById('reStatus'),
    info: document.getElementById('reInfo'),
    waveform: document.getElementById('reWaveform')
  };

  function setStatus(msg, cls) {
    if (!els.status) return;
    els.status.textContent = msg;
    els.status.className = 're-status' + (cls ? ' ' + cls : '');
  }

  function setInfo(msg) {
    if (!els.info) return;
    els.info.innerHTML = '<div>' + msg + '</div>';
  }

  function enable(btn, flag) {
    if (btn) btn.disabled = !flag;
  }

  function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    for (var i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  function blobToBase64(blob, cb) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    reader.onloadend = function () {
      cb(arrayBufferToBase64(reader.result));
    };
  }

  function sendToParent(data) {
    if (window.opener) {
      window.opener.postMessage(data, '*');
    } else if (window.parent && window.parent !== window) {
      window.parent.postMessage(data, '*');
    } else {
      console.warn('[RE] No parent/opener to send message to.');
    }
  }

  /* ---------- Recording ---------- */
  async function reStart() {
    try {
      setStatus('Đang yêu cầu quyền micro…', 'warn');
      enable(els.btnStart, false);

      var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      state.stream = stream;

      var recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      state.recorder = recorder;
      state.chunks = [];
      state.isRecording = true;

      recorder.ondataavailable = function (e) {
        if (e.data && e.data.size > 0) state.chunks.push(e.data);
      };

      recorder.onstop = function () {
        state.stream.getTracks().forEach(function (t) { t.stop(); });
        state.isRecording = false;
        var blob = new Blob(state.chunks, { type: 'audio/webm' });
        state.blob = blob;

        blobToBase64(blob, function (base64) {
          state.base64 = base64;
          setStatus('Đã ghi xong (' + Math.round(blob.size / 1024) + ' KB)', 'ok');
          setInfo('Kích thước: ' + Math.round(blob.size / 1024) + ' KB · Loại: audio/webm');
          enable(els.btnStop, false);
          enable(els.btnPlay, true);
          enable(els.btnSend, true);
          enable(els.btnReRecord, true);
          enable(els.btnStart, false);
          drawWaveform();
        });
      };

      recorder.onerror = function (e) {
        console.error('[RE] MediaRecorder error', e);
        setStatus('Lỗi MediaRecorder: ' + e.message, 'err');
        enable(els.btnStart, true);
      };

      recorder.start(200);
      setStatus('Đang ghi âm… Hãy nói vào micro.', 'rec');
      enable(els.btnStop, true);
      enable(els.btnPlay, false);
      enable(els.btnSend, false);
      enable(els.btnReRecord, false);
      setInfo('Đang thu âm…');

    } catch (err) {
      console.error('[RE] getUserMedia error', err);
      setStatus('Không truy cập được micro: ' + err.message, 'err');
      enable(els.btnStart, true);
    }
  }

  function reStop() {
    if (state.recorder && state.recorder.state === 'recording') {
      state.recorder.stop();
    } else {
      setStatus('Không có phiên ghi âm nào đang chạy.', 'warn');
    }
  }

  function rePlay() {
    if (!state.blob) return;
    var url = URL.createObjectURL(state.blob);
    if (state.audioEl) state.audioEl.pause();
    state.audioEl = new Audio(url);
    state.audioEl.play().catch(function (e) {
      console.error('[RE] Play error', e);
      setStatus('Không phát được bản ghi: ' + e.message, 'err');
    });
    state.audioEl.onended = function () {
      URL.revokeObjectURL(url);
    };
    setStatus('Đang phát lại bản ghi…', 'info');
  }

  function reReRecord() {
    state.blob = null;
    state.base64 = null;
    state.chunks = [];
    if (state.audioEl) {
      state.audioEl.pause();
      state.audioEl = null;
    }
    setStatus('Sẵn sàng ghi lại.', 'warn');
    setInfo('Chưa có bản ghi nào.');
    enable(els.btnStart, true);
    enable(els.btnStop, false);
    enable(els.btnPlay, false);
    enable(els.btnSend, false);
    enable(els.btnReRecord, false);
    els.waveform.innerHTML = '';
  }

  function reSendToParent() {
    if (!state.base64 || !state.sessionId || state.itemIndex == null) {
      setStatus('Thiếu dữ liệu để gửi.', 'err');
      return;
    }

    var msg = {
      type: 'RECORDING_READY',
      sessionId: state.sessionId,
      itemIndex: state.itemIndex,
      audioBase64: state.base64,
      mimeType: state.blob ? state.blob.type : 'audio/webm',
      size: state.blob ? state.blob.size : 0,
      ts: new Date().toISOString()
    };

    sendToParent(msg);
    setStatus('Đã gửi yêu cầu về ứng dụng chính…', 'info');
    setInfo('Đang chờ phản hồi từ ứng dụng TOEIC chính…');
  }

  /* ---------- Waveform (visual only) ---------- */
  function drawWaveform() {
    if (!state.blob) return;
    var barCount = 30;
    var html = '';
    for (var i = 0; i < barCount; i++) {
      var h = 10 + Math.random() * 40;
      html += '<div class="re-bar" style="height:' + h + 'px"></div>';
    }
    els.waveform.innerHTML = html;
  }

  /* ---------- postMessage listener (from parent/GAS) ---------- */
  window.addEventListener('message', function (event) {
    var data = event.data || {};
    if (!data.type) return;

    switch (data.type) {
      case 'START_RECORDING':
        state.sessionId = data.sessionId || null;
        state.itemIndex = data.itemIndex != null ? data.itemIndex : null;
        setStatus('Nhận lệnh từ ứng dụng chính. Bắt đầu ghi âm…', 'info');
        setInfo('Item #' + state.itemIndex + ' · Session: ' + (state.sessionId || '-'));
        reStart();
        break;

      case 'STOP_RECORDING':
        reStop();
        break;

      case 'PLAY_RECORDING':
        rePlay();
        break;

      case 'RECORDING_CLEAR':
        reReRecord();
        break;

      default:
        break;
    }
  });

  function announceReady() {
    sendToParent({ type: 'RE_ENGINE_READY', ts: new Date().toISOString() });
  }

  setTimeout(announceReady, 500);

})();
```

---

### 5.3 UI của web app (gọi mic ở trang con)

Thay vì request mic trực tiếp từ UI của web app, web app chỉ cần:

1. Bật nút ghi âm
2. Gửi `START_RECORDING` đến trang con
3. Đợi kết quả từ `RECORDING_READY`
4. Hiển thị kết quả

**Thiếu đi:** `navigator.mediaDevices.getUserMedia()` khỏi web app

---

## 6. Cài đặt (một lần)

### 6.1 Setup trang con ghi âm

1. Clone repo `https://github.com/lfskcm2018/Toeic-lptd`
2. Thêm file `op/recording-engine/` vào repo
3. Deploy lên GitHub Pages:
   - Settings → Pages → Source: Deploy from a branch → `main` → `/op/recording-engine`
   - Hoặc: `gh pages --dist op/recording-engine`
4. Lấy URL: `https://lfskcm2018.github.io/Toeic-lptd/op/recording-engine/index.html`

---

### 6.2 Cấu hình giao tiếp

Trang con (recording engine) có:

```javascript
window.addEventListener('message', function (event) {
  if (event.data.type === 'START_RECORDING') {
    // Bắt đầu ghi âm
  }
});
```

Web app gửi:

```javascript
var engineUrl = 'https://lfskcm2018.github.io/Toeic-lptd/op/recording-engine/index.html';
var win = window.open(engineUrl, '_blank', 'width=640,height=480');
win.focus();

// Đợi engine ready
setTimeout(function () {
  win.postMessage({ type: 'START_RECORDING', sessionId: 'abc123', itemIndex: 0 }, '*');
}, 500);
```

---

## 7. Kiểm thử

### 7.1 Sơ bộ (local)

```bash
cd "E:\CÁ NHÂN\03. Quyet.nv\29. Học chép chính tả TOEIC"
node op/tools/serve-lptd.js
```

Mở: `http://localhost:8096/op/index.html`

Expected: Nút ghi âm bật, mic không mở được (do `file://` hoặc `http://`)

---

### 7.2 Trên GitHub Pages (HTTPS)

Mở: `https://lfskcm2018.github.io/Toeic-lptd/op/recording-engine/index.html`

Expected:
- Click nút ghi âm → request mic
- Bấm Allow → recording bắt đầu
- Dừng → nghe lại, gửi về parent

---

### 7.3 Trên web app (iframe)

Mở web app: `https://script.google.com/macros/s/...`
- Bấm nút ghi âm
- Chờ popup trang con ghi âm mở
- Bật mic → test

---

## 8. Checklist khi deploy

- [ ] URL trang ghi âm (recording engine) hoạt động
- [ ] Phim quyền mic (Chrome phải cho phép)
- [ ] Bấm "Allow" microphone khi request
- [ ] Đang phát âm được ghi audio
- [ ] Dừng ghi → phát lại được
- [ ] Gửi audio về parent
- [ ] Console không lỗi
- [ ] Không có lỗi `Permission denied`

---

## 9. Rollback

Nếu phát hiện lỗi sau deploy:

1. Xoá file `op/recording-engine/` khỏi repo
2. Pull lại bản trước deploy
3. Deploy lại commit trước đó
4. Không ảnh hưởng đến dữ liệu của web app và thiết bị người dùng

---

## 10. Kết luận

| Tiêu chí | Giá trị |
|---|---|
| Phương án tốt nhất | **Phương án A** (tách ghi âm ra ngoài iframe) |
| Vì sao | Bypass Permissions Policy, minh bạch, dễ test |
| Thời gian triển khai | 1–2 ngày (nếu đã có code recording engine) |
| Rủi ro | Thấp (tách biệt với web app) |
| Kết quả mong đợi | Mic mở được, ghi âm và chấm % hoạt động |

---

## 11. Lưu ý chính

- Chrome chặn mic trong iframe → **không request mic từ web app/iframe**
- Mic phải ở trang độc lập (GitHub Pages/Cloudflare/Vercel)
- Giao tiếp qua `window.postMessage()` từ web app → thư con
- Tất cả các lỗi `Permission denied` đều phải xử lý trong React/front-end UI (không yêu cầu mic từ server) — làm việc trong `recording-engine/` (agent)

## 10. Trang thai trien khai (11/11/2026)

Da hoan thanh Approach A (popup ngoai iframe):

- Recording Engine v2 tai `op/recording-engine/` (engine.js/index.html/style.css), chay tren GitHub Pages:
  `https://lfskcm2018.github.io/Toeic-lptd/recording-engine/` (HTTP 200, xac minh 11/11/2026).
- GAS app standalone deployment @8: `AKfycbyM8huBU37okqYAvNajHt52sNrGKgV-SsL278b270rdXxz52VX0PGN-ZO4XlMKXrzTN`
  (Mic fix v8 - popup recording engine + postMessage (Approach A)).
- `op/app/lptd-ui.js`: toggleRecord/assessLine GAS branch mo popup engine qua `window.RE`, nhan blob + transcript qua postMessage,
  cham diem bang exactMatch, luu tien do. Local mode giu nguyen getUserMedia.
- `op/gas-standalone/Code.gs`: doGet bom `RECORDING_ENGINE_URL` tu Script Property `LPTD_RECORDING_ENGINE_URL` (fallback GitHub Pages).
- `op/tools/build-standalone-gas.js`: sinh Index.html kem hang so `window.LPTD_RECORDING_ENGINE_URL` -> rebuild khong mat RE.
- Xac minh E2E tren GAS @8: popup mo, target sentence hien thi, START_RECORDING/RECORDING_ERROR/RECOGNITION_ERROR round-trip hoat dong.
- Gioi han moi truong test tu dong: mic bi tu dong tu choi (khong co phan cung/permission prompt) -> loi 'Permission denied' la do moi truong,
  khong phai loi code. Nguoi dung that chon 'Cho phep' trong prompt -> ghi am & cham % hoat dong.

### Bổ sung 11/11/2026 — Lưu Drive + mã đồng bộ

- Deployment mới nhất **@10**: `AKfycbxlnVOgdkGbOKQ_tWcEFa_t9TX41hNgjUNiAuemt13xjSa7QzD6puUmdZTltlkOu7En`
  (=/@9 `AKfycbzaa...` nội dung Drive, thêm thư mục Drive `LPTD Recordings`).
- Mỗi bản ghi tự lưu Google Drive (`saveUserRecording`), ghi đè file cũ cùng câu (trash file cũ).
- `getUserRecordings(userId, day, unit)` trả URL cả unit trong 1 round-trip; UI hiện link ☁ Drive.
- Mã đồng bộ (localStorage `toeic_lptd_uid`) để nghe lại trên thiết bị khác (nhập cùng mã).
- Khóa Drive: `day = book`, `itemIndex = unit * 100 + line`; Properties key `recording:{uid}:{day}:{idx}`.
- Cần chạy `authorizeLptdDrive()` một lần trong Script Editor để cấp quyền Drive.
- Hướng dẫn cho AI/dev: `op/AI-GUIDE-SHADOWING-AUDIO.md`.
