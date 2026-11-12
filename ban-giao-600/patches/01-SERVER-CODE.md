# PATCH 01 — Server (600+)

> Mục tiêu: thêm 32 unit 600+ vào `getLptdBootstrap()` dưới dạng **book 7**
> (LPTD 1–4 = 1–4, Hacker 1 = 5, DP2 = 6).

## 1. Thêm file dữ liệu

Copy `files/gas/H600Data.gs` → `app/H600Data.gs` (chỉ `H600_LESSONS_META/H600_LESSONS`).

## 2. Thêm helper server

Copy `files/gas/Code.h600.gs` vào cuối `app/LptdServer.gs`.

Các hàm: `H600_BOOK = 7`, `h600CdnBase_()`, `h600LessonsWithUrls_()`, `h600MetaWithBook_()`, `getH600Lessons()`, `debugH600()`.

> Nếu chưa tích hợp Hacker 1/DP2, đổi `H600_BOOK` cho phù hợp (5 hoặc 6).

## 3. Patch `getLptdBootstrap()`

Thêm block:

```js
var h600Lessons = [];
var h600Meta = null;
try {
  if (typeof H600_LESSONS === 'function') {
    h600Lessons = h600LessonsWithUrls_();
    h600Meta = h600MetaWithBook_();
  }
} catch (e) { /* bỏ qua */ }
```

Trả thêm:

```js
h600Lessons: h600Lessons,
h600Meta: h600Meta,
h600LessonCount: h600Lessons.length,
h600CdnBase: (typeof h600CdnBase_ === 'function' ? h600CdnBase_() : ''),
```

## 4. (Tùy chọn) `getLptdUnit()` nhánh book 7.

## 5. Kiểm tra

```js
debugH600();  // 32 unit | 179 câu | 1342 từ | book=7
```

3 URL mẫu trả 206.
