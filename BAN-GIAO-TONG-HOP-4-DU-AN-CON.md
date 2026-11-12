# BÀN GIAO TỔNG HỢP — 4 DỰ ÁN CON → DỰ ÁN TỔNG

> **Đối tượng:** AI/dev phụ trách dự án tổng (TOEIC app: Hackers 20 DAY + ETS 2026 + LPTD 1–4).  
> **Mục tiêu:** tích hợp 4 nguồn nội dung mới (Hacker 1, Dictation Part 2, 600+, 750+) vào module LPTD của dự án tổng.  
> **Ngày:** 2026-11-12  
> **Nguyên tắc:** không phá LPTD 1–4, Hackers 700+, ETS 2026; mỗi nguồn là một **book** riêng trong module LPTD.

---

## 1. Tổng quan 4 nguồn

| Nguồn | Folder bàn giao | Book (tích hợp) | Unit | Câu | Từ | Audio CDN base | Audio files |
|---|---|---|---|---|---|---|---|
| Hacker 1 | `op/ban-giao-hacker-1/` | **5** | 30 | 186 | 2.559 | `/audio/hacker1` | 30 |
| Dictation Part 2 | `op/ban-giao-dp2/` | **6** | 11 | 476 | 3.166 | `/audio/dictation-part2` | 11 |
| 600+ | `op/ban-giao-600/` | **7** | 32 | 179 | 1.342 | `/audio/600plus` | 32 |
| 750+ | `op/ban-giao-750/` | **8** | 20 | 110 | 804 | `/audio/750plus` | 20 |

Tổng sau tích hợp: **8 book · 253 unit** (LPTD 160 + Hacker 1 30 + DP2 11 + 600+ 32 + 750+ 20).

> ⚠️ Book id giả định LPTD 1–4 = 1–4. Nếu dự án tổng chưa tích hợp Hacker 1, đổi book id các nguồn sau cho liên tục (DP2 = 5, 600+ = 6, 750+ = 7) và cập nhật helper tương ứng.

---

## 2. Cấu trúc mỗi folder bàn giao

Mỗi folder `op/ban-giao-<nguồn>/` có cùng cấu trúc:

```
ban-giao-<nguồn>/
├─ README.md
├─ HUONG-DAN-AI-TICH-HOP.md        ← hướng dẫn chính
├─ CHECKLIST-TICH-HOP.md           ← checklist thực thi + Done
├─ SHA256SUMS.txt                  ← kiểm tra toàn vẹn
├─ patches/
│  ├─ 01-SERVER-CODE.md            ← sửa LptdServer.gs
│  ├─ 02-CLIENT-UI.md              ← sửa lptd-data.js / lptd-ui.js / build bundle
│  └─ 03-LOCAL-DATA.md             ← bản local (local-study.html)
└─ files/
   ├─ data/                        ← JSON + JS dữ liệu
   ├─ gas/                         ← DP2Data/H600Data/Hacker1Data.gs (đã lọc wrapper) + helper + UI tham chiếu
   ├─ audio/                       ← manifest URL + SHA256
   ├─ extract/                     ← text PDF đã trích (audit)
   └─ tools/                       ← build data, build bundle, deploy audio
```

---

## 3. Thứ tự tích hợp khuyến nghị

1. **Hacker 1** (book 5) — đã có web app GAS riêng, E2E pass.
2. **Dictation Part 2** (book 6) — đã có web app GAS riêng, cần uỷ quyền Drive.
3. **600+** (book 7) — đã có web app GAS riêng, cần uỷ quyền Drive.
4. **750+** (book 8) — đã có web app GAS riêng, cần uỷ quyền Drive.

> Tích hợp **từng nguồn một**, deploy GAS mới sau mỗi nguồn, kiểm tra regression trước khi sang nguồn tiếp theo.

---

## 4. Nguyên tắc bất di bất dịch

