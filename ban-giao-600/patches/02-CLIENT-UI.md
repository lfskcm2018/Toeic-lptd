# PATCH 02 — Client UI (600+)

## 1. `app/lptd-data.js`

### 1.1. Thêm book 7 vào `BOOKS`

```js
{
  book: 7,
  code: '600+',
  title: '600+ · Dictation & Shadowing',
  short: '600+',
  level: '20 ngày · 32 audio',
  icon: '📘',
  accent: '#f59e0b',
  units: 32,
},
```

### 1.2. `L.get()` fallback

Nếu chưa có (Hacker 1/DP2 đã thêm), thêm fallback theo `book/unit`.

### 1.3. `DOCS`

Không cần thêm; `DOCS[7]` rỗng.

## 2. `app/lptd-ui.js`

### 2.1. Gộp dữ liệu trong `apply(res)`

```js
var h1 = Array.isArray(res.hacker1Lessons) ? res.hacker1Lessons : [];
var dp2 = Array.isArray(res.dp2Lessons) ? res.dp2Lessons : [];
var h600 = Array.isArray(res.h600Lessons) ? res.h600Lessons : [];
L.setLessons(res.lessons.concat(h1).concat(dp2).concat(h600));
```

### 2.2. Thanh tiến độ tab

Đã patch (`b.units || 40`); book 7 có `units: 32`.

### 2.3. Nhãn tổng

Cập nhật tổng số unit/nguồn nếu cần (160 + 30 + 11 + 32 = 233).

## 3. Build bundle

```powershell
node tools/build-lptdui-integrated.js
```

Kiểm tra `app/LptdUI.html` có `600+`, `h600Lessons`, `res.lessons.concat`.

## 4. Deploy

- `clasp push`, deployment mới.
- E2E: 7 tab, 600+ 32 unit, audio 206, dictation, shadowing.
- Regression: LPTD 160 + Hacker 1 30 + DP2 11 không đổi.
