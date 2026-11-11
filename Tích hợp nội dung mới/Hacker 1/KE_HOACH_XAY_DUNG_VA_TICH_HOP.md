# Kế hoạch xây dựng và tích hợp — nhánh tài liệu `Hacker 1`

> **Nguồn:** `E:\CÁ NHÂN\03. Quyet.nv\29. Học chép chính tả TOEIC\Hacker 1`  
> **Nhánh làm việc:** `lptd-source-hacker-1` (repo `op/`)  
> **Thư mục dữ liệu nguồn:** `op/Tích hợp nội dung mới/Hacker 1/`  
> **Nguyên tắc:** mọi file sinh ra trong quá trình khảo sát/xây dựng/tích hợp cho nguồn này phải nằm trong thư mục `Tích hợp nội dung mới/Hacker 1/` (hoặc thư mục con của nó), trừ khi bước “gộp vào dự án tổng” được thực hiện sau khi hoàn thành 100%.

---

## 1. Mục tiêu

1. Khảo sát, chuẩn hóa và chuyển đổi nguồn `Hacker 1` thành dữ liệu học được (dictation/shadowing/script) cho **web app GAS riêng**.
2. Xây dựng web app GAS nhánh riêng chạy độc lập, không sửa/không ảnh hưởng dự án tổng hiện tại (`app/`, `local-study.html`, LPTD hiện tại).
3. Hoàn thiện 100% và kiểm thử trên web app riêng trước khi lập kế hoạch gộp vào dự án tổng.

## 2. Phạm vi

**Trong phạm vi (giai đoạn riêng):**
- Trích xuất/cấu trúc hóa nội dung từ PDF + mapping audio MP3.
- Tạo schema dữ liệu lesson/unit, metadata, file build cho GAS riêng.
- Tạo/cấu hình web app GAS riêng, deploy và test.
- Tài liệu hướng dẫn, checklist, báo cáo.

**Ngoài phạm vi (chưa làm ở giai đoạn này):**
- Sửa `app/Code.gs`, `app/Index.html`, `app/core.js`, `local-study.html`.
- Sửa `op/app/lptd-*`, `op/gas-standalone/*` của dự án tổng.
- Merge/gộp vào dự án tổng (chỉ thực hiện sau khi đạt 100%).

## 3. Khảo sát nguồn dữ liệu

### 3.1 Thông tin tổng quan

| Hạng mục | Giá trị |
|---|---|
| Tên nguồn | Hacker 1 |
| Workbook | Hackers TOEIC 1000 1 LC 3rd workbook |
| Loại | Test workbook (TOEIC Listening) có script/Q&A và nội dung dictation-like |
| PDF | `Hackers_Toeic_1000_1_LC_3rd_workbook_(PDF).pdf` (31 trang, ~1.54 MB) |
| Audio | 30 file MP3 trong `Hackers_Toeic_1000_1_LC_3rd_workbook(mp3)/` |
| Cấu trúc test | 10 TEST × 3 track = 30 track |
| Quy ước audio | `TEST{01..10}_Part1-2.mp3`, `TEST{01..10}_Part3.mp3`, `TEST{01..10}_Part4.mp3` |

### 3.2 Nội dung theo phần (theo khảo sát PDF)

| Track | Nội dung | Đặc điểm | Mức phù hợp LPTD |
|---|---|---|---|
| Part 1–2 | Câu mô tả tranh / Q&A ngắn | Câu ngắn, có đáp án/script | Trung bình (cần chọn chế độ luyện phù hợp) |
| Part 3 | Hội thoại (conversation) | Có đoạn chừa chỗ + script đầy đủ, nhiều câu | Cao cho dictation/shadowing |
| Part 4 | Bài nói (talk) | Có đoạn chừa chỗ + script đầy đủ, đoạn dài | Cao cho dictation/shadowing |

### 3.3 Đánh giá phù hợp

- **Phù hợp:** làm nguồn audio + script để luyện nghe chép chính tả và shadowing (đặc biệt Part 3, Part 4).
- **Khác biệt với LPTD hiện tại:** không phải workbook “Day/Unit” thuần dictation như 600+/750+; là bộ test theo TEST/PART.
- **Kết luận:** nên tích hợp như **nhánh/khóa học dạng TEST** trong web app riêng, giữ rõ metadata `test`, `part`, `track`.

### 3.4 Rủi ro nguồn

- PDF có mã hóa font/CID ở một số phần → trích text tự động có thể lỗi ký tự, cần đối chiếu thủ công.
- Part 1-2 gộp chung 1 file audio → cần quyết định tách hay giữ nguyên theo track.
- Cần đảm bảo tuân thủ bản quyền/mục đích sử dụng cá nhân học tập (không phân phối trái phép).

