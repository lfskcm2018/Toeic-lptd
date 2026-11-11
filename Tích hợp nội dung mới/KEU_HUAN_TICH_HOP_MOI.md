# Kế hoạch tích hợp nội dung mới vào web app LPTD riêng

> Thư mục mới: `Tích hợp nội dung mới`  
> Mục tiêu: xây dựng và kiểm thử một **web app GAS riêng** cho các nguồn nội dung LPTD mới.  
> Sau khi hoàn thành **100% công việc**, mới tiến hành gộp vào dự án tổng hiện tại.

## 1. Mục tiêu chính

1. Tích hợp các nguồn tài liệu / audio mới vào một web app Google Apps Script riêng.
2. Web app này phải chạy được độc lập trên GAS mới.
3. Không sửa, không ảnh hưởng đến web app LPTD hiện tại của dự án tổng.
4. Sau khi hoàn thành 100%:
   - Kiểm tra lại web app riêng.
   - Nếu OK → kế hoạch gộp vào dự án tổng.
   - Nếu chưa OK → tiếp tục sửa trong web app riêng, không gộp.

## 2. Tài liệu nguồn đã khảo sát

### 2.1 `Hacker 1`

- Loại nguồn: workbook / test TOEIC LC 1000.
- Nội dung: 10 test, nhiều part, có script / câu hỏi / dictation-like content.
- Mức độ phù hợp cho LPTD: trung bình – cao.
- Vai trò trong kế hoạch: nguồn audio / câu hỏi / test source.

### 2.2 `Dictation Part 2`

- Loại nguồn: workbook dictation chuyên sâu về Part 2.
- Nội dung: 11 audio, 64 trang PDF, các loại câu When / Where / Who / Why / Which / What / How…
- Mức độ phù hợp cho LPTD: cao.
- Vai trò trong kế hoạch: content dictation tốt nhất cho Part 2.

### 2.3 `750+`

- Loại nguồn: Hackers TOEIC 750+ Dictation & Shadowing Workbook.
- Nội dung: 20 audio `D1.mp3` – `D20.mp3`, có dictation, answer, shadowing, translation.
- Mức độ phù hợp cho LPTD: rất cao.
- Vai trò trong kế hoạch: nền tảng content chính cho web app riêng.

### 2.4 `600+`

- Loại nguồn: Hackers TOEIC 600+ Dictation & Shadowing Workbook.
- Nội dung: 20 ngày, audio `DAYxx`, dictation, answer, shadowing, translation.
- Mức độ phù hợp cho LPTD: rất cao.
- Vai trò trong kế hoạch: content bổ sung / đối chiếu cho course dictation & shadowing.

## 3. Kết luận khảo sát

- `750+` và `600+`: phù hợp mạnh để xây dựng nội dung dictation/shadowing cho web app riêng.
- `Dictation Part 2`: phù hợp để làm module Part 2 ngắn gọn.
- `Hacker 1`: phù hợp làm nguồn test / audio / script, chưa phải là dictation workbook thuần túy.
- Tổng thể: các nguồn mới đều có tài liệu PDF + audio MP3, nhưng cần transform sang format LPTD lesson: `id`, `book`, `unit`, `title`, `slug`, `audioFileName`, `cdnName`, `localPath`, `lines`, `lineCount`, `wordCount`.

## 10. Cấu trúc thư mục nguồn dữ liệu

| Nguồn tài liệu | Thư mục con trong `Tích hợp nội dung mới` |
|---|---|
| `Hacker 1` | `Tích hợp nội dung mới/Hacker 1/` |
| `Dictation Part 2` | `Tích hợp nội dung mới/Dictation Part 2/` |
| `750+` | `Tích hợp nội dung mới/750+/` |
| `600+` | `Tích hợp nội dung mới/600+/` |

Khi AI khảo sát để thêm dữ liệu, file dữ liệu của từng nguồn tài liệu phải được lưu đúng vào folder con tương ứng của chính nguồn đó.  
Không được gộp file dữ liệu của nhiều nguồn vào một thư mục chung trong giai đoạn xây dựng web app riêng.

## 4. Kế hoạch xây dựng web app GAS riêng

### 4.1 Cấu hình bắt đầu

