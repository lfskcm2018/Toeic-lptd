# PATCH 03 — Bản local (600+)

## 1. Copy file

```
files/data/h600-lessons-data.js  →  app/h600-lessons-data.js
files/data/h600-local-glue.js   →  app/h600-local-glue.js
```

## 2. Sửa `local-study.html`

Thứ tự:

```html
<script src="app/h600-lessons-data.js"></script>
<script src="app/lptd-lessons-data.js"></script>
<script src="app/h600-local-glue.js"></script>
<script src="app/lptd-data.js"></script>
<script src="app/lptd-ui.js"></script>
```

Glue remap book 1 → 7, gắn `cdnUrl` Netlify ASCII, nối vào `LPTD_LESSONS_RAW`.

## 3. Kiểm tra

```js
LPTD.lessons.length        // 233 (nếu đã tích hợp tất cả)
LPTD.byBook(7).length      // 32
LPTD.get(7, 1).cdnUrl      // https://toeic-audio.netlify.app/audio/600plus/H600D01.mp3
```
