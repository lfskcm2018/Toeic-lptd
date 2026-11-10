# PATCH — Tích hợp LPTD vào bản local (`local-study.html`)

> **Không bắt buộc.** Muốn dùng ngay bản tích hợp sẵn, chỉ cần chạy:
>
> ```bash
> node op/tools/serve-lptd.js
> ```
>
> rồi mở `http://localhost:8096/op/index.html`.
>
> Tài liệu này dành cho trường hợp muốn nhúng LPTD vào `local-study.html` gốc.

---

## 1. Điều kiện

- Đã có các file trong `op/`:
  - `op/app/lptd-lessons-data.js`
  - `op/app/lptd-data.js`
  - `op/app/lptd-ui.js`
  - `op/app/lptd-ui.css`
- `local-study.html` nằm ở thư mục gốc dự án (cùng cấp `op/`).
- Không cần sửa `app/core.js`, `app/core.css`, `app/data.js`, `app/ets-data.js`.

---

## 2. Thêm CSS

Mở `local-study.html`, tìm dòng:

```html
<link rel="stylesheet" href="app/core.css">
```

Thêm **ngay bên dưới**:

```html
<link rel="stylesheet" href="op/app/lptd-ui.css">
```

---

## 3. Thêm script

Tìm đoạn cuối `<body>`:

```html
<script src="app/ets-data.js"></script>
<script src="app/lesson-data.js"></script>
<script src="app/data.js"></script>
<script src="app/ets-data.js"></script>
<script src="app/core.js"></script>
</body>
```

Thêm **sau `app/core.js`** và **trước `</body>`**:

```html
<!-- ===== Listening Practice Through Dictation 1–4 ===== -->
<script src="op/app/lptd-lessons-data.js"></script>
<script>
  /* local-study.html nằm ở gốc dự án → audio/tài liệu dùng đường dẫn gốc. */
  window.LPTD_LOCAL_BASE = "";
</script>
<script src="op/app/lptd-data.js"></script>
<script src="op/app/lptd-ui.js"></script>
```

### Thứ tự bắt buộc

1. `lptd-lessons-data.js` — nạp `window.LPTD_LESSONS_RAW`.
2. Khai báo `window.LPTD_LOCAL_BASE` — **trước** `lptd-data.js`.
3. `lptd-data.js` — tạo `window.LPTD`.
4. `lptd-ui.js` — inject nút sidebar + toàn bộ UI.

> Nếu đặt `local-study.html` trong thư mục con, đổi `LPTD_LOCAL_BASE` thành tiền tố tương ứng (ví dụ `"../"`).

---

## 4. Kiểm tra sau khi patch

1. Mở `local-study.html` qua server (không mở `file://` nếu muốn ghi âm/seek ổn định):
   ```bash
   node op/tools/serve-lptd.js
   ```
   → `http://localhost:8096/local-study.html`
2. Sidebar xuất hiện nút **📚 LPTD 1–4** ngay trên nút ETS 2026.
3. Bấm nút → thấy 4 tab cuốn, mỗi cuốn 40 unit.
4. Mở Unit 01 → audio phát, seek được, đổi tốc độ được.
5. Dictation: điền thử → **Kiểm tra đáp án** → có highlight đúng/sai + điểm %.
6. Shadowing: ghi âm → nghe lại → chấm % (Chrome/Edge + mạng).
7. Bấm DAY 01 / ETS 2026 / Ôn từ sai → UI core trở lại bình thường.

---

## 5. Rollback

Xoá đúng 5 dòng đã thêm:

- 1 `<link ... lptd-ui.css>`
- 3 `<script src="op/app/...">`
- 1 khối `<script>` đặt `window.LPTD_LOCAL_BASE`

Không cần xoá dữ liệu tiến độ LPTD trong localStorage (không ảnh hưởng Hackers/ETS).

---

## 6. Lưu ý

- **Không** thêm `op/app/LptdData.gs`, `Code.lptd.gs`, `LptdUI.html` vào bản local — đây là file cho Google Apps Script.
- Bản local ưu tiên file MP3 trên đĩa. Nếu server không hỗ trợ HTTP Range, player hiện nút **⚡ Chuyển sang CDN**.
- Tiến độ LPTD lưu riêng ở `toeic_lptd_progress`; từ sai riêng ở `toeic_lptd_mistakes`.
