# PATCH 02 — Client UI (`app/lptd-data.js`, `app/lptd-ui.js`, `app/LptdUI.html`)

> Mục tiêu: UI nhận thêm 30 track Hacker 1 (book 5) do server trả về,
> hiển thị thành tab riêng, mở bài/audio/dictation bình thường,
> **không đổi hành vi LPTD 1–4**.

Thực hiện đúng thứ tự: sửa `lptd-data.js` → sửa `lptd-ui.js` → build lại `LptdUI.html`.

---

## 1. `app/lptd-data.js`

### 1.1. Thêm book 5 vào `BOOKS`

Tìm mảng `var BOOKS = [` (kết thúc bằng object book 4, khoảng dòng 50–60).
Thêm object sau **sau** book 4:

```js
    {
      book: 5,
      code: 'Hacker 1',
      title: 'Hackers TOEIC 1000 LC — Hacker 1',
      short: 'TOEIC LC',
      level: '10 TEST · 30 track',
      icon: '📘',
      accent: '#0ea5e9',
      units: 30,
    },
```

> `units: 30` rất quan trọng: UI dùng để tính `% tiến độ` và nhãn `x/30`.

### 1.2. Sửa `L.get()` để tra được id Hacker 1

Id Hacker 1 là `hacker1-tNN-pYY`, **không** phải `lptd-5-NN`. Hiện tại:

```js
    get: function (book, unit) {
      return this.lessonsById['lptd-' + Number(book) + '-' + this.pad2(unit)] || null;
    },
```

Thay bằng:

```js
    get: function (book, unit) {
      var id = 'lptd-' + Number(book) + '-' + this.pad2(unit);
      if (this.lessonsById[id]) return this.lessonsById[id];
      /* Fallback cho nguồn có id riêng (Hacker 1: hacker1-tNN-pYY). */
      var list = this.byBook(book);
      for (var i = 0; i < list.length; i++) {
        if (Number(list[i].unit) === Number(unit)) return list[i];
      }
      return null;
    },
```

Không cần sửa `unitKey()` — hàm này dùng `book + '-' + unit`, nên book 5 tự có key `5-1 … 5-30`, không đụng tiến độ LPTD.

Không cần thêm `DOCS[5]`; `docsForBook(5)` trả `[]` nên UI tự ẩn khối tài liệu.

### 1.3. Kiểm tra nhanh trong Console (bản local)

```js
LPTD.byBook(5).length      // 30
LPTD.get(5, 1)             // object, không null
LPTD.cdnUrl(LPTD.get(5, 1))
// "https://toeic-audio.netlify.app/audio/hacker1/HACKER1_T01_P12.mp3"
```

---

## 2. `app/lptd-ui.js`

### 2.1. Gộp dữ liệu trong `apply(res)` (bắt buộc)

Tìm hàm `apply(res)` trong `ensureData()`, khoảng dòng 165:

```js
    function apply(res) {
      if (res && Array.isArray(res.lessons)) {
        if (res.cdnBase) L.CDN_BASE = String(res.cdnBase).replace(/\/+$/, '');
        if (res.docsCdnBase) L.docsCdnBase = String(res.docsCdnBase).replace(/\/+$/, '');
        L.setLessons(res.lessons);
      } else if (Array.isArray(res)) {
        L.setLessons(res);
      } else {
        throw new Error('Dữ liệu LPTD trả về không hợp lệ.');
      }
```

Thay dòng `L.setLessons(res.lessons);` bằng:

```js
        var h1 = Array.isArray(res.hacker1Lessons) ? res.hacker1Lessons : [];
        L.setLessons(res.lessons.concat(h1));
```

> Nếu thiếu bước này: tab Hacker 1 không xuất hiện vì `L.setLessons` chỉ nhận 160 unit LPTD.

### 2.2. Thanh tiến độ tab: bỏ hard-code `/40`

Trong `renderLibrary()` (khoảng dòng 772–779):

```js
      var bpct = Math.round(bdone / 40 * 100);
      ...
      '<span class="lptd-book-progress">...<small>' + bdone + '/40</small></span>' +
```

Thay bằng:

```js
      var bUnits = Number(b.units) || 40;
      var bpct = bUnits ? Math.round(bdone / bUnits * 100) : 0;
      ...
      '<span class="lptd-book-progress">...<small>' + bdone + '/' + bUnits + '</small></span>' +
```

Lý do: Hacker 1 chỉ có 30 unit; nếu để `/40` thì chọn xong 30 bài vẫn hiện `30/40`.

### 2.3. Nhãn hero / sidebar (nên sửa để không gây nhầm)

Các chuỗi cần đổi (tìm theo nội dung — số dòng có thể lệch):

