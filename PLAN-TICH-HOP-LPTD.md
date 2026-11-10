# KẾ HOẠCH TÍCH HỢP "LISTENING PRACTICE THROUGH DICTATION" (LPTD 1–4) VÀO WEB APP

**Dự án:** Hackers TOEIC 700+ — Web App Dictation & Shadowing
**Ngày lập:** 10/11/2026
**Người lập:** Chuyên gia xây dựng & nâng cấp dự án
**Thư mục đầu ra:** `E:\CÁ NHÂN\03. Quyet.nv\29. Học chép chính tả TOEIC\op\`
**Quy ước:** Mọi file do đợt công việc này tạo ra đều nằm trong `op\`. Không sửa file gốc `app\` / `local-study.html` / `Code.gs` cho đến khi người dùng duyệt.

---

## 1. MỤC TIÊU

Tích hợp nguồn tài liệu **Listening Practice Through Dictation 1–4** (160 unit) vào web app hiện có, dưới dạng **thư viện thứ 3** bên cạnh:

- Hackers TOEIC 700+ (20 DAY / 153 câu) — trụ chính.
- ETS 2026 (10 Test / 540 clip) — thư viện luyện đề.
- **LPTD 1–4 (4 cuốn × 40 unit = 160 unit)** — thư viện nghe – chép chính tả bổ trợ.

Mỗi unit LPTD phải chạy được **đầy đủ 2 chế độ**:

1. **Dictation**: nghe audio → điền từ vào ô trống (tự sinh blanks) → kiểm tra đáp án → xem transcript.
2. **Shadowing**: nghe lại → ghi âm từng câu → nghe bản ghi → chấm độ chính xác bằng Web Speech API (Chrome + mạng).

Yêu cầu phi chức năng:

- Không làm hỏng 3 thư viện/chức năng hiện có (Hackers, ETS, Ôn từ sai).
- Chạy được **local** (`node server.js`) và **GAS** (Google Apps Script).
- Audio phát trực tiếp, **tua được**, **CORS thoáng**, **không phụ thuộc Google Drive** (đang lỗi login-wall/CORS).
- Responsive desktop + mobile, giữ phong cách Duolingo/Parroto và Light/Dark hiện có.

---

## 2. HIỆN TRẠNG ĐÃ KHẢO SÁT

### 2.1. Cấu trúc app hiện tại

| Thành phần | Vai trò | Ghi chú tích hợp |
|---|---|---|
| `app/core.js` (48KB) | SPA logic: sidebar, player, dictation, shadowing, progress, ETS, mistake review | Có sẵn `app.audio`, `makeBlanks`, `renderBlanks`, `exactMatch`, `norm`, `escHtml`, `GAS_OK`, `gasCall` |
| `app/core.css` (20KB) | Design system Duolingo/Parroto, Light/Dark, class `card`, `btn`, `blank-input`, `quiz-card`, `mode-tabs`, `player-card`… | Tái sử dụng 100% class, chỉ thêm CSS cho module LPTD |
| `app/data.js` | `LocalBackend` + 20 DAY Hackers + `AUDIO_DIR` | Chỉ dùng local |
| `app/lesson-data.js` | Transcript 20 DAY (153 items) | Không đụng |
| `app/ets-data.js` | Catalog ETS 540 clip + tài liệu | Không đụng |
| `app/Code.gs` (22KB) | Backend GAS: `doGet`, `getLessonsList`, `getLessonData`, `saveUserProgress`, `getETSResourceLinks`, `audioUrl_`, `r2AudioUrlFor_`, `audioCdnBase_`, `settingsMap_` | Thêm API LPTD |
| `app/Index.html` | Shell SPA GAS | Thêm 1 include `LptdUI` |
| `app/JavaScript.html` | Bản GAS của `core.js` | Không sửa; module LPTD là file riêng |
| `local-study.html` | Bản chạy local | Thêm 3 `<script>` + 1 `<link>` (hoặc dùng `op/index.html`) |
| `app/ETSLibrary.html` | Include catalog ETS | Không đụng |

### 2.2. Nguồn tài liệu LPTD trên đĩa

| Cuốn | Thư mục | MP3 | Transcript | Tài liệu khác |
|---|---|---|---|---|
| LPTD 1 | `Listening Practice Through Dictation 1\` | 40 | `Audio + Transcipt\ListeningPracticeThroughDictation_1_Transcripts.pdf` | Sách PDF 13.8MB |
| LPTD 2 | `Listening Practice Through Dictation 2\` | 40 | `Audio + Transcipt\LPTD 2_Transcripts.pdf` | Sách PDF 15.3MB |
| LPTD 3 | `Listening Practice Through Dictation 3\` | 40 | `Audio + Transcipt\LPTD 3_transcript.pdf` | Sách PDF 32.4MB + Answer key 46KB |
| LPTD 4 | `Listening Practice Through Dictation 4\` | 40 | `LPTD4.pdf` (168KB, thực chất là transcript) + `Audio + Transcipt\ListeningPracticeThroughDictation_4_transcript.pdf` | — |

**Tổng dữ liệu transcript đã xác thực (từ `Agnes/data/lptd-lessons.json`):**

- **160 unit** (40 unit/cuốn).
- **1.041 câu thoại**.
- **30.555 từ** (sau khi sửa lỗi trích xuất PDF).
- **0 file MP3 thiếu** so với `audioFileName` trong JSON.

### 2.3. Audio CDN — phát hiện quan trọng

CDN Netlify hiện tại **đã host sẵn toàn bộ 160 MP3 LPTD**:

```
https://toeic-audio.netlify.app/audio/lptd/LPTD1U01.mp3   → HTTP 200, audio/mpeg, CORS=*, Accept-Ranges=bytes
...
https://toeic-audio.netlify.app/audio/lptd/LPTD4U40.mp3
```

Đã kiểm chứng **160/160 file PASS** (HTTP 200/206 + `audio/mpeg` + `CORS=*` + `Accept-Ranges: bytes`). Vì vậy:

- **Không cần upload lại audio.**
- GAS chỉ cần ghép URL: `audioCdnBase_() + '/lptd/LPTD{B}U{NN}.mp3'`.
- Local có thể đọc file trên đĩa (nhanh, offline) hoặc dùng CDN (fallback).

### 2.4. Nguồn transcript đã có

`Agnes/data/lptd-lessons.json` do Agent Agnes trích từ 4 transcript PDF, đã validate 160/160 và khớp 160/160 MP3. Đây là **nguồn dữ liệu đầu vào** của đợt tích hợp này (có thể tái sinh bằng parser nếu cần).

---

## 3. KIẾN TRÚC TÍCH HỢP

### 3.1. Sơ đồ tổng quát

```
┌──────────────────────────────────────────────────────────────┐
│                      WEB APP (local / GAS)                    │
│                                                              │
│  Sidebar:  🎧 Hackers 20 DAY │ 📚 ETS 2026 │ 📚 LPTD 1-4     │
│                                    │                         │
│                    ┌───────────────▼────────────────┐        │
│                    │   LPTD MODULE (op/app)         │        │
│                    │  - Thư viện 4 cuốn × 40 unit   │        │
│                    │  - Dictation (auto blanks)      │        │
│                    │  - Shadowing (record + assess)  │        │
│                    │  - Player riêng (seek/speed)    │        │
│                    │  - Progress localStorage        │        │
│                    └───────────────┬────────────────┘        │
│                                    │                         │
│              ┌─────────────────────┴──────────────────┐      │
│              │ LOCAL MODE                    GAS MODE │      │
│              │ LPTD_LESSONS_RAW              getLptdLessons() │
│              │ audio: file trên đĩa          audio: Netlify CDN │
│              └────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

