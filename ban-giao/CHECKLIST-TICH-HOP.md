# Checklist tích hợp LPTD 1–4

> Dùng kèm `HUONG-DAN-AI-TICH-HOP.md`. Tick từng mục; nếu mục nào fail, dừng và xử lý trước khi sang mục tiếp theo.

## 0. Chuẩn bị

- [ ] Đã đọc `README.md` + `HUONG-DAN-AI-TICH-HOP.md`.
- [ ] Đã tạo branch/backup cho dự án tổng.
- [ ] Đã xác nhận `app/Code.gs` có `doGet(e)` và `include(filename)`.
- [ ] Đã xác nhận `app/Index.html` có `.sidebar-footer`, `#btnETSLibrary`, `#playerCard`, `.mode-tabs`, `#modeBody`, `#quizFooter`, các `hero*`.
- [ ] Đã kiểm tra `app/Code.gs` chưa có hàm LPTD trùng tên.
- [ ] Đã xác nhận không dùng nhầm `files/gas/LptdUI.html` (bản auto-open).

## 1. Local

- [ ] Copy 4 file `files/app/*` vào `app/`.
- [ ] Thêm `<link rel="stylesheet" href="app/lptd-ui.css">` sau `app/core.css`.
- [ ] Thêm 3 script LPTD sau `app/core.js` đúng thứ tự:
  - [ ] `lptd-lessons-data.js`
  - [ ] `lptd-data.js`
  - [ ] `lptd-ui.js`
- [ ] Chạy static server tại thư mục gốc dự án.
- [ ] Mở `local-study.html` bằng Chrome/Edge.
- [ ] Nút **📚 LPTD 1–4** xuất hiện trước **ETS 2026**.
- [ ] Mở được 4 cuốn × 40 unit.
- [ ] Unit 01 phát audio; seek/tốc độ/âm lượng OK.
- [ ] Dictation kiểm tra + lưu tiến độ OK.
- [ ] Shadowing mic/ghi âm/nghe lại/chấm % OK.
- [ ] Đóng LPTD → core UI trở lại.
- [ ] Console không lỗi đỏ.

## 2. GAS — thêm file

- [ ] Thêm script `LptdData` ← `files/gas/LptdData.gs`.
- [ ] Thêm script `LptdServer` ← `files/gas/LptdServer.gs`.
- [ ] Thêm HTML `LptdUI` ← `files/gas/LptdUI-integrated.html`.
- [ ] Thêm HTML `LptdStyles` ← `files/gas/LptdStyles.html`.
- [ ] Không dán `doGet`/`include` từ bản standalone.
- [ ] (Nếu dùng clasp) `clasp push` thành công.

## 3. GAS — patch app tổng

- [ ] `app/Index.html` head: thêm `<?!= include('LptdStyles'); ?>` sau `Stylesheet`.
- [ ] `app/Index.html` cuối file: thêm block `LPTD_RECORDING_ENGINE_URL` + `<?!= include('LptdUI'); ?>` sau `JavaScript`.
- [ ] `app/Code.gs` `doGet`: thêm `template.RECORDING_ENGINE_URL = ...` (có guard `typeof`).
- [ ] `app/appsscript.json`: thêm `oauthScopes` đủ `spreadsheets`, `drive`, `script.external_request`.
- [ ] Giữ nguyên `webapp.access` của app tổng.
- [ ] Không đổi thứ tự include core.

## 4. GAS — quyền + deploy

- [ ] Hard reload Script Editor (Ctrl+Shift+R).
- [ ] Chạy `lptdAuthDiagnostics`.
- [ ] Nếu `status: REQUIRED`: mở `authUrl`, chọn đúng tài khoản.
- [ ] Màn hình granular: **TÍCH ô Drive**.
- [ ] Nếu app chưa xác minh: Advanced → Go to ... (unsafe) → Allow.
- [ ] Chạy lại `lptdAuthDiagnostics`: `hasDriveScope: true`, `driveRoot: "My Drive"`.
- [ ] Chạy `authorizeLptdDrive`: log `Drive OK: My Drive`.
- [ ] **Deploy version mới** (Manage deployments → Edit → New version).
- [ ] Mở URL deployment mới / Ctrl+F5.

## 5. GAS — test chức năng

- [ ] Trang chủ không auto-open LPTD.
- [ ] Bấm LPTD: tải 160 unit, 4 cuốn.
- [ ] Audio CDN phát; Network 206/audio-mpeg.
- [ ] Player LPTD: play/pause/stop/seek/tốc độ/âm lượng.
- [ ] Shadowing: popup mở, xin quyền mic.
- [ ] Ghi 1 câu → nghe lại được.
- [ ] Link **☁ Drive** xuất hiện.
- [ ] File nằm trong Drive folder `LPTD Recordings`.
- [ ] Link Drive mở được ở tab ẩn danh/điện thoại.
- [ ] Đổi `toeic_lptd_uid` → link Drive đồng bộ.
- [ ] Ghi lại cùng câu → file cũ bị trash.
- [ ] `lptdDeleteRecording` xoá file + metadata.
- [ ] Đóng LPTD → DAY/ETS/Ôn từ sai chạy bình thường.
- [ ] `#etsFloat` không đè LPTD (nếu đã patch §8.1).
- [ ] Console không lỗi đỏ.

## 6. Hồi quy core

- [ ] Hackers 20 DAY: audio + dictation + shadowing.
- [ ] ETS 2026: thư viện + transcript + cloze + exam + floating player.
- [ ] Ôn từ sai: mở/đóng, dữ liệu cũ còn.
- [ ] Audio proxy `?audioId=...` còn hoạt động.
- [ ] Sheet `Lessons`/`Progress` không bị ghi sai.
- [ ] Không có thay đổi ngoài phạm vi LPTD (trừ các patch đã ghi).

## 7. Kết thúc

- [ ] Áp dụng patch tương thích `#etsFloat` (§8.1) nếu app tổng có floating player.
- [ ] Áp dụng guard `postMessage` (§8.2) nếu core Shadowing và LPTD dùng cùng phiên.
- [ ] Ghi lại deployment ID/URL mới.
- [ ] Ghi lại tên hàm đã đổi (nếu chọn §7.3 cách B).
- [ ] Cập nhật `README`/tài liệu dự án tổng.
- [ ] Báo cáo theo mẫu §13 trong `HUONG-DAN-AI-TICH-HOP.md`.

## Rollback nhanh

- [ ] Local: xoá 3 script + 1 CSS link + 4 file.
- [ ] GAS: xoá 2 include + block script, khôi phục `doGet`, xoá 4 file, deploy version trước.
- [ ] Không xoá dữ liệu Hackers/ETS/Sheet.
- [ ] Chỉ dọn `recording:*` / folder `LPTD Recordings` khi chắc chắn.
