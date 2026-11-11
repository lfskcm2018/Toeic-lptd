# Bàn giao module LPTD 1–4

> **Đối tượng:** AI / dev của **dự án tổng** (TOEIC app: Hackers 20 DAY + ETS 2026 + Ôn từ sai).
> **Mục tiêu:** tích hợp module Listening Practice Through Dictation 1–4 vào app tổng mà **không sửa core** và **không phá** các tính năng hiện có.
> **Ngày bàn giao:** 2026-11-11
> **Nguồn:** `op/` (repo `lfskcm2018/Toeic-lptd`, nhánh `master`, base commit `7d2832d`)
> **Bản tham chiếu đã chạy ổn định:** deployment độc lập **@13** — `AKfycbyBtbIBaQCopgUEGvj9smruaNO7z5cTKjpnsUz7QoQ6wluomKorxe1zqOtqMu0VvLFa`

---

## 1. Bàn giao gồm những gì?

Module LPTD là **module tự chứa**:

- 4 cuốn × 40 unit = **160 unit**, **1.041 câu**, **30.555 từ**.
- Audio phát trực tiếp từ CDN: `https://toeic-audio.netlify.app/audio/lptd`.
- Có **Dictation**, **Shadowing**, ghi âm, nghe lại, chấm % bằng Web Speech API.
- Trên GAS: lưu bản ghi lên **Google Drive** (thư mục `LPTD Recordings`), đồng bộ đa thiết bị bằng mã `toeic_lptd_uid`.
- Tự inject nút **📚 LPTD 1–4** vào `.sidebar-footer`, tự ẩn player/tab/footer của core khi mở, tự khôi phục khi đóng.

```
op/ban-giao/
├─ README.md                       ← file này (index + manifest)
├─ HUONG-DAN-AI-TICH-HOP.md        ← HƯỚNG DẪN CHÍNH, đọc trước khi sửa
├─ CHECKLIST-TICH-HOP.md           ← checklist thực thi
├─ SHA256SUMS.txt                  ← hash toàn bộ file bàn giao
├─ files/
│  ├─ app/                         ← dùng cho local web app
│  │  ├─ lptd-data.js
│  │  ├─ lptd-lessons-data.js
│  │  ├─ lptd-ui.js
│  │  └─ lptd-ui.css
│  └─ gas/                         ← dùng cho Google Apps Script
│     ├─ LptdData.gs
│     ├─ LptdServer.gs             ← đã bỏ doGet/include, tự chứa
│     ├─ LptdUI-integrated.html    ← DÙNG FILE NÀY cho app tổng
│     ├─ LptdStyles.html           ← CSS bổ sung, include sau Stylesheet
│     ├─ LptdUI.html               ← bản standalone, CÓ auto-open, chỉ tham khảo
│     └─ appsscript.main.example.json
└─ recording-engine/               ← popup ghi âm (GitHub Pages)
   ├─ index.html
   ├─ engine.js
   └─ style.css
```

---

## 2. Chọn đúng đường tích hợp

| Đường | Dùng khi | File cần dùng |
|---|---|---|
| **A. Local web app** | Chạy `local-study.html` bằng static server | `files/app/*` |
| **B. Google Apps Script** | App tổng deploy trên GAS (`app/Code.gs` + `app/Index.html`) | `files/gas/LptdData.gs`, `LptdServer.gs`, `LptdUI-integrated.html`, `LptdStyles.html` |

> ⚠️ **Không dùng nhầm** `files/gas/LptdUI.html` cho app tổng. File đó là bundle standalone, có **auto-open LPTD ngay khi tải trang**. App tổng phải dùng `LptdUI-integrated.html` (không auto-open).

---

## 3. Quick start

### A. Local (5 phút)

1. Copy 4 file `files/app/*` vào thư mục `app/` của dự án tổng.
2. Trong `local-study.html`, thêm sau `<link rel="stylesheet" href="app/core.css">`:
   ```html
   <link rel="stylesheet" href="app/lptd-ui.css">
   ```
3. Thêm sau `<script src="app/core.js"></script>`:
   ```html
   <script src="app/lptd-lessons-data.js"></script>
   <script src="app/lptd-data.js"></script>
   <script src="app/lptd-ui.js"></script>
   ```
4. Chạy static server tại thư mục gốc dự án, mở `local-study.html` bằng Chrome/Edge.
5. Kiểm tra nút **📚 LPTD 1–4** trong sidebar.

### B. Google Apps Script (10 phút + cấp quyền)

1. Thêm 2 file script: `LptdData` ← `files/gas/LptdData.gs`; `LptdServer` ← `files/gas/LptdServer.gs`.
2. Thêm 2 file HTML: `LptdUI` ← `files/gas/LptdUI-integrated.html`; `LptdStyles` ← `files/gas/LptdStyles.html`.
3. Trong `app/Index.html`:
   - `<head>`: thêm `<?!= include('LptdStyles'); ?>` ngay sau `<?!= include('Stylesheet'); ?>`.
   - Cuối file, sau `<?!= include('JavaScript'); ?>`: thêm
     ```html
     <script>
       window.LPTD_RECORDING_ENGINE_URL = '<?!= RECORDING_ENGINE_URL ?>';
     </script>
     <?!= include('LptdUI'); ?>
     ```
