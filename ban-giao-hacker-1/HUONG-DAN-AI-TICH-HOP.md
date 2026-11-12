# HƯỚNG DẪN AI — TÍCH HỢP HACKER 1 VÀO DỰ ÁN TỔNG

> **Người nhận:** AI/dev phụ trách dự án tổng.
> **Người giao:** phiên làm việc Hacker 1 (nhánh `lptd-source-hacker-1`).
> **Ngày:** 2026-11-12.
> **Nguyên tắc:** tích hợp **không phá** LPTD 1–4, Hackers 700+, ETS 2026 và các tính năng đang chạy.

---

## 1. Bối cảnh

Dự án tổng hiện có module **LPTD 1–4** (160 unit) chạy trong app GAS:

- Server: `app/Code.gs`, `app/LptdServer.gs`, `app/LptdData.gs`
- Client: `app/lptd-data.js`, `app/lptd-ui.js`, bundle `app/LptdUI.html`
- HTML: `app/Index.html` include `LptdUI` ở cuối trang
- Deploy GAS: `.clasp.json` ở gốc repo, `rootDir: "app"`, Script ID `1RCTQ5HE3oLYnn_SLcUqqHpovMbVSBC7dfe8aZBIl0tkGNP37crYvESW7`

Nguồn **Hacker 1** đã được xây dựng và kiểm thử E2E trên một web app GAS riêng. Bàn giao này đưa Hacker 1 vào module LPTD của dự án tổng dưới dạng **book 5**.

---

## 2. Trạng thái nguồn Hacker 1 (đã kiểm chứng)

| Hạng mục | Kết quả |
|---|---|
| Dữ liệu | 30 track · 186 câu · 2.559 từ · 0 bài rỗng |
| Phân bố | 10 TEST × (Part 1-2, Part 3, Part 4) |
| Audio | 30/30 file trên Netlify, HTTP 200/206, `audio/mpeg` |
| Dictation | Chấm đúng 100% khi điền đủ đáp án |
| Shadowing | Render đủ card + nút ghi âm/chấm % |
| Điều hướng | 30 card → mở bài → quay lại thư viện OK |
| Console | Không lỗi ứng dụng (chỉ warning sandbox GAS) |
| Web app tham chiếu | Deployment @4 (URL ở mục 8) |

---

## 3. Thiết kế tích hợp (khuyến nghị)

### 3.1. Hacker 1 = book 5

- LPTD: book 1–4 (40 unit/cuốn).
- Hacker 1: book **5**, unit **1–30**.
- `unitKey` hiện tại là `<book>-<unit>` → book 5 không đụng khoá tiến độ của LPTD.
- Thứ tự unit: TEST 01 P1-2, P3, P4 → TEST 02 … → TEST 10 P4.

### 3.2. Luồng dữ liệu

```
Hacker1Data.gs (HACKER1_LESSONS, book gốc = 1)
        │
        ▼
hacker1LessonsWithUrls_()   ← remap book=5, gắn cdnUrl riêng (/audio/hacker1)
        │
        ▼
getLptdBootstrap()
  { lessons: [...160 LPTD], hacker1Lessons: [...30] }
        │
        ▼
lptd-ui.js  apply(res)
  L.setLessons(res.lessons.concat(res.hacker1Lessons || []))
        │
        ▼
BOOKS (thêm book 5) → tab "Hacker 1" → 30 card
```

### 3.3. Vì sao không gộp thẳng vào `LPTD_LESSONS()`

- `LptdData.gs` là file **auto-generated** từ nguồn LPTD; gộp tay sẽ bị ghi đè khi build lại.
- Audio Hacker 1 dùng **base CDN khác** (`/audio/hacker1`), trong khi `lptdLessonsWithUrls_` dùng một base duy nhất.
- Tách `hacker1Lessons` giúp bật/tắt nguồn độc lập và rollback dễ.

---

## 4. Các bước tích hợp

### Bước 0 — Backup trước khi sửa

```powershell
cd "E:\CÁ NHÂN\03. Quyet.nv\29. Học chép chính tả TOEIC"
git status
git add -A
git commit -m "chore: snapshot before Hacker 1 integration"
```

Bản backup nguồn Hacker 1 (không gồm MP3):

```
op/backup_20261112_hacker1/
```

---

### Bước 1 — Thêm dữ liệu Hacker 1

Copy:

```
files/gas/Hacker1Data.gs  →  app/Hacker1Data.gs
```

Kiểm tra file chỉ có 2 hàm dữ liệu:

- `HACKER1_LESSONS_META()`
- `HACKER1_LESSONS()`

