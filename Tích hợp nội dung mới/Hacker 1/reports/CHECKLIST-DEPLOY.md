# Checklist triển khai & kiểm thử — Hacker 1 (GAS riêng)

## A. Chuẩn bị (đã có trong repo/thư mục)
- [x] Dữ liệu: 30 lessons, 190 lines, 2596 words (`hacker-1-lessons.json`).
- [x] GAS: `gas/Code.gs`, `gas/Hacker1Data.gs`, `gas/Index.html`, `gas/Styles.html`, `gas/LptdUI.html`, `gas/appsscript.json`.
- [x] Audio staging: `audio-cdn/` có 30 MP3 + `upload-manifest.csv/json` (mp3 không commit).
- [x] Hướng dẫn: `gas/DEPLOY.md`, `README.md`, `reports/PROGRESS.md`.
- [ ] Kiểm tra local: mở `local-preview.html` qua HTTP server và spot-check vài track với audio.

## B. Audio/CDN (thủ công)
- [ ] Upload 30 file trong `audio-cdn/` lên CDN/static host.
- [ ] Xác nhận URL truy cập được: `<BASE>/HACKER1_T01_P12.mp3` ... `<BASE>/HACKER1_T10_P4.mp3` (HTTP 200/206, CORS nếu cần).
- [ ] Ghi nhận `LPTD_AUDIO_CDN_BASE` = `<BASE>` (không `/` cuối).

## C. Apps Script project mới (thủ công)
- [ ] Tạo project mới (không dùng project dự án tổng). Copy/push file trong `gas/`.
- [ ] Script Properties: `LPTD_AUDIO_CDN_BASE` = `<BASE>` (tùy chọn: `LPTD_RECORDING_ENGINE_URL`).
- [ ] Chạy `debugLptd()` trong Editor → kiểm tra meta/lesson count/CDN.
- [ ] Deploy Web app (Execute as Me). Cấp quyền. Chạy `authorizeLptdDrive()` nếu dùng ghi âm.
- [ ] **Deploy version mới** sau mỗi thay đổi scope/code.

## D. Kiểm thử thực tế (sau deploy)
- [ ] Load trang: hiển thị 30 track, không lỗi console/network nghiêm trọng.
- [ ] Mỗi nhóm TEST 01–10 có đủ Part 1-2/3/4 (spot-check tối thiểu 3 test).
- [ ] Audio phát đúng track (so `cdnName`/Network), tua/seek ổn.
- [ ] Dictation: nhập, chấm, hiện đáp án, điều hướng dòng/unit.
- [ ] Shadowing: phát mẫu, ghi âm (nếu bật), nghe lại.
- [ ] Recording/Drive (nếu bật): popup Recording Engine hoạt động, lưu/hiện link Drive, phân quyền đúng.
- [ ] Reload/cross-check sau đổi cấu hình CDN.

## E. Lưu ý
- Dữ liệu trích tự động từ PDF; nên spot-check đối chiếu audio (đặc biệt Part 1-2, hội thoại Part 3).
- UI hiện nhóm 30 unit theo thứ tự (book 1). Tùy biến "nhóm theo TEST" là cải tiến tiếp theo nếu cần.
- **Không gộp vào dự án tổng** trước khi checklist D đạt 100%.
