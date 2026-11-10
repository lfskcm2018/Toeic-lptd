# PATCH — Triển khai LPTD lên Google Apps Script (GAS)

> Audio LPTD phát trực tiếp từ **Netlify CDN**, không dùng Google Drive.
> Không cần tài khoản trả phí.

---

## 1. File cần đưa lên GAS

| File trong `op/app/` | Tên file trong Apps Script | Loại | Kích thước |
|---|---|---|---|
| `LptdData.gs` | `LptdData.gs` | Script | ~248 KB |
| `Code.lptd.gs` | `Code.lptd.gs` | Script | ~6 KB |
| `LptdUI.html` | `LptdUI.html` | HTML | ~71 KB |

> `LptdData.gs` và `LptdUI.html` là file **tự sinh**. Khi sửa dữ liệu/UI, chạy lại:
> ```bash
> node op/tools/build-lptd-data.js
> node op/tools/build-gas-ui.js
> ```

**Không** đưa `lptd-lessons-data.js` lên GAS (dữ liệu đã nằm trong `LptdData.gs`; thêm sẽ trùng 248 KB).

---

## 2. Các bước trong Apps Script Editor

### 2.1. Thêm dữ liệu

1. Mở project Apps Script của app hiện tại.
2. **+ → Script** → đặt tên `LptdData`.
3. Dán toàn bộ nội dung `op/app/LptdData.gs` → **Save**.

### 2.2. Thêm API

1. **+ → Script** → đặt tên `Code.lptd`.
2. Dán toàn bộ nội dung `op/app/Code.lptd.gs` → **Save**.

### 2.3. Thêm UI

1. **+ → HTML** → đặt tên `LptdUI`.
2. Dán toàn bộ nội dung `op/app/LptdUI.html` → **Save**.

### 2.4. Include UI vào trang chính

Mở `Index.html`, tìm cuối file:

```html
<?!= include('ETSLibrary'); ?>
<?!= include('JavaScript'); ?>
</body>
```

Thêm **sau** dòng `include('JavaScript')`:

```html
<?!= include('LptdUI'); ?>
</body>
```

> Đặt sau `JavaScript` để DOM (`#modeBody`, sidebar) đã sẵn sàng khi module khởi động.

---

## 3. Kiểm tra nhanh trong Editor

1. Chọn hàm `debugLptd` → **Run**.
2. Lần đầu sẽ yêu cầu cấp quyền → **Review permissions → Allow**.
3. Xem **Execution log**, kỳ vọng:

```
=== LPTD ===
Tổng unit: 160 | câu: 1041 | từ: 30555
Cuốn 1: 40 unit, ...
CDN base: https://toeic-audio.netlify.app/audio/lptd
  https://toeic-audio.netlify.app/audio/lptd/LPTD1U01.mp3 → 206 · audio/mpeg
```

Nếu log báo lỗi `settingsMap_ is not defined`: project chưa có `app/Code.gs` gốc — module vẫn chạy nhờ fallback CDN mặc định.

---

## 4. Deploy

1. **Deploy → Manage deployments**.
2. Chọn deployment Web App hiện tại → **Edit** (biểu tượng bút).
3. **Version: New version** → ghi chú `Add LPTD 1-4`.
4. **Deploy**.
5. Mở URL Web App, nhấn **Ctrl + F5** để bỏ cache.

Kiểm tra:

- Sidebar có nút **📚 LPTD 1–4**.
- Mở Unit 01 → audio phát từ `toeic-audio.netlify.app` (xem Network).
- Seek được (CDN trả `206 Partial Content`).
- Không có lỗi console.

---

## 5. Settings tùy chọn (Sheet `Settings`)

| Key | Ý nghĩa | Mặc định |
|---|---|---|
| `LPTD_AUDIO_CDN_BASE` | Base CDN audio LPTD | `audioCdnBase_() + '/lptd'` → hiện là `https://toeic-audio.netlify.app/audio/lptd` |
| `LPTD_DOCS_CDN_BASE` | Base CDN cho PDF (nếu upload tài liệu) | trống → nút PDF bị disable trong GAS |

Ví dụ:

```
LPTD_AUDIO_CDN_BASE = https://toeic-audio.netlify.app/audio/lptd
LPTD_DOCS_CDN_BASE  = https://your-docs-cdn.example.com/lptd
```

Sau khi đổi Settings, không cần deploy lại — chỉ cần tải lại trang.

> GAS không phục vụ file tĩnh trong project. Vì vậy:
> - **Audio**: dùng CDN Netlify (đã có sẵn 160 file).
> - **PDF**: chỉ bật khi cấu hình `LPTD_DOCS_CDN_BASE`.

---

## 6. Kiểm thử chấp nhận trên GAS

- [ ] Nút LPTD xuất hiện, bấm mở thư viện.
- [ ] 4 cuốn × 40 unit hiển thị đúng.
- [ ] Unit 01 phát audio CDN, seek + đổi tốc độ được.
- [ ] Dictation kiểm tra đáp án + lưu tiến độ.
- [ ] Shadowing ghi âm/nghe lại/chấm % (Chrome, HTTPS).
- [ ] Chuyển DAY 01 / ETS / Ôn từ sai → UI core bình thường.
- [ ] Không có lỗi console.

---

## 7. Rollback

1. Xoá `<?!= include('LptdUI'); ?>` khỏi `Index.html`.
2. Xoá 3 file: `LptdData.gs`, `Code.lptd.gs`, `LptdUI.html`.
3. **Deploy → Manage deployments → Edit → Version trước đó → Deploy**.

Không ảnh hưởng Sheet, Drive, tiến độ Hackers/ETS.

---

## 8. Ghi chú kỹ thuật

- UI gọi **một lần** `getLptdBootstrap()` để lấy cấu hình + 160 unit (giảm round-trip).
- Nếu bản GAS cũ chỉ có `getLptdLessons()`, UI tự fallback.
- `cdnUrl` được server gắn sẵn cho từng unit; UI không tự đoán URL.
- Tiến độ lưu localStorage trình duyệt (`toeic_lptd_progress`), không ghi Sheet.