**Tuyệt đối không** để `LPTD_LESSONS_META()` / `LPTD_LESSONS()` trong file này.

Kiểm tra nhanh:

```powershell
Select-String -Path "app\Hacker1Data.gs" -Pattern "^function " | Select-Object Line
```

Kỳ vọng chỉ 2 dòng `HACKER1_*`.

---

### Bước 2 — Thêm helper server

Copy nội dung `files/gas/Code.hacker1.gs` vào **cuối** `app/LptdServer.gs`
(hoặc tạo file `app/Hacker1Server.gs` — clasp tự push file `.gs`).

File này thêm:

| Hàm | Vai trò |
|---|---|
| `HACKER1_BOOK = 5` | book id khi tích hợp |
| `hacker1CdnBase_()` | base CDN, override bằng `HACKER1_AUDIO_CDN_BASE` |
| `hacker1LessonsWithUrls_()` | 30 track, remap book 5, gắn `cdnUrl` |
| `hacker1MetaWithBook_()` | meta hiển thị nguồn |
| `getHacker1Lessons()` | API riêng (nếu cần) |
| `debugHacker1()` | log kiểm tra |

---

### Bước 3 — Sửa `getLptdBootstrap()` trong `app/LptdServer.gs`

Xem chi tiết + code đầy đủ: `patches/01-SERVER-CODE.md`.

Tóm tắt thay đổi:

```js
var hacker1Lessons = [];
var hacker1Meta = null;
try {
  if (typeof HACKER1_LESSONS === 'function') {
    hacker1Lessons = hacker1LessonsWithUrls_();
    hacker1Meta = hacker1MetaWithBook_();
  }
} catch (e) { /* không chặn LPTD */ }

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
  hacker1CdnBase: hacker1CdnBase_(),
};
```

> Bọc `try/catch` để nếu file dữ liệu chưa push, app vẫn chạy LPTD bình thường.

---

### Bước 4 — Sửa client `app/lptd-data.js`

#### 4.1. Thêm book 5 vào `BOOKS`

Thêm sau object book 4:

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

#### 4.2. Sửa `L.get()` để tra được id Hacker 1

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

Lý do: id Hacker 1 là `hacker1-tNN-pYY`, không phải `lptd-5-NN`.

#### 4.3. `DOCS`

Không cần thêm; `DOCS[5]` rỗng → UI tự ẩn phần tài liệu.

---

### Bước 5 — Sửa client `app/lptd-ui.js`

Xem chi tiết: `patches/02-CLIENT-UI.md`.

#### 5.1. Gộp dữ liệu trong `apply(res)`

```js
function apply(res) {
  if (res && Array.isArray(res.lessons)) {
    if (res.cdnBase) L.CDN_BASE = String(res.cdnBase).replace(/\/+$/, '');
    if (res.docsCdnBase) L.docsCdnBase = String(res.docsCdnBase).replace(/\/+$/, '');
    var h1 = Array.isArray(res.hacker1Lessons) ? res.hacker1Lessons : [];
    L.setLessons(res.lessons.concat(h1));
  } else if (Array.isArray(res)) {
    L.setLessons(res);
  } else {
    throw new Error('Dữ liệu LPTD trả về không hợp lệ.');
  }
  if (!L.lessons.length) throw new Error('Danh sách LPTD rỗng.');
  cb(null);
}
```

#### 5.2. Cập nhật nhãn/hero (tránh hiển thị sai "160 unit · 4 cuốn")

Các vị trí cần sửa (tìm theo nội dung, số dòng có thể lệch):

| Nội dung cũ | Nội dung mới gợi ý |
|---|---|
| `'📚 LPTD 1–4'` (nút sidebar) | `'📚 LPTD & Hacker 1'` |
| `'LPTD 1–4 · 160 unit · …'` | `'LPTD 1–4 + Hacker 1 · 190 unit · …'` |
| `'🎧 160 unit · 4 cuốn · …'` | `'🎧 190 unit · 5 nguồn · …'` |
| `<h2>📚 Listening Practice Through Dictation</h2>` | `<h2>📚 Listening Practice + Hacker 1</h2>` |
| `<p>160 unit · 4 cuốn · …</p>` | `<p>190 unit · 5 nguồn · Nghe – chép chính tả – luyện nói theo</p>` |
| `b.book-progress ... bdone + '/40'` | `bdone + '/' + (b.units || 40)` |

Không bắt buộc đổi hết để chạy, nhưng nên đổi để người dùng không hiểu nhầm.

#### 5.3. (Nếu muốn) hiển thị badge `T01` cho Hacker 1

Trong `unitCardsHtml`, thay badge `U..` bằng:

