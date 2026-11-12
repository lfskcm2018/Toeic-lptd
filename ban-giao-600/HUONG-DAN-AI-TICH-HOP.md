# HƯỚNG DẪN AI — TÍCH HỢP 600+ VÀO DỰ ÁN TỔNG

> **Mục tiêu:** tích hợp 600+ (32 unit) vào module LPTD dưới dạng **book 7**.  
> **Nguyên tắc:** không phá LPTD 1–4, Hacker 1 (5), DP2 (6).

## 1. Bối cảnh

- 600+ là workbook dictation & shadowing, 20 ngày, 32 audio.
- Nội dung: 32 unit, 179 câu, 1.342 từ.
- Audio đã ở Netlify: `/audio/600plus/H600D01.mp3` … `H600D20B.mp3`.
- Web app GAS riêng đã deploy (cần uỷ quyền Drive).

## 2. Thiết kế

```
H600Data.gs (H600_LESSONS, book gốc = 1)
        │
        ▼
h600LessonsWithUrls_()   ← remap book=7, gắn cdnUrl
        │
        ▼
getLptdBootstrap()
  { lessons: [...160], hacker1Lessons: [...30], dp2Lessons: [...11], h600Lessons: [...32] }
        │
        ▼
lptd-ui.js  apply(res)
  L.setLessons(res.lessons.concat(h1).concat(dp2).concat(h600))
        │
        ▼
BOOKS (thêm book 7) → tab "600+" → 32 unit
```

- Book 7 giả định Hacker 1 = 5, DP2 = 6. Nếu chưa tích hợp, đổi `H600_BOOK`.
- Script Property (tùy chọn): `H600_AUDIO_CDN_BASE`.

## 3. Các bước tích hợp

1. Backup dự án tổng.
2. Copy `files/gas/H600Data.gs` → `app/H600Data.gs`.
3. Copy helper `files/gas/Code.h600.gs` → cuối `app/LptdServer.gs`.
4. Patch `getLptdBootstrap()` theo `patches/01-SERVER-CODE.md`.
5. Patch `app/lptd-data.js` + `app/lptd-ui.js` theo `patches/02-CLIENT-UI.md`.
6. Build `app/LptdUI.html`.
7. (Tùy chọn) bản local theo `patches/03-LOCAL-DATA.md`.
8. `clasp push`, deployment mới, E2E + regression.

## 4. Kiểm thử

- `debugH600()` → 32 unit | 179 câu | 1342 từ | book=7, 3 URL 206.
- 7 tab, 600+ 32 unit, audio 206, dictation, shadowing.
- Regression: LPTD 160 + Hacker 1 30 + DP2 11 không đổi.

## 5. Rủi ro

| Rủi ro | Xử lý |
|---|---|
| Ghi đè dữ liệu LPTD | Kiểm tra `H600Data.gs` không có wrapper `LPTD_*` |
| Chỉ 6 tab | Server chưa trả `h600Lessons` hoặc `apply()` chưa concat |
| Mở unit trắng | Chưa patch `L.get()` fallback |
| Audio 404 | Deploy lại manifest hợp nhất 917 file |
| Progress lẫn nguồn | Kiểm tra `book = 7` |

## 6. Tham chiếu

- Repo: `lfskcm2018/Toeic-lptd`, nhánh `lptd-source-600`, commit `9f6e188` (sau push).
- Web app GAS riêng: Script ID `1mcLxn7uOuHt2wdw5mw87JPbYJFKLo-C6A590yQvyt5JrIGfOTkNYZHCc`, deploy @1 `AKfycbz-CTUkKXbjGeFaMBDYUMtBBLG7mSMoOE5rOKG_GxE194c5qEj9aQq2lpBr8TpPks7qOg`.
- Audio: Netlify deploy `6af5d03a859e6ca209f9f8ec`, 917 file.
- Backup: chưa tạo.
