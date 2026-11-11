# Báo cáo tiến độ — Hacker 1

- Nhánh: `lptd-source-hacker-1`
- Cập nhật: 2026-11-11

## Đã thực hiện

1. **Khảo sát nguồn**
   - 10 TEST, 30 MP3 (`TEST01-10_Part1-2/3/4`), PDF 31 trang.
   - Trích text PDF → `extract/hacker1-raw.txt`.

2. **Chuẩn hóa dữ liệu (Phase 1 - v1)**
   - Tạo `tools/build-hacker1-data.js` (parse header cuối section, tách bản script điền đủ, tách câu narration).
   - Sinh: `hacker-1-meta.json`, `hacker-1-lessons.json`, `hacker-1-lessons-data.js`.
   - Kết quả: **30 lessons**, **269 lines**, **3170 words** (0 lesson rỗng).

3. **Dựng web app GAS riêng (Phase 2 - khung ban đầu)**
   - `gas/Hacker1Data.gs` (dữ liệu + wrapper `LPTD_LESSONS_META/LESSONS`).
   - `gas/Code.gs` (adapted từ standalone, CDN base mặc định `.../audio/hacker1`).
   - `gas/Index.html` (branding Hacker 1).
   - Copy `Styles.html`, `LptdUI.html`, `appsscript.json` từ standalone.
   - `README.md` hướng dẫn build/deploy.

## Chưa hoàn thành / cần làm tiếp

- Rà soát chất lượng từng lesson (đặc biệt Part 1-2, một số Part 3 hội thoại).
- Upload audio lên CDN đúng `cdnName` và cấu hình `LPTD_AUDIO_CDN_BASE`.
- Tạo project Apps Script mới, deploy và test thực tế (load, audio, dictation, shadowing, recording).
- Tùy biến UI/nhãn nếu cần (nhóm theo TEST thay vì book).
- Hoàn thiện 100% trước khi gộp vào dự án tổng.

## Build log
- `reports/build-last.log` (lần build gần nhất).