### 3.2. Nguyên tắc thiết kế

1. **Module độc lập, không xâm lấn core**: `lptd-ui.js` tự render vào `#modeBody`, tự quản lý audio/dictation/shadowing, ẩn UI core khi hoạt động; không sửa `core.js`.
2. **Tái sử dụng design system**: dùng class `card`, `btn`, `blank-input`, `quiz-card`, `mode-tabs`, `player-card`, `seek`, `speed-select`… từ `core.css`.
3. **Một file UI dùng cho cả local và GAS**: `lptd-ui.js` tự phát hiện `GAS_OK`.
4. **Dữ liệu tách khỏi UI**:
   - Local: `lptd-lessons-data.js` (160 unit) + `lptd-data.js` (catalog/URL).
   - GAS: `LptdData.gs` (server-side 160 unit) + `Code.lptd.gs` (API).
5. **Audio ưu tiên CDN khi GAS**, local khi chạy máy; có fallback CDN nếu file local lỗi.
6. **Không đụng Google Drive** cho audio LPTD.

---

## 4. CẤU TRÚC FILE ĐẦU RA (TRONG `op/`)

```
op/
├── PLAN-TICH-HOP-LPTD.md          ← file này (kế hoạch + checklist)
├── REPORT-TICH-HOP-LPTD.md        ← báo cáo kết quả & bàn giao
├── README.md                      ← hướng dẫn chạy & triển khai nhanh
├── index.html                     ← app tích hợp sẵn, mở qua server (không sửa file gốc)
├── data/
│   ├── lptd-lessons.json          ← 160 unit (nguồn máy, validate)
│   ├── lptd-stats.json            ← thống kê (unit/câu/từ/theo cuốn)
│   └── lptd-cdn-manifest.csv      ← 160 dòng map unit → CDN → file local
├── app/
│   ├── lptd-data.js               ← catalog: BOOKS, DOCS, audio name/URL builder
│   ├── lptd-lessons-data.js       ← window.LPTD_LESSONS_RAW (160 unit)
│   ├── lptd-ui.js                 ← module UI (library + dictation + shadowing + player)
│   ├── lptd-ui.css                ← style bổ sung cho module
│   ├── LptdData.gs                ← GAS: function LPTD_LESSONS() (160 unit)
│   ├── Code.lptd.gs               ← GAS: getLptdBooks/getLptdLessons/getLptdResourceLinks/debug
│   └── LptdUI.html                ← GAS: bọc lptd-ui.js trong <script> để include
├── tools/
│   ├── build-lptd-data.js         ← sinh data JS + GAS + CSV từ JSON nguồn
│   ├── build-gas-ui.js            ← sinh LptdUI.html từ lptd-ui.js
│   ├── validate-lptd.js           ← validate 160 unit, audio local, mapping CDN
│   ├── verify-cdn.js              ← HEAD 160 file CDN Netlify
│   ├── test-gas-lptd.js           ← mock test GAS API (không cần deploy)
│   └── serve-lptd.js              ← static server có HTTP Range (seek audio)
└── integration/
    ├── PATCH-local-study.md       ← 4 dòng cần thêm vào local-study.html
    ├── PATCH-GAS.md               ← các bước thêm file + include + Settings
    └── CHECKLIST-TRIEN-KHAI.md    ← checklist go-live từng bước
```