| Vị trí | Chuỗi cũ | Chuỗi mới |
|---|---|---|
| `openLibrary()` → `setHero` | `'LPTD 1–4 · 160 unit · Nghe – chép chính tả – shadowing'` | `'LPTD 1–4 + Hacker 1 · 190 unit · Nghe – chép chính tả – shadowing'` |
| `openLibrary()` → `setHero` | `'🎧 160 unit · 4 cuốn · ' + ...` | `'🎧 190 unit · 5 nguồn · ' + ...` |
| `openLibrary()` → `setHero` | `'LPTD 1–4'` | `'LPTD & Hacker 1'` |
| `renderLibrary()` → hero card | `<h2 ...>📚 Listening Practice Through Dictation</h2>` | `<h2 ...>📚 Listening Practice + Hacker 1</h2>` |
| `renderLibrary()` → hero card | `<p ...>160 unit · 4 cuốn · Nghe – chép chính tả – luyện nói theo</p>` | `<p ...>190 unit · 5 nguồn · Nghe – chép chính tả – luyện nói theo</p>` |
| Nút sidebar | `btn.innerHTML = '📚 LPTD 1–4';` | `btn.innerHTML = '📚 LPTD & Hacker 1';` |
| `showFatal()` | `'LPTD 1–4'` | `'LPTD & Hacker 1'` |

Đây là thay đổi hiển thị, không ảnh hưởng logic. Có thể để nguyên nếu dự án tổng muốn giữ thương hiệu cũ.

### 2.4. (Tùy chọn) Badge `T01…T10` cho Hacker 1

Trong `unitCardsHtml(units)` hiện tại:

```js
'<span class="lptd-unit-badge">U' + pad2(u.unit) + '</span>' +
```

Thay bằng:

```js
'<span class="lptd-unit-badge">' + unitBadge(u) + '</span>' +
```

và thêm helper gần đó:

```js
  function unitBadge(u) {
    if (Number(u.book) === 5) {
      var m = /TEST\s*(\d+)/i.exec(u.title || '');
      if (m) return 'T' + ('0' + m[1]).slice(-2);
      return 'H' + pad2(u.unit);
    }
    return 'U' + pad2(u.unit);
  }
```

### 2.5. (Tùy chọn) Hero khi mở bài Hacker 1

`unitLabel()` / `setHero()` đang hiện `'LPTD ' + book + ' · U..'`.
Có thể thêm nhánh book 5 → `'Hacker 1 · ' + badge`. Không bắt buộc.

---

## 3. Build lại bundle `app/LptdUI.html`

Bundle GAS là kết quả ghép `app/lptd-data.js + app/lptd-ui.js`. **Không sửa tay file này.**

```powershell
node tools/build-lptdui-integrated.js
```

Nếu chưa copy tool vào `tools/`, chạy trực tiếp từ folder bàn giao:

```powershell
node "op/ban-giao-hacker-1/files/tools/build-lptdui-integrated.js" --root "E:\CÁ NHÂN\03. Quyet.nv\29. Học chép chính tả TOEIC"
```

Kỳ vọng:

```
== build-lptdui-integrated ==
Out  : ...\app\LptdUI.html (8x,xxx bytes)
OK   : <timestamp>
```

Kiểm tra bundle đã có book 5 + merge:

```powershell
Select-String -Path "app\LptdUI.html" -Pattern "Hacker 1|hacker1Lessons|res\.lessons\.concat" |
  Select-Object -First 10
```

Phải thấy ít nhất:

- `code: 'Hacker 1'`
- `res.hacker1Lessons`
- `res.lessons.concat(h1)`

---

## 4. Điều kiện để UI hoạt động

1. `app/Index.html` vẫn include `<?!= include('LptdUI'); ?>` **sau** `JavaScript` và sau khi có `#modeBody` + `.sidebar-footer`.
2. CSS vẫn ở `app/LptdStyles.html` — Hacker 1 dùng lại 100% class LPTD, không cần CSS mới.
3. `app/LptdUI.html` mới phải được push lên GAS (`.claspignore` chỉ bỏ `*.js`, nên `.html` được push).

---

## 5. Lỗi thường gặp ở bước client

| Triệu chứng | Nguyên nhân | Cách sửa |
|---|---|---|
| Chỉ có 4 tab | `apply()` chưa `concat` hoặc server không trả `hacker1Lessons` | Kiểm tra payload `getLptdBootstrap`, rồi patch 2.1 |
| Có tab Hacker 1 nhưng 0 card | `book` trong lesson không phải 5 | Kiểm tra `hacker1LessonsWithUrls_()` ở server |
| Mở bài trắng / không phản ứng | `L.get()` chưa fallback | Patch 1.2 |
| Tab hiện `0/40` | Chưa patch 2.2 hoặc `BOOKS[4].units` thiếu | Thêm `units: 30` + patch 2.2 |
| Audio 404 | `cdnUrl` thiếu hoặc sai `cdnName` | Kiểm tra `cdnUrl` trong payload; xem patch 01 |
| Sửa js nhưng UI không đổi | Chưa build lại `LptdUI.html` hoặc chưa tạo deployment mới | Chạy mục 3 + tạo deployment mới |
