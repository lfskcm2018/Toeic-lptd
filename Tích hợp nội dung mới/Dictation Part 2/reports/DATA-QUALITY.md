# DATA QUALITY — DICTATION PART 2

**Ngày:** 2026-11-12  
**Nguồn:** `파트2 출제표현 정리집.pdf` (64 trang) + 11 MP3.

## 1. Kết quả kiểm tra

| Hạng mục | Kết quả |
|---|---|
| Số unit | 11 |
| Số cặp Q/A | 238 (15+15+29+21+11+19+24+37+22+30+15) |
| Số dòng | 476 (Q+A) |
| Số từ | 3.166 |
| Dòng rỗng | 0 |
| ID trùng | 0 |
| Thiếu trường bắt buộc | 0 |
| Q/A lệch trong 1 unit | 0 |
| `lineCount` ≠ số dòng thực | 0 |
| `wordCount` ≠ số từ thực | 0 |
| Nội dung không xuất hiện trong PDF | 0 |
| Cặp Q/A tiếng Anh trong PDF không có trong dữ liệu | 0 |

## 2. So sánh với dữ liệu cũ

- Dữ liệu cũ: `dictation-part2-lessons.js` (commit `30cbf64`): 11 unit · 476 dòng · 3.166 từ.
- Dữ liệu mới (sinh lại từ PDF): **giống hệt nội dung**, chỉ thay đổi:
  - `cdnName`: tên gốc tiếng Hàn → `DP2U01.mp3` … `DP2U11.mp3`
  - tiêu đề unit 8: `General Tag Indirect Questions` → `General, Tag & Indirect Questions`
  - tiêu đề unit 9: `Suggestion Offer Questions` → `Suggestions & Offers`
  - thêm `titleKo`

## 3. Audio

- 11/11 URL ASCII trả HTTP 206, `audio/mpeg`.
- Tổng dung lượng ~25,4 MB.
- Netlify deploy hiện tại: 844 file (base 803 + Hacker 1 30 + DP2 11).

## 4. Kết luận

Dữ liệu Dictation Part 2 **đạt chất lượng**, sẵn sàng cho web app GAS và tích hợp dự án tổng.