- Base: web app LPTD standalone hiện tại:
  - `op/gas-standalone/Code.gs`
  - `op/gas-standalone/Index.html`
  - `op/gas-standalone/Styles.html`
  - `op/gas-standalone/LptdUI.html`
  - `op/gas-standalone/LptdData.gs`
- New branch: `lptd-content-integration` trong repo `op/`.
- Mục tiêu: không merge branch này vào `master` trong giai đoạn xây dựng.

### 4.2 Nội dung mới cần đưa vào

- Thêm source từ `750+` vào web app riêng.
- Thêm source từ `600+` vào web app riêng.
- Thêm source từ `Dictation Part 2` vào web app riêng.
- Có thể dùng source từ `Hacker 1` cho test / audio source.
- Tạo dữ liệu lesson mới trong format `LPTD_LESSONS()` / `LPTD_LESSONS_META()`.

### 4.3 Audio strategy

- Dùng CDN audio hiện có nếu nguồn đã có trên CDN.
- Hoặc cấu hình `LPTD_AUDIO_CDN_BASE`.
- Map audio:
  - `750+`: `D1.mp3` … `D20.mp3`.
  - `600+`: `DAYxx.mp3` / `DAYxx_1.mp3` / `DAYxx_2.mp3`.
  - `Dictation Part 2`: `MP3/01. When ….mp3` …
  - `Hacker 1`: `Hackers_Toeic_1000_1_LC_3rd_workbook(mp3)/TESTxx_Part….mp3`.

### 4.4 UI / module

- Dùng `LptdUI` base.
- Dùng `LptdStyles` base.
- Không sửa app tổng `app/`.
- Nếu cần custom source metadata, giữ trong `LptdData.gs` của web app riêng.

### 4.5 Deployment riêng

- Tạo project Apps Script mới cho web app nội dung LPTD mới.
- Script properties riêng:
  - `LPTD_AUDIO_CDN_BASE`
  - `LPTD_DOCS_CDN_BASE`
  - `LPTD_RECORDING_ENGINE_URL`
  - `RECORDING_FOLDER_ID`
  - `RECORDING_SETTINGS`
- Drive riêng cho bản ghi.
- Auth riêng cho web app mới.

## 5. Các bước thực hiện

1. Tạo branch riêng: `lptd-content-integration`.
2. Copy base web app LPTD standalone vào vùng làm việc riêng.
3. Thêm source data mới từ 4 nguồn.
4. Transform PDF/MP3 thành lesson data hợp lệ.
5. Build bundle UI GAS.
6. Deploy web app mới.
7. Test:
   - load lesson.
   - audio.
   - dictation.
   - shadowing.
   - Drive recording.
   - console.
8. Xác nhận web app riêng chạy ổn.
9. Chỉ sau đó mới lên kế hoạch gộp vào `app/` chính.

## 6. Ràng buộc an toàn

- **Không** sửa `app/Code.gs`.
- **Không** sửa `app/Index.html`.
- **Không** sửa `app/core.js`.
- **Không** sửa `op/app/lptd-*` trong giai đoạn build web app riêng.
- Web app riêng phải dùng script properties và dữ liệu riêng.
- Gộp vào dự án tổng chỉ được làm sau khi đạt tiêu chí hoàn thành.

## 7. Tiêu chí hoàn thành 100%

- Web app GAS riêng load được.
- 4 nguồn nội dung mới được nạp đúng mục tiêu.
- Audio phát được.
- Dictation / shadowing hoạt động.
- Recording / Drive hoạt động.
- Không ảnh hưởng web app tổng.
- Sau đó mới merge vào dự án tổng.

## 8. Lưu ý pháp lý / nội dung

- Các PDF có ghi nhận quyền bản quyền và hạn chế sao chép/phân phối.
- Việc tích hợp cần tuân thủ quyền sử dụng và mục đích cá nhân / học tập.

## 9. Việc tiếp theo sau khi hoàn thành 100%

- Tạo PR / merge từ branch `lptd-content-integration` vào `master`.
- Copy source data mới vào `op/app/` và `op/gas-standalone/`.
- Rebuild `op/gas-standalone/LptdUI.html`.
- Deploy version mới cho web app tổng.
- Test lại tích hợp vào dự án tổng.
