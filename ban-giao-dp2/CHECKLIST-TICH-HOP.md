# CHECKLIST TÍCH HỢP DICTATION PART 2 → DỰ ÁN TỔNG

## A. Chuẩn bị
- [ ] Đọc `README.md` + `HUONG-DAN-AI-TICH-HOP.md`.
- [ ] Backup dự án tổng (`git commit`).
- [ ] Kiểm tra audio CDN:
  - `https://toeic-audio.netlify.app/audio/dictation-part2/DP2U01.mp3` → 206
  - `https://toeic-audio.netlify.app/audio/dictation-part2/DP2U11.mp3` → 206

## B. Server
- [ ] Copy `files/gas/DP2Data.gs` → `app/DP2Data.gs`.
- [ ] Copy helper `files/gas/Code.dp2.gs` → cuối `app/LptdServer.gs`.
- [ ] Patch `getLptdBootstrap()` (book 6, try/catch).
- [ ] (Tùy chọn) patch `getLptdUnit()` cho book 6.
- [ ] `clasp push`.
- [ ] `debugDp2()` → 11 unit | 476 dòng | 3166 từ | book=6, 3 URL 206.

## C. Client UI
- [ ] `app/lptd-data.js`: thêm book 6 (`units: 11`).
- [ ] `L.get()` fallback (nếu chưa có).
- [ ] `app/lptd-ui.js`: `apply(res)` concat `dp2Lessons`.
- [ ] Cập nhật nhãn tổng (201 unit · 6 nguồn) nếu đã có Hacker 1.
- [ ] Build `app/LptdUI.html`.
- [ ] `clasp push`.

## D. Deploy & E2E
- [ ] Tạo deployment mới.
- [ ] 6 tab: LPTD 1–4, Hacker 1 (nếu có), Dictation Part 2.
- [ ] Tab DP2: 11 chuyên đề, số hiển thị 1…11.
- [ ] Audio 206, seek được.
- [ ] Dictation: điền đủ → 100%.
- [ ] Shadowing render.
- [ ] Quay lại thư viện, lưu tiến độ, reload còn.
- [ ] Regression: LPTD 160 + Hacker 1 30 không đổi.
- [ ] Console không lỗi mới.

## E. Tiêu chí Done
1. 11/11 chuyên đề hoạt động end-to-end.
2. 160/160 LPTD + 30 Hacker 1 không regression.
3. Không lỗi console/network mới.

## F. Rollback
- Xoá `DP2Data.gs`, revert `LptdServer.gs`, `lptd-data.js`, `lptd-ui.js`, rebuild `LptdUI.html`.
- Deployment cũ trên Apps Script.
- Audio: deploy lại manifest hợp nhất (844 file).
