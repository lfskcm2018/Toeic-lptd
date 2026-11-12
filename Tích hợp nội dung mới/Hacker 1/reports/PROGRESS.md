# Báo cáo tiến độ — Hacker 1

- Nhánh: `lptd-source-hacker-1`
- Cập nhật: 2026-11-12

## Đã thực hiện

### 1. Khảo sát nguồn
- Nguồn: `Hackers TOEIC 1000 1 LC 3rd workbook` (10 TEST, 30 MP3 `TEST01-10_Part1-2/3/4`, PDF 31 trang).
- Trích text PDF → `extract/hacker1-raw.txt`.
- Inventory: `hacker-1-source.json`.

### 2. Chuẩn hóa dữ liệu
- Tool: `tools/build-hacker1-data.js`
  - Parse theo marker `TEST xx | Part y`, lấy bản script điền đủ, loại bản nháp/chỗ trống trùng lặp.
  - Giữ speaker `W/M/W1/W2`, tách câu narration dài, chuẩn hóa ký tự, lọc artefact parse.
- Output: `hacker-1-meta.json`, `hacker-1-lessons.json`, `hacker-1-lessons-data.js`.
- **Kết quả hiện tại:** **30 lessons · 186 lines · 2559 words**, 0 lesson rỗng, scan 0 issue (`reports/data-quality-scan.json`).

### 3. Audio/CDN (đã live)
- 30 MP3 staged tại `_deploy_audio/audio/hacker1/` và `audio-cdn/`.
- Đã upload lên Netlify: `https://toeic-audio.netlify.app/audio/hacker1/<cdnName>` (HTTP 200/206).
- Manifest deploy hợp nhất hiện tại: **834 file** = 792 file cũ (`/audio/lptd`, `/audio/etss`, `/audio/hackers`) + 12 file Dictation Part 2 + 30 file Hacker 1.

### 4. Web app GAS riêng (đã deploy)
- Project: **Hacker 1 - TOEIC 1000 LC Dictation**
- Script ID: `1WJIc2K-xMIw2w0ebtokx04BLkv2qTO5vwUQpEGQXXuooVZVDhsUzVSfi`
- `clasp push` 6 file: `Code.gs`, `Hacker1Data.gs`, `Index.html`, `Styles.html`, `LptdUI.html`, `appsscript.json`.
- **Deployment @4:**
  `https://script.google.com/macros/s/AKfycbzUIn85bNxDupYm3kLlnjOvVPOPkW7JdHp7ml_B8NCsDO_FX95ch7YWJILo3ZhXQPgQ/exec`
- `debugLptd()` PASS: 30 unit / 186 câu / 2559 từ; CDN sample HTTP 206; Recording Engine đúng URL.
- Script Property khuyến nghị: `LPTD_AUDIO_CDN_BASE=https://toeic-audio.netlify.app/audio/hacker1`.

### 5. UI (đã đổi thương hiệu riêng)
- Bỏ thư viện LPTD 1–4; chỉ còn một mục **📘 Hacker 1** (book 1, 30 track).
- Hero/header/sidebar/nhãn unit/float player đều dùng "Hacker 1"; badge track `T01…T10`.
- Không hiển thị tài liệu PDF (`DOCS = {}`).
- Sửa lỗi điều hướng: `L.get(book, unit)` fallback theo cặp book/unit (id Hacker 1 là `hacker1-tNN-pYY`, không phải `lptd-…`).
- Key localStorage riêng: `hacker1_progress`, `hacker1_audio_mode`, `hacker1_theme`.

## E2E đã kiểm tra (browser, deployment @4)
- 30/30 track hiển thị; mở đúng bài, nội dung 6–9 câu + ô trống dictation.
- Audio CDN phát đúng file (HTTP 206), play/seek hoạt động.
- Dictation chấm đúng (test 21/21 = 100%), hiện đáp án.
- Shadowing render đủ card/nút; quay lại thư viện giữ 30 card + tiến độ.
- Console: không lỗi ứng dụng (chỉ warning sandbox của Google Apps Script).

## Chưa hoàn thành / cần làm tiếp
- [ ] Spot-check nội dung đối chiếu audio (ưu tiên Part 1-2, hội thoại Part 3).
- [ ] Test ghi âm/Drive thực tế bằng micro (popup Recording Engine).
- [ ] Sau khi D đạt 100%: gộp vào dự án tổng, rồi lặp lại cho Dictation Part 2 / 750+ / 600+.
- [!] Cảnh báo vận hành: Netlify site dùng chung; nếu deploy nguồn khác làm mất `/audio/hacker1`, chạy lại deploy manifest hợp nhất (xem `reports/CHECKLIST-DEPLOY.md` mục B).

## Build log
- `reports/build-last.log`
- `reports/data-quality-scan.json`
