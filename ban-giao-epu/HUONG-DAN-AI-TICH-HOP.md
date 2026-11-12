# HƯỚNG DẪN AI TÍCH HỢP — EPI Elementary (book 9)

## 0. Bối cảnh

Module LPTD trong app tổng hiện đã gộp 8 nguồn:

| Book | Nguồn | Số unit |
|---|---|---|
| 1–4 | Listening Practice Through Dictation 1–4 | 160 |
| 5 | Hackers TOEIC 1000 LC — Hacker 1 | 30 |
| 6 | Dictation Part 2 | 11 |
| 7 | 600+ | 32 |
| 8 | 750+ | 20 |
| **9** | **English Pronunciation in Use Elementary (EPI)** | **58** (50 unit + 8 mục Section E) |

## 1. Thứ tự thực hiện (không được bỏ bước nào)

1. **Đọc** `README.md` + `patches/01-SERVER-CODE.md` + `patches/02-CLIENT-UI.md`.
2. **Copy** `files/gas/EpiData.gs` → `app/EpiData.gs` và `files/gas/EpiServer.gs` → `app/EpiServer.gs`.
3. **Patch** `app/LptdServer.gs` (3 chỗ trong `getLptdBootstrap()`).
4. **Patch** `app/lptd-data.js` (thêm book 9 vào `BOOKS`).
5. **Patch** `app/lptd-ui.js` (concat `res.epiLessons`, sidebar, panel EPI, nhãn tổng).
6. **Build** `app/LptdUI.html` bằng `tools/build-lptdui-integrated.js`.
7. **Push + deploy**: `clasp push` rồi `clasp deploy -m "…"`.
8. **Test E2E** bằng trình duyệt (mục 3).
9. **Cập nhật** `CHECKLIST-TICH-HOP.md` + `SHA256SUMS.txt`.

> **Không sửa tay `app/LptdUI.html`** — luôn build lại từ `lptd-data.js` + `lptd-ui.js`.

## 2. Audio

- Đã đẩy sẵn **351 file MP3** lên GitHub Pages:
  `https://lfskcm2018.github.io/Toeic-lptd/epu-audio/CD{1..5}-Track{01..}.mp3`
- Manifest: `files/audio/epu-cdn-manifest.json` (đếm theo CD) và `upload-manifest.csv`.
- **Netlify đã hết quota** → không dùng Netlify cho EPI.
- Nếu cần đổi nguồn: đặt Script Property `EPI_AUDIO_CDN_BASE`.

## 3. Kiểm thử E2E (bắt buộc)

| # | Hạng mục | Kỳ vọng |
|---|---|---|
| 1 | `getLptdBootstrap()` | `lessonCount=160`, `epiLessonCount=58` |
| 2 | Sidebar | “📚 LPTD 1–9” có nhánh “🗣️ EPI Elementary” |
| 3 | Thư viện → tab EPI | `58 unit`, summary “EPI Elementary · 50 unit + Section E · 351 audio” |
| 4 | Unit 15 | Head “Unit 15 — Both together”, panel “CD B · track 14–19 · sách trang 38”, 6 nút track |
| 5 | Bài tập | 3 bài, nút “Xem đáp án” hiện đáp án (unit 15 có 15.1/15.3/15.4) |
| 6 | Audio | mọi URL `…/CDx-TrackNN.mp3` trả HTTP 206 (Range) |
| 7 | Regression | LPTD 160 + H1 30 + DP2 11 + 600+ 32 + 750+ 20 = 253 unit không đổi; tổng 311 |
| 8 | Dictation/Shadowing | vẫn chạy ở các book cũ |
| 9 | Web app EPI riêng | Script `1uamRFmYlNanNmc57OqzPjnGEQ_z02UMa6w7wwVYC7qsGB6FbsuPEwOgG` — deploy @18 — 50 unit + Section E, E1/E3/E6 render đúng |

## 4. Những chỗ dễ sai

- `EPI_BOOK` phải là **9** (không trùng 5–8).
- `app/lptd-ui.js`: cần patch **cả** `apply()` (concat) **và** `injectSidebarButton()` (entries).
- Panel EPI phải được bind **sau** khi `host.innerHTML = html` trong `renderUnit()`.
- `openLibrary(book)` — bug có sẵn đã được sửa; nếu bản của bạn chưa có, phải sửa (xem patch 01).
- Deploy bị lỗi “Scripts may only have up to 20 versioned deployments” → xoá deployment cũ bằng
  `clasp delete-deployment <id>`.

## 5. Nguồn dữ liệu (khi cần regenerate)

```bash
node work/tools/build-epu-data.js       # work/data/epu-lessons.json
node work/tools/build-gas-epu.js        # work/gas/EPIData.gs (web app riêng)
node work/tools/build-main-app-epu.js   # app/EpiData.gs + patch app tổng (idempotent)
```

- `epu-track-map.js` — mapping audio ↔ unit (đã đối chiếu marker trong sách).
- `epu-units-meta.js` — metadata 50 unit, IPA đọc tay từ ảnh trang Mục lục.
- `epu-section-e.js` — E1 bảng âm (44 mục), E3 37 cặp âm, E6 số đếm (10 nhóm · 52 ví dụ).
