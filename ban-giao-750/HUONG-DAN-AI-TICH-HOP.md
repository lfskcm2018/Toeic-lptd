# HƯỚNG DẪN AI — TÍCH HỢP 750+ VÀO DỰ ÁN TỔNG

> **Mục tiêu:** tích hợp 750+ (20 unit) vào module LPTD dưới dạng **book 8**.  
> **Nguyên tắc:** không phá LPTD 1–4, Hacker 1 (5), DP2 (6), 600+ (7).

## 1. Bối cảnh

- 750+ là workbook dictation & shadowing, 20 ngày, 20 audio.
- Nội dung: 20 unit, 110 câu, 804 từ.
- Audio đã ở Netlify: `/audio/750plus/H750D01.mp3` … `H750D20.mp3`.
- Web app GAS riêng đã deploy (cần uỷ quyền Drive).

## 2. Thiết kế

```
H750Data.gs (H750_LESSONS, book gốc = 1)
        │
        ▼
h750LessonsWithUrls_()   ← remap book=8, gắn cdnUrl
        │
        ▼
getLptdBootstrap()
  { lessons: [...160], hacker1Lessons: [...30], dp2Lessons: [...11], h600Lessons: [...32], h750Lessons: [...20] }
        │
        ▼
lptd-ui.js  apply(res)
  L.setLessons(res.lessons.concat(h1).concat(dp2).concat(h600).concat(h750))
        │
        ▼
BOOKS (thêm book 8) → tab "750+" → 20 unit
```

- Book 8 giả định Hacker 1 = 5, DP2 = 6, 600+ = 7. Nếu chưa tích hợp, đổi `H750_BOOK`.
- Script Property (tùy chọn): `H750_AUDIO_CDN_BASE`.

## 3. Các bước tích hợp

1. Backup dự án tổng.
2. Copy `files/gas/H750Data.gs` → `app/H750Data.gs`.
3. Copy helper `files/gas/Code.h750.gs` → cuối `app/LptdServer.gs`.
4. Patch `getLptdBootstrap()` theo `patches/01-SERVER-CODE.md`.
5. Patch `app/lptd-data.js` + `app/lptd-ui.js` theo `patches/02-CLIENT-UI.md`.
6. Build `app/LptdUI.html`.
7. (Tùy chọn) bản local theo `patches/03-LOCAL-DATA.md`.
8. `clasp push`, deployment mới, E2E + regression.

## 4. Kiểm thử

- `debugH750()` → 20 unit | 110 câu | 804 từ | book=8, 3 URL 206.
- 8 tab, 750+ 20 unit, audio 206, dictation, shadowing.
- Regression: LPTD 160 + Hacker 1 30 + DP2 11 + 600+ 32 không đổi.

## 5. Rủi ro

| Rủi ro | Xử lý |
|---|---|
| Ghi đè dữ liệu LPTD | Kiểm tra `H750Data.gs` không có wrapper `LPTD_*` |
| Chỉ 7 tab | Server chưa trả `h750Lessons` hoặc `apply()` chưa concat |
| Mở unit trắng | Chưa patch `L.get()` fallback |
| Audio 404 | Deploy lại manifest hợp nhất (937 file) |
| Progress lẫn nguồn | Kiểm tra `book = 8` |

## 6. Tham chiếu

- Repo: `lfskcm2018/Toeic-lptd`, nhánh `lptd-source-750`, commit `78fd130` (sau push).
- Web app GAS riêng: Script ID `1vZiuqGBay036wLeVrH5y_7s6KEb9T2eeA6xmYtT_tVBpyHcwzXXVPl9t`, deploy @1 `AKfycbxDzTF5tpXx6aTjgak3p34Hl_OPvty6P8as_HE2SXPWX5AAMnkowQ8nAwSUEJwp1wBT`.
- Audio: Netlify deploy `6af5dc66af586a9d035c7277`, 937 file.
- Backup: chưa tạo.