4. Trong `app/Code.gs`, sửa `doGet(e)` để bơm `RECORDING_ENGINE_URL` (xem hướng dẫn §5.3).
5. Trong `app/appsscript.json`, thêm `oauthScopes` (xem §5.4).
6. Chạy `lptdAuthDiagnostics` → cấp quyền Drive → **deploy version mới**.
7. Mở web app, vào 1 unit → Shadowing → ghi âm → kiểm tra link **☁ Drive**.

Chi tiết từng bước, code patch chính xác và test matrix: xem **`HUONG-DAN-AI-TICH-HOP.md`**.

---

## 4. File manifest

| File bàn giao | Kích thước | Đích trong app tổng | Ghi chú |
|---|---:|---|---|
| `files/app/lptd-data.js` | 8.770 B | `app/lptd-data.js` | Catalog 4 cuốn + URL builder (`window.LPTD`) |
| `files/app/lptd-lessons-data.js` | 253.909 B | `app/lptd-lessons-data.js` | 160 unit cho **local** (`window.LPTD_LESSONS_RAW`) |
| `files/app/lptd-ui.js` | 72.166 B | `app/lptd-ui.js` | Toàn bộ UI + player + shadowing + Drive sync |
| `files/app/lptd-ui.css` | 16.594 B | `app/lptd-ui.css` | CSS riêng, class `lptd-*` |
| `files/gas/LptdData.gs` | 253.775 B | `LptdData` (script) | `LPTD_LESSONS_META()`, `LPTD_LESSONS()` |
| `files/gas/LptdServer.gs` | 11.510 B | `LptdServer` (script) | API server + Drive; **không có** `doGet`/`include` |
| `files/gas/LptdUI-integrated.html` | 81.249 B | `LptdUI` (HTML) | Data + UI, **không auto-open** |
| `files/gas/LptdStyles.html` | 16.779 B | `LptdStyles` (HTML) | Chỉ CSS LPTD; core.css đã có sẵn |
| `files/gas/LptdUI.html` | 82.038 B | — | Bundle standalone, **có auto-open**, chỉ tham khảo |
| `files/gas/appsscript.main.example.json` | 382 B | `app/appsscript.json` | Manifest mẫu cho app tổng |
| `recording-engine/index.html` | 2.108 B | GitHub Pages | Trang popup ghi âm |
| `recording-engine/engine.js` | 17.772 B | GitHub Pages | Xử lý mic + Web Speech |
| `recording-engine/style.css` | 4.513 B | GitHub Pages | Style popup |

> Hash SHA-256 đầy đủ: xem `SHA256SUMS.txt`.
> Nếu file nào bị sửa tay, hash sẽ khác — đó là dấu hiệu cần kiểm tra lại.

---

## 5. Ba điều quan trọng nhất

1. **`LptdServer.gs` đã bỏ `doGet()` và `include()`** vì `app/Code.gs` của dự án tổng đã có hai hàm này. **Không dán lại** `doGet`/`include` từ bản standalone — sẽ lỗi trùng hàm.
2. **Phải thêm `oauthScopes`** vào manifest và **deploy version mới** sau khi cấp quyền Drive. Chỉ chạy `authorizeLptdDrive()` trong editor là chưa đủ cho web app đang chạy.
3. **Không sửa `app/core.js`** cho module này. Module chỉ đọc/ghi DOM qua các ID có sẵn (`#modeBody`, `.sidebar-footer`, `#playerCard`, `.mode-tabs`, `#quizFooter`, các `hero*`). Nếu cần thay đổi, ưu tiên thêm file include/patch nhỏ, không sửa core.

---

## 6. Tài liệu liên quan

| File | Nội dung |
|---|---|
| `HUONG-DAN-AI-TICH-HOP.md` | Hướng dẫn đầy đủ: kiến trúc, patch chính xác, API, xung đột tên, test, rollback |
| `CHECKLIST-TICH-HOP.md` | Checklist tick từng bước, dùng khi thực thi |
| `SHA256SUMS.txt` | Hash kiểm tra tính toàn vẹn file bàn giao |
| `op/AI-GUIDE-SHADOWING-AUDIO.md` | Hướng dẫn gốc về Shadowing + Recording Engine + cấp quyền Drive |
| `op/integration/PATCH-GAS.md` | Patch GAS cũ (tham khảo lịch sử, có điểm khác bản này) |

---

## 7. Trạng thái đã kiểm chứng trên bản độc lập (@13)

- [x] Tải 160 unit, 4 cuốn, audio CDN phát được, seek + tốc độ + âm lượng.
- [x] Floating player hoạt động, lưu tốc độ/âm lượng vào localStorage.
- [x] Ghi âm bằng popup Recording Engine (Chrome/Edge, có mic).
- [x] Lưu bản ghi lên Drive, file public `ANYONE_WITH_LINK`, link tải HTTP 200 `audio/wav`.
- [x] `getUserRecordings(uid, book, unit)` trả đúng map `{line: {url, ts}}`.
- [x] UI hiện link **☁ Drive** sau khi lưu; đổi mã `toeic_lptd_uid` để đồng bộ máy khác.
- [x] `lptdDeleteRecording` xoá file + metadata.
- [x] Chuyển unit/dừng player không rò âm thanh; đóng module khôi phục UI core.

> Các điểm **chưa** kiểm chứng trên app tổng: xung đột với `#etsFloat` và listener `postMessage` của core. Đã có patch tương thích trong hướng dẫn (§8).
