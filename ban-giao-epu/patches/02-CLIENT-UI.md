# PATCH 02 — Client UI (EPI Elementary)

## 1. `app/lptd-data.js`

### 1.1. Thêm book 9 vào `BOOKS`

```js
{
  book: 9,
  code: 'EPI Elementary',
  title: 'English Pronunciation in Use Elementary',
  short: 'EPI',
  level: '50 unit + Section E · 351 audio',
  icon: '🗣️',
  accent: '#ec4899',
  units: 58,
},
```

### 1.2. `L.get()` fallback

Không cần sửa — `L.get(book, unit)` đã có fallback theo số unit trong `L.byBook(book)`.

### 1.3. `DOCS`

Không thêm; `DOCS[9]` rỗng.

## 2. `app/lptd-ui.js`

### 2.1. Gộp dữ liệu trong `apply(res)`

```js
var epi = Array.isArray(res.epiLessons) ? res.epiLessons : [];
L.setLessons(res.lessons.concat(h1).concat(dp2).concat(h600).concat(h750).concat(epi));
```

### 2.2. Cây sidebar — thêm EPI Elementary

Trong `injectSidebarButton()`, `entries` thêm:

```js
{ book: 9, label: 'EPI Elementary', title: 'English Pronunciation in Use Elementary' },
```

Nhãn nút cha: `📚 LPTD 1–9` (từ `LPTD 1–8`), `title` → “9 nguồn”.

### 2.3. Panel EPI trong unit view

Trong `renderUnit()`, trước `html += '<div id="lptdUnitBody"></div>';` chèn panel:

- dòng thông tin: `CD x · track a–b · sách trang p`
- nút phát từng track (`.epi-track-btn`)
- bài tập + nút “Xem đáp án” (`.epi-reveal`)

CSS đặt trong `ensureEpiCss()` (`.epi-tracks`, `.epi-ex`, `.epi-answer`).

### 2.4. Nhãn tổng

`LPTD 1–9 · 311 unit · Nghe – chép chính tả – shadowing` và
`🎧 311 unit · 9 nguồn · … từ`.

## 3. Build bundle

```powershell
node tools/build-lptdui-integrated.js
```

Kiểm tra `app/LptdUI.html` có `EPI Elementary`, `concat(epi)`, `epiPanel`.

> Script build nằm ở `op/tools/build-lptdui-integrated.js`
> (bản dùng trong repo này: `op/ban-giao-750/files/tools/build-lptdui-integrated.js`).

## 4. Deploy

- `clasp push`, deployment mới.
- E2E: 9 tab (LPTD 1–4, Hacker 1, DP2, 600+, 750+, EPI Elementary), EPI 58 unit, audio 206, dictation, shadowing.
- Regression: LPTD 160 + Hacker 1 30 + DP2 11 + 600+ 32 + 750+ 20 không đổi (tổng 253 → 311).
