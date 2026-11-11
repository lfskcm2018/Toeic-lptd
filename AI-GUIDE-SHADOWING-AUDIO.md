# HƯỚNG DẪN TÍCH HỢP AUDIO + GHI ÂM SHADOWING (dành cho AI/Dev khác)

> Mục tiêu: bất kỳ AI/dev nào cũng có thể lắp chức năng **nghe audio + ghi âm + chấm % + lưu Drive**
> vào một module shadowing mới (Hackers 20 DAY, ETS 2026, LPTD, ...) mà **không vấp lại lỗi micro**.
>
> Phiên bản: 2.0 — 11/11/2026. Bản tham chiếu đang chạy: `op/recording-engine/` + `op/app/lptd-ui.js`
> + `op/gas-standalone/Code.gs`.

---

## 0. TL;DR (đọc nhanh)

1. **Audio** phát trực tiếp từ CDN HTTPS (Netlify) — không dùng Google Drive, không tải file qua GAS.
2. **Micro** KHÔNG gọi `getUserMedia`/`SpeechRecognition` trong iframe GAS (bị Chrome chặn).
   → Mở **popup top-level** tới trang Recording Engine (GitHub Pages), giao tiếp bằng `postMessage`.
3. Popup trả về `{ audioBase64, mimeType, transcript }` → app tạo Blob để phát lại, chấm % bằng
   `exactMatch`, lưu tiến độ; đồng thời lưu Drive qua `google.script.run.saveUserRecording`.
4. URL Recording Engine cấu hình bằng Script Property `LPTD_RECORDING_ENGINE_URL` (có fallback).
5. Lần đầu deploy: chạy `authorizeLptdDrive()` trong Script Editor để cấp quyền Drive.

---

## 1. Bối cảnh & nguyên nhân lỗi (đọc kỹ trước khi code)

GAS web app (`HtmlService`) luôn chạy trong **iframe sandbox** tại `https://n-xxx.googleusercontent.com`.
Chrome áp **Permissions Policy** mặc định: iframe **không** có `allow="microphone"` →
cả `navigator.mediaDevices.getUserMedia()` và `webkitSpeechRecognition` đều lỗi:

```
Permissions policy violation: microphone is not allowed in this document
Không truy cập được micro: Permission denied
```

Không có cách nào sửa bằng code bên trong iframe (không được set `allow` cho iframe cha).
**Giải pháp duy nhất (miễn phí):** đưa phần mic sang một **trang top-level** (popup) cùng HTTPS,
rồi trao đổi dữ liệu qua `window.postMessage`.

