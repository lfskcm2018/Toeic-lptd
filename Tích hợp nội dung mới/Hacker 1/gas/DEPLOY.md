# Triển khai web app GAS riêng — Hacker 1

> Thực hiện trong project Apps Script **mới**, tách biệt hoàn toàn với dự án tổng.

## 1. Chuẩn bị

- Có tài khoản Google với quyền tạo Apps Script/Drive.
- (Tùy chọn) Cài `clasp` và đăng nhập: `npm i -g @google/clasp && clasp login`.
- Audio 30 file đã sẵn sàng trong `../audio-cdn/` với tên `cdnName` (xem `upload-manifest.csv`).

## 2. Upload audio lên CDN (bắt buộc để phát audio trên GAS)

1. Upload toàn bộ file trong `../audio-cdn/` lên CDN/static host của bạn.
2. Đảm bảo URL dạng: `<LPTD_AUDIO_CDN_BASE>/<cdnName>` truy cập được (HTTP 200/206), ví dụ:
   - `https://<host>/audio/hacker1/HACKER1_T01_P12.mp3`
3. Ghi lại base URL (không có `/` cuối), ví dụ `https://<host>/audio/hacker1`.

> Nếu chưa có CDN, bạn có thể test tạm bằng host tĩnh khác; đặt Script Property `LPTD_AUDIO_CDN_BASE` tương ứng.

## 3. Tạo Apps Script project mới

### Cách A — qua giao diện web
1. Vào https://script.google.com → **New project** (đặt tên, ví dụ `Hacker 1 LPTD`).
2. Tạo/copy các file (tên đúng như dưới) với nội dung từ thư mục `gas/`:
   - `Code.gs`
   - `Hacker1Data.gs`
   - `Index.html`
   - `Styles.html` (HTML)
   - `LptdUI.html` (HTML)
   - `appsscript.json` (Project Settings → Show manifest file)
3. **Project Settings → Script properties**:
   - `LPTD_AUDIO_CDN_BASE` = base URL CDN ở bước 2.
   - (Tùy chọn) `LPTD_RECORDING_ENGINE_URL` = URL Recording Engine.
4. Chạy hàm `debugLptd()` trong Editor để kiểm tra dữ liệu + CDN.
5. **Deploy → New deployment → Web app**:
   - Execute as: **Me**
   - Who has access: theo nhu cầu (ví dụ *Anyone*)
   - Deploy và cấp quyền khi được yêu cầu.

### Cách B — qua clasp
1. Tạo project: `clasp create --type webapp --title "Hacker 1 LPTD" --rootDir .` (chạy trong thư mục `gas/` hoặc copy file sang thư mục deploy riêng).
2. `clasp push`
3. Vào Editor để đặt Script Properties và Deploy như trên.

> Không dùng `.clasp.json` của dự án tổng. Nếu tạo file `.clasp.json`, giữ nó **trong thư mục Hacker 1** (hoặc thư mục deploy riêng), không commit scriptId nhạy cảm nếu không cần.

## 4. Cấp quyền & Drive (ghi âm)

- `appsscript.json` đã khai báo scope `drive` và `script.external_request`.
- Lần đầu chạy/chức năng ghi âm: chạy `authorizeLptdDrive()` (hoặc `lptdAuthDiagnostics()`), hoàn tất consent (tích quyền Drive nếu granular consent).
- **Phải deploy version mới** sau khi đổi scope/quyền để web app nhận quyền mới.
- Bản ghi lưu trong folder Drive `LPTD Recordings` (tự tạo).

## 5. Kiểm tra sau deploy

- Mở URL web app: thấy 30 track (10 test × P1-2/P3/P4), load không lỗi console.
- Chọn 1 track: audio phát đúng (kiểm tra Network, không 404).
- Dictation: nhập/chấm/hiện đáp án; Shadowing: phát lại, ghi âm (nếu bật Recording Engine), lưu/hiện link Drive (nếu có quyền).
- Đổi `LPTD_AUDIO_CDN_BASE` → reload để xác nhận mapping `cdnName`.

## 6. Ghi chú

- Không chỉnh sửa `app/` hay LPTD hiện tại của dự án tổng.
- Nếu UI bundle LptdUI cần tùy biến sâu (nhóm theo TEST), chỉnh trong `LptdUI.html` hoặc rebuild từ nguồn UI rồi cập nhật tại đây.
