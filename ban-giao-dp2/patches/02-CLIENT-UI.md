# PATCH 02 — Client UI (Dictation Part 2)

## 1. `app/lptd-data.js`

### 1.1. Thêm book 6 vào `BOOKS`

Thêm sau book 5 (Hacker 1) hoặc sau book 4 nếu chưa có Hacker 1:

```js
{
  book: 6,
  code: 'Dictation Part 2',
  title: 'Dictation Part 2 — TOEIC Part 2',
  short: 'Part 2',
  level: '11 chuyên đề',
  icon: '📘',
  accent: '#0ea5e9',
  units: 11,
},
```

### 1.2. `L.get()` fallback

Nếu chưa có (Hacker 1 đã thêm), thêm fallback theo `book/unit`:

```js
get: function (book, unit) {
  var id = 'lptd-' + Number(book) + '-' + this.pad2(unit);
  if (this.lessonsById[id]) return this.lessonsById[id];
  var list = this.byBook(book);
  for (var i = 0; i < list.length; i++) {
    if (Number(list[i].unit) === Number(unit)) return list[i];
  }
  return null;
},
```

Id DP2 là `dp2-1-01`…`dp2-1-11`, không khớp `lptd-6-NN`.

### 1.3. `DOCS`

Không cần thêm; `DOCS[6]` rỗng → UI tự ẩn tài liệu.

## 2. `app/lptd-ui.js`

### 2.1. Gộp dữ liệu trong `apply(res)`

```js
var h1 = Array.isArray(res.hacker1Lessons) ? res.hacker1Lessons : [];
var dp2 = Array.isArray(res.dp2Lessons) ? res.dp2Lessons : [];
L.setLessons(res.lessons.concat(h1).concat(dp2));
```

### 2.2. Thanh tiến độ tab

Đã patch cho Hacker 1 (`b.units || 40`); book 6 có `units: 11`, tự tính đúng.

### 2.3. Nhãn (nên sửa)

Cập nhật “190 unit · 5 nguồn” → “201 unit · 6 nguồn” (160 + 30 + 11) nếu đã tích hợp Hacker 1.

### 2.4. (Tùy chọn) Hiển thị số chuyên đề

Dictation tab hiện `Math.floor(i / 2) + 1` (đã patch trong bundle DP2) để Q/A cùng số chuyên đề 1…15. Nếu bundle chưa patch, áp dụng tương tự.

## 3. Build bundle

```powershell
node tools/build-lptdui-integrated.js
```

Kiểm tra:

```powershell
Select-String -Path "app\LptdUI.html" -Pattern "Dictation Part 2|dp2Lessons|res.lessons.concat"
```

## 4. Deploy

- `clasp push`
- Tạo deployment mới.
- E2E: 6 tab (LPTD 1–4, Hacker 1, Dictation Part 2), 11 chuyên đề, audio 206, dictation, shadowing.
- Regression: LPTD 160 + Hacker 1 30 không đổi.