1. **Không sửa core** Hackers/ETS; các nguồn chỉ là book mới trong module LPTD.
2. **Không copy wrapper** `LPTD_LESSONS_META()/LPTD_LESSONS()` từ bản standalone — sẽ ghi đè 160 unit LPTD.
3. **Audio dùng CDN**, không nhúng base64 vào GAS.
4. **Netlify dùng chung**: mọi lần deploy audio phải dùng manifest hợp nhất, hiện **937 file** (base + 30 Hacker 1 + 11 DP2 + 32 600+ + 20 750+). Dùng `deploy-audio-merged.js` trong từng folder.
5. **Script Property** (tùy chọn) cho từng nguồn:
   - `HACKER1_AUDIO_CDN_BASE` = `https://toeic-audio.netlify.app/audio/hacker1`
   - `DP2_AUDIO_CDN_BASE` = `https://toeic-audio.netlify.app/audio/dictation-part2`
   - `H600_AUDIO_CDN_BASE` = `https://toeic-audio.netlify.app/audio/600plus`
   - `H750_AUDIO_CDN_BASE` = `https://toeic-audio.netlify.app/audio/750plus`
   - (Mặc định đã có trong helper, không bắt buộc set.)

---

## 5. Kiến trúc tích hợp (thống nhất)

```
Hacker1Data.gs / DP2Data.gs / H600Data.gs / H750Data.gs
        │
        ▼
hacker1LessonsWithUrls_() / dp2LessonsWithUrls_() / h600LessonsWithUrls_() / h750LessonsWithUrls_()
  (remap book = 5/6/7/8, gắn cdnUrl riêng)
        │
        ▼
getLptdBootstrap()
  {
    lessons: [...160 LPTD],
    hacker1Lessons: [...30],
    dp2Lessons: [...11],
    h600Lessons: [...32],
    h750Lessons: [...20],
    ... meta, cdnBase, ...
  }
        │
        ▼
lptd-ui.js  apply(res)
  L.setLessons(res.lessons.concat(h1).concat(dp2).concat(h600).concat(h750))
        │
        ▼
BOOKS (8 book) → tab riêng cho từng nguồn
```

---

## 6. Patch tổng hợp

### 6.1. Server — `app/LptdServer.gs`

1. Copy các file dữ liệu (đã lọc wrapper):
   - `ban-giao-hacker-1/files/gas/Hacker1Data.gs` → `app/Hacker1Data.gs`
   - `ban-giao-dp2/files/gas/DP2Data.gs` → `app/DP2Data.gs`
   - `ban-giao-600/files/gas/H600Data.gs` → `app/H600Data.gs`
   - `ban-giao-750/files/gas/H750Data.gs` → `app/H750Data.gs`

2. Copy các helper (vào cuối `LptdServer.gs` hoặc file `.gs` mới):
   - `ban-giao-hacker-1/files/gas/Code.hacker1.gs`
   - `ban-giao-dp2/files/gas/Code.dp2.gs`
   - `ban-giao-600/files/gas/Code.h600.gs`
   - `ban-giao-750/files/gas/Code.h750.gs`

3. Patch `getLptdBootstrap()` (xem chi tiết `patches/01-SERVER-CODE.md` trong từng folder). Mẫu tổng:

```js
function getLptdBootstrap() {
  var cdnBase = lptdCdnBase_();
  var lessons = lptdLessonsWithUrls_(cdnBase);
  var meta = LPTD_LESSONS_META();

  function safe(fn) { try { return fn(); } catch (e) { return null; } }

  var hacker1Lessons = safe(function () { return typeof HACKER1_LESSONS === 'function' ? hacker1LessonsWithUrls_() : []; }) || [];
  var hacker1Meta = safe(function () { return typeof HACKER1_LESSONS === 'function' ? hacker1MetaWithBook_() : null; });

  var dp2Lessons = safe(function () { return typeof DP2_LESSONS === 'function' ? dp2LessonsWithUrls_() : []; }) || [];
  var dp2Meta = safe(function () { return typeof DP2_LESSONS === 'function' ? dp2MetaWithBook_() : null; });

  var h600Lessons = safe(function () { return typeof H600_LESSONS === 'function' ? h600LessonsWithUrls_() : []; }) || [];
  var h600Meta = safe(function () { return typeof H600_LESSONS === 'function' ? h600MetaWithBook_() : null; });

  var h750Lessons = safe(function () { return typeof H750_LESSONS === 'function' ? h750LessonsWithUrls_() : []; }) || [];
  var h750Meta = safe(function () { return typeof H750_LESSONS === 'function' ? h750MetaWithBook_() : null; });

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
    h600Lessons: h600Lessons,
    h600Meta: h600Meta,
    h600LessonCount: h600Lessons.length,
    h600CdnBase: (typeof h600CdnBase_ === 'function' ? h600CdnBase_() : ''),
    h750Lessons: h750Lessons,
    h750Meta: h750Meta,
    h750LessonCount: h750Lessons.length,
    h750CdnBase: (typeof h750CdnBase_ === 'function' ? h750CdnBase_() : ''),
  };
}
```

