# PATCH 03 — Bản local (EPI Elementary)

## 1. Copy file

```
files/data/epu-lessons.json       →  app/epu-lessons-data.js   (bọc thành window.EPU_LESSONS_RAW)
files/data/epu-local-glue.js      →  app/epu-local-glue.js
```

## 2. Sửa `local-study.html`

Thứ tự:

```html
<script src="app/epu-lessons-data.js"></script>
<script src="app/lptd-lessons-data.js"></script>
<script src="app/epu-local-glue.js"></script>
<script src="app/lptd-data.js"></script>
<script src="app/lptd-ui.js"></script>
```

Glue remap book → 9, gắn `cdnUrl` GitHub Pages ASCII, nối vào `LPTD_LESSONS_RAW`.

## 3. Kiểm tra

```js
LPTD.lessons.length        // 311 (nếu đã tích hợp tất cả)
LPTD.byBook(9).length      // 58
LPTD.get(9, 15).cdnUrl    // https://lfskcm2018.github.io/Toeic-lptd/epu-audio/CD2-Track14.mp3
LPTD.get(9, 15).epi.audioTracks.length  // 6
```

## 4. Audio local (tuỳ chọn)

Nếu chạy offline, copy file MP3 vào `English Pronunciation in Use Elementary [1999]/`
đúng cấu trúc `CDx/Track NN.mp3` và đặt `EPI_AUDIO_CDN_BASE` trỏ tới thư mục phục vụ local.
