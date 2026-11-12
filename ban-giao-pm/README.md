# BÀN GIAO — Pronunciation Master (Intermediate + Advanced)

> **Ngày:** 2026-11-13  
> **Phạm vi:** 2 khóa học phát âm nâng cao dựa trên *English Pronunciation in Use* (Cambridge)  
> **Trạng thái:** ✅ cả 2 đã deploy + test pass

## 1. Cấu trúc

```
op/ban-giao-pm/
├─ README.md
├─ SHA256SUMS.txt
├─ files/
│  ├─ core/                  CORE DÙNG CHUNG (sinh ra cả 2 app)
│  │  ├─ Code.gs PMService.gs Index.html Styles.html App.html
│  │  ├─ build-pm-app.cjs       dựng thư mục GAS cho 1 khóa
│  │  ├─ prepare-cdn-audio.cjs  chuẩn hoá tên audio ASCII + copy vào op/
│  │  └─ push-audio-master.cjs  đẩy audio lên nhánh GitHub Pages (master)
│  ├─ gas/
│  │  ├─ intermediate/        app GAS của khóa Intermediate
│  │  └─ advanced/            app GAS của khóa Advanced
│  ├─ data/                   dataset chuẩn (2 khóa) + TOC Advanced
│  ├─ tools/                  script tách audio / OCR / trích nội dung
│  ├─ audio/                  manifest audio (360 + 386 track)
│  └─ docs/                   bản bàn giao chi tiết từng khóa
```

## 2. Thông tin nhanh

| Hạng mục | Intermediate | Advanced |
|---|---|---|
| Script ID | `1zfmuzM5cDmQWCaNHeMSUAChxlP3kGdKHSWkacDEPxjv4F07h6wN_tXB5` | `1ITbb1_OOs8viMWiXqbJ_S8B9bNCvs9UKW6s-QNM7U6QSjCb2ros6lYJK` |
| Deploy | @6 | @3 |
| Unit | 60 (A 20 · B 20 · C 20) | 60 (A 6 · B 19 · C 28 · D 7) + E1–E5 |
| Bài tập | 195 (127 có đáp án) | 76 (28 có đáp án) |
| Audio | 360 track | 386 track |
| CDN | `…/pm-intermediate-audio/` | `…/pm-advanced-audio/` |

## 3. Nguyên tắc

1. **Core dùng chung** — Advanced tái dùng đúng core của Intermediate (theo spec Advanced §18).
2. **Nội dung tĩnh + CDN** — giống 7 nguồn đã có (LPTD 1–4, Hacker 1, DP2, 600+, 750+, EPI Elementary).
3. **Đáp án chỉ nằm ở server** (`PMContent.gs`), không gửi về client trước khi nộp.
4. **Không dùng Netlify** (hết quota) — audio trên GitHub Pages.
5. Bộ file Sheets/Drive gốc của Intermediate giữ ở `legacy-sheets-version/` để tham khảo.

## 4. Bước tích hợp (nếu muốn đưa vào app tổng)

- Module LPTD của app tổng đang ở book 1–9 (LPTD 1–4, Hacker 1, DP2, 600+, 750+, EPI Elementary).
- Hai khóa Pronunciation Master dùng **UI riêng** (course map + lesson player + reference + báo cáo)
  nên chưa ghép được vào `LptdUI.html` mà không viết thêm renderer.
- Đề xuất: tách thành 2 app GAS độc lập (đã xong) và đưa vào sidebar app tổng dưới dạng
  2 mục riêng, hoặc viết renderer LPTD mới cho nhóm Pronunciation Master.
