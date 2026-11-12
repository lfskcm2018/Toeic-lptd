# BÀN GIAO CÔNG VIỆC — Pronunciation Master – Advanced

> **Cập nhật:** 13/11/2026 (đã nhận bàn giao và triển khai xong)  
> **Nguồn:** *English Pronunciation in Use – Advanced*, Martin Hewings, Cambridge (ISBN 978-1-108-40349-8), 191 trang PDF  
> **Core dùng chung:** `English Pronunciation in Use Intermediate [2000]/work/pm-core/` (theo khuyến nghị §18 của spec)

---

## 1. TRẠNG THÁI: ✅ ĐÃ DEPLOY & TEST PASS

| Hạng mục | Giá trị |
|---|---|
| Script ID | `1ITbb1_OOs8viMWiXqbJ_S8B9bNCvs9UKW6s-QNM7U6QSjCb2ros6lYJK` |
| Deploy | **@3** — `AKfycbwAWw_kjiec1aq3D1YCSIRB0LTId5QJWat3-pf3jV2oB1IbEhtuSPrLvX7iy9Awnum6` |
| Web app | `https://script.google.com/macros/s/AKfycbwAWw_kjiec1aq3D1YCSIRB0LTId5QJWat3-pf3jV2oB1IbEhtuSPrLvX7iy9Awnum6/exec` |
| Nội dung | **60 unit** (Section A 6 · B 19 · C 28 · D 7) + Section E (E1–E5) |
| Bài tập | **76 bài** (28 kèm đáp án từ Key) — chấm ở server, answer key không lộ ra client |
| Audio | **386 track** · CD A 93 · CD B 93 · CD C 95 · CD D 78 · CD E 27 |
| CDN | `https://lfskcm2018.github.io/Toeic-lptd/pm-advanced-audio/ADV-CD{A..E}-Track{NN}.mp3` |

## 2. ĐÃ LÀM (so với bàn giao cũ)

Bàn giao cũ nói “code ready for deploy”, nhưng thực tế:

| Vấn đề cũ | Đã xử lý |
|---|---|
| `doGet` dùng `ContentService.createHTMLOutputFromFile('Index')` nhưng file tên `index.html` → **lỗi** | Đã viết lại `doGet` dùng `HtmlService.createTemplateFromFile` + `include()` |
| `saveProgress()` gọi `SpreadsheetApp.create()` **mỗi lần lưu** → tạo rác spreadsheet | Đã bỏ; tiến độ lưu ở client (localStorage) |
| `getUserProgress()` dùng `SpreadsheetApp.getActiveSpreadsheet()` — **không tồn tại** với script độc lập → lỗi | Đã bỏ |
| `Session.getUserIdentity()` trả null với khách ẩn danh | Đã bỏ phụ thuộc identity |
| `index.html` gọi `fetch('/dev?action=loadUnit')` — endpoint không tồn tại | Đã viết lại client dùng `google.script.run` |
| Chỉ có 2 unit trong `<select>` | Đã viết lại: course map 60 unit + bản tra cứu + báo cáo năng lực |
| Thiếu service theo spec §10.4 (Annotation/Activity/Progress/Audio/Admin) | Đã dựng core đầy đủ: `PMService.gs` (bootstrap, course map, unit, activity set, chấm 6 loại bài, progress, báo cáo năng lực) |
| Chưa có nội dung, chưa có audio trên CDN | Đã trích nội dung từ PDF + đẩy 386 track lên CDN |

### Kiến trúc mới (thống nhất với 7 nguồn đã có của dự án)

```
Nội dung tĩnh  →  PMContent.gs (sinh tự động từ work/data/pm-advanced-content.json)
Audio           →  GitHub Pages CDN (không dùng Netlify — tài khoản đã hết quota)
Tiến độ        →  localStorage phía client (key pm_progress_PRON_ADVANCED)
Chấm điểm      →  server (submitActivity) — answer key chỉ nằm trong PMContent.gs
Ghi âm          →  Recording Engine popup (https://lfskcm2018.github.io/Toeic-lptd/recording-engine/)
```

