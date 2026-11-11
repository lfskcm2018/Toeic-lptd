# Hướng dẫn AI tích hợp module LPTD 1–4 vào dự án tổng

> **Người nhận:** AI / dev của dự án tổng.
> **Nhiệm vụ:** tích hợp module LPTD vào app tổng (Hackers 20 DAY + ETS 2026 + Ôn từ sai) mà **không sửa core** và **không làm hỏng** tính năng hiện có.
> **Nguồn bàn giao:** `op/ban-giao/`.
> **Bản tham chiếu:** app độc lập LPTD @13 đã chạy ổn định.

---

## 0. Đọc trước — 5 nguyên tắc

1. **Không sửa `app/core.js`** cho module này. Module chỉ dùng DOM/ID có sẵn và tự inject nút.
2. **Không dán `doGet()` / `include()`** từ bản standalone. `LptdServer.gs` đã được cắt bỏ hai hàm này vì app tổng đã có.
3. **Dùng `LptdUI-integrated.html`**, không dùng `LptdUI.html` (bản standalone có auto-open).
4. **Phải thêm `oauthScopes` + deploy version mới** sau khi cấp quyền Drive. Chỉ chạy `authorizeLptdDrive()` trong editor là chưa đủ.
5. **Test cả 3 vùng:** local, GAS, và các nút core (DAY / ETS / Ôn từ sai). Không chỉ test LPTD.

---

## 1. Bản đồ file bàn giao

| File | Đích | Vai trò |
|---|---|---|
| `files/app/lptd-lessons-data.js` | `app/lptd-lessons-data.js` | 160 unit cho local (`window.LPTD_LESSONS_RAW`) |
| `files/app/lptd-data.js` | `app/lptd-data.js` | Catalog + URL builder (`window.LPTD`) |
| `files/app/lptd-ui.js` | `app/lptd-ui.js` | UI, player, dictation, shadowing, Drive sync |
| `files/app/lptd-ui.css` | `app/lptd-ui.css` | CSS riêng (`lptd-*`) |
| `files/gas/LptdData.gs` | `LptdData` (script) | 160 unit dạng server (`LPTD_LESSONS()`) |
| `files/gas/LptdServer.gs` | `LptdServer` (script) | API server + Drive; **không** `doGet`/`include` |
| `files/gas/LptdUI-integrated.html` | `LptdUI` (HTML) | Data + UI; **không auto-open** |
| `files/gas/LptdStyles.html` | `LptdStyles` (HTML) | Chỉ CSS LPTD |
| `files/gas/LptdUI.html` | *không dùng* | Bundle standalone, có auto-open; chỉ tham khảo |
| `files/gas/appsscript.main.example.json` | `app/appsscript.json` | Manifest mẫu cho app tổng |
| `recording-engine/*` | GitHub Pages | Popup ghi âm dùng chung |

Kiểm tra hash:

```powershell
Get-FileHash op/ban-giao/files/app/lptd-ui.js -Algorithm SHA256
# đối chiếu với op/ban-giao/SHA256SUMS.txt
```

---

## 2. Kiến trúc và luồng dữ liệu

### 2.1 Local

```
local-study.html
  ├─ app/core.css
  ├─ app/lptd-ui.css
  ├─ app/core.js                 (core hiện có)
  ├─ app/lptd-lessons-data.js    → window.LPTD_LESSONS_RAW
  ├─ app/lptd-data.js            → window.LPTD (catalog + URL)
  └─ app/lptd-ui.js              → boot, inject #btnLPTD, render #modeBody
```

- `LPTD.isGas = false`.
- `ensureData()` dùng dữ liệu local đã nạp; không gọi server.
- Ghi âm local dùng `MediaRecorder` + Web Speech API; **không** lưu Drive.
- CSS được tự inject bởi `lptd-ui.js`, nhưng nên khai báo `<link>` tường minh để tránh FOUC.

### 2.2 Google Apps Script

```
app/Index.html
  ├─ <?!= include('Stylesheet'); ?>     (core.css hiện có)
  ├─ <?!= include('LptdStyles'); ?>     (chỉ lptd-ui.css)
  ├─ ... core UI ...
  ├─ <?!= include('JavaScript'); ?>     (core.js hiện có)
  ├─ <script> window.LPTD_RECORDING_ENGINE_URL = '<?!= RECORDING_ENGINE_URL ?>'; </script>
  └─ <?!= include('LptdUI'); ?>         (lptd-data.js + lptd-ui.js, không auto-open)

app/Code.gs
  ├─ doGet(e)                           (patch để bơm RECORDING_ENGINE_URL)
  └─ include()                          (đã có sẵn)

LptdServer.gs
  ├─ getLptdBootstrap / getLptdLessons / getLptdBooks / getLptdUnit
  ├─ saveUserRecording / getUserRecording / getUserRecordings
  ├─ lptdDeleteRecording / authorizeLptdDrive / lptdAuthDiagnostics
  └─ lptdProp_, lptdCdnBase_, lptdRecordingFolder_, ...

LptdData.gs
  ├─ LPTD_LESSONS_META()
  └─ LPTD_LESSONS()
```

