# TIẾN ĐỘ — DICTATION PART 2

**Ngày khảo sát:** 2026-11-12  
**Nhánh:** `lptd-source-dictation-part2`  
**Trạng thái:** Dữ liệu + audio đã chuẩn hoá và kiểm chứng; web app GAS riêng đã deploy nhưng còn cần uỷ quyền Drive.

---

## 1. Khảo sát nguồn

| Hạng mục | Giá trị |
|---|---|
| PDF | `파트2 출제표현 정리집.pdf` — 64 trang, song ngữ Anh–Hàn |
| Audio | 11 MP3 (~25,4 MB) |
| Chuyên đề | 11 |
| Nội dung | **238 cặp Q/A · 476 dòng · 3.166 từ** |
| ID unit | `dp2-1-01` … `dp2-1-11` |

### 1.1. Đối chiếu PDF ↔ dữ liệu

- Trích text PDF bằng `pdf-parse` → 39.052 ký tự, 64 trang.
- Parse tự động 11 section, mỗi section chỉ lấy cặp Q/A tiếng Anh (bỏ placeholder tiếng Hàn).
- So sánh với dữ liệu cũ: **0 khác biệt nội dung**; chỉ đổi tên audio sang ASCII và tinh chỉnh tiêu đề.
- Kiểm tra cấu trúc: Q/A cân bằng, `lineCount`/`wordCount` khớp, không dòng rỗng, không ID trùng.

### 1.2. Audio

- Netlify site `toeic-audio` dùng chung; deploy hiện tại (trước khi sửa) có 11 file DP2 với tên tiếng Hàn NFD + 1 placeholder, **không có Hacker 1**.
- Tên tiếng Hàn gây 404 theo cách gọi thông thường (NFC/case).
- Đã upload alias ASCII `DP2U01.mp3` … `DP2U11.mp3` và khôi phục Hacker 1 bằng `deploy-audio-merged.js`.
- Deploy mới: `6af5c413801836c525077515` · 844 file · tất cả 41 URL trả 206.

---

## 2. Các file đã tạo

- `dictation-part2-lessons.json`, `dictation-part2-meta.json`, `dictation-part2-source.json`
- `dictation-part2-lessons-data.js` (`window.DP2_*`)
- `dictation-part2-lessons.js` (legacy `LPTD_*`)
- `gas/DP2Data.gs`, `gas/Code.gs`, `gas/Code.dp2.gs`, `gas/Index.html`, `gas/Styles.html`, `gas/LptdUI.html`, `gas/appsscript.json`
- `audio-cdn/upload-manifest.json` / `.csv`
- `extract/dp2-raw.txt`
- `tools/build-dp2-data.js`, `tools/deploy-audio-merged.js`
- `reports/DATA-QUALITY.md`, `reports/CHECKLIST-DEPLOY.md`, `reports/last-audio-deploy.json`

---

## 3. Web app GAS riêng

- Script ID: `1r0RFaKVQDWZVTrdnVQOwsGuckt7cdKBz-3nAuSP8e11Rn34-pbLVfaAN`
- Deployments:
  - @1 `AKfycbwGgY19...` (initial)
  - @4 `AKfycbyAFHhj...` (minimal, không Drive)
- Trạng thái: **403 Access denied** do chưa uỷ quyền scope (Drive/UrlFetch) cho owner. Cần mở Editor và chạy `debugLptd()` hoặc `authorizeLptdDrive()` một lần, sau đó deploy version mới.

---

## 4. Việc tiếp theo

1. Uỷ quyền Drive trong Apps Script Editor → deploy version mới → E2E 11 unit.
2. Nếu E2E đạt: backup + folder bàn giao cho AI dự án tổng (book 6).
3. Cập nhật `HUONG-DAN-AI-TICH-HOP` tương tự Hacker 1 (server patch, client patch, local patch).
