# BÀN GIAO — English Pronunciation in Use Elementary (EPI)

> **Đối tượng:** AI/dev phụ trách dự án tổng.  
> **Mục tiêu:** tích hợp EPI Elementary (50 unit + Section E) vào module LPTD dưới dạng **book 9**.  
> **Ngày:** 2026-11-13  
> **Nhánh nguồn:** `lptd-source-epu`

## 1. Bàn giao gồm những gì?

```
op/ban-giao-epu/
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
   │  ├─ epu-lessons.json          ← dataset chuẩn (50 unit + Section E)
   │  ├─ epu-units-meta.js         ← metadata 50 unit (IPA đọc tay từ ảnh Mục lục)
   │  ├─ epu-track-map.js          ← mapping audio ↔ unit (đọc tay marker trong sách)
   │  ├─ epu-section-e.js          ← nội dung Section E (E1–E8)
   │  ├─ epu-meta.json
   │  ├─ epu-source.json
   │  └─ epu-local-glue.js
   ├─ gas/
   │  ├─ EpiData.gs                ← dữ liệu EPI dạng GAS (book 9)
   │  ├─ EpiServer.gs              ← helper server EPI
   │  ├─ Code.epu-standalone.gs    ← web app EPI độc lập (Script ID riêng)
   │  ├─ EPIData.epu-standalone.gs
   │  ├─ EPIUI.epu-standalone.html
   │  └─ LptdUI.epu-reference.html ← bản LptdUI.html đã tích hợp EPI (tham chiếu)
   ├─ audio/
   │  ├─ epu-cdn-manifest.json
   │  ├─ upload-manifest.json
   │  └─ upload-manifest.csv
   ├─ extract/epu-mapping.txt      ← bản chép lại mapping + metadata (nguồn: sách)
   └─ tools/
      ├─ build-epu-data.js         ← sinh epu-lessons.json
      ├─ build-gas-epu.js          ← sinh EPIData.gs cho web app riêng
      ├─ build-main-app-epu.js     ← sinh EpiData.gs + patch app tổng (idempotent)
      ├─ parse-content-v4.js       ← trích câu mẫu + bài tập + đáp án từ OCR
      ├─ parse-e.js                ← trích sound pairs + số đếm
      └─ ocr-batch.mjs             ← OCR hàng loạt (mupdf + tesseract.js)
```

## 2. Thông tin nhanh

| Hạng mục | Giá trị |
|---|---|
| Nguồn | Marks, J. — *English Pronunciation in Use Elementary*, Cambridge (2007), 168 trang |
| Số unit | **50** (Section A 27 · B 5 · C 11 · D 7) + **Section E E1–E8** |
| Nội dung | **147 câu mẫu · 173 bài tập (137 có đáp án) · 28 từ vựng** |
| ID unit | `epu-u01` … `epu-u50`, Section E: `epu-e1` … `epu-e8` |
| Book khi tích hợp | **9** (LPTD 1–4 = 1–4, Hacker 1 = 5, DP2 = 6, 600+ = 7, 750+ = 8) |
| Audio CDN | `https://lfskcm2018.github.io/Toeic-lptd/epu-audio/CD1-Track01.mp3` … `CD5-Track38.mp3` |
| Tổng audio | **351 track** (CD1 81 · CD2 92 · CD3 85 · CD4 55 · CD5 38) |
| Script Property (tùy chọn) | `EPI_AUDIO_CDN_BASE` |
| Web app riêng | Script ID `1uamRFmYlNanNmc57OqzPjnGEQ_z02UMa6w7wwVYC7qsGB6FbsuPEwOgG`, deploy @18 |

## 3. Mapping audio ↔ unit (đã đối chiếu marker trong sách)

Marker trong sách = **icon tai nghe hồng** + nhãn `<CD><số track><phần>` (ví dụ `B14a`, `A2c`).
Mỗi unit chiếm **1 dải track liên tiếp** trên CD của nó.

| CD | File | Unit | Dải track |
|---|---|---|---|
| A | CD1 | 1–12 | U1 1–8 · U2 9–15 · U3 16–22 · U4 23–29 · U5 30–36 · U6 37–42 · U7 43–47 · U8 48–54 · U9 55–62 · U10 63–68 · U11 69–74 · U12 75–81 → **81** |
| B | CD2 | 13–27 | U13 1–7 · U14 8–13 · U15 14–19 · U16 20–27 · U17 28–33 · U18 34–41 · U19 42–49 · U20 50–54 · U21 55–59 · U22 60–63 · U23 64–68 · U24 69–73 · U25 74–78 · U26 79–86 · U27 87–92 → **92** |
| C | CD3 | 28–43 | U28 1–6 · U29 7–12 · U30 13–18 · U31 19–23 · U32 24–28 · U33 29–31 · U34 32–37 · U35 38–43 · U36 44–49 · U37 50–53 · U38 54–56 · U39 57–62 · U40 63–67 · U41 68–73 · U42 74–78 · U43 79–85 → **85** |
| D | CD4 | 44–50 + E | U44 1–6 · U45 7–10 · U46 11–14 · U47 15–18 · U48 19–22 · U49 23–26 · U50 27–30 · **E1 31 · E4 32–33 · E5 34–39 · E6 40–52 · E7 53–54 · E8 55** → **55** |
| E | CD5 | E3 | track 1 = intro, **sound pair N → track N+1** (pair 1→2 … pair 37→38) → **38** |

Tổng: 81 + 92 + 85 + 55 + 38 = **351** ✅ khớp đúng số file MP3.

## 4. Nguyên tắc

1. Không sửa core Hackers/ETS; EPI chỉ là **book 9** trong module LPTD.
2. Không copy wrapper `LPTD_LESSONS_META/LPTD_LESSONS`.
3. Audio dùng CDN (GitHub Pages) — **không** Netlify (tài khoản Netlify đã hết quota).
4. IPA/bảng âm **đọc tay từ ảnh sách**, không tin OCR (OCR làm sai `ɪ/e/æ/ʌ/ɒ/ʊ/ə`, `θ/ð`, `ʃ/ʒ`, `ŋ`, `ː`).

## 5. Đọc gì trước?

1. `HUONG-DAN-AI-TICH-HOP.md`
2. `patches/01-SERVER-CODE.md`
3. `patches/02-CLIENT-UI.md`
4. `CHECKLIST-TICH-HOP.md`

## 6. Rollback

- Code: revert `app/EpiData.gs`, `app/EpiServer.gs` + revert patch trong `app/LptdServer.gs`, `app/lptd-data.js`, `app/lptd-ui.js`, rồi rebuild `app/LptdUI.html`.
- GAS: chọn version cũ (deploy @65 trước đó).
- Audio: GitHub Pages — xoá thư mục `epu-audio/` và push lại.
- Progress không bị ảnh hưởng (key `9-<unit>`).