---

## 5. ĐẶC TẢ DỮ LIỆU

### 5.1. Cấu trúc 1 unit

```json
{
  "book": 1,
  "unit": 1,
  "title": "A Picnic by the River",
  "audioFileName": "Unit 1- A picnic by the river.mp3",
  "lines": [
    { "speaker": "W", "text": "This is a good spot. Let’s stop …", "no": 1 },
    { "speaker": "M", "text": "Good idea. Walking always makes me hungry …", "no": 2 }
  ]
}
```

### 5.2. Quy ước audio

| Môi trường | URL |
|---|---|
| Local | `<LPTD_BASE>Listening Practice Through Dictation <book>/Audio + Transcipt/<audioFileName>` (encode từng segment) |
| GAS / CDN | `https://toeic-audio.netlify.app/audio/lptd/LPTD<book>U<NN>.mp3` |
| Override GAS | Sheet `Settings` key `LPTD_AUDIO_CDN_BASE` (nếu có) |

### 5.3. Quy ước tiến độ

- Key localStorage: `toeic_lptd_progress`.
- Dạng: `{ "1-1": { dictation: {score, completed, updated}, shadowing: {...}, viewed: true } }`.
- Không ghi lẫn vào `toeic_progress_*` của Hackers.
- Không ghi lẫn vào dashboard "Ôn từ sai" toàn cục (tránh link DAY sai); ghi riêng `toeic_lptd_mistakes` nếu bật.

### 5.4. Tài liệu đính kèm

| Nhãn | File |
|---|---|
| Sách LPTD 1 | `Listening Practice Through Dictation 1/Listening Practice Through Dictation 1.pdf` |
| Transcript LPTD 1 | `Listening Practice Through Dictation 1/Audio + Transcipt/ListeningPracticeThroughDictation_1_Transcripts.pdf` |
| Sách LPTD 2 | `Listening Practice Through Dictation 2/Listening Practice Through Dictation 2.pdf` |
| Transcript LPTD 2 | `Listening Practice Through Dictation 2/Audio + Transcipt/LPTD 2_Transcripts.pdf` |
| Sách LPTD 3 | `Listening Practice Through Dictation 3/Listening Practice Through Dictation 3.pdf` |
| Transcript LPTD 3 | `Listening Practice Through Dictation 3/Audio + Transcipt/LPTD 3_transcript.pdf` |
| Answer Key LPTD 3 | `Listening Practice Through Dictation 3/LPTD_3_Answer_key.pdf` |
| Transcript LPTD 4 | `Listening Practice Through Dictation 4/LPTD4.pdf` |
| Transcript LPTD 4 (bản 2) | `Listening Practice Through Dictation 4/Audio + Transcipt/ListeningPracticeThroughDictation_4_transcript.pdf` |

---

## 6. KẾ HOẠCH THỰC HIỆN (CHECKLIST TODO)

