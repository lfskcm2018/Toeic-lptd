# BÀN GIAO — DICTATION PART 2

> **Đối tượng:** AI/dev phụ trách dự án tổng.  
> **Mục tiêu:** tích hợp Dictation Part 2 (11 chuyên đề TOEIC Part 2) vào module LPTD dưới dạng **book 6**.  
> **Ngày:** 2026-11-12  
> **Nhánh nguồn:** `lptd-source-dictation-part2` (commit `b952a82`)

## 1. Bàn giao gồm những gì?

```
op/ban-giao-dp2/
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
   │  ├─ dictation-part2-lessons.json
   │  ├─ dictation-part2-lessons-data.js
   │  ├─ dictation-part2-meta.json
   │  ├─ dictation-part2-source.json
   │  └─ dp2-local-glue.js
   ├─ gas/
   │  ├─ DP2Data.gs
   │  ├─ Code.dp2.gs
   │  └─ LptdUI.dp2-reference.html
   ├─ audio/
   │  ├─ upload-manifest.json
   │  ├─ upload-manifest.csv
   │  └─ dp2-cdn-manifest.json
   ├─ extract/dp2-raw.txt
   └─ tools/
      ├─ build-dp2-data.js
      ├─ build-lptdui-integrated.js
      └─ deploy-audio-merged.js
```

## 2. Thông tin nhanh

| Hạng mục | Giá trị |
|---|---|
| Nguồn | `파트2 출제표현 정리집.pdf` (64 trang) + 11 MP3 |
| Số chuyên đề | **11** |
| Nội dung | **238 cặp Q/A · 476 dòng · 3.166 từ** |
| ID | `dp2-1-01` … `dp2-1-11` |
| Book khi tích hợp | **6** (LPTD 1–4, Hacker 1 = 5) |
| Audio CDN | `https://toeic-audio.netlify.app/audio/dictation-part2/DP2U01.mp3` … `DP2U11.mp3` |
| Script Property (tùy chọn) | `DP2_AUDIO_CDN_BASE` |
| Web app riêng | Script ID `1r0RFaKVQDWZVTrdnVQOwsGuckt7cdKBz-3nAuSP8e11Rn34-pbLVfaAN`, deploy @7 |

## 3. Nguyên tắc

1. Không sửa core Hackers/ETS; DP2 chỉ là book 6 trong module LPTD.
2. Không copy wrapper `LPTD_LESSONS_META/LPTD_LESSONS` từ bản standalone.
3. Audio dùng CDN, không nhúng base64.
4. Netlify dùng chung: luôn deploy bằng manifest hợp nhất (844 file).

## 4. Đọc gì trước?

1. `HUONG-DAN-AI-TICH-HOP.md`
2. `patches/01-SERVER-CODE.md`
3. `patches/02-CLIENT-UI.md`
4. `CHECKLIST-TICH-HOP.md`

## 5. Rollback

- Code: revert files + rebuild `LptdUI.html`.
- GAS: chọn version cũ.
- Audio: deploy lại manifest hợp nhất.
- Progress không bị ảnh hưởng (key `6-<unit>`).