- `LPTD.isGas = true`.
- `ensureData()` gọi `google.script.run.getLptdBootstrap()`; fallback `getLptdLessons()`.
- Audio phát trực tiếp từ CDN, **không** qua Drive.
- Ghi âm: popup **Recording Engine** (GitHub Pages) → `postMessage` → blob + transcript → `google.script.run.saveUserRecording()` → Drive.
- Link Drive hiện dưới từng câu; mã đồng bộ lưu ở `localStorage.toeic_lptd_uid`.

### 2.3 Quy ước khóa ghi âm

| Tham số | Ý nghĩa | Ví dụ |
|---|---|---|
| `userId` | Mã đồng bộ người học | `umwbfmv50oz1uyl` |
| `day` | **book** (1–4) | LPTD 2 → `2` |
| `itemIndex` | `unit * 100 + lineIndex` (line 0-based) | Book 2, Unit 17, câu 3 → `1703` |

- Property key: `recording:{uid}:{day}:{itemIndex}`.
- File Drive: `REC_{uid}_D{day}_I{itemIndex}.{ext}`; ví dụ `REC_umwbfmv50oz1uyl_D01_I103.webm`.
- Thư mục: `LPTD Recordings` (tự tạo; có thể đổi bằng `RECORDING_FOLDER_ID`).
- Quyền file: `ANYONE_WITH_LINK` / `VIEW` (nghe trên máy khác không cần đăng nhập).
- Ghi lại cùng câu → file cũ bị `setTrashed(true)`, metadata ghi đè.

---

## 3. Điều kiện tiên quyết và kiểm tra xung đột

### 3.1 Trước khi sửa

- [ ] Tạo branch/backup: `git switch -c feature/lptd-integration` (nếu repo tổng dùng git).
- [ ] Xác nhận `app/Code.gs` có `doGet(e)` và `include(filename)`.
- [ ] Xác nhận `app/Index.html` có:
  - `.sidebar-footer`
  - `#btnETSLibrary`
  - `#playerCard`
  - `.mode-tabs`
  - `#modeBody`
  - `#quizFooter`
  - `#heroTitle`, `#heroSub`, `#heroStatus`, `#heroBadgeCount`, `#headerTitle`, `#headerSub`
- [ ] Xác nhận `app/Code.gs` **chưa** có các hàm LPTD (xem §7).
- [ ] Nếu main app đang có workstream khác sửa `app/`, phối hợp thứ tự merge.

### 3.2 Kiểm tra nhanh xung đột tên

Chạy trong thư mục gốc:

```powershell
Select-String -Path app\Code.gs -Pattern "function (saveUserRecording|getUserRecording|getUserRecordings|getLptdBootstrap|getLptdLessons|authorizeLptdDrive|lptdDeleteRecording)"
```

Kết quả hiện tại của dự án tổng: **không có** các hàm này → có thể thêm `LptdServer.gs` mà không trùng. Tuy nhiên `app/JavaScript.html` và `app/core.js` **đã gọi** `saveUserRecording` cho Hackers Shadowing (xem §7.3).

---

## 4. Tích hợp local (`local-study.html`)

### 4.1 Copy file

Copy 4 file:

```powershell
Copy-Item op/ban-giao/files/app/lptd-lessons-data.js app/
Copy-Item op/ban-giao/files/app/lptd-data.js          app/
Copy-Item op/ban-giao/files/app/lptd-ui.js            app/
Copy-Item op/ban-giao/files/app/lptd-ui.css           app/
```

### 4.2 Patch `local-study.html`

**Patch 1 — CSS**, sau `<link rel="stylesheet" href="app/core.css">`:

```html
<link rel="stylesheet" href="app/lptd-ui.css">
```

**Patch 2 — script**, sau `<script src="app/core.js"></script>`:

```html
<script src="app/lptd-lessons-data.js"></script>
<script src="app/lptd-data.js"></script>
<script src="app/lptd-ui.js"></script>
```

Thứ tự bắt buộc: `lptd-lessons-data.js` → `lptd-data.js` → `lptd-ui.js`.

### 4.3 Lưu ý local