## 4. Thiết kế dữ liệu (đề xuất)

### 4.1 Nguyên tắc ánh xạ

- Mỗi **track audio = 1 lesson/unit** trong app riêng để mapping audio 1-1, dễ phát và theo dõi tiến độ.
- Tổng dự kiến: **30 units** (10 tests × 3 parts).
- Giữ nguyên `book/test` và `part` trong metadata để hiển thị/lọc.

### 4.2 Schema đề xuất (mở rộng từ LPTD, chỉ dùng trong nhánh riêng)

```json
{
  "id": "hacker1-t01-p3",
  "source": "hacker-1",
  "book": 1,
  "test": 1,
  "part": "3",
  "unit": 2,
  "title": "TEST 01 · Part 3",
  "slug": "test-01-part-3",
  "audioFileName": "TEST01_Part3.mp3",
  "cdnName": "HACKER1_T01_P3.mp3",
  "localPath": "Hacker 1/Hackers_Toeic_1000_1_LC_3rd_workbook(mp3)/TEST01_Part3.mp3",
  "durationHintSec": null,
  "lines": [
    { "no": 1, "speaker": "W", "text": "..." },
    { "no": 2, "speaker": "M", "text": "..." }
  ],
  "lineCount": 0,
  "wordCount": 0
}
```

> Nếu engine hiện tại yêu cầu trường cố định, sẽ cung cấp adapter tương thích (`book/unit/title/audioFileName/cdnName/localPath/lines`) và lưu trường mở rộng trong metadata riêng.

### 4.3 Metadata nguồn

- `hacker-1-source.json` (đã có): inventory audio/test/part.
- `hacker-1-meta.json` (sẽ tạo): thông tin workbook, tổng test/track, quy ước đặt tên, base audio/docs, ghi chú.
- `hacker-1-lessons.json` hoặc `hacker-1-lessons-data.js` (sẽ tạo): dữ liệu lesson chuẩn hóa.
- `hacker-1-gas-data.gs` (sẽ tạo khi build GAS): `*_META()` và `*_LESSONS()` cho app riêng.

### 4.4 Chiến lược audio

- **Local (dev):** dùng `localPath` trỏ về thư mục nguồn trong workspace.
- **GAS riêng:** cấu hình `*_AUDIO_CDN_BASE` (Script Property) trỏ CDN chứa 30 file MP3; đặt `cdnName` theo quy ước ổn định, không dấu/khoảng trắng.
- Không dùng Google Drive làm nguồn phát chính; Drive chỉ cho bản ghi người dùng (nếu bật tính năng recording).

## 5. Cấu trúc thư mục làm việc (trong nhánh này)

Tất cả file sinh ra cho `Hacker 1` đặt trong:

```text
op/Tích hợp nội dung mới/Hacker 1/
  KE_HOACH_XAY_DUNG_VA_TICH_HOP.md      # kế hoạch (file này)
  hacker-1-source.json                   # inventory nguồn (đã có)
  hacker-1-meta.json                     # (dự kiến) metadata chuẩn
  hacker-1-lessons.json                  # (dự kiến) dữ liệu lesson chuẩn
  hacker-1-lessons-data.js               # (dự kiến) bản dùng cho local/app riêng
  extract/                               # (dự kiến) kết quả trích xuất/đối chiếu PDF
  gas/                                   # (dự kiến) bản web app GAS riêng
    Code.gs
    Index.html
    Styles.html
    LptdUI.html (hoặc bundle tương đương)
    *Data.gs
    appsscript.json
    .clasp.json.example
  reports/                               # (dự kiến) báo cáo test/tiến độ
  README.md                              # (dự kiến) hướng dẫn chạy/test nhánh này
```

> Nếu cần script hỗ trợ build/parse, đặt trong `Tích hợp nội dung mới/Hacker 1/tools/`.

## 6. Kế hoạch thực hiện

### Giai đoạn 0 — Chuẩn bị (hoàn thành/đang làm)
- [x] Khảo sát nguồn (số lượng file, cấu trúc test/part, trích mẫu nội dung).
- [x] Tạo nhánh `lptd-source-hacker-1`.
- [x] Tạo `hacker-1-source.json`.
- [x] Tạo kế hoạch xây dựng và tích hợp (file này).

