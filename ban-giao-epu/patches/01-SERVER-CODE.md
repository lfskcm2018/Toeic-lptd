# PATCH 01 — Server (EPI Elementary)

> Mục tiêu: thêm EPI Elementary (50 unit + Section E) vào `getLptdBootstrap()` dưới dạng **book 9**
> (LPTD 1–4 = 1–4, Hacker 1 = 5, DP2 = 6, 600+ = 7, 750+ = 8).

## 1. Thêm file dữ liệu

Copy `files/gas/EpiData.gs` → `app/EpiData.gs` (chỉ `EPI_LESSONS_META/EPI_LESSONS`).

## 2. Thêm helper server

Copy `files/gas/EpiServer.gs` → `app/EpiServer.gs`.

Các hàm: `EPI_BOOK = 9`, `epiCdnBase_()`, `epiLessonsWithUrls_()`, `epiMetaWithBook_()`,
`getEpiLessons()`, `debugEPI()`.

> Nếu chưa tích hợp các nguồn trước, đổi `EPI_BOOK` cho phù hợp.

## 3. Patch `getLptdBootstrap()` (app/LptdServer.gs)

Thêm block:

```js
var epiLessons = safe(function () { return typeof EPI_LESSONS === 'function' ? epiLessonsWithUrls_() : []; }) || [];
var epiMeta = safe(function () { return typeof EPI_LESSONS === 'function' ? epiMetaWithBook_() : null; });
```

Trả thêm:

```js
epiLessons: epiLessons,
epiMeta: epiMeta,
epiLessonCount: epiLessons.length,
epiCdnBase: (typeof epiCdnBase_ === 'function' ? epiCdnBase_() : ''),
```

## 4. Kiểm tra

```js
debugEPI();  // EPI Elementary: 58 unit | 147 câu | … | book 9
```

URL mẫu trả 206 (Range request).

> **Lưu ý bug đã sửa:** `openLibrary(book)` trong `app/lptd-ui.js` trước đây **không nhận tham số**
> nhưng sidebar lại gọi `openLibrary(e.book)` → `ReferenceError: book is not defined`.
> Đã sửa thành `function openLibrary(book) {`.
