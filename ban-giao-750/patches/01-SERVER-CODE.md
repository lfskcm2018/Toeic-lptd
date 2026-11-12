# PATCH 01 — Server (750+)

> Mục tiêu: thêm 20 unit 750+ vào `getLptdBootstrap()` dưới dạng **book 8**
> (LPTD 1–4 = 1–4, Hacker 1 = 5, DP2 = 6, 600+ = 7).

## 1. Thêm file dữ liệu

Copy `files/gas/H750Data.gs` → `app/H750Data.gs` (chỉ `H750_LESSONS_META/H750_LESSONS`).

## 2. Thêm helper server

Copy `files/gas/Code.h750.gs` vào cuối `app/LptdServer.gs`.

Các hàm: `H750_BOOK = 8`, `h750CdnBase_()`, `h750LessonsWithUrls_()`, `h750MetaWithBook_()`, `getH750Lessons()`, `debugH750()`.

> Nếu chưa tích hợp các nguồn trước, đổi `H750_BOOK` cho phù hợp.

## 3. Patch `getLptdBootstrap()`

Thêm block:

```js
var h750Lessons = [];
var h750Meta = null;
try {
  if (typeof H750_LESSONS === 'function') {
    h750Lessons = h750LessonsWithUrls_();
    h750Meta = h750MetaWithBook_();
  }
} catch (e) { /* bỏ qua */ }
```

Trả thêm:

```js
h750Lessons: h750Lessons,
h750Meta: h750Meta,
h750LessonCount: h750Lessons.length,
h750CdnBase: (typeof h750CdnBase_ === 'function' ? h750CdnBase_() : ''),
```

## 4. (Tùy chọn) `getLptdUnit()` nhánh book 8.

## 5. Kiểm tra

```js
debugH750();  // 20 unit | 110 câu | 804 từ | book=8
```

3 URL mẫu trả 206.
