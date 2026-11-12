# CHECKLIST TÍCH HỢP 600+ → DỰ ÁN TỔNG

## A. Chuẩn bị
- [ ] Đọc `README.md` + `HUONG-DAN-AI-TICH-HOP.md`.
- [ ] Backup dự án tổng.
- [ ] Kiểm tra audio: `https://toeic-audio.netlify.app/audio/600plus/H600D01.mp3` → 206.

## B. Server
- [ ] Copy `files/gas/H600Data.gs` → `app/H600Data.gs`.
- [ ] Copy helper `files/gas/Code.h600.gs` → cuối `app/LptdServer.gs`.
- [ ] Patch `getLptdBootstrap()` (book 7, try/catch).
- [ ] `clasp push`.
- [ ] `debugH600()` → 32 unit | 179 câu | 1342 từ | book=7, 3 URL 206.

## C. Client UI
- [ ] `app/lptd-data.js`: thêm book 7 (`units: 32`).
- [ ] `L.get()` fallback (nếu chưa có).
- [ ] `app/lptd-ui.js`: `apply(res)` concat `h600Lessons`.
- [ ] Cập nhật nhãn tổng.
- [ ] Build `app/LptdUI.html`.
- [ ] `clasp push`.

## D. Deploy & E2E
- [ ] Tạo deployment mới.
- [ ] 7 tab (LPTD 1–4, Hacker 1, DP2, 600+).
- [ ] 600+ 32 unit, audio 206, dictation, shadowing.
- [ ] Regression: LPTD 160 + Hacker 1 30 + DP2 11 không đổi.
- [ ] Console không lỗi mới.

## E. Tiêu chí Done
1. 32/32 unit hoạt động end-to-end.
2. Không regression các nguồn cũ.

## F. Rollback
- Xoá `H600Data.gs`, revert `LptdServer.gs`, `lptd-data.js`, `lptd-ui.js`, rebuild `LptdUI.html`.
- Deployment cũ.
- Audio: deploy lại manifest hợp nhất (917 file).