- `localPath` trong dữ liệu là đường dẫn từ **thư mục gốc dự án** (ví dụ `Listening Practice Through Dictation/...`).
- Mở `local-study.html` bằng **HTTP server** (không mở `file://`) để mic/Web Speech hoạt động:
  ```powershell
  # chọn 1 cách, chạy tại thư mục gốc dự án
  python -m http.server 8080
  # hoặc
  npx serve .
  ```
  Sau đó mở `http://localhost:8080/local-study.html`.
- Không cần `window.LPTD_LOCAL_BASE` nếu file HTML nằm ở gốc dự án. Nếu đặt HTML ở thư mục con, đặt `window.LPTD_LOCAL_BASE = '../';` **trước** `lptd-data.js`.
- Local **không** ghi Drive; chỉ ghi âm trong phiên và nghe lại bằng blob.

### 4.4 Test local tối thiểu

1. Mở trang, Console không có lỗi đỏ.
2. Sidebar có **📚 LPTD 1–4** (trước nút ETS).
3. Bấm nút → thấy 4 cuốn, mỗi cuốn 40 unit.
4. Mở Unit 01 → audio phát, seek được, đổi tốc độ được.
5. Dictation: điền/kiểm tra, điểm lưu sau reload.
6. Shadowing: mic hoạt động (Chrome/Edge), nghe lại được; Web Speech chấm %.
7. Bấm ETS / DAY / Ôn từ sai → LPTD đóng, UI core trở lại bình thường.

---

## 5. Tích hợp Google Apps Script

### 5.1 Thêm file vào project

Trong Apps Script Editor (hoặc qua `clasp`):

| Loại | Tên file | Nội dung |
|---|---|---|
| Script | `LptdData` | `files/gas/LptdData.gs` |
| Script | `LptdServer` | `files/gas/LptdServer.gs` |
| HTML | `LptdUI` | `files/gas/LptdUI-integrated.html` |
| HTML | `LptdStyles` | `files/gas/LptdStyles.html` |

> Tên file HTML phải là `LptdUI` và `LptdStyles` để khớp `include('LptdUI')`, `include('LptdStyles')`. Không đặt tên `LptdUI-integrated`.

Nếu dùng `clasp` (`.clasp.json` hiện tại có `rootDir: "app"`):

```powershell
Copy-Item op/ban-giao/files/gas/LptdData.gs              app/LptdData.gs
Copy-Item op/ban-giao/files/gas/LptdServer.gs            app/LptdServer.gs
Copy-Item op/ban-giao/files/gas/LptdUI-integrated.html   app/LptdUI.html
Copy-Item op/ban-giao/files/gas/LptdStyles.html          app/LptdStyles.html
clasp push
```

### 5.2 Patch `app/Index.html`

**Patch 1 — head**, sau `<?!= include('Stylesheet'); ?>`:

```html
<?!= include('LptdStyles'); ?>
```

**Patch 2 — cuối file**, sau `<?!= include('JavaScript'); ?>`:

```html
<script>
  window.LPTD_RECORDING_ENGINE_URL = '<?!= RECORDING_ENGINE_URL ?>';
</script>
<?!= include('LptdUI'); ?>
```

Vị trí này bảo đảm `#modeBody`, `.sidebar-footer` đã có trong DOM. `LptdUI` không auto-open, nên trang chủ vẫn là app tổng.

> Không đổi thứ tự các include core (`ETSLibrary`, `ETSTranscripts`, `ETSCloze`, `ETSEm`, `JavaScript`).

### 5.3 Patch `app/Code.gs` — `doGet`

Tìm:

```js
function doGet(e) {
  if (e.parameter && e.parameter.audioId) {
    return proxyAudio_(e.parameter.audioId);
  }
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('Hackers TOEIC 700+ — Dictation & Shadowing')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
```

Thay bằng:

```js
function doGet(e) {
  if (e.parameter && e.parameter.audioId) {
    return proxyAudio_(e.parameter.audioId);
  }
  var template = HtmlService.createTemplateFromFile('Index');
  // LptdServer.gs cung cấp hàm này; guard để app không chết nếu chưa merge.
  template.RECORDING_ENGINE_URL = (typeof lptdRecordingEngineUrl_ === 'function')
    ? lptdRecordingEngineUrl_()
    : '';
  return template.evaluate()
    .setTitle('Hackers TOEIC 700+ — Dictation & Shadowing')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
```

> Nếu chưa thêm `LptdServer.gs`, dòng `lptdRecordingEngineUrl_` sẽ lỗi; guard ở trên giúp an toàn. Nhưng muốn LPTD chạy thì vẫn phải thêm `LptdServer.gs`.

### 5.4 Patch `app/appsscript.json` — OAuth scopes

Manifest hiện tại **chưa có** `oauthScopes`. Thêm đủ scope cho app tổng:

