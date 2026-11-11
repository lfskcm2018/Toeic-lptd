# Checklist triển khai & kiểm thử — Hacker 1 (GAS riêng)

## A. Đã chuẩn bị / test local (PASS)
- [x] Dữ liệu: 30 lessons, 186 lines, 2559 words (`hacker-1-meta.json`), scan 0 issue.
- [x] GAS: `gas/Code.gs`, `gas/Hacker1Data.gs` (có `LPTD_LESSONS_META/LESSONS`), `Index.html`, `Styles.html`, `LptdUI.html`, `appsscript.json`.
- [x] Audio staging: `audio-cdn/` 30 MP3 + manifest (mp3 gitignored). `_deploy_audio/audio/hacker1/` sẵn sàng deploy.
- [x] Hướng dẫn: `gas/DEPLOY.md`, `README.md`, `local-preview.html`.

## B. Audio/CDN (Netlify toeic-audio.netlify.app)
- [ ] Deploy/upload nội dung `_deploy_audio/` (hoặc `audio-cdn/*.mp3`) lên site sao cho URL: `https://toeic-audio.netlify.app/audio/hacker1/<cdnName>` trả 200/206.
- [ ] Xác nhận tối thiểu: `.../HACKER1_T01_P12.mp3`, `.../HACKER1_T05_P3.mp3`, `.../HACKER1_T10_P4.mp3`.
- [ ] Script Property `LPTD_AUDIO_CDN_BASE` = `https://toeic-audio.netlify.app/audio/hacker1`.

## C. Apps Script project mới (clasp đã login)
- [ ] Trong `gas/`: `clasp create --type webapp --title "Hacker 1 LPTD" --rootDir .` (hoặc gán scriptId mới).
- [ ] `clasp push` (6 file). Kiểm tra `debugLptd()`.
- [ ] Đặt Script Properties (`LPTD_AUDIO_CDN_BASE`, tuỳ chọn `LPTD_RECORDING_ENGINE_URL`).
- [ ] Deploy Web app (Execute as Me), cấp quyền. `authorizeLptdDrive()` nếu dùng ghi âm. Deploy version mới sau đổi scope/code.

## D. Kiểm thử E2E (sau deploy)
- [ ] Load 30 track (10 test × P1-2/3/4), không lỗi console nghiêm trọng.
- [ ] Audio phát đúng, dictation/shadowing hoạt động.
- [ ] Recording/Drive (nếu bật): popup, lưu, link Drive.
- [ ] Spot-check đối chiếu audio một số lesson (Part 1-2, Part 3).

## E. Sau khi 100%
- [ ] Báo cáo kết quả test. Chỉ khi hoàn thành 100% mới lập bước gộp vào dự án tổng; rồi lặp cho `Dictation Part 2`, `750+`, `600+`.
