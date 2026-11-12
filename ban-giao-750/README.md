# BÀN GIAO — 750+

> **Đối tượng:** AI/dev phụ trách dự án tổng.  
> **Mục tiêu:** tích hợp 750+ (20 unit) vào module LPTD dưới dạng **book 8**.  
> **Ngày:** 2026-11-12  
> **Nhánh nguồn:** `lptd-source-750`

## 1. Bàn giao gồm những gì?

```
op/ban-giao-750/
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
   │  ├─ h750-lessons.json
   │  ├─ h750-lessons-data.js
   │  ├─ h750-meta.json
   │  ├─ h750-source.json
   │  └─ h750-local-glue.js
   ├─ gas/
   │  ├─ H750Data.gs
   │  ├─ Code.h750.gs
   │  └─ LptdUI.h750-reference.html
   ├─ audio/
   │  ├─ upload-manifest.json
   │  ├─ upload-manifest.csv
   │  └─ h750-cdn-manifest.json
   ├─ extract/750-raw.txt
   └─ tools/
      ├─ build-750-data.js
      ├─ build-lptdui-integrated.js
      └─ deploy-audio-merged.js
```

## 2. Thông tin nhanh

| Hạng mục | Giá trị |
|---|---|
| Nguồn | Hackers TOEIC 750+ Dictation & Shadowing Workbook (21 trang) + 20 MP3 |
| Số unit | **20** |
| Nội dung | **110 câu · 804 từ** |
| ID | `h750-d01` … `h750-d20` |
| Book khi tích hợp | **8** (LPTD 1–4, Hacker 1 = 5, DP2 = 6, 600+ = 7) |
| Audio CDN | `https://toeic-audio.netlify.app/audio/750plus/H750D01.mp3` … `H750D20.mp3` |
| Script Property (tùy chọn) | `H750_AUDIO_CDN_BASE` |
| Web app riêng | Script ID `1vZiuqGBay036wLeVrH5y_7s6KEb9T2eeA6xmYtT_tVBpyHcwzXXVPl9t`, deploy @1 |

## 3. Nguyên tắc

1. Không sửa core Hackers/ETS; 750+ chỉ là book 8 trong module LPTD.
2. Không copy wrapper `LPTD_LESSONS_META/LPTD_LESSONS`.
3. Audio dùng CDN.
4. Netlify dùng chung: luôn deploy bằng manifest hợp nhất (937 file).

## 4. Đọc gì trước?

1. `HUONG-DAN-AI-TICH-HOP.md`
2. `patches/01-SERVER-CODE.md`
3. `patches/02-CLIENT-UI.md`
4. `CHECKLIST-TICH-HOP.md`

## 5. Rollback

- Code: revert files + rebuild `LptdUI.html`.
- GAS: chọn version cũ.
- Audio: deploy lại manifest hợp nhất.
- Progress không bị ảnh hưởng (key `8-<unit>`).