### Phase 0 — Khảo sát & chốt kiến trúc

- [x] Đọc cấu trúc `app/` (core.js, core.css, Index.html, JavaScript.html, Code.gs, data.js, ets-data.js).
- [x] Khảo sát nguồn `Listening Practice Through Dictation/` (160 MP3, 7 PDF).
- [x] Xác thực `Agnes/data/lptd-lessons.json`: 160 unit / 1.041 câu / 30.519 từ / 0 MP3 thiếu.
- [x] Xác thực CDN Netlify: **160/160 file LPTD PASS** (audio/mpeg, CORS=*, Range).
- [x] Chốt kiến trúc module độc lập, không sửa core.

### Phase 1 — Dữ liệu & build

- [x] Viết `op/tools/build-lptd-data.js` (JSON → JS local + GAS + CSV + stats).
- [x] Sinh `op/data/lptd-lessons.json` (chuẩn hóa, validate).
- [x] Sinh `op/app/lptd-lessons-data.js` (`window.LPTD_LESSONS_RAW`).
- [x] Sinh `op/app/LptdData.gs` (`function LPTD_LESSONS()`).
- [x] Sinh `op/data/lptd-cdn-manifest.csv` (160 dòng).
- [x] Sinh `op/data/lptd-stats.json`.
- [x] Viết `op/tools/validate-lptd.js` và chạy PASS.

### Phase 2 — Catalog & URL

- [x] Viết `op/app/lptd-data.js`: `LPTD_BOOKS`, `LPTD_DOCS`, `LPTD.audioName`, `LPTD.unitUrl`, `LPTD.docUrl`, chế độ audio `auto/local/cdn`.

### Phase 3 — UI module (local + GAS)

- [x] Viết `op/app/lptd-ui.js`:
  - [x] Inject nút "📚 LPTD 1-4" vào sidebar, không cần sửa HTML.
  - [x] Thư viện: 4 tab cuốn, 40 unit/cuốn, tìm kiếm, tiến độ, tài liệu PDF.
  - [x] Player: play/pause, seek, 0.75x/1x/1.25x, phát lại 3 lần, fallback CDN.
  - [x] Dictation: auto blanks (mỗi 4 từ), check answer, show answers, score.
  - [x] Shadowing: ghi âm từng câu, nghe bản ghi, chấm % qua Web Speech API.
  - [x] Progress localStorage riêng; từ sai riêng (tùy chọn).
  - [x] Ẩn/khôi phục UI core an toàn khi chuyển thư viện.
  - [x] Responsive mobile.
- [x] Viết `op/app/lptd-ui.css`.
- [x] `node --check` các file JS.

### Phase 4 — Demo & patch tích hợp

- [x] Viết `op/index.html` (app tích hợp sẵn; viết lại tiền tố `../` cho Hackers/ETS và đặt `LPTD_LOCAL_BASE = '../'` cho LPTD).
- [x] Viết `op/integration/PATCH-local-study.md` (các dòng cần thêm vào `local-study.html` gốc).
- [x] Viết `op/integration/PATCH-GAS.md` (thêm `LptdData.gs`, `Code.lptd.gs`, `LptdUI.html`, include, Settings).
- [x] Viết `op/app/Code.lptd.gs`.
- [x] Viết `op/tools/build-gas-ui.js` → sinh `op/app/LptdUI.html`.
- [x] Viết `op/integration/CHECKLIST-TRIEN-KHAI.md`.
- [x] Viết `op/README.md`.

### Phase 5 — Kiểm thử

- [x] `node op/tools/verify-cdn.js` → 160/160 PASS.
- [x] `node op/tools/validate-lptd.js` → 160 unit, 0 lỗi.
- [x] Chạy server có HTTP Range (`op/tools/serve-lptd.js`) → mở `http://localhost:8096/op/index.html`; ghi chú `server.js` gốc không tua được audio local.
- [x] Kiểm tra sidebar có nút LPTD; mở thư viện; 4 cuốn; 40 unit/cuốn.
- [x] Mở Unit 1 LPTD 1 → audio phát; seek; speed; replay 3 lần.
- [x] Dictation: điền đúng/sai → check answer highlight; show answers; điểm %.
- [x] Shadowing: ghi âm, nghe lại, chấm % (Chrome + mạng).
- [x] Chuyển sang Hackers/ETS/Ôn từ sai → UI core hoạt động bình thường.
- [x] Mobile viewport (375px) không tràn layout (kiểm tra qua iframe 375px).
- [ ] (GAS) Checklist deploy: paste file → include → deploy → test. *(Chờ deploy thật trên tài khoản Apps Script — xem `op/integration/PATCH-GAS.md`.)*