```js
var m = /TEST\s*(\d+)/i.exec(u.title || '');
var badge = m ? 'T' + ('0' + m[1]).slice(-2) : 'U' + pad2(u.unit);
```

---

### Bước 6 — Build lại bundle GAS `app/LptdUI.html`

Dự án tổng dùng bundle ghép từ `lptd-data.js + lptd-ui.js`. Có sẵn script bàn giao:

```powershell
node "op/ban-giao-hacker-1/files/tools/build-lptdui-integrated.js"
```

Script sẽ:

1. Đọc `app/lptd-data.js` + `app/lptd-ui.js`.
2. Ghép thành `app/LptdUI.html` (escape `</script>`).
3. Giữ đúng định dạng bundle hiện tại (không auto-open).

Kiểm tra bundle có book 5 + merge `hacker1Lessons`:

```powershell
Select-String -Path "app\LptdUI.html" -Pattern "Hacker 1|hacker1Lessons|HACKER1" | Select-Object -First 10
```

---

### Bước 7 — (Tùy chọn) bản local

Xem `patches/03-LOCAL-DATA.md`:

- Copy `hacker-1-lessons-data.js` vào `app/`.
- Nạp trước `lptd-data.js`/`lptd-ui.js`.
- Gộp vào `window.LPTD_LESSONS_RAW` và remap `book = 5`.

---

### Bước 8 — Deploy GAS

1. Kiểm tra `.clasp.json` ở gốc repo trỏ đúng project tổng (`rootDir: app`).
2. `clasp push` (từ gốc repo).
3. Apps Script Editor → chạy `debugLptd()` và `debugHacker1()`.
4. **Tạo deployment mới** (Deploy → New deployment) — không sửa deployment cũ đang chạy.
5. Mở URL `/exec` mới, hard reload.

---

## 5. Script Properties

| Key | Bắt buộc | Giá trị |
|---|---|---|
| `HACKER1_AUDIO_CDN_BASE` | Không (có default trong code) | `https://toeic-audio.netlify.app/audio/hacker1` |
| `LPTD_AUDIO_CDN_BASE` | Đang dùng cho LPTD | giữ nguyên |
| `LPTD_RECORDING_ENGINE_URL` | Nếu dùng ghi âm | giữ nguyên |

Nếu dự án tổng không muốn thêm property, cứ để default trong `Code.hacker1.gs`.

---

## 6. Kiểm thử & tiêu chí Done

### 6.1. Server

```js
debugLptd();      // 160 unit LPTD, không đổi
debugHacker1();   // 30 track | 186 câu | 2559 từ | book=5
```

Kỳ vọng `debugHacker1()` có 3 dòng HTTP 200/206.

### 6.2. UI

- [ ] Sidebar có nút LPTD; mở module thấy **5 tab**: LPTD 1, 2, 3, 4, **Hacker 1**.
- [ ] Tab Hacker 1 hiển thị **30 card**, badge `T01…T10`.
- [ ] Mở 1 bài: hiện 6–9 câu + ô trống dictation.
- [ ] Audio phát đúng `HACKER1_*.mp3`, Network trả **206**, seek được.
- [ ] Dictation: điền đủ → 100%, xem đáp án OK.
- [ ] Shadowing: render card + ghi âm/chấm % (nếu môi trường cho phép micro).
- [ ] Quay lại thư viện, tiến độ lưu; reload vẫn còn.
- [ ] **LPTD 1–4 vẫn đủ 160 unit**, mở bài/audio bình thường.
- [ ] Hackers 700+/ETS 2026 không bị ảnh hưởng (mở thử 1 đề).
- [ ] Console không lỗi.

### 6.3. Tiêu chí Done

1. 30/30 track Hacker 1 hoạt động end-to-end.
2. 160/160 unit LPTD cũ không regression.
3. Không tăng đáng kể thời gian tải (payload +~42KB JSON).
4. Không có lỗi console/network mới.

---

## 7. Rủi ro & cách xử lý

