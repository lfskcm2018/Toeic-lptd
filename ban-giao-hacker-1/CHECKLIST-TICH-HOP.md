# CHECKLIST TÍCH HỢP HACKER 1 → DỰ ÁN TỔNG

> Đánh dấu `[x]` chỉ khi đã kiểm tra thực tế.
> Không bỏ qua mục **E. Không phá LPTD 1–4**.

---

## A. Chuẩn bị (1 lần)

- [ ] Đã đọc `README.md` + `HUONG-DAN-AI-TICH-HOP.md`.
- [ ] Đã backup dự án tổng: `git status` sạch, đã commit hoặc stash.
- [ ] Xác nhận đúng project GAS: `app/.clasp.json` (hoặc `.clasp.json` gốc) trỏ Script ID dự án tổng.
- [ ] `rootDir` của clasp là `app` (hoặc biết chính xác nơi chứa `lptd-data.js`).
- [ ] Có quyền tạo deployment mới trên Apps Script.
- [ ] Đã kiểm tra audio CDN còn sống:

```powershell
curl.exe -sS -o NUL -w "%{http_code}`n" "https://toeic-audio.netlify.app/audio/hacker1/HACKER1_T01_P12.mp3"
curl.exe -sS -o NUL -w "%{http_code}`n" "https://toeic-audio.netlify.app/audio/lptd/LPTD1U01.mp3"
```

- [ ] Cả hai trả `200` hoặc `206`.

---

## B. Server (GAS)

- [ ] Copy `files/gas/Hacker1Data.gs` → `app/Hacker1Data.gs`.
- [ ] Kiểm tra file **chỉ có 2 hàm** dữ liệu:

```powershell
Select-String -Path "app\Hacker1Data.gs" -Pattern "^function " | Select-Object Line
```

Kỳ vọng:

```
function HACKER1_LESSONS_META()
function HACKER1_LESSONS()
```

- [ ] **Không có** `LPTD_LESSONS_META()` / `LPTD_LESSONS()` trong file này.
- [ ] Copy helper `files/gas/Code.hacker1.gs` → cuối `app/LptdServer.gs` hoặc file `app/Hacker1Server.gs`.
- [ ] Đã patch `getLptdBootstrap()` theo `patches/01-SERVER-CODE.md`.
- [ ] `getLptdBootstrap()` trả thêm: `hacker1Lessons`, `hacker1Meta`, `hacker1LessonCount`, `hacker1CdnBase`.
- [ ] (Nếu dùng) đã patch `getLptdUnit()` cho book 5.
- [ ] `clasp push` thành công, không lỗi cú pháp.
- [ ] Chạy `debugLptd()` → vẫn đủ **160 unit**, 1.041 câu, 30.555 từ.
- [ ] Chạy `debugHacker1()` → **30 track | 186 câu | 2559 từ | book=5**.
- [ ] Log `debugHacker1()` có 3 dòng HTTP `200/206`.

---

## C. Client UI

- [ ] `app/lptd-data.js`: đã thêm book 5 với `units: 30`.
- [ ] `app/lptd-data.js`: `L.get()` có fallback theo `book/unit`.
- [ ] `app/lptd-ui.js`: `apply(res)` dùng `L.setLessons(res.lessons.concat(h1))`.
- [ ] `app/lptd-ui.js`: thanh tiến độ tab dùng `b.units || 40`, không hard-code `/40`.
- [ ] (Nên) đã cập nhật nhãn “160 unit · 4 cuốn” → “190 unit · 5 nguồn”.
- [ ] Đã chạy `node tools/build-lptdui-integrated.js`.
- [ ] `app/LptdUI.html` mới có: `code: 'Hacker 1'`, `hacker1Lessons`, `res.lessons.concat`.
- [ ] `app/LptdUI.html` vẫn **không auto-open** (không tự mở module khi tải app).
- [ ] `clasp push` đã đẩy `LptdUI.html` mới.

---

## D. Deploy & kiểm thử E2E

- [ ] Đã tạo **deployment mới** (Deploy → New deployment), không sửa deployment cũ.
- [ ] Mở URL `/exec` mới, hard reload (Ctrl+Shift+R).
- [ ] Sidebar có nút mở module LPTD/Hacker.
- [ ] Thư viện hiện **5 tab**: LPTD 1, LPTD 2, LPTD 3, LPTD 4, **Hacker 1**.
- [ ] Tab Hacker 1: **30 card**, đúng thứ tự TEST 01 P1-2 → TEST 10 P4.
- [ ] Badge hiển thị `T01…T10` (nếu đã patch 2.4) hoặc `U01…U30`.
- [ ] Tab Hacker 1: tiến độ hiển thị `/30` (không phải `/40`).
- [ ] Không thấy khối “Tài liệu cuốn 5” (docs rỗng).
- [ ] Mở **TEST 01 Part 1-2**: hiện đủ câu + ô dictation.
- [ ] Mở **TEST 05 Part 3**: nội dung đúng, không lẫn bài khác.
- [ ] Mở **TEST 10 Part 4**: nội dung đúng, bài cuối danh sách.
- [ ] Audio: Network trả `206` (`audio/mpeg`), phát được, seek được.
- [ ] Đổi tốc độ phát (nếu có) vẫn hoạt động.
- [ ] Dictation: điền đủ đáp án → **100%**; nút “Xem đáp án” đúng.
- [ ] Nộp bài sai → hiện đáp án đúng + lưu “từ sai”.
- [ ] Shadowing: render card, nút ghi âm/chấm % hoạt động (hoặc báo rõ nếu môi trường chặn micro).
- [ ] Quay lại thư viện: vẫn ở tab Hacker 1, tiến độ cập nhật.
- [ ] Reload trang: tiến độ Hacker 1 còn nguyên.
- [ ] Chuyển sang LPTD 1 và quay lại Hacker 1: không mất dữ liệu, không lẫn tiến độ.

---

## E. Không phá LPTD 1–4 (bắt buộc)

- [ ] `debugLptd()` vẫn **160 unit**.
- [ ] Tab LPTD 1 có **40 card**, mở bài bình thường.
- [ ] Tab LPTD 4 có **40 card**, audio LPTD phát `206`.
- [ ] Tiến độ LPTD cũ **không bị reset** (kiểm tra 1 bài đã học trước đó).
- [ ] Panel “Tài liệu” của LPTD 1–4 vẫn hiện như trước.
- [ ] `getLptdUnit(1, 1)` vẫn trả đúng bài LPTD 1 Unit 1.
- [ ] Tìm kiếm trong thư viện vẫn lọc đúng theo tab hiện tại.

---

## F. Không phá phần còn lại của app tổng

- [ ] Mở Hackers TOEIC 700+ (hoặc module DAY) → vẫn chạy.
- [ ] Mở ETS 2026 (1 đề bất kỳ) → vẫn chạy.
- [ ] Pronunciation / Cloze / Transcripts (nếu có) → vẫn chạy.
- [ ] Đổi theme sáng/tối → không vỡ layout.
- [ ] Sidebar mobile đóng/mở bình thường.
- [ ] Console: không có lỗi mới (ngoài warning sandbox GAS).
- [ ] Network: không có request 404 mới.

---

## G. Bản local (nếu triển khai)

- [ ] Đã copy `hacker-1-lessons-data.js` + `hacker1-local-glue.js` vào `app/`.
- [ ] `local-study.html` nạp đúng 5 file theo thứ tự ở `patches/03-LOCAL-DATA.md`.
- [ ] (Nếu build lại) đã sửa `tools/build.js` để không mất thẻ script.
- [ ] Console local: `LPTD.lessons.length === 190`, `LPTD.byBook(5).length === 30`.
- [ ] Audio local: file đĩa hoặc CDN đều phát/seek được.

---

## H. Tiêu chí Done

Chỉ coi là xong khi **tất cả** đúng:

1. [ ] 30/30 track Hacker 1 hoạt động end-to-end (mở bài, audio, dictation, shadowing, quay lại, lưu tiến độ).
2. [ ] 160/160 unit LPTD 1–4 không regression.
3. [ ] Các module khác (700+, ETS 2026, …) không regression.
4. [ ] Không lỗi console/network mới.
5. [ ] Có deployment mới ổn định; URL `/exec` đã ghi lại.
6. [ ] Đã commit code + ghi chú thay đổi trong repo dự án tổng.

---

## I. Rollback nếu có sự cố

| Lỗi | Rollback nhanh |
|---|---|
| Mất dữ liệu LPTD | Xoá/khôi phục `Hacker1Data.gs`, kiểm tra không còn wrapper `LPTD_*`; `clasp push` lại |
| UI vỡ | `git checkout -- app/lptd-data.js app/lptd-ui.js`; build lại `LptdUI.html` |
| Bundle lỗi | Khôi phục `app/LptdUI.html` từ git; push lại |
| Deployment lỗi | Apps Script → Manage deployments → chọn version cũ → Deploy |
| Audio 404 toàn bộ nguồn khác | Deploy lại Netlify bằng **manifest hợp nhất 834 file** (mục 9 trong `HUONG-DAN-AI-TICH-HOP.md`) |

---

## J. Biên bản tích hợp

| Hạng mục | Giá trị |
|---|---|
| Người/AI tích hợp | |
| Ngày | |
| Commit dự án tổng | |
| Deployment ID / URL `/exec` | |
| `debugLptd()` | unit: ___ / câu: ___ / từ: ___ |
| `debugHacker1()` | track: ___ / câu: ___ / từ: ___ |
| Kết quả E2E Hacker 1 | ☐ PASS ☐ FAIL |
| Kết quả regression LPTD | ☐ PASS ☐ FAIL |
| Ghi chú | |
