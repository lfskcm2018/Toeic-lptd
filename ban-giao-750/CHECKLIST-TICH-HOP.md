# CHECKLIST TÍCH HỢP 750+ → DỰ ÁN TỔNG

## A. Chuẩn bị
- [ ] Đọc `README.md` + `HUONG-DAN-AI-TICH-HOP.md`.
- [ ] Backup dự án tổng.
- [ ] Kiểm tra audio: `https://toeic-audio.netlify.app/audio/750plus/H750D01.mp3` → 206.

## B. Server
- [ ] Copy `files/gas/H750Data.gs` → `app/H750Data.gs`.
- [ ] Copy helper `files/gas/Code.h750.gs` → cuối `app/LptdServer.gs`.
- [ ] Patch `getLptdBootstrap()` (book 8, try/catch).
- [ ] `clasp push`.
- [ ] `debugH750()` → 20 unit | 110 câu | 804 từ | book=8, 3 URL 206.

## C. Client UI
- [ ] `app/lptd-data.js`: thêm book 8 (`units: 20`).
- [ ] `L.get()` fallback (nếu chưa có).
- [ ] `app/lptd-ui.js`: `apply(res)` concat `h750Lessons`.
- [ ] Cập nhật nhãn tổng.
- [ ] Build `app/LptdUI.html`.
- [ ] `clasp push`.

## D. Deploy & E2E
- [ ] Tạo deployment mới.
- [ ] 8 tab (LPTD 1–4, Hacker 1, DP2, 600+, 750+).
- [ ] 750+ 20 unit, audio 206, dictation, shadowing.
- [ ] Regression: LPTD 160 + Hacker 1 30 + DP2 11 + 600+ 32 không đổi.
- [ ] Console không lỗi mới.

## E. Tiêu chí Done
1. 20/20 unit hoạt động end-to-end.
2. Không regression các nguồn cũ.

## F. Rollback
- Xoá `H750Data.gs`, revert `LptdServer.gs`, `lptd-data.js`, `lptd-ui.js`, rebuild `LptdUI.html`.
- Deployment cũ.
- Audio: deploy lại manifest hợp nhất (937? actually 937? current 917+20=937) file.
- Progress không bị ảnh hưởng (key `8-<unit>`).