```json
{
  "timeZone": "Asia/Ho_Chi_Minh",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/script.external_request"
  ],
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE"
  }
}
```

Giữ `access` đúng như app tổng hiện tại (`ANYONE` hoặc `ANYONE_ANONYMOUS`).

Giải thích:

| Scope | Dùng cho |
|---|---|
| `spreadsheets` | `SpreadsheetApp` (DB Hackers/ETS, tiến độ) |
| `drive` | `DriveApp`: audio proxy + lưu bản ghi LPTD |
| `script.external_request` | `UrlFetchApp`: R2/CDN + `lptdAuthDiagnostics` |

Nếu sau này dùng trigger/`ScriptApp` cần thêm `https://www.googleapis.com/auth/script.scriptapp`. Với code hiện tại, 3 scope trên là đủ.

> **Quan trọng:** nếu khai báo `oauthScopes`, phải liệt kê **đủ tất cả** scope app dùng. Thiếu `spreadsheets` sẽ làm DB core lỗi; thiếu `drive` sẽ làm proxy audio/LPTD lỗi.

### 5.5 Cấp quyền Drive (một lần cho mỗi script)

1. **Push/paste** code mới, mở lại Script Editor, nhấn **Ctrl+Shift+R** (hard reload để nạp manifest).
2. Chọn hàm **`lptdAuthDiagnostics`** → **Run**.
3. Đọc Execution log:
   - `status: "REQUIRED"` → mở `authUrl` bằng đúng tài khoản deploy.
   - Màn hình **granular consent**: **TÍCH** ô quyền Drive:
     > “See, edit, create, and delete all of your Google Drive files”
   - Nếu app chưa xác minh: **Advanced** → **Go to ... (unsafe)** → **Allow**.
4. Chạy lại `lptdAuthDiagnostics`; kỳ vọng:
   ```json
   {
     "status": "NOT_REQUIRED",
     "hasDriveScope": true,
     "driveRoot": "My Drive"
   }
   ```
5. Nếu vẫn lỗi, chạy `authorizeLptdDrive()` và kiểm tra log `Drive OK: My Drive`.

### 5.6 Deploy version mới (bắt buộc)

Deployment tạo **trước** khi có scope Drive vẫn giữ bản ủy quyền cũ. Sau khi cấp quyền:

**Cách UI:**
1. **Deploy → Manage deployments**.
2. Chọn deployment Web App → **Edit** (biểu tượng bút).
3. **Version: New version**.
4. Ghi chú: `Add LPTD 1-4 + Drive recording`.
5. **Deploy**.

**Cách clasp:**
```powershell
clasp deploy --description "Add LPTD 1-4 + Drive recording"
```

Sau đó mở URL deployment mới (hoặc Ctrl+F5 URL cũ).

### 5.7 Script Properties (tùy chọn)

Vào **Project Settings → Script properties**:

| Key | Mặc định | Khi nào đổi |
|---|---|---|
| `LPTD_AUDIO_CDN_BASE` | `https://toeic-audio.netlify.app/audio/lptd` | Khi chuyển CDN audio |
| `LPTD_DOCS_CDN_BASE` | *(trống)* | Khi có CDN PDF; nếu trống, nút PDF bị ẩn trên GAS |
| `LPTD_RECORDING_ENGINE_URL` | `https://lfskcm2018.github.io/Toeic-lptd/recording-engine/` | Khi host Recording Engine ở nơi khác |
| `RECORDING_FOLDER_ID` | *(trống)* | Khi muốn lưu bản ghi vào folder Drive khác |
| `RECORDING_SETTINGS` | *(tự tạo)* | **Không sửa tay**; do `lptdRecordingFolder_()` quản lý |

Không ghi đè các property core như `DB_SPREADSHEET_ID`, `AUDIO_FOLDER_ID`, `R2_*`.

### 5.8 Kiểm tra server trong Editor

Chạy **`debugLptd`** → xem log:

```
=== LPTD standalone ===
Tổng unit: 160 | câu: 1041 | từ: 30555
Cuốn 1: 40 unit, ...
Audio CDN: https://toeic-audio.netlify.app/audio/lptd
Recording Engine: https://lfskcm2018.github.io/Toeic-lptd/recording-engine/
  ... → HTTP 206
```

Nếu `debugLptd` báo thiếu `LPTD_LESSONS_META` → chưa thêm `LptdData.gs`.

---

## 6. API contract

### 6.1 Hàm server cho UI

