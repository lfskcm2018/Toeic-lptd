# LPTD 1–4 — Tích hợp vào Hackers TOEIC Dictation & Shadowing

Bổ sung thư viện **Listening Practice Through Dictation 1–4** (160 unit) vào web app hiện có, chạy được cả **local** và **Google Apps Script (GAS)**.

- 4 cuốn × 40 unit = **160 unit**
- **1.041 câu thoại**, **30.555 từ**
- Audio: **Netlify CDN** (`toeic-audio.netlify.app`), CORS mở, hỗ trợ HTTP Range → tua được
- Không phụ thuộc Google Drive
- Không sửa `app/core.js`, `app/core.css`, `local-study.html`, `Code.gs` gốc

---

## 1. Chạy nhanh bản local

```bash
node op/tools/serve-lptd.js
```

Mở:

```
http://localhost:8096/op/index.html
```

> Vì sao không dùng `node server.js`? Server gốc không hỗ trợ HTTP Range nên audio local không tua được (`seekable = [0,0]`). `serve-lptd.js` trả `206 Partial Content` + `Accept-Ranges: bytes`.
>
> Nếu vẫn dùng server gốc, player sẽ hiện nút **⚡ Chuyển sang CDN**.

### Chạy không cần Node

Mở trực tiếp `op/index.html` bằng Chrome/Edge (`file://`). Audio local vẫn phát và tua được, nhưng một số trình duyệt chặn ghi âm/Web Speech trên `file://`.

---

## 2. Cấu trúc thư mục

```
op/
├── PLAN-TICH-HOP-LPTD.md          Kế hoạch + checklist
├── REPORT-TICH-HOP-LPTD.md        Báo cáo kết quả
├── README.md                      File này
├── index.html                     App tích hợp sẵn (Hackers + ETS + LPTD)
├── data/
│   ├── lptd-lessons.json          160 unit đã chuẩn hóa
│   ├── lptd-stats.json            Thống kê
│   └── lptd-cdn-manifest.csv      Map unit → CDN → file local
├── app/
│   ├── lptd-data.js               Catalog + URL builder
│   ├── lptd-lessons-data.js       window.LPTD_LESSONS_RAW (tự sinh)
│   ├── lptd-ui.js                 Module UI
│   ├── lptd-ui.css                Style bổ sung
│   ├── LptdData.gs                GAS data (tự sinh)
│   ├── Code.lptd.gs               GAS API
│   └── LptdUI.html                GAS UI bundle (tự sinh)
├── tools/
│   ├── build-lptd-data.js         JSON nguồn → JSON/JS/GAS/CSV
│   ├── build-gas-ui.js            lptd-ui.* → LptdUI.html
│   ├── validate-lptd.js           Validate dữ liệu + file local
│   ├── verify-cdn.js              HEAD 160 file CDN
│   ├── test-gas-lptd.js           Mock test GAS API
│   └── serve-lptd.js              Static server có HTTP Range
└── integration/
    ├── PATCH-local-study.md       Nhúng vào local-study.html
    ├── PATCH-GAS.md               Triển khai GAS
    └── CHECKLIST-TRIEN-KHAI.md    Checklist go-live
```

---

## 3. Lệnh thường dùng

| Việc cần làm | Lệnh |
|---|---|
| Sinh lại toàn bộ dữ liệu | `node op/tools/build-lptd-data.js` |
| Validate dữ liệu | `node op/tools/validate-lptd.js` |
| Kiểm tra CDN | `node op/tools/verify-cdn.js` |
| Sinh GAS UI bundle | `node op/tools/build-gas-ui.js` |
| Test GAS API (mock) | `node op/tools/test-gas-lptd.js` |
| Chạy server có Range | `node op/tools/serve-lptd.js` |
| Đổi cổng server | `node op/tools/serve-lptd.js --port 9000` |

Thứ tự chuẩn khi sửa dữ liệu:

```bash
node op/tools/build-lptd-data.js
node op/tools/validate-lptd.js
node op/tools/build-gas-ui.js
node op/tools/test-gas-lptd.js
```

