# DATA QUALITY — EPI ELEMENTARY (Section A MVP)

**Ngày:** 2026-11-13

## 1. Kết quả kiểm tra

| Hạng mục | Kết quả |
|---|---|
| Số unit | 10 |
| Số câu mẫu | 84 |
| Số exercise | 30 |
| Thiếu trường | 0 |
| ID trùng | 0 |
| Audio 404 | 0 (81/81 GitHub Pages 206) |
| OCR text tiếng Anh | Đọc được rõ ràng (>90% câu) |
| OCR phonetic symbols | Nhiều chỗ bị lệch (/iː/, /ɪ/, /æ/, /ʌ/, /ɜː/) → cần review thủ công |
| Audio mapping CD1 → Unit | Ước lượng ban đầu (chưa đối chiếu từng track) |

## 2. Ghi chú

- PDF scan nên OCR không hoàn hảo; các câu thoại tiếng Anh hầu hết đọc đúng.
- Các symbol phonetic thường bị nhầm dấu (long/short, schwa, R-colored). Khi nhập data, cần đối chiếu với PDF gốc và chỉnh tay.
- Audio mapping: CD1 track order ≈ book order; unit 1 ≈ tracks 01–09, unit 2 ≈ 10–16, ..., unit 10 ≈ 66–72. Chưa xác thực từng track.

## 3. Đề xuất

- Review thủ công 10 units để sửa phonetic symbols cho chính xác trước khi merge.
- Mapping audio: đối chiếu từng unit với sách (mỗi unit có `(A` track marker) để gán đúng track.
