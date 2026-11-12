# PATCH 02 — Client UI (750+)

## 1. `app/lptd-data.js`

### 1.1. Thêm book 8 vào `BOOKS`

```js
{
  book: 8,
  code: '750+',
  title: '750+ · Dictation & Shadowing',
  short: '750+',
  level: '20 ngày · 20 audio',
  icon: '📘',
  accent: '#8b5cf6',
  units: 20,
},
```

### 1.2. `L.get()` fallback

Nếu chưa có, thêm fallback theo `book/unit`.

### 1.3. `DOCS`

Không cần thêm; `DOCS[8]` rỗng.

## 2. `app/lptd-ui.js`

### 2.1. Gộp dữ liệu trong `apply(res)`

```js
var h1 = Array.isArray(res.hacker1Lessons) ? res.hacker1Lessons : [];
var dp2 = Array.isArray(res.dp2Lessons) ? res.dp2Lessons : [];
var h600 = Array.isArray(res.h600Lessons) ? res.h600Lessons : [];
var h750 = Array.isArray(res.h750Lessons) ? res.h750Lessons : [];
L.setLessons(res.lessons.concat(h1).concat(dp2).concat(h600).concat(h750));
```

### 2.2. Thanh tiến độ tab

Đã patch (`b.units || 40`); book 8 có `units: 20`.

### 2.3. Nhãn tổng

Cập nhật tổng số unit/nguồn nếu cần (160 + 30 + 11 + 32 + 20 = 253).

## 3. Build bundle

```powershell
node tools/build-lptdui-integrated.js
```

Kiểm tra `app/LptdUI.html` có `750+`, `h750Lessons`, `res.lessons.concat`.

## 4. Deploy

- `clasp push`, deployment mới.
- E2E: 8 tab (LPTD 1–4, Hacker 1, DP2, 600+, 750+), 750+ 20 unit, audio 206, dictation, shadowing.
- Regression: LPTD 160 + Hacker 1 30 + DP2 11 + 600+ 32 không đổi.
