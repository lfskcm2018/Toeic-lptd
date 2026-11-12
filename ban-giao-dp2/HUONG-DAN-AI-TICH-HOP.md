# HƯỚNG DẪN AI — TÍCH HỢP DICTATION PART 2 VÀO DỰ ÁN TỔNG

> **Đối tượng:** AI/dev phụ trách dự án tổng.  
> **Mục tiêu:** tích hợp Dictation Part 2 (11 chuyên đề TOEIC Part 2) vào module LPTD dưới dạng **book 6**.  
> **Nguyên tắc:** không phá LPTD 1–4, Hacker 1 (book 5) và các module khác.

## 1. Bối cảnh

- Dự án tổng đã có module LPTD 1–4 (book 1–4) và có thể đã tích hợp Hacker 1 (book 5).
- Dictation Part 2 có 11 chuyên đề, 238 cặp Q/A, 476 dòng, 3.166 từ.
- Audio đã ở Netlify: `/audio/dictation-part2/DP2U01.mp3` … `DP2U11.mp3` (ASCII, tránh lỗi Unicode).
- Web app GAS riêng đã deploy (cần uỷ quyền Drive để recording).

## 2. Thiết kế

```
DP2Data.gs (DP2_LESSONS, book gốc = 1)
        │
        ▼
dp2LessonsWithUrls_()   ← remap book=6, gắn cdnUrl
        │
        ▼
getLptdBootstrap()
  { lessons: [...160 LPTD], hacker1Lessons: [...30], dp2Lessons: [...11] }
        │
        ▼
lptd-ui.js  apply(res)
  L.setLessons(res.lessons.concat(h1).concat(dp2))
        │
        ▼
BOOKS (thêm book 6) → tab "Dictation Part 2" → 11 chuyên đề
```

- Book 6 giả định Hacker 1 đã là book 5. Nếu chưa, đổi `DP2_BOOK = 5` trong helper.
- Audio base: `https://toeic-audio.netlify.app/audio/dictation-part2`.
- Script Property (tùy chọn): `DP2_AUDIO_CDN_BASE`.

## 3. Các bước tích hợp

1. **Backup** dự án tổng.
2. Copy `files/gas/DP2Data.gs` → `app/DP2Data.gs`.
3. Copy helper `files/gas/Code.dp2.gs` → cuối `app/LptdServer.gs`.
4. Patch `getLptdBootstrap()` theo `patches/01-SERVER-CODE.md`.
5. Patch `app/lptd-data.js` + `app/lptd-ui.js` theo `patches/02-CLIENT-UI.md`.
6. Build `app/LptdUI.html` bằng `files/tools/build-lptdui-integrated.js`.
7. (Tùy chọn) bản local theo `patches/03-LOCAL-DATA.md`.
8. `clasp push`, tạo deployment mới, E2E + regression.

## 4. Kiểm thử

- `debugDp2()` → 11 unit | 476 dòng | 3166 từ | book=6, 3 URL 206.
- 6 tab, DP2 11 chuyên đề, số hiển thị 1…11.
- Audio 206, dictation 100%, shadowing render.
- LPTD 160 + Hacker 1 30 không regression.
- Console không lỗi.

## 5. Rủi ro

| Rủi ro | Xử lý |
|---|---|
| Ghi đè dữ liệu LPTD | Kiểm tra `DP2Data.gs` không có wrapper `LPTD_*` |
| Chỉ 5 tab | Server chưa trả `dp2Lessons` hoặc `apply()` chưa concat |
| Mở chuyên đề trắng | Chưa patch `L.get()` fallback |
| Audio 404 | Deploy lại manifest hợp nhất 844 file |
| Progress lẫn nguồn | Kiểm tra `book = 6` trong `dp2LessonsWithUrls_()` |

## 6. Tham chiếu

- Repo: `lfskcm2018/Toeic-lptd`, nhánh `lptd-source-dictation-part2`, commit `b952a82`.
- Web app GAS riêng: Script ID `1r0RFaKVQDWZVTrdnVQOwsGuckt7cdKBz-3nAuSP8e11Rn34-pbLVfaAN`, deploy @7 `AKfycbzSOPp_1szqlbhB3ccu8JDofWr2vXdgSit4r80wogR_eV1QPGYyFiieP-pnKFd2ml8S`.
- Audio: Netlify site `toeic-audio`, deploy `6af5c413801836c525077515`, 844 file.
- Backup nguồn DP2: chưa tạo (tạo sau khi E2E đạt).
