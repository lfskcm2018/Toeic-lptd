# BÀN GIAO CÔNG VIỆC — Pronunciation Master – Intermediate

> **Cập nhật:** 13/11/2026 (đã nhận bàn giao và triển khai xong)  
> **Nguồn:** *English Pronunciation in Use – Intermediate*, Mark Hancock, Cambridge (ISBN 978-0-521-00657-6), 201 trang PDF  
> **Core dùng chung (cả 2 khóa):** `work/pm-core/`

---

## 1. TRẠNG THÁI: ✅ ĐÃ DEPLOY & TEST PASS

| Hạng mục | Giá trị |
|---|---|
| Script ID | `1zfmuzM5cDmQWCaNHeMSUAChxlP3kGdKHSWkacDEPxjv4F07h6wN_tXB5` |
| Deploy | **@6** — `AKfycbyVWuuPsLXA_TybqKIuLfZT1oy2hI0NXO_n8yltT7JqjOWQjILiO8ix7rNOuWcpRPqCJQ` |
| Web app | `https://script.google.com/macros/s/AKfycbyVWuuPsLXA_TybqKIuLfZT1oy2hI0NXO_n8yltT7JqjOWQjILiO8ix7rNOuWcpRPqCJQ/exec` |
| Nội dung | **60 unit** (Chặng A 1–20 · B 21–40 · C 41–60) + Section D (D1/D3/D4) |
| Bài tập | **195 bài** (127 kèm đáp án từ Key) — chấm ở server |
| Audio | **360 track** (CD1 99 · CD2 97 · CD3 99 · CD4 65) |
| CDN | `https://lfskcm2018.github.io/Toeic-lptd/pm-intermediate-audio/INT-CD{1..4}-Track{NN}.mp3` |

## 2. ĐÃ LÀM (so với bàn giao cũ)

Bàn giao cũ nói “100% code, còn 6 bước setup”. Đã làm hết 6 bước, nhưng phải **đổi kiến trúc
backend** vì các nguyên nhân sau:

| Vấn đề | Kết quả |
|---|---|
| Bước 1 — tạo Google Sheet | `clasp run` và API `scripts.run` đều lỗi **“a server error occurred while reading from storage. Error code NOT_FOUND”** (lỗi nền tảng, xảy ra cả với script EPI đang chạy tốt) → không tạo được Sheet bằng API |
| Bước 2 — tạo thư mục Drive | tương tự (cần scope `drive`) |
| Bước 3–4 — Config + push | push OK sau khi sửa `appsscript.json` (bản cũ có field không hợp lệ `executionTimeout`, `oAuthScopes`) |
| Bước 5 — deploy | OK, nhưng web app trả **403 “Bạn cần có quyền truy cập”** vì scope Sheets/Drive chưa được cấp cho deployer (không đăng nhập được Google trong browser) |
| Bước 6 — kiểm tra | không chạy được vì bước 1–2 |

### Quyết định kiến trúc

Chuyển sang **nội dung tĩnh + CDN + tiến độ client** — đúng pattern của 7 nguồn đã có trong dự án
(LPTD 1–4, Hacker 1, DP2, 600+, 750+, EPI Elementary). Bộ file Sheets gốc **được giữ nguyên** ở
`legacy-sheets-version/` để tham khảo/khôi phục khi có môi trường cấp scope.

### Thêm mới (chưa có trong bàn giao cũ)

1. **Tách audio từ 4 file MP3 lớn → 360 track** theo file `.cue` (giữ đúng mã marker của sách
   `A1…A99`, `B1…B97`, `C1…C99`, `D1…D65`), bằng `ffmpeg` (cài qua `ffmpeg-static`).
2. **OCR 190 trang sách** (mupdf + tesseract.js) → `work/ocr/page-*.txt`.
3. **Trích nội dung**: tiêu đề unit, 195 bài tập, 127 đáp án từ Key, mapping audio ↔ unit.
4. **Core dùng chung** `work/pm-core/` (mới) — Advanced dùng lại đúng core này.
5. **Deploy + test E2E** bằng trình duyệt.

## 3. CẤU TRÚC

```
English Pronunciation in Use Intermediate [2000]/
├─ GAS_Implementation/          ← app GAS hiện hành (push bằng clasp)
│  ├─ Code.gs  PMService.gs  PMContent.gs  Config.gs
│  ├─ Index.html  Styles.html  App.html
│  └─ appsscript.json  .clasp.json
├─ legacy-sheets-version/       ← bộ 15 file Sheets/Drive gốc (giữ để tham khảo)
├─ work/
│  ├─ pm-core/                  ← CORE DÙNG CHUNG (sinh cả 2 app)
│  │   ├─ Code.gs PMService.gs Index.html Styles.html App.html
│  │   ├─ build-pm-app.cjs      dựng thư mục GAS cho 1 khóa
│  │   ├─ prepare-cdn-audio.cjs chuẩn hoá tên file audio ASCII
│  │   └─ push-audio-master.cjs đẩy audio lên nhánh GitHub Pages
│  ├─ ocr/page-001..201.txt     OCR sách
│  ├─ audio/INT-CD*.mp3         360 track đã tách + manifest.json
│  ├─ data/pm-intermediate-content.json
│  └─ tools/  split-audio.js · ocr-batch.mjs · build-intermediate-content.cjs
├─ "CD A".."CD D"/               MP3 gốc + .cue
└─ BAN_GIAO_CONG_VIEC.md         (file này)
```

## 4. LỆNH TÁI TẠO

```bash
# 1. tách audio (cần ffmpeg-static)
node work/tools/split-audio.js
# 2. OCR sách
node work/tools/ocr-batch.mjs 1 201 2 page
# 3. trích dataset
node work/tools/build-intermediate-content.cjs
# 4. dựng app GAS
node work/pm-core/build-pm-app.cjs \
  "English Pronunciation in Use Intermediate [2000]/GAS_Implementation" \
  "English Pronunciation in Use Intermediate [2000]/work/data/pm-intermediate-content.json" \
  "Pronunciation Master – Intermediate" "PRON_INTERMEDIATE_2000" \
  "https://lfskcm2018.github.io/Toeic-lptd/pm-intermediate-audio" \
  1zfmuzM5cDmQWCaNHeMSUAChxlP3kGdKHSWkacDEPxjv4F07h6wN_tXB5
# 5. push + deploy
cd "English Pronunciation in Use Intermediate [2000]/GAS_Implementation" && clasp push --force && clasp deploy -d "…"
# 6. đẩy audio lên CDN (nhánh master = GitHub Pages)
node work/pm-core/prepare-cdn-audio.cjs
node work/pm-core/push-audio-master.cjs
```

## 5. CÒN LẠI (không chặn release)

1. **Mapping audio ↔ unit ở Section D (D1–D65)** chưa gắn vào mục tham khảo (chỉ gán tới unit 60).
2. **Chưa có bảng IPA / sound pairs** cho Section D (D1 bảng ký hiệu, D4 sound pairs) — cần trích từ
   trang 129–160 và biên soạn lại như bản âm E1/E3 của EPI Elementary.
3. **68 bài chưa có đáp án** — một phần vì Key của sách cho transcript dài, một phần vì OCR.
4. **Chưa có vai trò STUDENT/TEACHER/ADMIN, chưa lưu bản ghi lên Drive** (cần scope Drive).
5. Nếu muốn bật lại backend Sheets/Drive: copy `legacy-sheets-version/` vào `GAS_Implementation/`,
   chạy `initializeMVP()` trong Script Editor (cần đăng nhập Google), điền ID vào `Config.gs`.