---

## 4. Cách hoạt động

### Chế độ audio

| Chế độ | Local | GAS |
|---|---|---|
| `auto` (mặc định) | File trên đĩa, fallback CDN | CDN, fallback local (không dùng được) |
| `local` | File trên đĩa | Bị disable |
| `cdn` | Netlify CDN | Netlify CDN |

Chọn trong thư viện LPTD → mục **Nguồn audio**.

URL CDN:

```
https://toeic-audio.netlify.app/audio/lptd/LPTD{B}U{NN}.mp3
```

### Tiến độ & từ sai

| Key localStorage | Nội dung |
|---|---|
| `toeic_lptd_progress` | `{ "1-1": { dictation: {...}, shadowing: {...} } }` |
| `toeic_lptd_mistakes` | Từ nhập sai trong Dictation LPTD |
| `toeic_lptd_audio_mode` | `auto` / `local` / `cdn` |

Không ghi lẫn vào tiến độ Hackers/ETS.

### Dictation

- Ô trống tự sinh mỗi 4 từ (giống cơ chế Hackers).
- Enter để kiểm tra; đạt ≥ 70% tính hoàn thành.
- Gợi ý: chữ cái đầu/cuối + độ dài.
- Xem đáp án: chuyển ô nhập sang read-only.

### Shadowing

- Ghi âm từng câu bằng `MediaRecorder`.
- Nghe lại bản ghi.
- Chấm % bằng Web Speech API (Chrome/Edge + mạng + micro).
- Trình duyệt không hỗ trợ → vẫn ghi âm/nghe lại, ẩn nút chấm.

---

## 5. Triển khai

- **Local**: xem `op/integration/PATCH-local-study.md` hoặc dùng luôn `op/index.html`.
- **GAS**: xem `op/integration/PATCH-GAS.md`.
- **Checklist go-live**: `op/integration/CHECKLIST-TRIEN-KHAI.md`.

---

## 6. Kiểm thử đã chạy

| Hạng mục | Kết quả |
|---|---|
| `validate-lptd.js` | PASS — 160 unit / 1.041 câu / 30.555 từ / 160 MP3 local |
| `verify-cdn.js` | PASS 160/160 — `audio/mpeg`, CORS `*`, `Accept-Ranges: bytes` |
| `test-gas-lptd.js` | PASS 13/13 |
| Browser local (8096) | Sidebar, thư viện 4×40, unit, seek, dictation, shadowing OK |
| Seek local | `seekable = [0, 89.22]`, `currentTime = 30` giữ đúng |
| Seek CDN | `seekable = [0, 89.22]` |
| Không hồi quy | Hackers DAY 01, ETS 2026, Ôn từ sai OK |
| Mobile 375px (iframe) | Không tràn ngang; thư viện 1 cột |
| Hiệu năng | Mở thư viện ~8.8 ms; mở unit ~5.3 ms |

---

## 7. Xử lý sự cố

| Hiện tượng | Nguyên nhân | Cách xử lý |
|---|---|---|
| Audio local không tua được | Server thiếu HTTP Range | Dùng `serve-lptd.js` hoặc bấm **⚡ Chuyển sang CDN** |
| Nút PDF bị disable trên GAS | Chưa có `LPTD_DOCS_CDN_BASE` | Cấu hình Settings hoặc dùng bản local |
| Không chấm % Shadowing | Thiếu Web Speech API / micro / mạng | Dùng Chrome/Edge, cấp quyền micro, chạy HTTPS |
| Bấm LPTD nhưng hiện DAY | Core render đè khi tải chậm | Đã tự phục hồi bằng MutationObserver; tải lại trang nếu cần |
| Audio 404 trên GAS | Sai `LPTD_AUDIO_CDN_BASE` | Kiểm tra Settings; mặc định `.../audio/lptd` |
| LPTD không xuất hiện trên GAS | Thiếu include | Thêm `<?!= include('LptdUI'); ?>` sau `JavaScript` |