> Quy tắc vàng: **Không bao giờ** gọi `getUserMedia`/`SpeechRecognition` trực tiếp trong HTML của GAS.
> Chỉ gọi trong popup Recording Engine. Ngoại lệ duy nhất: chạy **local** (file:// hoặc localhost),
> khi đó trang là top-level nên mic hoạt động bình thường.

---

## 2. Kiến trúc tổng thể

```
┌─────────────────────────────┐        postMessage        ┌──────────────────────────────┐
│  GAS Web App (iframe)       │  ───────────────────────►  │  Recording Engine (popup)    │
│  lptd-ui.js / shadowing UI  │                            │  https://lfskcm2018.github.io│
│                             │  ◄───────────────────────  │  /Toeic-lptd/recording-engine│
│  - nút 🎙 Ghi âm            │   RECORDING_READY          │  - getUserMedia (mic)        │
│  - nhận blob + transcript   │   {audioBase64, transcript}│  - MediaRecorder (webm)      │
│  - phát lại, chấm %, lưu    │                            │  - SpeechRecognition (en-US) │
│  - lưu Drive (GAS backend)  │                            │  - UI hướng dẫn              │
└──────────────┬──────────────┘                            └──────────────────────────────┘
               │ google.script.run
               ▼
┌─────────────────────────────┐
│  Code.gs (GAS backend)      │
│  - saveUserRecording(...)   │  → DriveApp (file .webm, ANYONE_WITH_LINK)
│  - getUserRecording(...)    │  → URL 1 bản ghi
│  - getUserRecordings(...)   │  → URL cả unit (1 round-trip)
│  - authorizeLptdDrive()     │  → chạy 1 lần trong Script Editor
└─────────────────────────────┘
```

**Audio bài nghe**: player thường (`<audio>`/`new Audio`) phát URL CDN HTTPS. Không liên quan micro.

---

## 3. Giao thức postMessage (hợp đồng giữa app và engine)

### App → Engine

| type | payload | ý nghĩa |
|---|---|---|
| `START_RECORDING` | `{ sessionId, itemIndex, targetText, autoSend }` | Bắt đầu ghi âm + nhận giọng nói; `targetText` để hiển thị câu cần đọc |
| `STOP_RECORDING` | `{}` | Dừng ghi âm (engine tự gửi kết quả) |
| `START_RECOGNITION` | `{ sessionId, itemIndex, targetText }` | Chỉ nhận giọng nói (không ghi audio) — phục vụ nút "Chấm %" |
| `RECORDING_CLEAR` | `{}` | Xoá bản ghi hiện tại, reset UI |

### Engine → App (gửi về `window.opener`)

| type | payload | ý nghĩa |
|---|---|---|
| `RE_ENGINE_READY` | `{ version, speechRecognition }` | Engine đã load xong; app gửi lệnh đang chờ |
| `RECORDING_STARTED` | `{ sessionId, itemIndex }` | Đã bắt đầu ghi |
| `RECORDING_READY` | `{ sessionId, itemIndex, audioBase64, mimeType, size, durationMs, transcript }` | **Kết quả chính** |
| `RECORDING_ERROR` | `{ sessionId, itemIndex, error }` | Lỗi mic/MediaRecorder (VD `Permission denied`) |
| `RECOGNITION_READY` | `{ sessionId, itemIndex, transcript }` | Kết quả chấm % |
| `RECOGNITION_ERROR` | `{ sessionId, itemIndex, error }` | Lỗi nhận giọng nói (`no-speech`, `unsupported`, ...) |

Quy ước:
- `itemIndex` = chỉ số câu trong unit (0-based).
- `sessionId` = chuỗi bất kỳ do app sinh (VD `lptd-<ts>-<line>`) để đối chiếu.
- App **phải kiểm tra `event.source === reWin`** trước khi xử lý message.
- `targetOrigin` dùng `'*'` (GAS iframe origin thay đổi, engine không biết trước). Không gửi dữ liệu nhạy cảm.

---

## 4. Bản đồ file & trách nhiệm

| File | Vai trò |
|---|---|
| `op/recording-engine/index.html` | Trang popup (UI: câu cần đọc, nút, transcript) |
| `op/recording-engine/engine.js` | Toàn bộ logic mic + MediaRecorder + SpeechRecognition + postMessage |
| `op/recording-engine/style.css` | Style popup |
| `op/app/lptd-ui.js` | Module UI: mở popup, nhận kết quả, chấm %, lưu Drive, local fallback |
| `op/gas-standalone/Code.gs` | Backend: `doGet` (bơm URL engine), `saveUserRecording`, `getUserRecordings`, `authorizeLptdDrive` |
| `op/tools/build-standalone-gas.js` | Sinh bundle GAS (`Index.html`, `LptdUI.html`, `Styles.html`) |
| `op/gas-standalone/.clasp.json` | Trỏ tới **project GAS độc lập** (scriptId riêng) |

Hosting engine: GitHub Pages repo `lfskcm2018/Toeic-lptd`, thư mục `recording-engine/` ở nhánh `master`.
URL: `https://lfskcm2018.github.io/Toeic-lptd/recording-engine/` (phải trả HTTP 200).

---

## 5. Tích hợp module shadowing MỚI — từng bước

### Bước 1 — Có sẵn Recording Engine

Nếu dùng lại engine hiện tại: không cần làm gì, chỉ cần URL HTTPS trả 200.
Nếu host chỗ khác (Netlify/Vercel/Cloudflare Pages): copy 3 file trong `op/recording-engine/`
lên hosting, đảm bảo **HTTPS** (bắt buộc với `getUserMedia`).

### Bước 2 — Cấu hình URL engine cho web app GAS

**Code.gs:**

```js
var LPTD_DEFAULT_RECORDING_ENGINE_URL = 'https://lfskcm2018.github.io/Toeic-lptd/recording-engine/';

function lptdRecordingEngineUrl_() {
  var url = String(lptdProp_('LPTD_RECORDING_ENGINE_URL', LPTD_DEFAULT_RECORDING_ENGINE_URL)).trim();
  return url || LPTD_DEFAULT_RECORDING_ENGINE_URL;
}

function doGet() {
  var t = HtmlService.createTemplateFromFile('Index');
  t.RECORDING_ENGINE_URL = lptdRecordingEngineUrl_();
  return t.evaluate();
}
```

**Index.html (template GAS):**

```html
<script>
window.LPTD_RECORDING_ENGINE_URL = '<?!= RECORDING_ENGINE_URL ?>';
</script>
```

> Ghi đè không cần sửa code: Project Settings → Script properties →
> `LPTD_RECORDING_ENGINE_URL = https://.../recording-engine/`.

### Bước 3 — Client: mở popup ĐÚNG CÁCH

`window.open` **phải nằm trong handler click** (user gesture), nếu không bị popup blocker chặn.

```js
var RE_URL_FALLBACK = 'https://lfskcm2018.github.io/Toeic-lptd/recording-engine/';

function reUrl() {
  return String((window.LPTD_RECORDING_ENGINE_URL || RE_URL_FALLBACK)).trim() || RE_URL_FALLBACK;
}

function openEngine() {
  if (S.reWin && !S.reWin.closed) { S.reWin.focus(); return S.reWin; }
  S.reWinReady = false;
  S.reWin = window.open(reUrl(), 'lptd_recording_engine',
    'width=560,height=680,resizable=yes,scrollbars=yes');
  return S.reWin;
}
```

### Bước 4 — Handshake & gửi lệnh

```js
// Nhận RE_ENGINE_READY rồi mới gửi lệnh (tránh gửi khi engine chưa load)
window.addEventListener('message', function (event) {
  var data = event.data;
  if (!data || typeof data.type !== 'string') return;
  if (S.reWin && event.source !== S.reWin) return;   // chỉ nhận từ popup của mình

  if (data.type === 'RE_ENGINE_READY') {
    S.reWinReady = true;
    sendStart();
  } else if (data.type === 'RECORDING_READY') {
    onRecordingReady(data);
  } else if (data.type === 'RECORDING_ERROR') {
    resetLineUi(data.itemIndex);
    setHint('Không truy cập được micro (cửa sổ phụ): ' + data.error +
      ' — chọn "Cho phép" khi trình duyệt hỏi quyền.', true);
  } else if (data.type === 'RECOGNITION_READY') {
    onRecognitionReady(data);
  }
});

function sendStart() {
  if (!S.reWin || S.reWin.closed || !S.pending) return;
  S.reWin.postMessage({
    type: 'START_RECORDING',
    sessionId: S.pending.sessionId,
    itemIndex: S.pending.line,
    targetText: S.pending.targetText,
    autoSend: true
  }, '*');
}
```

Nếu popup đã mở từ trước (người dùng ghi câu tiếp theo), `RE_ENGINE_READY` sẽ **không** bắn lại →
cần cờ `S.reWinReady` để gửi lệnh ngay khi popup còn sống.

### Bước 5 — Nhận kết quả, phát lại

```js
function base64ToBlob(b64, mime) {
  var bin = atob(String(b64 || ''));
  var bytes = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime || 'audio/webm' });
}

function onRecordingReady(data) {
  var line = Number(data.itemIndex);
  var blob = base64ToBlob(data.audioBase64, data.mimeType);
  S.recBlobs[line] = blob;                 // ▶ Nghe bản ghi: new Audio(URL.createObjectURL(blob))
  enablePlayButton(line);

  if (data.transcript) {
    var pct = exactMatch(data.transcript, targetTextOf(line));
    renderScore(line, pct, data.transcript);
    saveProgress(line, pct);
  }
  saveToDrive(line, data.audioBase64, data.mimeType);   // Bước 7
}
```

### Bước 6 — Chấm % & lưu tiến độ

Dùng hàm so khớp từ (đã chống trùng lặp, không phân biệt hoa thường, bỏ dấu câu):

```js
function normalizeWords(s) {
  return String(s || '').toLowerCase()
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .split(/\s+/)
    .map(function (w) { return w.replace(/[^a-z0-9']/g, ''); })
    .filter(Boolean);
}

function exactMatch(said, target) {
  var a = normalizeWords(said), b = normalizeWords(target);
  if (!b.length) return 0;
  var copy = b.slice(), matched = 0;
  a.forEach(function (w) {
    var ix = copy.indexOf(w);
    if (ix !== -1) { matched++; copy.splice(ix, 1); }
  });
  return Math.round(matched / b.length * 100);
}
```

Nút "🗣 Chấm %" trong GAS: gửi `START_RECOGNITION` (không ghi audio) → engine trả `RECOGNITION_READY`.

### Bước 7 — Lưu Google Drive + mã đồng bộ (đa thiết bị)

**Quy ước khóa (khớp Code.gs):**

| tham số | ý nghĩa | ví dụ LPTD 2 · Unit 17 · câu 3 |
|---|---|---|
| `userId` | mã đồng bộ người dùng | `umwbfmv50oz1uyl` |
| `day` | = `book` | `2` |
| `itemIndex` | = `unit * 100 + line` | `1703` |

**Code.gs:**

```js
function authorizeLptdDrive() {            // chạy 1 lần trong Script Editor
  try { DriveApp.getRootFolder(); return true; }
  catch (e) { return false; }
}

function lptdRecordingFolder_() {           // thư mục "LPTD Recordings" (tự tạo) hoặc RECORDING_FOLDER_ID
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('RECORDING_FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  var it = DriveApp.getFoldersByName('LPTD Recordings');
  return it.hasNext() ? it.next() : DriveApp.createFolder('LPTD Recordings');
}

function saveUserRecording(userId, day, itemIndex, audioBase64, mimeType) {
  // tạo file .webm trong Drive, setSharing(ANYONE_WITH_LINK, VIEW)
  // lưu metadata vào PropertiesService: key 'recording:{uid}:{day}:{idx}'
  // ghi đè: file cũ cùng key → setTrashed(true)
}

function getUserRecordings(userId, day, unit) {
  // quét PropertiesService, trả { "<line>": { url, ts } } cho cả unit (1 round-trip)
}
```

**Client:**

```js
function lptdUid() {                        // mã đồng bộ lưu localStorage
  var uid = readLS('toeic_lptd_uid', '');
  if (!uid) {
    uid = 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    writeLS('toeic_lptd_uid', uid);
  }
  return uid;
}

function saveToDrive(line, base64, mime) {
  if (!base64) return;
  google.script.run
    .withSuccessHandler(function (res) {
      if (res && res.url) { /* hiện link ☁ Drive + cache localStorage */ }
    })
    .withFailureHandler(function (err) {
      setHint('Không lưu được lên Drive: ' + err.message +
        ' — chạy authorizeLptdDrive() trong Script Editor.', true);
    })
    .saveUserRecording(lptdUid(), lesson.book, lesson.unit * 100 + line, base64, mime || 'audio/webm');
}
```

UI gợi ý:
- Mỗi câu có link **☁ Drive** (anchor `target="_blank"`) hiện khi đã lưu.
- Khối "mã đồng bộ" trong card hướng dẫn: hiện mã, nút **📋 Sao chép**, **🔑 Đổi mã**
  (`prompt()` nhập mã từ máy khác → đổi `localStorage` → gọi `getUserRecordings` để tải lại link).
- Cache URL trong localStorage `toeic_lptd_rec_urls` để hiện link ngay khi mở lại unit.

### Bước 8 — Local mode (không bắt buộc, nhưng nên giữ)

Khi chạy local (top-level), dùng `getUserMedia` + `MediaRecorder` trực tiếp như cũ
(không cần popup). Chỉ bật nhánh popup khi `L.isGas` (có `google.script.run`):

```js
function isGas() {
  return typeof google !== 'undefined' && google.script && google.script.run;
}
```

---

## 6. Build & deploy checklist

```bash
# 1. Sửa code trong op/app/ + op/gas-standalone/Code.gs
node op/tools/build-standalone-gas.js        # sinh lại Index/Styles/LptdUI/LptdData

# 2. Push + deploy GAS (project độc lập)
cd op/gas-standalone
clasp push --force
clasp deploy --description "vN - <mô tả>"

# 3. Push engine lên GitHub (nếu sửa recording-engine/)
git -C op add recording-engine/
git -C op commit -m "Update recording engine"
git -C op push origin master

# 4. Kiểm tra engine sống
curl -I https://lfskcm2018.github.io/Toeic-lptd/recording-engine/   # phải 200
```

Sau deploy:
- [ ] Mở link `/exec` bằng Chrome/Edge **có micro**.
- [ ] Vào unit → tab Shadowing → thấy dòng "mã đồng bộ".
- [ ] Bấm 🎙 → popup mở → Chrome hỏi micro → **Allow**.
- [ ] Đọc 1 câu → Dừng → app nhận bản ghi, ▶ phát lại được.
- [ ] Ô chấm % hiện transcript + %.
- [ ] Link **☁ Drive** xuất hiện sau ~1–2 giây; mở link trên điện thoại/máy khác nghe được.
- [ ] (Tuỳ chọn) máy khác: nhập cùng mã đồng bộ → link Drive tự hiện.

---

## 7. Cấp quyền Drive (bắt buộc một lần cho mỗi script)

Lần đầu dùng `DriveApp`, script chưa có quyền Drive → `saveUserRecording` lỗi
"Authorization is required" / `authorizeLptdDrive()` trả `false`.

Cách cấp quyền:
1. Mở https://script.google.com → chọn project **"LPTD 1-4 Standalone"**.
2. Chọn hàm `authorizeLptdDrive` → bấm **Run**.
3. Google hỏi quyền (Drive) → **Allow / Cho phép**.
4. Nếu đã tạo deployment trước đó: **Deploy → Manage deployments → Edit → New version → Deploy**
   (để deployment nhận scope mới).

> Lỗi thường gặp:
> - `Incorrect function` khi xoá file tên `nul` trên Windows → dùng
>   `cmd /c del /f /q "\\?\<đường-dẫn-tuyệt-đối>\nul"`.
> - Popup bị chặn → hướng dẫn người dùng cho phép popup cho `script.google.com`.
> - Chrome đã từ chối mic trước đó → `chrome://settings/content/microphone` → Allow / Reset.

---

## 8. Test matrix tối thiểu

| # | Kịch bản | Kỳ vọng |
|---|---|---|
| 1 | Audio unit | phát/tạm dừng, tua được, đổi tốc độ, phát lại 3 lần |
| 2 | Ghi âm lần đầu | prompt quyền micro → Allow → ghi → Dừng → ▶ nghe lại |
| 3 | Ghi âm khi từ chối quyền | app hiện hint "Permission denied", nút trở lại bình thường |
| 4 | Chấm % | transcript hiển thị, % đúng công thức `exactMatch`, lưu tiến độ |
| 5 | Đóng popup giữa chừng | UI reset sau ~1s, không kẹt trạng thái "Đang ghi…" |
| 6 | Lưu Drive | link ☁ Drive xuất hiện, mở trên thiết bị khác OK |
| 7 | Mã đồng bộ | nhập mã máy khác → link Drive của unit tự hiện |
| 8 | Local mode | mic chạy trực tiếp (không popup), mọi thứ như cũ |
| 9 | Ghi đè | ghi lại cùng câu → file Drive cũ bị trash, link mới |

---

## 9. Pitfalls & cách tránh

| Vấn đề | Nguyên nhân | Cách tránh |
|---|---|---|
| `Permissions policy violation: microphone` | gọi mic trong iframe GAS | luôn dùng popup (engine) trong GAS mode |
| Popup không mở | `window.open` ngoài user gesture | gọi ngay trong handler click, không sau `await`/`setTimeout` |
| `RE_ENGINE_READY` không bắn lại | popup đã mở từ trước | giữ cờ `reWinReady`; nếu popup còn sống thì gửi lệnh luôn |
| Message giả mạo | bất kỳ window nào cũng postMessage được | kiểm tra `event.source === reWin` |
| `getUserMedia` lỗi trên HTTP | mic yêu cầu secure context | hosting engine phải **HTTPS** |
| Không chấm % | Safari/Firefox thiếu Web Speech | ẩn/khuyên dùng Chrome/Edge; vẫn cho ghi âm |
| Base64 quá lớn | ghi âm dài | engine tự dừng sau **20s**; webm ~100–300KB |
| Autoplay bị chặn | phát audio không có gesture | phát lại trong handler click (▶ Nghe bản ghi) |
| Drive đầy | mỗi lần ghi tạo file mới | ghi đè: trash file cũ cùng key trước khi tạo mới |
| Sai khóa Drive | lệch quy ước `day`/`itemIndex` | dùng đúng `day = book`, `itemIndex = unit*100 + line` |

---

## 10. Mẫu code tối thiểu (copy-paste)

Xem bản đầy đủ đang chạy:
- `op/recording-engine/engine.js` (~450 dòng, có comment từng phần).
- `op/app/lptd-ui.js` — mục `/* ---------- Recording Engine (GAS): popup ngoài iframe ---------- */`
  và `/* ---------- Drive: lưu bản ghi + mã đồng bộ đa thiết bị ---------- */`.
- `op/gas-standalone/Code.gs` — `saveUserRecording`, `getUserRecording`, `getUserRecordings`,
  `authorizeLptdDrive`.

Khi port sang module khác (VD Hackers/ETS shadowing): chỉ cần thay
`itemIndex`/`targetText`/`lesson.unit` theo dữ liệu của module đó và giữ nguyên giao thức postMessage.
