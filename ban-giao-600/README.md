# BÀN GIAO — 600+

> **Đối tượng:** AI/dev phụ trách dự án tổng.  
> **Mục tiêu:** tích hợp 600+ (32 unit) vào module LPTD dưới dạng **book 7**.  
> **Ngày:** 2026-11-12  
> **Nhánh nguồn:** `lptd-source-600`

## 1. Bàn giao gồm những gì?

```
op/ban-giao-600/
├─ README.md
├─ HUONG-DAN-AI-TICH-HOP.md
├─ CHECKLIST-TICH-HOP.md
├─ SHA256SUMS.txt
├─ patches/
│  ├─ 01-SERVER-CODE.md
│  ├─ 02-CLIENT-UI.md
│  └─ 03-LOCAL-DATA.md
└─ files/
   ├─ data/
   │  ├─ h600-lessons.json
   │  ├─ h600-lessons-data.js
   │  ├─ h600-meta.json
   │  ├─ h600-source.json
   │  └─ h600-local-glue.js
   ├─ gas/
   │  ├─ H600Data.gs
   │  ├─ Code.h600.gs
   │  └─ LptdUI.h600-reference.html
   ├─ audio/
   │  ├─ upload-manifest.json
   │  ├─ upload-manifest.csv
   │  └─ h600-cdn-manifest.json
   ├─ extract/600-raw.txt
   └─ tools/
      ├─ build-600-data.js
      ├─ build-lptdui-integrated.js
      └─ deploy-audio-merged.js
```

## 2. Thông tin nhanh

| Hạng mục | Giá trị |
|---|---|
| Nguồn | Hackers TOEIC 600+ Dictation & Shadowing Workbook (33 trang) + 32 MP3 |
| Số unit | **32** |
| Nội dung | **179 câu · 1.342 từ** |
| ID | `h600-d01` … `h600-d20b` |
| Book khi tích hợp | **7** (LPTD 1–4, Hacker 1 = 5, DP2 = 6) |
| Audio CDN | `https://toeic-audio.netlify.app/audio/600plus/H600D01.mp3` … `H600D20B.mp3` |
| Script Property (tùy chọn) | `H600_AUDIO_CDN_BASE` |
| Web app riêng | Script ID `1mcLxn7uOuHt2wdw5mw87JPbYJFKLo-C6A590yQvyt5JrIGfOTkNYZHCc`, deploy @1 |

## 3. Nguyên tắc

1. Không sửa core Hackers/ETS; 600+ chỉ là book 7 trong module LPTD.
2. Không copy wrapper `LPTD_LESSONS_META/LPTD_LESSONS`.
3. Audio dùng CDN.
4. Netlify dùng chung: luôn deploy bằng manifest hợp nhất (917 file).

## 4. Đọc gì trước?

1. `HUONG-DAN-AI-TICH-HOP.md`
2. `patches/01-SERVER-CODE.md`
3. `patches/02-CLIENT-UI.md`
4. `CHECKLIST-TICH-HOP.md`

## 5. Rollback

- Code: revert files + rebuild `LptdUI.html`.
- GAS: chọn version cũ.
- Audio: deploy lại manifest hợp nhất.
- Progress không bị ảnh hưởng (key `7-<unit>`).
