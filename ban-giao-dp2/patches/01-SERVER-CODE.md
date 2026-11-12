# PATCH 01 — Server (Google Apps Script) — Dictation Part 2

> Mục tiêu: thêm 11 chuyên đề Dictation Part 2 vào `getLptdBootstrap()` của dự án tổng,
> dưới dạng **book 6** (LPTD 1–4 = 1–4, Hacker 1 = 5), không ảnh hưởng nguồn cũ.

## 1. Thêm file dữ liệu

Copy:

```
files/gas/DP2Data.gs  →  <project tổng>/DP2Data.gs
```

File chỉ khai báo:

- `DP2_LESSONS_META()`
- `DP2_LESSONS()`

⚠️ **Không** để wrapper `LPTD_LESSONS_META()` / `LPTD_LESSONS()` trong file này.

## 2. Thêm helper server

Copy nội dung `files/gas/Code.dp2.gs` vào cuối `app/LptdServer.gs` (hoặc file `.gs` mới).

Các hàm thêm:

| Hàm | Vai trò |
|---|---|
| `DP2_BOOK = 6` | book id khi tích hợp (standalone = 1) |
| `dp2CdnBase_()` | base CDN, override bằng `DP2_AUDIO_CDN_BASE` |
| `dp2LessonsWithUrls_()` | 11 unit, remap book 6, gắn `cdnUrl` |
| `dp2MetaWithBook_()` | meta hiển thị nguồn |
| `getDp2Lessons()` | API riêng |
| `debugDp2()` | log kiểm tra |

> Nếu dự án tổng **chưa** tích hợp Hacker 1, đổi `DP2_BOOK = 5` trong helper.

## 3. Sửa `getLptdBootstrap()` trong `app/LptdServer.gs`

### Trước

```js
function getLptdBootstrap() {
  var cdnBase = lptdCdnBase_();
  var lessons = lptdLessonsWithUrls_(cdnBase);
  var meta = LPTD_LESSONS_META();
  // (có thể đã có block Hacker 1)
  return {
    configured: true,
    cdnBase: cdnBase,
    docsCdnBase: lptdDocsBase_(),
    meta: meta,
    lessonCount: lessons.length,
    lessons: lessons,
    // hacker1Lessons, hacker1Meta, ... (nếu đã tích hợp Hacker 1)
  };
}
```

### Sau

```js
function getLptdBootstrap() {
  var cdnBase = lptdCdnBase_();
  var lessons = lptdLessonsWithUrls_(cdnBase);
  var meta = LPTD_LESSONS_META();

  /* Hacker 1 (book 5) — nếu đã tích hợp */
  var hacker1Lessons = [];
  var hacker1Meta = null;
  try {
    if (typeof HACKER1_LESSONS === 'function') {
      hacker1Lessons = hacker1LessonsWithUrls_();
      hacker1Meta = hacker1MetaWithBook_();
    }
  } catch (e) { /* bỏ qua */ }

  /* Dictation Part 2 (book 6) */
  var dp2Lessons = [];
  var dp2Meta = null;
  try {
    if (typeof DP2_LESSONS === 'function') {
      dp2Lessons = dp2LessonsWithUrls_();
      dp2Meta = dp2MetaWithBook_();
    }
  } catch (e) { /* bỏ qua */ }

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
    dp2Lessons: dp2Lessons,
    dp2Meta: dp2Meta,
    dp2LessonCount: dp2Lessons.length,
    dp2CdnBase: (typeof dp2CdnBase_ === 'function' ? dp2CdnBase_() : ''),
  };
}
```

## 4. (Tùy chọn) `getLptdUnit()`

Thêm nhánh book 6:

```js
if (Number(book) === DP2_BOOK) {
  var d = dp2LessonsWithUrls_();
  for (var k = 0; k < d.length; k++) {
    if (Number(d[k].unit) === Number(unit)) return d[k];
  }
  return null;
}
```

## 5. Kiểm tra

```js
debugLptd();   // LPTD 1-4 không đổi
debugHacker1(); // nếu đã tích hợp Hacker 1
debugDp2();     // 11 unit | 476 dòng | 3166 từ | book=6
```

Kỳ vọng `debugDp2()` có 3 dòng HTTP 200/206.