> **Ghi chú kiến trúc:** spec §9.2 mô tả backend Google Sheets + Drive. Trong môi trường này
> không thể cấp scope `spreadsheets`/`drive` cho deployer (web app `ANYONE_ANONYMOUS` trả 403
> “Bạn cần có quyền truy cập”, và API `scripts.run` bị lỗi storage nền tảng). Vì vậy backend
> được chuyển sang nội dung tĩnh + CDN, **giống hệt 7 nguồn đã có** (LPTD 1–4, Hacker 1,
> DP2, 600+, 750+, EPI Elementary). Bộ file Sheets gốc của Intermediate được giữ lại ở
> `English Pronunciation in Use Intermediate [2000]/legacy-sheets-version/` để tham khảo.

## 3. CẤU TRÚC THƯ MỤC

```
English Pronunciation in Use Advanced/
├─ GAS_Implementation/          ← app GAS (push bằng clasp)
│  ├─ Code.gs                    doGet + router + ?page=health
│  ├─ PMService.gs               API server (bootstrap/course/unit/activity/chấm/progress)
│  ├─ PMContent.gs               NỘI DUNG TĨNH (sinh tự động — KHÔNG sửa tay)
│  ├─ Config.gs                  tên app, CDN, course id
│  ├─ Index.html / Styles.html / App.html
│  ├─ appsscript.json / .clasp.json
├─ work/
│  ├─ text/p001..p191.txt        text layer của PDF (mupdf)
│  ├─ data/adv-toc.js            TOC 60 unit (đọc tay từ trang Mục lục)
│  ├─ data/pm-advanced-content.json  dataset chuẩn
│  └─ tools/build-advanced-content.js  sinh dataset
├─ "CD A".."CD E"/               audio gốc (386 MP3)
└─ BÀN GIAO CÔNG VIỆC.md         (file này)
```

## 4. LỆNH TÁI TẠO

```bash
# 1. trích text + dataset
node work/tools/extract-adv-text.mjs          # (đặt trong work/tools nếu chưa có)
node work/tools/build-advanced-content.js

# 2. dựng thư mục GAS từ core dùng chung
node "English Pronunciation in Use Intermediate [2000]/work/pm-core/build-pm-app.cjs" \
  "English Pronunciation in Use Advanced/GAS_Implementation" \
  "English Pronunciation in Use Advanced/work/data/pm-advanced-content.json" \
  "Pronunciation Master – Advanced" "PRON_ADVANCED" \
  "https://lfskcm2018.github.io/Toeic-lptd/pm-advanced-audio" \
  1ITbb1_OOs8viMWiXqbJ_S8B9bNCvs9UKW6s-QNM7U6QSjCb2ros6lYJK

# 3. push + deploy
cd "English Pronunciation in Use Advanced/GAS_Implementation"
clasp push --force
clasp deploy -d "Pronunciation Master - Advanced v1.0.0"
```

## 5. CÒN LẠI (không chặn release)

1. **Key còn 48 bài chưa có đáp án** — Key của sách phần lớn là transcript dài (không phải đáp án
   ngắn); cần biên soạn lại câu hỏi trắc nghiệm để có đáp án dạng A/B/C/D.
2. **Chưa có lớp chú giải (annotation)** theo spec §10.2 (SpeechUnits / IntonationMaps /
   Annotations) — cần người biên tập xác nhận, không thể tự động suy ra.
3. **Vài unit chưa dò được số bài tập** (37, 41, 45, 52, 55) — số bài trong PDF bị OCR tách
   ký tự; cần xem lại bản PDF gốc.
4. **Chưa có vai trò STUDENT/TEACHER/ADMIN** và upload bản ghi lên Drive (cần scope Drive).
