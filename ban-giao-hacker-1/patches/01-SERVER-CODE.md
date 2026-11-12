# PATCH 01 — Server (Google Apps Script)

> Mục tiêu: thêm 30 track Hacker 1 vào API `getLptdBootstrap()` của dự án tổng,
> dưới dạng **book 5**, không ảnh hưởng LPTD 1–4.

## 1. Thêm file dữ liệu

Copy file bàn giao:

```
files/gas/Hacker1Data.gs  →  <project tổng>/Hacker1Data.gs
```

File này chỉ khai báo:

- `HACKER1_LESSONS_META()`
- `HACKER1_LESSONS()`

⚠️ **Không** copy 2 wrapper `LPTD_LESSONS_META()` / `LPTD_LESSONS()` từ bản standalone.
Nếu copy, chúng sẽ ghi đè dữ liệu LPTD 160 unit của dự án tổng.

## 2. Thêm helper server

Copy file:

```
files/gas/Code.hacker1.gs  →  dán vào cuối Code.gs (hoặc tạo file .gs mới)
```

File này thêm:

- `HACKER1_BOOK = 5`
- `hacker1CdnBase_()` — đọc Script Property `HACKER1_AUDIO_CDN_BASE`, mặc định `https://toeic-audio.netlify.app/audio/hacker1`
- `hacker1LessonsWithUrls_()` — remap `book = 5`, gắn `cdnUrl` riêng cho từng track
- `getHacker1Lessons()`, `debugHacker1()`

## 3. Sửa `getLptdBootstrap()` trong `Code.gs`

### Trước

```js
function getLptdBootstrap() {
  var cdnBase = lptdCdnBase_();
  var lessons = lptdLessonsWithUrls_(cdnBase);
  var meta = LPTD_LESSONS_META();
  return {
    configured: true,
    cdnBase: cdnBase,
    docsCdnBase: lptdDocsBase_(),
    meta: meta,
    lessonCount: lessons.length,
    lessons: lessons,
  };
}
```

### Sau

```js
function getLptdBootstrap() {
  var cdnBase = lptdCdnBase_();
  var lessons = lptdLessonsWithUrls_(cdnBase);
  var meta = LPTD_LESSONS_META();

  /* Hacker 1 (book 5) — bọc try/catch để không làm hỏng app nếu thiếu file dữ liệu */
  var hacker1Lessons = [];
  var hacker1Meta = null;
  try {
    if (typeof HACKER1_LESSONS === 'function') {
      hacker1Lessons = hacker1LessonsWithUrls_();
      hacker1Meta = hacker1MetaWithBook_();
    }
  } catch (e) { /* bỏ qua — app vẫn chạy LPTD 1-4 */ }

  return {
    configured: true,
    cdnBase: cdnBase,
    docsCdnBase: lptdDocsBase_(),
    meta: meta,
    lessonCount: lessons.length,
    lessons: lessons,
    hacker1Lessons: hacker1Lessons,
    hacker1Meta: hacker1Meta,
    hacker1LessonCount: hacker1Lessons.length,
    hacker1CdnBase: (typeof hacker1CdnBase_ === 'function' ? hacker1CdnBase_() : ''),
  };
}
```

## 4. (Tùy chọn) `getLptdUnit()`

Hàm hiện tại tra id `lptd-<book>-<unit>`, không khớp id Hacker 1.
Nếu có nơi khác dùng `getLptdUnit()`, thêm nhánh:

```js
function getLptdUnit(book, unit) {
  if (Number(book) === HACKER1_BOOK) {
    var h1 = hacker1LessonsWithUrls_();
    for (var j = 0; j < h1.length; j++) {
      if (Number(h1[j].unit) === Number(unit)) return h1[j];
    }
    return null;
  }
  var id = 'lptd-' + Number(book) + '-' + ('0' + Number(unit)).slice(-2);
  var list = lptdLessonsWithUrls_(lptdCdnBase_());
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
}
```

## 5. Kiểm tra

Chạy trong Script Editor:

```js
debugLptd();      // LPTD 1-4 vẫn đủ 160 unit
debugHacker1();   // 30 track | 186 câu | 2559 từ | book=5 | HTTP 200/206
```

Kỳ vọng log `debugHacker1()`:

```
Hacker 1: 30 track | 186 câu | 2559 từ | book=5
CDN: https://toeic-audio.netlify.app/audio/hacker1
  HACKER1_T01_P12.mp3 → HTTP 206 · audio/mpeg
  HACKER1_T05_P3.mp3  → HTTP 206 · audio/mpeg
  HACKER1_T10_P4.mp3  → HTTP 206 · audio/mpeg
```