### Giai đoạn 1 — Chuẩn hóa nội dung
- [ ] Trích xuất script theo từng TEST/PART từ PDF (ưu tiên Part 3,4; sau đó Part 1-2).
- [ ] Chuẩn hóa text: speaker, ngắt dòng/câu, loại ký tự lỗi, giữ đáp án/blank nếu cần.
- [ ] Đối chiếu thủ công các đoạn trích lỗi font/CID.
- [ ] Sinh `hacker-1-meta.json` và `hacker-1-lessons.json`.
- [ ] Kiểm tra: đủ 30 track mapping, `lineCount/wordCount` hợp lệ.

**Deliverable:** dữ liệu lesson hoàn chỉnh, có thể audit.

### Giai đoạn 2 — Dựng web app GAS riêng
- [ ] Copy base từ `op/gas-standalone/` (Code/Index/Styles/UI/Data pattern) vào `Hacker 1/gas/` và điều chỉnh cho nguồn Hacker 1.
- [ ] Tạo `*Data.gs`/bundle UI tương ứng (không dùng chung file với dự án tổng).
- [ ] Cấu hình `appsscript.json` và Script Properties riêng (`*_AUDIO_CDN_BASE`, recording engine nếu dùng).
- [ ] Chuẩn bị CDN/đường dẫn audio cho 30 file (hoặc cơ chế local test nếu hỗ trợ).

**Deliverable:** mã nguồn web app GAS riêng hoàn chỉnh trong thư mục nhánh.

### Giai đoạn 3 — Triển khai và kiểm thử (web app riêng)
- [ ] Tạo project Apps Script mới, deploy bản web app riêng.
- [ ] Test chức năng: load danh sách test/part, phát audio đúng track, hiển thị script/lines, dictation, shadowing (nếu áp dụng), điều hướng, mobile/desktop cơ bản.
- [ ] Test lỗi biên: audio 404, thiếu dữ liệu, ký tự đặc biệt.
- [ ] Ghi nhận kết quả trong `reports/`.

**Deliverable:** web app GAS riêng chạy ổn định, báo cáo test đạt.

### Giai đoạn 4 — Hoàn thiện 100% và chuẩn bị gộp (chưa thực hiện gộp)
- [ ] Rà soát lại toàn bộ tiêu chí hoàn thành.
- [ ] Hoàn thiện tài liệu `README.md` trong thư mục nhánh.
- [ ] Lập đề xuất gộp vào dự án tổng (file/patch, ảnh hưởng, rollback) — **chỉ thực thi sau khi được xác nhận 100%**.

## 7. Tiêu chí hoàn thành (Definition of Done)

- [ ] 30/30 track `Hacker 1` được mapping và truy cập được trong web app riêng.
- [ ] Dữ liệu lesson/script đầy đủ, đúng test/part, không lỗi hiển thị nghiêm trọng.
- [ ] Audio phát đúng theo từng unit/track.
- [ ] Web app GAS riêng deploy và hoạt động độc lập (không phụ thuộc sửa đổi dự án tổng).
- [ ] Không có thay đổi nào lên `app/`, `local-study.html`, hay LPTD hiện tại của dự án tổng.
- [ ] Có báo cáo kiểm thử và hướng dẫn sử dụng trong `Tích hợp nội dung mới/Hacker 1/`.

## 8. Ràng buộc và lưu ý

- **An toàn tích hợp:** không sửa dự án tổng trong giai đoạn xây dựng.
- **Tổ chức file:** mọi output của nhánh này nằm trong `Tích hợp nội dung mới/Hacker 1/`.
- **Quyền nội dung:** tài liệu thuộc workbook gốc; sử dụng phục vụ học tập cá nhân, không tái phân phối trái phép.
- **Kỹ thuật:** giữ tương thích schema/cách gọi của engine LPTD hiện có khi có thể; nếu mở rộng, phải có adapter và ghi rõ trong tài liệu.

## 9. Báo cáo tiến độ (cập nhật)

| Ngày | Hạng mục | Trạng thái | Ghi chú |
|---|---|---|---|
| 2026-11-11 | Khảo sát nguồn + tạo branch + inventory | Hoàn thành | `hacker-1-source.json`, commit trên `lptd-source-hacker-1` |
| 2026-11-11 | Kế hoạch xây dựng & tích hợp | Hoàn thành | File kế hoạch này |
| — | Chuẩn hóa nội dung (lesson/script) | Chưa bắt đầu | Giai đoạn 1 |
| — | Web app GAS riêng | Chưa bắt đầu | Giai đoạn 2–3 |
| — | Hoàn thiện 100% & đề xuất gộp | Chưa bắt đầu | Giai đoạn 4 |