| Hàm | Tham số | Trả về |
|---|---|---|
| `getLptdBootstrap()` | — | `{configured, cdnBase, docsCdnBase, meta, lessonCount, lessons}` |
| `getLptdLessons()` | — | `Array<lesson>` (tương thích bản cũ) |
| `getLptdBooks()` | — | `Array<book>` |
| `getLptdUnit(book, unit)` | `book 1–4`, `unit 1–40` | `lesson | null` |
| `saveUserRecording(userId, day, itemIndex, audioBase64, mimeType)` | xem §2.3 | `{url, fileId, fileName}` |
| `getUserRecording(userId, day, itemIndex)` | xem §2.3 | `{url, fileId, fileName}` |
| `getUserRecordings(userId, day, unit)` | `day=book` | `{ [line]: {url, ts} }` |
| `lptdDeleteRecording(userId, day, itemIndex)` | xem §2.3 | `{deleted: true}` |
| `authorizeLptdDrive()` | — | `true/false` |
| `lptdAuthDiagnostics()` | — | object chẩn đoán |

### 6.2 Hàm UI gọi server

Trong `lptd-ui.js`:

- `loadDriveUrlsFromServer()` → `.getUserRecordings(uid, book, unit)`
- `saveRecordingToDrive()` → `.saveUserRecording(uid, book, recIndex(lesson, line), base64, mime)`
- `recIndex(lesson, line) = unit * 100 + line`

Nếu đổi tên hàm server, phải sửa đúng hai chỗ này.

### 6.3 Hàm client toàn cục

| Biến/hàm | Mục đích |
|---|---|
| `window.LPTD` | Catalog + URL builder + progress local |
| `window.LPTD_UI` | `open()`, `close()`, `openUnit()`, `state`, `refresh()` |
| `window.LPTD_RECORDING_ENGINE_URL` | URL popup Recording Engine (GAS) |
| `#btnLPTD` | Nút sidebar do module inject |

Không ghi đè `window.LPTD` / `window.LPTD_UI` ở nơi khác.

---

## 7. Xung đột tên và cách xử lý

### 7.1 Những gì `LptdServer.gs` **không** chứa

Đã cắt bỏ:

- `doGet()` — app tổng đã có, có nhánh `audioId`.
- `include()` — app tổng đã có.

Nếu dán lại, GAS báo lỗi kiểu `Identifier 'doGet' has already been declared` hoặc ghi đè hàm cũ.

### 7.2 Bảng xung đột hiện tại

| Tên | Trong `LptdServer.gs` | Trong app tổng hiện tại | Kết luận |
|---|---|---|---|
| `doGet` | Không | Có | Không đụng |
| `include` | Không | Có | Không đụng |
| `getLptdBootstrap` | Có | Không | An toàn |
| `getLptdLessons` | Có | Không | An toàn |
| `getLptdBooks` | Có | Không | An toàn |
| `getLptdUnit` | Có | Không | An toàn |
| `saveUserRecording` | Có | **Không** (nhưng `JavaScript.html`/`core.js` đang gọi) | Xem §7.3 |
| `getUserRecording` | Có | Không | An toàn |
| `getUserRecordings` | Có | Không | An toàn |
| `lptdDeleteRecording` | Có | Không | An toàn |
| `authorizeLptdDrive` | Có | Không | An toàn |
| `lptdAuthDiagnostics` | Có | Không | An toàn |
| `debugLptd` | Có | Không | An toàn |
| `LPTD_DEFAULT_CDN_BASE` | Có | Không | An toàn |
| `lptdProp_` | Có | Không | An toàn |

### 7.3 Lưu ý đặc biệt: `saveUserRecording` và core Shadowing

`app/JavaScript.html` (và bản `app/core.js`) **đã gọi**:

```js
gasCall('saveUserRecording', [app.userId, app.currentDay, i, audioBase64, mimeType], ...)
```

Trong app tổng hiện tại **chưa có** hàm server này. Sau khi thêm `LptdServer.gs`:

- Core Shadowing sẽ **bắt đầu lưu được** bản ghi (trước đó lỗi).
- Bản ghi core dùng `day = app.currentDay` (1–20) và `itemIndex = i` (line index), **không** theo quy ước `unit*100+line`.
- File vẫn vào folder `LPTD Recordings` và key `recording:{uid}:{day}:{itemIndex}`.

Đây là **thay đổi hành vi có lợi** nhưng cần test. Nếu muốn tách hoàn toàn:

**Cách A — giữ nguyên (khuyến nghị cho lần tích hợp đầu):**
- Không đổi gì; test core Shadowing lưu được.
- Chấp nhận folder chung `LPTD Recordings`.

**Cách B — đổi tên hàm LPTD để cô lập:**

1. Trong `LptdServer.gs`:
   - `saveUserRecording` → `lptdSaveUserRecording`
   - `getUserRecording` → `lptdGetUserRecording`
   - `getUserRecordings` → `lptdGetUserRecordings`
   - Giữ `lptdDeleteRecording`.