4. (Tùy chọn) `getLptdUnit()` thêm nhánh book 5/6/7/8.

### 6.2. Client — `app/lptd-data.js`

Thêm 4 book vào `BOOKS` (sau book 4):

```js
{ book: 5, code: 'Hacker 1', title: 'Hackers TOEIC 1000 LC — Hacker 1', short: 'TOEIC LC', level: '10 TEST · 30 track', icon: '📘', accent: '#0ea5e9', units: 30 },
{ book: 6, code: 'Dictation Part 2', title: 'Dictation Part 2 — TOEIC Part 2', short: 'Part 2', level: '11 chuyên đề', icon: '📘', accent: '#0ea5e9', units: 11 },
{ book: 7, code: '600+', title: '600+ · Dictation & Shadowing', short: '600+', level: '20 ngày · 32 audio', icon: '📘', accent: '#f59e0b', units: 32 },
{ book: 8, code: '750+', title: '750+ · Dictation & Shadowing', short: '750+', level: '20 ngày · 20 audio', icon: '📘', accent: '#8b5cf6', units: 20 },
```

`L.get()` fallback theo `book/unit` (nếu chưa có):

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

`DOCS` không cần thêm (rỗng → UI tự ẩn).

### 6.3. Client — `app/lptd-ui.js`

`apply(res)`:

```js
var h1 = Array.isArray(res.hacker1Lessons) ? res.hacker1Lessons : [];
var dp2 = Array.isArray(res.dp2Lessons) ? res.dp2Lessons : [];
var h600 = Array.isArray(res.h600Lessons) ? res.h600Lessons : [];
var h750 = Array.isArray(res.h750Lessons) ? res.h750Lessons : [];
L.setLessons(res.lessons.concat(h1).concat(dp2).concat(h600).concat(h750));
```

Thanh tiến độ tab: `b.units || 40` (đã patch).

Cập nhật nhãn tổng: `253 unit · 8 nguồn` (nếu tích hợp đủ).

### 6.4. Build bundle

```powershell
node tools/build-lptdui-integrated.js
```

Kiểm tra `app/LptdUI.html` có `Hacker 1`, `Dictation Part 2`, `600+`, `750+`, `hacker1Lessons`, `dp2Lessons`, `h600Lessons`, `h750Lessons`, `res.lessons.concat`.

### 6.5. Bản local

Theo `patches/03-LOCAL-DATA.md` trong từng folder; nạp các glue theo thứ tự, sau đó `lptd-data.js`.

---

## 7. Deploy & E2E

1. `clasp push` (từ gốc repo, rootDir `app`).
2. Tạo **deployment mới**.
3. E2E:
   - 8 tab: LPTD 1–4, Hacker 1, Dictation Part 2, 600+, 750+.
   - Mỗi tab: đúng số unit (30/11/32/20), audio 206, dictation 100%, shadowing render, quay lại/lưu tiến độ.
   - Console không lỗi mới.
4. Regression:
   - LPTD 160 unit không đổi.
   - Hacker 1 30, DP2 11, 600+ 32 không đổi.
   - Hackers 700+ / ETS 2026 mở thử 1 đề.
