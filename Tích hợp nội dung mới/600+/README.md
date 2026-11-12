# 600+ — Nguồn nội dung mới

> **Nguồn gốc:** `E:\CÁ NHÂN\03. Quyet.nv\29. Học chép chính tả TOEIC\600+`  
> **Nhánh:** `lptd-source-600`  
> **Ngày khảo sát:** 2026-11-12

## 1. Nguồn gồm những gì?

| Hạng mục | Giá trị |
|---|---|
| PDF | `한권으로끝내는해커스토익_600+_받아쓰기쉐도잉워크북. (1).pdf` — 33 trang |
| Audio | 32 MP3 (~73 MB) |
| Cấu trúc | 20 ngày (Part 1: Day 01-02, Part 2: Day 03-08, Part 3: Day 09-15, Part 4: Day 16-20) |
| Nội dung | **32 unit · 179 câu · 1.342 từ** |
| ID unit | `h600-d01` … `h600-d08`, `h600-d09a/b` … `h600-d20a/b` |
| Audio CDN | `https://toeic-audio.netlify.app/audio/600plus/H600D01.mp3` … `H600D20B.mp3` |

## 2. Cấu trúc thư mục

```
600+/
├─ 한권으로끝내는해커스토익_600+_받아쓰기쉐도잉워크북. (1).pdf
├─ MP3/                             ← 32 MP3 gốc
├─ h600-lessons.json                ← dữ liệu chuẩn (32 unit)
├─ h600-meta.json
├─ h600-source.json
├─ h600-lessons-data.js             ← window.H600_*
├─ h600-lessons.js                  ← legacy LPTD_*
├─ audio-cdn/upload-manifest.json/.csv
├─ extract/600-raw.txt
├─ gas/H600Data.gs
├─ gas/Code.h600.gs
├─ tools/build-600-data.js
├─ tools/deploy-audio-merged.js
├─ reports/PROGRESS.md, DATA-QUALITY.md, CHECKLIST-DEPLOY.md, last-audio-deploy.json
├─ README.md
└─ KE_HOACH_XAY_DUNG_VA_TICH_HOP.md
```

## 3. Lệnh thường dùng

```powershell
node "op\Tích hợp nội dung mới\600+\tools\build-600-data.js"
node "op\Tích hợp nội dung mới\600+\tools\deploy-audio-merged.js"
```

## 4. Trạng thái & việc tiếp theo

Đã xong:
- [x] Khảo sát PDF/MP3.
- [x] Trích xuất 32 unit, 179 câu, 1.342 từ, 0 lỗi.
- [x] Upload 32 audio alias ASCII lên Netlify (917 file tổng).
- [x] Sinh dữ liệu + GAS helper.

Tiếp theo:
- [ ] Web app GAS riêng (UI dictation/shadowing).
- [ ] E2E.
- [ ] Backup + folder bàn giao (book 7).
- [ ] Tích hợp dự án tổng.
