# KẾ HOẠCH XÂY DỰNG & TÍCH HỢP — DICTATION PART 2

## 1. Mục tiêu

- Web app GAS riêng cho Dictation Part 2 (11 chuyên đề TOEIC Part 2).
- Không ảnh hưởng dự án tổng.
- Sau khi đạt 100%: backup + folder bàn giao + tích hợp vào dự án tổng (book 6).

## 2. Trạng thái hiện tại

- Dữ liệu: ✅ 11 unit · 476 dòng · 3.166 từ, 0 lỗi.
- Audio: ✅ 11 URL ASCII trả 206; Hacker 1 khôi phục.
- Web app: 🟡 đã deploy, cần uỷ quyền scope.
- Backup/bàn giao: ⬜ chưa làm.

## 3. Các bước tiếp theo

1. Uỷ quyền Drive trong Apps Script Editor.
2. Deploy version mới, E2E 11 unit.
3. Nếu đạt: backup + handover (theo mẫu Hacker 1).
4. Tích hợp dự án tổng: server patch (book 6), client patch, build bundle, deploy mới, kiểm tra regression 6 nguồn.
