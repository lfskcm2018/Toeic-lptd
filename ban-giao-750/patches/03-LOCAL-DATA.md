# PATCH 03 — Bản local (750+)

## 1. Copy file

```
files/data/h750-lessons-data.js  →  app/h750-lessons-data.js
files/data/h750-local-glue.js   →  app/h750-local-glue.js
```

## 2. Sửa `local-study.html`

Thứ tự:

```html
<script src="app/h750-lessons-data.js"></script>
<script src="app/lptd-lessons-data.js"></script>
<script src="app/h750-local-glue.js"></script>
<script src="app/lptd-data.js"></script>
<script src="app/lptd-ui.js"></script>
```

Glue remap book 1 → 8, gắn `cdnUrl` Netlify ASCII, nối vào `LPTD_LESSONS_RAW`.

## 3. Kiểm tra

```js
LPTD.lessons.length        // 253 (nếu đã tích hợp tất cả)
LPTD.byBook(8).length      // 20
LPTD.get(8, 1).cdnUrl      // https://toeic-audio.netlify.app/audio/750plus/H750D01.mp3
```
