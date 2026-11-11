# Báo cáo tiến độ — Hacker 1

- Nhánh: `lptd-source-hacker-1`
- Cập nhật: 2026-11-11

## Đã thực hiện

### 1. Khảo sát nguồn
- Nguồn: `Hackers TOEIC 1000 1 LC 3rd workbook` (10 TEST, 30 MP3 `TEST01-10_Part1-2/3/4`, PDF 31 trang).
- Trích text PDF → `extract/hacker1-raw.txt`.
- Inventory: `hacker-1-source.json`.

### 2. Chuẩn hóa dữ liệu (Phase 1 — v2, đã cải thiện)
- Tool: `tools/build-hacker1-data.js`
  - Parse theo marker `TEST xx | Part y` (header cuối section), lấy bản script điền đủ (filled), loại bản nháp/chỗ trống trùng lặp.
  - Giữ speaker `W/M/W1/W2`, tách câu narration dài, chuẩn hóa ký tự, lọc artefact parse.
- Output: `hacker-1-meta.json`, `hacker-1-lessons.json`, `hacker-1-lessons-data.js`.
- **Kết quả hiện tại:** **30 lessons**, **254 lines**, **3153 words**, 0 lesson rỗng.
- Rà soát tự động: `reports/data-quality-scan.json` (1 cảnh báo nhỏ còn lại — xem “Lưu ý chất lượng”).

### 3. Audio staging/CDN (chuẩn bị upload)
- Đã tạo bản sao 30 MP3 đổi tên theo `cdnName` trong `audio-cdn/` (30/30 file, không thiếu).
- Manifest: `audio-cdn/upload-manifest.csv`, `audio-cdn/upload-manifest.json`.
- **Cần thao tác thủ công (ngoài khả năng tự động):** upload `audio-cdn/*` lên CDN/static host và đặt Script Property `LPTD_AUDIO_CDN_BASE` = base URL tương ứng trên project GAS riêng.

### 4. Web app GAS riêng (Phase 2 — khung triển khai)
- `gas/Hacker1Data.gs` (dữ liệu + wrapper `LPTD_LESSONS_META/LESSONS`), `gas/Code.gs`, `gas/Index.html`, `gas/Styles.html`, `gas/LptdUI.html`, `gas/appsscript.json`.
- Hướng dẫn: `gas/DEPLOY.md`, `gas/.clasp.json.example`.
- **Cần thao tác thủ công:** tạo Apps Script project mới, copy/push `gas/`, cấu hình Script Properties, deploy web app, cấp quyền Drive (nếu dùng recording) — không thể tự tạo/deploy do không có quyền truy cập tài khoản Google/GAS.

### 5. Kiểm tra local
- `local-preview.html` — xem 30 track, nội dung dòng, phát audio local (từ `localPath`) để đối chiếu dữ liệu.
- Cách dùng: chạy HTTP server tại thư mục gốc workspace rồi mở `op/Tích hợp nội dung mới/Hacker 1/local-preview.html`.

### 6. UI
- Đang dùng bundle UI LPTD standalone (30 unit hiển thị như một nhóm/book 1). Hoạt động được cho v1; **tùy biến nhóm theo TEST** là cải tiến tiếp theo (cần chỉnh/rebuild `gas/LptdUI.html`).

## Lưu ý chất lượng dữ liệu
- Trích xuất tự động từ PDF; đa số Part 3/4 đã sạch (filled script). Một số dòng Part 1-2 và edge-case có thể cần rà soát thủ công khi nghe đối chiếu audio.
- `data-quality-scan.json` ghi nhận 1 cảnh báo nhỏ (`hacker1-t07-p4` còn một marker chỗ trống trong câu) — không chặn sử dụng, có thể tinh chỉnh parser hoặc sửa dữ liệu sau.

## Chưa hoàn thành / cần làm tiếp
- [ ] (Thủ công) Upload `audio-cdn/` lên CDN và đặt `LPTD_AUDIO_CDN_BASE`.
- [ ] (Thủ công) Tạo project Apps Script mới, deploy web app riêng, test thực tế: load 30 track, audio, dictation, shadowing, recording/Drive, console.
- [ ] Rà soát thủ công thêm theo audio (ưu tiên các lesson có cảnh báo/Part 1-2).
- [ ] (Tùy chọn) Tinh chỉnh UI nhóm theo TEST.
- [ ] Hoàn thiện 100% + báo cáo test, sau đó mới lập bước gộp vào dự án tổng.

## Build log
- `reports/build-last.log` (lần build gần nhất).
- `reports/data-quality-scan.json` (quét chất lượng).
