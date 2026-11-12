# Checklist triển khai & kiểm thử — Hacker 1 (GAS riêng)

## A. Chuẩn bị (đã có trong repo/thư mục)
- [x] Dữ liệu: 30 lessons, 186 lines, 2559 words (`hacker-1-lessons.json`), scan 0 issue.
- [x] GAS: `gas/Code.gs`, `gas/Hacker1Data.gs`, `gas/Index.html`, `gas/Styles.html`, `gas/LptdUI.html`, `gas/appsscript.json`.
- [x] Audio staging: `audio-cdn/` + `_deploy_audio/audio/hacker1/` (30 MP3, đúng `cdnName`).
- [x] Hướng dẫn: `gas/DEPLOY.md`, `README.md`, `reports/PROGRESS.md`.
- [x] UI đã đổi thương hiệu riêng **Hacker 1** (bỏ LPTD 1–4, bỏ DOCS PDF).

## B. Audio/CDN
- [x] Upload 30 MP3 lên Netlify (`toeic-audio.netlify.app/audio/hacker1/*`).
- [x] URL truy cập được: HTTP 200/206, `content-type: audio/mpeg`.
- [x] `LPTD_AUDIO_CDN_BASE=https://toeic-audio.netlify.app/audio/hacker1` (mặc định trong code; có thể set Script Property).
- [!] Lưu ý: Netlify site dùng chung với các nguồn khác. Nếu một deploy khác ghi đè danh sách file, phải deploy lại **manifest hợp nhất** (792 file cũ + DP2 + hacker1) — script mẫu: `TEMP/deploy-merged.js`.

## C. Apps Script project (đã thực hiện)
- [x] Project riêng: **Hacker 1 - TOEIC 1000 LC Dictation**.
- [x] Script ID: `1WJIc2K-xMIw2w0ebtokx04BLkv2qTO5vwUQpEGQXXuooVZVDhsUzVSfi`.
- [x] `clasp push` 6 file.
- [x] `debugLptd()` PASS: 30 unit / 186 câu / 2559 từ, 10 test, parts `1-2|3|4`, sample CDN HTTP 206.
- [x] Deployment mới sau thay đổi code: **@4** `AKfycbzUIn85bNxDupYm3kLlnjOvVPOPkW7JdHp7ml_B8NCsDO_FX95ch7YWJILo3ZhXQPgQ`.
- [ ] (Khi dùng ghi âm) chạy `authorizeLptdDrive()` một lần trong Script Editor.

## D. Kiểm thử thực tế (E2E trên @4)
- [x] Load trang: 30 track hiển thị, không lỗi console (chỉ warning sandbox của GAS).
- [x] Không còn tab LPTD 1–4; tiêu đề/hero/header/nhãn đều là **Hacker 1**.
- [x] Đủ 10 TEST × 3 track (Part 1-2 / Part 3 / Part 4), badge `T01…T10`.
- [x] Mở unit: nội dung 6–9 câu hiển thị, ô trống dictation render đúng.
- [x] Audio phát đúng track (`HACKER1_T02_P3.mp3`, HTTP 206), play/seek hoạt động.
- [x] Dictation: điền đủ → chấm 21/21 (100%), hiện đáp án.
- [x] Shadowing: render đủ card + nút ghi âm/chấm; popup Recording Engine (chưa test micro thực tế).
- [x] Quay lại thư viện: 30 card, tiến độ lưu localStorage (`hacker1_progress`).
- [ ] Spot-check nội dung đối chiếu audio (Part 1-2, hội thoại Part 3).
- [ ] Recording/Drive thực tế với micro (nếu bật).

## E. Lưu ý
- Dữ liệu trích tự động từ PDF; nên spot-check đối chiếu audio (đặc biệt Part 1-2, hội thoại Part 3).
- UI gom 30 track vào một "book" Hacker 1, sắp theo TEST/Part.
- **Không gộp vào dự án tổng** trước khi checklist D đạt 100%.