2. Trong `lptd-ui.js`:
   - `.getUserRecordings(` → `.lptdGetUserRecordings(` (khoảng dòng 1512)
   - `.saveUserRecording(` → `.lptdSaveUserRecording(` (khoảng dòng 1535)
3. Cập nhật lại `LptdUI-integrated.html` (hoặc sửa cả hai file).
4. Sau đó mới implement `saveUserRecording` riêng cho core nếu cần.

> Nếu chọn B, **không** quên `lptdDeleteRecording` vẫn giữ tên cũ (không trùng core).

### 7.4 Xung đột UI/CSS/localStorage

| Phạm vi | Tiền tố | Ghi chú |
|---|---|---|
| DOM | `#btnLPTD`, `.lptd-*`, `#lptdFloat` | Không trùng core |
| CSS | `.lptd-*` | Không sửa `.shadow-card` core; LPTD dùng thêm `.lptd-shadow-card` |
| localStorage | `toeic_lptd_*` | Tách khỏi `toeic_*` của core |
| postMessage | `RE_*` | Dùng chung protocol với core; xem §8.2 |

---

## 8. Patch tương thích với app tổng

### 8.1 Ẩn `#etsFloat` khi mở LPTD (BẮT BUỘC nếu app tổng dùng ETS floating player)

App tổng có `#etsFloat` (floating player trong tab ETS). Module LPTD hiện chỉ ẩn `#playerCard`, `.mode-tabs`, `#quizFooter`, nên nếu người dùng đang ở tab ETS rồi mở LPTD, floating player có thể **nổi đè** lên LPTD.

Sửa `hideCoreUI()` và `restoreCoreUI()` trong `lptd-ui.js`:

```js
function hideCoreUI() {
  var els = [q('#playerCard'), q('.mode-tabs'), q('#quizFooter')];
  S.coreHidden = els.map(function (el) { return el ? el.classList.contains('hidden') : null; });
  els.forEach(function (el) { if (el) el.classList.add('hidden'); });

  // Tương thích app tổng: ẩn floating player ETS
  var etsFloat = q('#etsFloat');
  var etsSpacer = q('#etsFloatSpacer');
  S.etsFloatHidden = etsFloat ? etsFloat.hidden : null;
  S.etsSpacerHeight = etsSpacer ? etsSpacer.style.height : null;
  if (etsFloat) etsFloat.hidden = true;
  if (etsSpacer) etsSpacer.style.height = '0px';

  var ets = q('#btnETSLibrary'), review = q('#btnMistakeReview');
  if (ets) ets.classList.remove('active');
  if (review) review.classList.remove('active');
  var btn = q('#btnLPTD');
  if (btn) btn.classList.add('active');
}

function restoreCoreUI() {
  var els = [q('#playerCard'), q('.mode-tabs'), q('#quizFooter')];
  els.forEach(function (el, i) {
    if (!el) return;
    if (!S.coreHidden || S.coreHidden[i] === false) el.classList.remove('hidden');
  });
  S.coreHidden = null;

  // Khôi phục floating player ETS nếu trước đó đang hiện
  var etsFloat = q('#etsFloat');
  var etsSpacer = q('#etsFloatSpacer');
  if (etsFloat && S.etsFloatHidden === false) etsFloat.hidden = false;
  if (etsSpacer) etsSpacer.style.height = S.etsSpacerHeight || '';
  S.etsFloatHidden = null;
  S.etsSpacerHeight = null;

  var btn = q('#btnLPTD');
  if (btn) btn.classList.remove('active');
}
```

Nếu app tổng **không** có `#etsFloat`, patch này vô hại (các `q()` trả `null`).

### 8.2 Chặn nhiễu `postMessage` giữa 2 Recording Engine

App tổng có `#reFrame` (Recording Engine của core) và LPTD dùng popup. Cả hai dùng protocol `RE_ENGINE_READY`, `RECORDING_READY`, ... Nên siết kiểm tra `event.source`.

Trong `lptd-ui.js`, hàm `reHandleMessage(event)`:

```js
// Trước
if (S.reWin && event.source !== S.reWin) return;

// Sau (an toàn hơn)
if (!S.reWin || event.source !== S.reWin) return;
```

Trong `app/Index.html`, listener của core:

```js
window.addEventListener('message', function (event) {
  var data = event.data || {};
  if (!reFrame || event.source !== reFrame.contentWindow) return; // thêm dòng này
  if (data.type === 'RE_ENGINE_READY') {
    reReady = true;
    reFlushPending();
  }
});
```