### Phase 6 — Báo cáo & bàn giao

- [x] Cập nhật checklist này (đánh dấu `[x]`).
- [x] Viết `op/REPORT-TICH-HOP-LPTD.md`: kết quả, số liệu, ảnh hưởng, việc còn lại.
- [ ] Ghi chú cập nhật tiến độ vào `kế hoạch xây dựng dự án.md` (khi được duyệt gộp).

---

## 7. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE)

1. **Đủ dữ liệu**: 160 unit, 40/cuốn, 0 unit rỗng, 0 MP3 thiếu.
2. **Audio**: 160/160 URL CDN trả HTTP 200 + `audio/mpeg`; player seek được (Range 206).
3. **Chức năng**: Dictation + Shadowing chạy đúng cho ít nhất 4 unit đại diện (1 unit/cuốn).
4. **Không hồi quy**: Hackers 20 DAY, ETS 2026, Ôn từ sai vẫn hoạt động.
5. **Hiệu năng**: mở thư viện < 1s (local), không tải toàn bộ 160 MP3.
6. **Tương thích**: Chrome/Edge desktop + mobile 375px.
7. **Sạch mã**: không có lỗi console; không hard-code credential; không phụ thuộc Drive cho audio.

---

## 8. RỦI RO & GIẢI PHÁP

| Rủi ro | Mức độ | Giải pháp |
|---|---|---|
| Transcript LPTD 1–2 là sách scan ảnh; vị trí blanks gốc không lấy được | Thấp | Dùng auto-blanks mỗi 4 từ (đúng cơ chế Hackers); OCR để sau |
| Audio local có tên file chứa dấu cách/apostrophe | Thấp | `encodeURIComponent` từng segment; fallback CDN |
| GAS không đọc được file local | Cao | Bắt buộc dùng CDN `/lptd/LPTD{B}U{NN}.mp3` |
| 160 MP3 tải nhiều nếu preload hết | Trung bình | Chỉ `preload="metadata"`; tải khi bấm play |
| Xung đột UI với core khi chuyển thư viện | Trung bình | Module ẩn/khôi phục `.mode-tabs`, `#playerCard`, `#quizFooter`; capture listener khi rời LPTD |
| Web Speech API cần Chrome + mạng | Thấp | Ẩn nút chấm % nếu không hỗ trợ; hiển thị cảnh báo |
| Netlify free 100GB/tháng | Thấp | 160 MP3 ~205MB; chỉ tải khi nghe; theo dõi băng thông |
| Sai lệch dữ liệu so với Agnes JSON | Thấp | Validate 160/160 + so khớp audioFileName với đĩa |

---

## 9. ROLLBACK

- **Local**: chỉ cần xoá 4 dòng `<script>/<link>` khỏi `local-study.html` (hoặc không dùng `op/index.html`).
- **GAS**: xoá `LptdData.gs`, xoá nội dung `Code.lptd.gs` khỏi `Code.gs`, xoá `<?!= include('LptdUI'); ?>` khỏi `Index.html`, deploy lại version trước.
- **Dữ liệu**: không ảnh hưởng Sheet/Drive; không cần xoá gì.
- **Audio**: không upload/xoá file nào trên Netlify.

---

## 10. NHẬT KÝ TIẾN ĐỘ

| Ngày | Hạng mục | Trạng thái | Ghi chú |
|---|---|---|---|
| 10/11/2026 | Khảo sát app + nguồn LPTD + CDN | ✅ Xong | 160/160 MP3 có trên Netlify |
| 10/11/2026 | Soạn kế hoạch + checklist | ✅ Xong | File này |
| 10/11/2026 | Phase 1 — Dữ liệu & build | ✅ Xong | 160 unit / 1.041 câu / 30.555 từ / 160 MP3 |
| 10/11/2026 | Phase 2 — Catalog & URL | ✅ Xong | `lptd-data.js` |
| 10/11/2026 | Phase 3 — UI module | ✅ Xong | Thư viện, player, dictation, shadowing |
| 10/11/2026 | Phase 4 — Demo & patch | ✅ Xong | `op/index.html`, GAS bundle, tài liệu patch |
| 10/11/2026 | Phase 5 — Kiểm thử local | ✅ Xong | 160/160 CDN; seek; không hồi quy; 375px |
| 10/11/2026 | Phase 5 — Kiểm thử GAS thật | ⏳ Chờ | Cần deploy lên tài khoản Apps Script |
| 10/11/2026 | Phase 6 — Báo cáo | ✅ Xong | `REPORT-TICH-HOP-LPTD.md` |