| Rủi ro | Dấu hiệu | Xử lý |
|---|---|---|
| Ghi đè dữ liệu LPTD | Mất 160 unit, chỉ còn 30 | Kiểm tra `Hacker1Data.gs` không có wrapper `LPTD_*`; khôi phục `LptdData.gs` |
| Không thấy tab Hacker 1 | Chỉ có 4 tab | `res.hacker1Lessons` rỗng → chưa push `Hacker1Data.gs` hoặc lỗi `hacker1LessonsWithUrls_()`; xem Logs |
| Mở bài trắng | Click card không phản ứng | Chưa patch `L.get()` fallback |
| Audio 404 | Network 404 | Netlify bị deploy nguồn khác ghi đè; deploy lại manifest hợp nhất (mục 9) |
| Audio phát nhưng không seek | Network 200 thay vì 206 | Kiểm tra header CDN; Netlify đã hỗ trợ Range |
| Progress lẫn LPTD | Điểm Hacker 1 hiện sang bài LPTD | Kiểm tra `book = 5` trong `hacker1LessonsWithUrls_()` |
| Deploy xong vẫn UI cũ | `/exec` không đổi | GAS pin version: phải tạo **deployment mới**, không chỉ `clasp push` |
| Bundle không cập nhật | Sửa js nhưng UI không đổi | Chạy lại `build-lptdui-integrated.js` rồi push `app/LptdUI.html` |

---

## 8. Tham chiếu web app standalone (để so sánh)

- Script ID: `1WJIc2K-xMIw2w0ebtokx04BLkv2qTO5vwUQpEGQXXuooVZVDhsUzVSfi`
- Deployment @4:
  `https://script.google.com/macros/s/AKfycbzUIn85bNxDupYm3kLlnjOvVPOPkW7JdHp7ml_B8NCsDO_FX95ch7YWJILo3ZhXQPgQ/exec`
- Dùng để đối chiếu UI/hành vi, **không** copy nguyên `LptdUI.html` vào dự án tổng.

---

## 9. Audio/CDN — lưu ý sống còn

- Base: `https://toeic-audio.netlify.app/audio/hacker1`.
- 30 file, tên theo `cdnName` (xem `files/audio/hacker1-cdn-manifest.json`).
- Netlify site dùng chung với `/audio/lptd` (160), `/audio/ets*`, `/audio/hackers` và `/audio/dictation-part2`.
- **Mọi lần deploy Netlify phải dùng manifest hợp nhất**, nếu không sẽ xoá audio của nguồn khác.
- Manifest hiện tại sau khi khôi phục: **834 file** (792 cũ + 12 DP2 + 30 Hacker 1).
- Kiểm tra nhanh:

```powershell
curl.exe -sS -o NUL -w "%{http_code}`n" "https://toeic-audio.netlify.app/audio/hacker1/HACKER1_T01_P12.mp3"
curl.exe -sS -o NUL -w "%{http_code}`n" "https://toeic-audio.netlify.app/audio/lptd/LPTD1U01.mp3"
```

Cả hai phải trả `200` hoặc `206`.

---

## 10. Lỗi thường gặp khi tích hợp

### 10.1. `TypeError: HACKER1_LESSONS is not a function`

- Chưa thêm `app/Hacker1Data.gs`, hoặc file bị đổi tên thành `.js` (claspignore bỏ `.js`).
- Chạy `clasp push` lại và kiểm tra file xuất hiện trong Apps Script Editor.

### 10.2. `LPTD_LESSONS is not defined`

- Đã copy wrapper từ bản standalone rồi xoá nhầm `LptdData.gs`/`Hacker1Data.gs`.
- Khôi phục `app/LptdData.gs` và bỏ wrapper khỏi `Hacker1Data.gs`.

### 10.3. Chỉ thấy 4 tab

- `getLptdBootstrap()` chưa trả `hacker1Lessons`, hoặc `apply()` chưa `concat`.
- Kiểm tra Network payload của `getLptdBootstrap`: phải có key `hacker1Lessons` dài 30.

### 10.4. Tab Hacker 1 có 30 card nhưng mở bài trắng

- Chưa patch `L.get()` fallback.
- Kiểm tra `window.LPTD.get(5, 1)` trong Console phải trả object, không null.

### 10.5. Audio 404 sau vài ngày

- Một deploy khác đã ghi đè Netlify. Deploy lại manifest hợp nhất.
- Không sửa gì trong code GAS nếu URL trong `cdnUrl` vẫn đúng.

---

## 11. Liên hệ nguồn

- Repo: `lfskcm2018/Toeic-lptd` (nhánh `lptd-source-hacker-1`).
- Commit nguồn: `c56903d` (UI + checklist), `87828d1` (UI rebrand/fix).
- Bản bàn giao này được commit trong tag `backup/hacker1-2026-11-12`
  (bao gồm `ban-giao-hacker-1/` + nguồn `Tích hợp nội dung mới/Hacker 1/`).
- Backup nguồn: `op/backup_20261112_hacker1/` (không commit — nằm trong `.gitignore` dạng `backup_*/`).
- Tài liệu nguồn chi tiết: `op/Tích hợp nội dung mới/Hacker 1/reports/PROGRESS.md`.