Hai patch này không bắt buộc để LPTD chạy, nhưng nên làm nếu app tổng dùng core Shadowing + LPTD trong cùng phiên.

### 8.3 Không đụng `#reFrame`

`#reFrame` là iframe Recording Engine của core, có biến `RECORDING_ENGINE_URL` **cục bộ trong IIFE**. LPTD dùng biến global `LPTD_RECORDING_ENGINE_URL`. Hai biến độc lập; không đổi tên, không xoá `#reFrame`.

---

## 9. Test matrix

### 9.1 Local

| # | Thao tác | Kỳ vọng |
|---|---|---|
| L1 | Mở `local-study.html` qua HTTP | Trang load, Console không lỗi đỏ |
| L2 | Nhìn sidebar | Có **📚 LPTD 1–4** trước **ETS 2026** |
| L3 | Bấm LPTD | Thấy 4 cuốn × 40 unit; hero đổi sang LPTD |
| L4 | Mở Unit 01 | Audio phát; play/pause/seek/0.5–2.0x/volume OK |
| L5 | Chuyển unit | Audio cũ dừng, không rò tiếng |
| L6 | Dictation | Điền/kiểm tra/điểm %, reload vẫn còn tiến độ |
| L7 | Shadowing | Mic xin quyền, ghi âm, nghe lại, chấm % |
| L8 | Bấm ETS / DAY / Ôn từ sai | LPTD đóng; player/tab/footer core trở lại |
| L9 | Quay lại LPTD | Mở bình thường, không nhân đôi nút |

### 9.2 GAS

| # | Thao tác | Kỳ vọng |
|---|---|---|
| G1 | Mở web app deployment mới | Không auto-open LPTD; app tổng hiện bình thường |
| G2 | Bấm **📚 LPTD 1–4** | Tải 160 unit từ `getLptdBootstrap()`; 4 cuốn |
| G3 | Mở Unit 01 | Audio CDN phát; Network thấy `206` / `audio/mpeg` |
| G4 | Player LPTD | Seek, tốc độ, âm lượng, phát lại 3 lần |
| G5 | Shadowing → 🎙 Ghi âm | Popup Recording Engine mở; xin quyền mic |
| G6 | Đọc 1 câu → Dừng | Có blob; nghe lại được; transcript/% (nếu có) |
| G7 | Chờ lưu Drive | Link **☁ Drive** hiện dưới câu; file trong `LPTD Recordings` |
| G8 | Mở link Drive ở tab ẩn danh/điện thoại | Nghe được, không cần đăng nhập Google |
| G9 | Đổi mã `toeic_lptd_uid` sang mã máy khác | Link Drive của unit tự tải về |
| G10 | Ghi lại cùng câu | File cũ bị trash; link mới thay thế |
| G11 | `lptdDeleteRecording(uid, book, idx)` | File + metadata bị xoá; `getUserRecordings` không còn line đó |
| G12 | Đóng LPTD → mở DAY/ETS/Ôn từ sai | Core chạy bình thường; `#etsFloat` không nổi đè |
| G13 | Chạy `lptdAuthDiagnostics` | `hasDriveScope: true`, `driveRoot: "My Drive"` |
| G14 | Console toàn trang | Không lỗi đỏ; không warning CSP/mic bất thường |

### 9.3 Kiểm tra hồi quy core

- [ ] Hackers 20 DAY: chọn DAY, phát audio, dictation, shadowing.
- [ ] ETS 2026: thư viện, transcript, cloze, exam, floating player.
- [ ] Ôn từ sai: mở/đóng, dữ liệu cũ còn.
- [ ] Audio proxy `?audioId=...` vẫn hoạt động.
- [ ] Sheet `Lessons` / `Progress` không bị ghi sai.

---

## 10. Rollback

### 10.1 Local

1. Xoá 3 thẻ `<script>` LPTD trong `local-study.html`.
2. Xoá `<link rel="stylesheet" href="app/lptd-ui.css">`.
3. Xoá 4 file:
   - `app/lptd-lessons-data.js`
   - `app/lptd-data.js`
   - `app/lptd-ui.js`
   - `app/lptd-ui.css`
4. Ctrl+F5.

Không ảnh hưởng dữ liệu core (localStorage `toeic_*`).

### 10.2 GAS

1. Trong `app/Index.html`:
   - Xoá `<?!= include('LptdStyles'); ?>`.
   - Xoá block `<script>window.LPTD_RECORDING_ENGINE_URL...</script>` + `<?!= include('LptdUI'); ?>`.
2. Trong `app/Code.gs`: khôi phục `doGet` cũ (bỏ template var).
3. Xoá 4 file: `LptdData`, `LptdServer`, `LptdUI`, `LptdStyles`.
4. Manifest: bỏ `oauthScopes` (hoặc giữ nếu app tổng đã dùng explicit scopes cho việc khác).
5. **Deploy → Manage deployments → Edit → Version trước đó → Deploy**.
6. Ctrl+F5.

