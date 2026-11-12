# PATCH 03 — Bản local (`local-study.html`)

## 1. Copy file

```
files/data/dictation-part2-lessons-data.js  →  app/dictation-part2-lessons-data.js
files/data/dp2-local-glue.js               →  app/dp2-local-glue.js
```

## 2. Sửa `local-study.html`

Thứ tự bắt buộc:

```html
<script src="app/dictation-part2-lessons-data.js"></script>
<script src="app/lptd-lessons-data.js"></script>
<script src="app/dp2-local-glue.js"></script>
<script src="app/lptd-data.js"></script>
<script src="app/lptd-ui.js"></script>
```

Glue remap book 1 → 6, gắn `cdnUrl` Netlify ASCII, nối vào `LPTD_LESSONS_RAW`.

## 3. Nếu build lại bằng `tools/build.js`

Sửa đoạn thay `<?!= include('LptdUI'); ?>` để chèn đúng thứ tự trên.

## 4. Kiểm tra

Console local:

```js
LPTD.lessons.length        // 201 (160 + 30 + 11) nếu đã tích hợp Hacker 1
LPTD.byBook(6).length      // 11
LPTD.get(6, 1).cdnUrl      // https://toeic-audio.netlify.app/audio/dictation-part2/DP2U01.mp3
```
