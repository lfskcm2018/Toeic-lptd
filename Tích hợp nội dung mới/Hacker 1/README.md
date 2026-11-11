# Hacker 1 — nhánh tích hợp nội dung

Thư mục này chứa toàn bộ dữ liệu và artefact phục vụ xây dựng/tích hợp nguồn **Hacker 1** (Hackers TOEIC 1000 1 LC, 3rd workbook) vào **web app GAS riêng**. Mọi file sinh ra cho nhánh này nằm trong thư mục này.

## Cấu trúc

- `hacker-1-source.json` — inventory nguồn (10 test, 30 track).
- `hacker-1-meta.json`, `hacker-1-lessons.json`, `hacker-1-lessons-data.js` — dữ liệu lesson đã chuẩn hóa (30 lessons, 254 lines, 3153 words).
- `extract/hacker1-raw.txt` — text trích từ PDF.
- `tools/build-hacker1-data.js` — script build/chuẩn hóa dữ liệu.
- `audio-cdn/` — **30 MP3 đã đổi tên theo `cdnName`** + `upload-manifest.csv/json` (sẵn sàng upload lên CDN).
- `gas/` — mã web app GAS riêng (standalone): `Hacker1Data.gs`, `Code.gs`, `Index.html`, `Styles.html`, `LptdUI.html`, `appsscript.json`, `DEPLOY.md`, `.clasp.json.example`.
- `local-preview.html` — trang xem/kiểm tra dữ liệu + phát audio local.
- `reports/` — `PROGRESS.md`, `build-last.log`, `data-quality-scan.json`.
- `KE_HOACH_XAY_DUNG_VA_TICH_HOP.md` — kế hoạch chi tiết.

## Rebuild dữ liệu

```bash
node "Tích hợp nội dung mới/Hacker 1/tools/build-hacker1-data.js"
```

Sinh lại: `hacker-1-meta.json`, `hacker-1-lessons.json`, `hacker-1-lessons-data.js`, `gas/Hacker1Data.gs`.

## Kiểm tra local (dữ liệu + audio)

1. Chạy HTTP server tại **thư mục gốc workspace** (ví dụ `python -m http.server 8080`).
2. Mở `http://localhost:8080/op/Tích%20hợp%20nội%20dung%20mới/Hacker%201/local-preview.html`.
3. Chọn track để xem lines và phát audio từ `localPath`.

## Audio/CDN cho web app GAS

- File trong `audio-cdn/` đã đúng tên `cdnName` (ví dụ `HACKER1_T01_P12.mp3`).
- Upload toàn bộ lên CDN/static host, rồi đặt Script Property `LPTD_AUDIO_CDN_BASE` = base URL (ví dụ `https://<host>/audio/hacker1`).
- Xem `gas/DEPLOY.md`.

## Triển khai web app GAS riêng

1. Tạo **Apps Script project mới** (không dùng project dự án tổng).
2. Copy/push các file trong `gas/` (`Code.gs`, `Hacker1Data.gs`, `Index.html`, `Styles.html`, `LptdUI.html`, `appsscript.json`).
3. Đặt Script Properties: `LPTD_AUDIO_CDN_BASE` (và tùy chọn `LPTD_RECORDING_ENGINE_URL`).
4. Deploy Web app, cấp quyền; chạy `debugLptd()` / `authorizeLptdDrive()` nếu cần.
5. Chi tiết: `gas/DEPLOY.md`.

> Việc tạo project, upload CDN và deploy cần thực hiện thủ công bằng tài khoản Google/CDN của bạn.

## Mapping audio

| Unit | Test | Part | Audio gốc | cdnName |
|---:|---:|---|---|---|
| 1..3 | 01 | 1-2,3,4 | `TEST01_Part1-2.mp3`, `TEST01_Part3.mp3`, `TEST01_Part4.mp3` | `HACKER1_T01_P12.mp3`, `HACKER1_T01_P3.mp3`, `HACKER1_T01_P4.mp3` |
| ... | ... | ... | ... | ... |
| 28..30 | 10 | 1-2,3,4 | `TEST10_Part*.mp3` | `HACKER1_T10_P12.mp3`, `HACKER1_T10_P3.mp3`, `HACKER1_T10_P4.mp3` |

## Lưu ý

- Dữ liệu trích tự động từ PDF (v2); xem `reports/data-quality-scan.json` và `reports/PROGRESS.md` cho cảnh báo/việc còn lại.
- UI hiện dùng bundle LPTD (30 unit, book 1). Có thể tinh chỉnh nhóm theo TEST sau.
- **Không** gộp vào dự án tổng cho đến khi hoàn thành 100% và kiểm thử.
