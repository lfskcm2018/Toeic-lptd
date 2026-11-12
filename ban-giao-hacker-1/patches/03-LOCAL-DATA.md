# PATCH 03 — Bản local (`local-study.html`)

> Chỉ cần nếu dự án tổng muốn Hacker 1 chạy được ở bản mở trực tiếp bằng trình duyệt
> (`local-study.html`), không chỉ trên Google Apps Script.

---

## 1. Copy file

Từ folder bàn giao:

```
files/data/hacker-1-lessons-data.js   →  app/hacker-1-lessons-data.js
files/data/hacker1-local-glue.js      →  app/hacker1-local-glue.js
```

`hacker-1-lessons-data.js` tạo `window.HACKER1_LESSONS` (30 track, `book = 1` gốc).
`hacker1-local-glue.js` remap sang `book = 5`, gắn `cdnUrl` `/audio/hacker1`, rồi nối vào `window.LPTD_LESSONS_RAW`.

---

## 2. Sửa `local-study.html`

### Trước

```html
<!-- ===== M10 — LPTD 1–4 ... ===== -->
<script>
  window.LPTD_RECORDING_ENGINE_URL = '';
</script>
<script src="app/lptd-lessons-data.js"></script>
<script src="app/lptd-data.js"></script>
<script src="app/lptd-ui.js"></script>
```

### Sau

```html
<!-- ===== M10 — LPTD 1–4 + Hacker 1 ... ===== -->
<script>
  window.LPTD_RECORDING_ENGINE_URL = '';
</script>
<script src="app/hacker-1-lessons-data.js"></script>
<script src="app/lptd-lessons-data.js"></script>
<script src="app/hacker1-local-glue.js"></script>
<script src="app/lptd-data.js"></script>
<script src="app/lptd-ui.js"></script>
```

⚠️ **Thứ tự bắt buộc:**

1. `hacker-1-lessons-data.js` — tạo `window.HACKER1_LESSONS`
2. `lptd-lessons-data.js` — tạo `window.LPTD_LESSONS_RAW` (160 unit)
3. `hacker1-local-glue.js` — nối 30 track vào `LPTD_LESSONS_RAW`
4. `lptd-data.js` — IIFE tự gọi `loadLocal()` và đọc `LPTD_LESSONS_RAW`
5. `lptd-ui.js`

Nếu đặt glue **sau** `lptd-data.js`, dữ liệu không được nạp (module đã load xong).

---

## 3. Nếu dự án tổng build lại `local-study.html` bằng `tools/build.js`

`local-study.html` được sinh từ `app/Index.html`, nên sửa trực tiếp file HTML sẽ bị ghi đè.
Sửa luôn `tools/build.js`, mục thay `<?!= include('LptdUI'); ?>`:

```js
index = index.replace(
  "<?!= include('LptdUI'); ?>",
  '<script src="app/hacker-1-lessons-data.js"></script>\n' +
  '<script src="app/lptd-lessons-data.js"></script>\n' +
  '<script src="app/hacker1-local-glue.js"></script>\n' +
  '<script src="app/lptd-data.js"></script>\n' +
  '<script src="app/lptd-ui.js"></script>'
);
```

Và thêm comment cập nhật ở dòng 74–75.

---

## 4. Kiểm tra bản local

1. Chạy server có HTTP Range (audio seek):

```powershell
node op/tools/serve-lptd.js
```

Hoặc dùng server hiện có của dự án tổng (nếu hỗ trợ Range).

2. Mở `http://localhost:8096/op/local-study.html` (hoặc đường dẫn tương ứng).

3. Console:

```js
LPTD.lessons.length        // 190 (160 LPTD + 30 Hacker 1)
LPTD.byBook(5).length      // 30
LPTD.get(5, 1).cdnUrl
// "https://toeic-audio.netlify.app/audio/hacker1/HACKER1_T01_P12.mp3"
```

4. UI: sidebar → LPTD → thấy **5 tab**, tab Hacker 1 có 30 card.
5. Mở 1 bài → audio phát (mode `auto` ở local ưu tiên file đĩa; nếu không có file local, đổi “Nguồn audio” sang **Netlify CDN**).

---

## 5. Lưu ý

- `hacker1-local-glue.js` **idempotent**: nạp lại không sinh bản ghi trùng (kiểm tra theo `id`).
- Bản local dùng chung progress key với GAS (`5-<unit>`), nên tiến độ Hacker 1 đồng bộ giữa local và GAS trên cùng trình duyệt.
- Không cần copy MP3 vào thư mục dự án: `cdnUrl` đã trỏ Netlify. Chỉ khi muốn chạy offline hoàn toàn mới cần tải 30 file về đúng `localPath`.
