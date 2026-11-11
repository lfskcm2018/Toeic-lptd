# Triển khai web app GAS riêng — Hacker 1

> Thực hiện trong project Apps Script **mới**, tách biệt hoàn toàn với dự án tổng.

## 1. Chuẩn bị
- Tài khoản Google (quyền Apps Script/Drive), `clasp` đã đăng nhập (nếu dùng CLI).
- Audio 30 file `cdnName` trong `../audio-cdn/` (`upload-manifest.csv`). MP3 không commit.
- **Đã test local pass** trước deploy: 30 lessons, dữ liệu/Code.gs/Hacker1Data wrapper hợp lệ.

## 2. Upload audio lên CDN (bắt buộc)
1. Upload `../audio-cdn/*.mp3` lên CDN/static host (giữ nguyên tên `cdnName`).
2. Đảm bảo URL: `<LPTD_AUDIO_CDN_BASE>/<cdnName>` trả 200/206 (vd. `.../audio/hacker1/HACKER1_T01_P12.mp3`).
3. Ghi base URL (không `/` cuối) → đặt Script Property `LPTD_AUDIO_CDN_BASE`.

## 3. Tạo project & push code (clasp / thủ công)
### Clasp (khuyến nghị, trong `gas/`)
```bash
# đã clasp login
clasp create --type webapp --title "Hacker 1 LPTD" --rootDir .
# (hoặc tạo project trên UI rồi copy scriptId vào .clasp.json)
clasp push
```
Hoặc tạo project mới tại https://script.google.com và copy: `Code.gs`, `Hacker1Data.gs`, `Index.html`, `Styles.html`, `LptdUI.html`, `appsscript.json`.

### Script Properties (Project Settings)
- `LPTD_AUDIO_CDN_BASE` = base URL CDN (vd. `https://toeic-audio.netlify.app/audio/hacker1`)
- (tuỳ chọn) `LPTD_RECORDING_ENGINE_URL`

## 4. Kiểm tra trước deploy
- Editor: chạy `debugLptd()` → kiểm tra lesson count/meta/CDN base.
- Ghi âm/Drive (nếu dùng): chạy `authorizeLptdDrive()` / `lptdAuthDiagnostics()`, hoàn tất consent. Deploy **version mới** sau khi đổi scope/quyền.

## 5. Deploy Web app
- **Deploy → New deployment → Web app**: Execute as **Me**, chọn quyền truy cập phù hợp, Deploy & cấp quyền.
- Hoặc `clasp deploy -d "Hacker 1"` (cấu hình truy cập có thể cần chỉnh trong UI lần đầu).

## 6. Kiểm thử sau deploy (E2E)
- Load 30 track (10 test × P1-2/P3/P4), không lỗi console nghiêm trọng.
- Audio phát đúng `cdnName` (Network không 404), dictation/shadowing hoạt động.
- Ghi âm/Recording Engine/Drive (nếu bật): lưu và hiện link đúng.
- Chi tiết: `../reports/CHECKLIST-DEPLOY.md`.

## 7. Lưu ý
- Không dùng/chỉnh project hay file của dự án tổng. Không gộp vào tổng trước khi E2E 100%.
- Nếu cần UI nhóm theo TEST, tinh chỉnh `LptdUI.html` sau khi v1 ổn.