5. Tiêu chí Done:
   - 4 nguồn hoạt động end-to-end.
   - Không regression.
   - Không lỗi console/network mới.

---

## 8. Audio / Netlify

- Site `toeic-audio` (ID `7951df54-c4fb-4717-b6f4-ddae3f8d480d`) dùng chung.
- Hiện có **937 file** (base + 30 + 11 + 32 + 20).
- **Mọi lần deploy phải dùng manifest hợp nhất** (script `deploy-audio-merged.js` trong từng folder, hoặc gộp lại một script).
- Kiểm tra nhanh:

```powershell
curl.exe -sS -o NUL -w "%{http_code}`n" -r 0-0 "https://toeic-audio.netlify.app/audio/hacker1/HACKER1_T01_P12.mp3"
curl.exe -sS -o NUL -w "%{http_code}`n" -r 0-0 "https://toeic-audio.netlify.app/audio/dictation-part2/DP2U01.mp3"
curl.exe -sS -o NUL -w "%{http_code}`n" -r 0-0 "https://toeic-audio.netlify.app/audio/600plus/H600D01.mp3"
curl.exe -sS -o NUL -w "%{http_code}`n" -r 0-0 "https://toeic-audio.netlify.app/audio/750plus/H750D01.mp3"
curl.exe -sS -o NUL -w "%{http_code}`n" -r 0-0 "https://toeic-audio.netlify.app/audio/lptd/LPTD1U01.mp3"
```

Tất cả phải trả `200` hoặc `206`.

---

## 9. Rollback

| Sự cố | Rollback |
|---|---|
| Mất dữ liệu LPTD | Xoá các file `*Data.gs` mới, kiểm tra không còn wrapper `LPTD_*`, `clasp push` lại |
| UI vỡ | `git checkout -- app/lptd-data.js app/lptd-ui.js`, build lại `LptdUI.html` |
| Bundle lỗi | Khôi phục `app/LptdUI.html` từ git |
| Deployment lỗi | Apps Script → Manage deployments → chọn version cũ |
| Audio 404 toàn bộ | Deploy lại Netlify bằng manifest hợp nhất 937 file |

---

## 10. Tham chiếu nhanh

| Nguồn | Folder | Nhánh | Commit | Script ID (standalone) | Deploy mới nhất |
|---|---|---|---|---|---|
| Hacker 1 | `op/ban-giao-hacker-1/` | `lptd-source-hacker-1` | `78fd130` | `1WJIc2K-xMIw2w0ebtokx04BLkv2qTO5vwUQpEGQXXuooVZVDhsUzVSfi` | (xem folder) |
| Dictation Part 2 | `op/ban-giao-dp2/` | `lptd-source-dictation-part2` | `07b18de` | `1r0RFaKVQDWZVTrdnVQOwsGuckt7cdKBz-3nAuSP8e11Rn34-pbLVfaAN` | @9 `AKfycbwJBF7g0jIVFiuhhA3BkXOB0gJsMrFHKxgz2zlB0h6oEDJUM2tgpaj2VYu_oL2ZZVs` |
| 600+ | `op/ban-giao-600/` | `lptd-source-600` | `8c0dc3a` | `1mcLxn7uOuHt2wdw5mw87JPbYJFKLo-C6A590yQvyt5JrIGfOTkNYZHCc` | @4 `AKfycbw5nvzt-CdcHDIG-JmKjv-iiUCDfrE5BLXqRSsMy9oclpXjo_GAO5-SBO1pAuBGeUA3vA` |
| 750+ | `op/ban-giao-750/` | `lptd-source-750` | `7e5a22c` | `1vZiuqGBay036wLeVrH5y_7s6KEb9T2eeA6xmYtT_tVBpyHcwzXXVPl9t` | @1 `AKfycbxDzTF5tpXx6aTjgak3p34Hl_OPvty6P8as_HE2SXPWX5AAMnkowQ8nAwSUEJwp1wBT` |

Backup nguồn (không commit, gitignored):
- `op/backup_20261112_hacker1/` + zip + tag `backup/hacker1-2026-11-12`
- `op/backup_20261112_dp2/` + zip
- `op/backup_20261112_600/` + zip
- `op/backup_20261112_750/` + zip

---

## 11. Dự án con tiếp theo — English Pronunciation in Use (đang làm dở)

| Nguồn | Folder | Nhánh | Trạng thái |
|---|---|---|---|
| EPI Elementary (Cambridge) | `op/Tích hợp nội dung mới/English Pronunciation in Use Elementary/work/` | `lptd-source-epu` | MVP Section A (Units 1–10) + CD1 audio — E2E PASS, **chưa merge** |

Sẽ là **book 9** sau khi đủ 50 units (Section A–E). Chưa bàn giao vào dự án tổng.

---

## 12. Ghi chú cho AI tổng


- Mỗi nguồn đã có **web app GAS riêng** (đã deploy, cần uỷ quyền Drive để recording). Dùng để đối chiếu UI/hành vi, **không** copy nguyên `LptdUI.html` vào dự án tổng (bản standalone auto-open + rebrand).
- Khi tích hợp, **không sửa** `app/Code.gs`, `app/Index.html`, `app/core.js` nếu không cần; chỉ sửa `LptdServer.gs`, `lptd-data.js`, `lptd-ui.js`, rebuild `LptdUI.html`.
- Nếu tích hợp **từng nguồn một**, sau mỗi nguồn chạy E2E + regression trước khi sang nguồn tiếp theo.
- Nếu tích hợp **tất cả cùng lúc**, vẫn nên thêm book theo thứ tự 5→8 và test từng tab.
- Tiến độ người học dùng key `<book>-<unit>` trong `toeic_lptd_progress`, nên các nguồn mới không đụng LPTD cũ.

## 6. Pronunciation Master — Intermediate & Advanced (đã deploy 13/11/2026)

> Nguồn: *English Pronunciation in Use* (Cambridge) — bản Intermediate (Mark Hancock) và Advanced (Martin Hewings).
> Bàn giao: `op/ban-giao-pm/` · Core dùng chung: `English Pronunciation in Use Intermediate [2000]/work/pm-core/`

| Khóa | Script ID | Deploy | Unit | Bài tập | Audio | CDN |
|---|---|---|---|---|---|---|
| Intermediate | `1zfmuzM5cDmQWCaNHeMSUAChxlP3kGdKHSWkacDEPxjv4F07h6wN_tXB5` | @6 | 60 (A/B/C 20+20+20) | 195 (127 đáp án) | 360 track | `…/pm-intermediate-audio/` |
| Advanced | `1ITbb1_OOs8viMWiXqbJ_S8B9bNCvs9UKW6s-QNM7U6QSjCb2ros6lYJK` | @3 | 60 (A/B/C/D) + E1–E5 | 76 (28 đáp án) | 386 track | `…/pm-advanced-audio/` |

**Kiến trúc:** nội dung tĩnh trong `PMContent.gs` + audio CDN + tiến độ localStorage + chấm điểm ở server — **cùng pattern** với 9 nguồn đã có. Hai khóa dùng chung một core GAS nên sửa core là cả 2 cập nhật.

**Lưu ý:** bản gốc của Intermediate dùng backend Google Sheets/Drive (11 sheet, vai trò STUDENT/TEACHER/ADMIN).
Trong môi trường hiện tại **không cấp được scope Sheets/Drive cho deployer** (web app 403, API `scripts.run` lỗi storage nền tảng) nên chuyển sang pattern tĩnh. Bộ file Sheets gốc giữ ở `English Pronunciation in Use Intermediate [2000]/legacy-sheets-version/` để khôi phục khi có môi trường phù hợp.

**Chưa ghép vào app tổng:** UI của Pronunciation Master khác hẳn LPTD (course map + lesson player + reference + báo cáo năng lực), cần renderer riêng nếu muốn đưa vào `LptdUI.html`. Hiện tại chạy độc lập dưới dạng 2 web app GAS.