### 10.3 Dữ liệu Drive (tùy chọn)

- Bản ghi nằm trong folder `LPTD Recordings`; có thể xoá thủ công.
- Metadata nằm ở Script Properties key `recording:*`; nếu cần dọn:
  ```js
  function cleanupLptdTestRecordings() {
    var props = PropertiesService.getScriptProperties();
    var all = props.getProperties();
    Object.keys(all).forEach(function (k) {
      if (k.indexOf('recording:') === 0) props.deleteProperty(k);
    });
  }
  ```
  **Chỉ chạy khi chắc chắn** không cần bản ghi cũ; không xoá `DB_SPREADSHEET_ID`.
- Không cần xoá Sheet hay dữ liệu Hackers/ETS.

---

## 11. Troubleshooting

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| `getLptdBootstrap is not defined` | Chưa thêm `LptdServer.gs`, sai tên file, hoặc chưa deploy | Thêm file, `clasp push`, deploy version mới |
| `LPTD is not defined` | Thiếu `lptd-data.js` hoặc sai thứ tự script | Nạp `lptd-lessons-data.js` → `lptd-data.js` → `lptd-ui.js` |
| `lptdRecordingEngineUrl_ is not a function` | Patch `doGet` trước khi thêm `LptdServer.gs` | Thêm server hoặc dùng guard trong §5.3 |
| Trang tự mở LPTD khi tải | Dùng nhầm `LptdUI.html` standalone | Thay bằng `LptdUI-integrated.html` |
| UI LPTD không có style | Thiếu `LptdStyles` | Thêm `<?!= include('LptdStyles'); ?>` sau `Stylesheet` |
| `You do not have permission to call DriveApp...` | Manifest thiếu `drive`, chưa consent, hoặc deployment cũ | Thêm scope, consent đủ ô Drive, deploy version mới |
| `Authorization is required` | Deployment giữ bản ủy quyền cũ | Deploy version mới sau khi Allow |
| Không hiện link ☁ Drive | `saveUserRecording` lỗi | Xem Console; chạy `lptdAuthDiagnostics`; kiểm tra popup/mic |
| Popup ghi âm không mở | Trình duyệt chặn popup | Cho phép popup cho `script.google.com` |
| Mic bị từ chối | Quyền mic của site | Chrome → Settings → Privacy → Microphone → Allow/Reset |
| Audio 404 | CDN sai hoặc property sai | Kiểm tra `LPTD_AUDIO_CDN_BASE`; thử URL `.../LPTD1U01.mp3` |
| PDF bị ẩn trên GAS | Chưa có CDN PDF | Bình thường; đặt `LPTD_DOCS_CDN_BASE` nếu có |
| `Identifier 'saveUserRecording' has already been declared` | App tổng đã có hàm cùng tên | Đổi tên theo §7.3 cách B |
| ETS floating player đè LPTD | Chưa patch `#etsFloat` | Áp dụng §8.1 |
| Ghi âm core và LPTD lẫn nhau | Cùng protocol `postMessage` | Áp dụng §8.2 |
| `LptdData.gs` quá lớn / chậm | 160 unit inline | Bình thường (~254 KB); không cắt dữ liệu |

---

## 12. Definition of Done

Chỉ coi là hoàn tất khi:

- [ ] Local: L1–L9 đạt.
- [ ] GAS: G1–G14 đạt.
- [ ] Core: Hackers / ETS / Ôn từ sai không hồi quy.
- [ ] `lptdAuthDiagnostics` trả `hasDriveScope: true`, `driveRoot` có tên.
- [ ] File ghi âm thật sự nằm trong Drive folder `LPTD Recordings`.
- [ ] Link Drive mở được ở tab ẩn danh/điện thoại.
- [ ] Deployment mới đã tạo sau khi thêm scope.
- [ ] Không có lỗi đỏ trong Console.
- [ ] Đã ghi lại deployment ID/URL mới và ngày test.

---

## 13. Gợi ý báo cáo lại

Khi xong, gửi ngắn gọn:

```text
Đã tích hợp LPTD 1–4 vào app tổng.
- Local: OK (đã test 4 cuốn/160 unit, dictation, shadowing)
- GAS deployment mới: <URL>
- Drive: OK (folder LPTD Recordings, link public)
- Auth: hasDriveScope=true, driveRoot=My Drive
- Core regression: Hackers/ETS/Ôn từ sai OK
- Ghi chú: <các thay đổi/tên hàm đã đổi nếu có>
```
