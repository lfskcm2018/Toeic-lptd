# Báo cáo tiến độ — Hacker 1

- Nhánh: `lptd-source-hacker-1`
- Cập nhật: 2026-11-11

## 1) Trạng thái dữ liệu (đã test local PASS)
- Nguồn: Hackers TOEIC 1000 1 LC 3rd workbook — 10 TEST, 30 track (P1-2/P3/P4).
- Build: `tools/build-hacker1-data.js` (trích PDF → lấy bản script điền đủ, giữ W/M/W1/W2, tách câu, lọc artefact).
- Output: `hacker-1-meta.json`, `hacker-1-lessons.json`, `hacker-1-lessons-data.js`, `gas/Hacker1Data.gs`.
- **Kết quả:** 30 lessons · **205 lines · 2737 words**, 0 lesson rỗng. `reports/data-quality-scan.json`: 0 issue.
- Kiểm tra local: `local-preview.html` (mở qua HTTP server tại gốc workspace).

## 2) Audio/CDN
- Staging: `audio-cdn/` có 30 MP3 đúng `cdnName` + `upload-manifest.csv/json` (MP3 gitignored). Bản deploy: `_deploy_audio/audio/hacker1/` (30 mp3).
- **Netlify (toeic-audio.netlify.app):** CLI trong môi trường chưa xác thực (`NETLIFY_AUTH_TOKEN` chưa có / `netlify login` chưa hoàn tất) → **chưa thể auto-deploy** audio. Cần upload để URL hoạt động: `https://toeic-audio.netlify.app/audio/hacker1/<cdnName>`.

## 3) Web app GAS riêng (đã tạo & deploy)
- Project: **Hacker 1 - TOEIC 1000 LC Dictation** (clasp, `lfskcm2018@gmail.com`)
- Script ID: `1WJIc2K-xMIw2w0ebtokx04BLkv2qTO5vwUQpEGQXXuooVZVDhsUzVSfi`
- Đã `clasp push` 6 file: `Code.gs`, `Hacker1Data.gs`, `Index.html`, `Styles.html`, `LptdUI.html`, `appsscript.json`.
- Deployment @1: `AKfycbxntTCymj9UaiJVj57qalm8jVpZt0umW7hdCuibe5YM3QHyr1aesn7prT_4Sk-iBAy8`
- Web app URL: https://script.google.com/macros/s/AKfycbxntTCymj9UaiJVj57qalm8jVpZt0umW7hdCuibe5YM3QHyr1aesn7prT_4Sk-iBAy8/exec
- **Cần cấu hình/check (Script Properties/UI):** `LPTD_AUDIO_CDN_BASE=https://toeic-audio.netlify.app/audio/hacker1` (mặc định code đã trỏ đúng; nên set rõ), kiểm tra quyền truy cập Web app, chạy `debugLptd()` / `authorizeLptdDrive()` và Recording Engine nếu dùng ghi âm.

## 4) Tài liệu & kiểm thử
- `gas/DEPLOY.md`, `reports/CHECKLIST-DEPLOY.md`, `README.md`, `.clasp.json.example`, `gas/.clasp.json`.
- UI: bundle LPTD (30 unit theo thứ tự, nhãn TEST/Part) — dùng được v1; “nhóm theo TEST” là cải tiến tuỳ chọn.

## 5) Việc còn lại để đạt 100%
- [ ] Upload audio lên Netlify path `/audio/hacker1/` (cần auth/token) và xác nhận URL 200/206.
- [ ] Đặt/xác nhận `LPTD_AUDIO_CDN_BASE` và quyền Web app/Drive trên GAS project.
- [ ] Test E2E theo `reports/CHECKLIST-DEPLOY.md`: load 30 track, audio, dictation/shadowing, recording/Drive, console.
- [ ] Spot-check đối chiếu audio; (tuỳ chọn) UI nhóm theo TEST.
- [ ] Chỉ sau khi 100% test ổn: gộp vào dự án tổng; rồi lặp cho `Dictation Part 2`, `750+`, `600+`.
