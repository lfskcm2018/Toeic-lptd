# Hacker 1 — nhánh tích hợp nội dung

Thư mục này chứa toàn bộ dữ liệu và artefact phục vụ xây dựng/tích hợp nguồn **Hacker 1** (Hackers TOEIC 1000 1 LC, 3rd workbook) vào **web app GAS riêng**.

## Cấu trúc

- `hacker-1-source.json` — inventory nguồn (10 test, 30 track).
- `hacker-1-meta.json`, `hacker-1-lessons.json`, `hacker-1-lessons-data.js` — dữ liệu lesson đã chuẩn hóa.
- `extract/hacker1-raw.txt` — text trích từ PDF (pdf-parse).
- `tools/build-hacker1-data.js` — script build dữ liệu từ raw text.
- `gas/` — mã web app GAS riêng (standalone):
  - `Hacker1Data.gs` — dữ liệu + wrapper `LPTD_LESSONS_META/LESSONS`.
  - `Code.gs`, `Index.html`, `Styles.html`, `LptdUI.html`, `appsscript.json`.
- `reports/` — log build/test.
- `KE_HOACH_XAY_DUNG_VA_TICH_HOP.md` — kế hoạch chi tiết.

## Rebuild dữ liệu

```bash
node "Tích hợp nội dung mới/Hacker 1/tools/build-hacker1-data.js"
```

Sinh lại: `hacker-1-meta.json`, `hacker-1-lessons.json`, `hacker-1-lessons-data.js`, `gas/Hacker1Data.gs`.

## Chạy web app GAS riêng (triển khai)

1. Tạo **Apps Script project mới** (không dùng project của dự án tổng).
2. Tạo các file trong project: `Code.gs`, `Hacker1Data.gs`, `Index.html`, `Styles.html`, `LptdUI.html`, `appsscript.json` (copy từ `gas/`).
3. Script Properties (tùy chọn):
   - `LPTD_AUDIO_CDN_BASE` — base URL chứa 30 file MP3 (mặc định trong code: `https://toeic-audio.netlify.app/audio/hacker1`).
   - `LPTD_DOCS_CDN_BASE` — nếu có tài liệu PDF trên CDN.
   - `LPTD_RECORDING_ENGINE_URL` — popup ghi âm (nếu dùng).
4. Upload audio lên CDN theo tên `cdnName` (ví dụ `HACKER1_T01_P12.mp3`, `HACKER1_T01_P3.mp3`, `HACKER1_T01_P4.mp3`, ...).
5. Deploy → Web app (Execute as: Me). Kiểm tra `debugLptd()` trong editor.

## Mapping audio

| Unit | Test | Part | Audio gốc | cdnName |
|---|---:|---|---|---|
| 1..3 | 01 | 1-2,3,4 | `TEST01_Part1-2.mp3`, `TEST01_Part3.mp3`, `TEST01_Part4.mp3` | `HACKER1_T01_P12.mp3` ... |
| ... | ... | ... | ... | ... |
| 28..30 | 10 | 1-2,3,4 | `TEST10_Part*.mp3` | `HACKER1_T10_P*.mp3` |

## Lưu ý

- Dữ liệu được trích tự động từ PDF; một số dòng (Part 1-2 Q/A, Part 3 hội thoại dài) có thể cần rà soát/chuẩn hóa thêm.
- Part 4 narration đã được tách câu từ bản script điền đủ (filled); một số ký hiệu `1)`..`6)` được giữ lại như trong workbook.
- Web app riêng dùng chung UI bundle LPTD hiện có; 30 unit hiển thị như một nhóm (book 1). Có thể tùy biến UI sau.
- **Không** gộp vào dự án tổng cho đến khi hoàn thành 100% và kiểm thử.
