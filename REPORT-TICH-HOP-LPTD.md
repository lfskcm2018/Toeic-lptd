# BÁO CÁO — Tích hợp Listening Practice Through Dictation 1–4

**Ngày hoàn tất:** 10/11/2026
**Phạm vi:** toàn bộ file mới nằm trong `op/`
**Trạng thái:** ✅ Hoàn tất phần local + mã nguồn GAS; ⏳ chờ deploy GAS thực tế

---

## 1. Kết quả tổng quan

Đã thêm **thư viện thứ 3** vào web app dictation hiện có:

| Thư viện | Nội dung | Trạng thái |
|---|---|---|
| Hackers TOEIC 700+ | 20 DAY | Không thay đổi, hoạt động bình thường |
| ETS 2026 | 10 Test / 540 clip | Không thay đổi, hoạt động bình thường |
| Ôn từ sai | Từ sai Dictation | Không thay đổi, hoạt động bình thường |
| **LPTD 1–4** | **4 cuốn × 40 unit** | **Mới, hoạt động đầy đủ** |

### Số liệu dữ liệu

| Chỉ số | Giá trị |
|---|---|
| Tổng unit | **160** |
| Unit mỗi cuốn | **40** |
| Tổng câu thoại | **1.041** |
| Tổng từ | **30.555** |
| MP3 local | **160/160** tồn tại |
| MP3 CDN | **160/160** PASS |
| File MP3 thiếu | **0** |

Phân bổ:

| Cuốn | Trình độ | Unit | Câu | Từ |
|---|---|---|---|---|
| LPTD 1 | Beginner | 40 | 311 | 5.614 |
| LPTD 2 | Elementary | 40 | 282 | 6.817 |
| LPTD 3 | Intermediate | 40 | 272 | 8.500 |
| LPTD 4 | Upper-intermediate | 40 | 176 | 9.624 |

---

## 2. Kiến trúc đã triển khai

```
Sidebar
  ├── Hackers 20 DAY        (core, không sửa)
  ├── ETS 2026              (core, không sửa)
  ├── Ôn từ sai             (core, không sửa)
  └── 📚 LPTD 1–4           (module mới, tự inject)

LPTD module (op/app/lptd-ui.js)
  ├── Thư viện 4 cuốn × 40 unit + tìm kiếm + tiến độ
  ├── Player riêng: play/pause, seek, tốc độ, phát lại 3 lần
  ├── Dictation: auto blanks mỗi 4 từ, check, show, hint, score
  ├── Shadowing: ghi âm từng câu, nghe lại, chấm % Web Speech
  ├── Tiến độ riêng: toeic_lptd_progress
  └── Từ sai riêng: toeic_lptd_mistakes

Nguồn dữ liệu
  ├── Local: op/app/lptd-lessons-data.js  (window.LPTD_LESSONS_RAW)
  └── GAS:   op/app/LptdData.gs + Code.lptd.gs (google.script.run)
```

**Nguyên tắc:** module độc lập, render vào `#modeBody`, ẩn/khôi phục `#playerCard`, `.mode-tabs`, `#quizFooter`; không sửa `core.js`.

---

## 3. File bàn giao

### Dữ liệu

| File | KB | Vai trò |
|---|---:|---|
| `op/data/lptd-lessons.json` | 318,8 | 160 unit đã chuẩn hóa + metadata |
| `op/data/lptd-stats.json` | 2,5 | Thống kê |
| `op/data/lptd-cdn-manifest.csv` | 40,3 | Map unit → CDN → file local |

### Module local

| File | KB | Vai trò |
|---|---:|---|
| `op/app/lptd-data.js` | 8,6 | Catalog 4 cuốn, tài liệu, URL builder, chế độ audio |
| `op/app/lptd-lessons-data.js` | 248,0 | `window.LPTD_LESSONS_RAW` (tự sinh) |
| `op/app/lptd-ui.js` | 50,2 | Toàn bộ UI + logic |
| `op/app/lptd-ui.css` | 12,2 | Style riêng, responsive |
| `op/index.html` | 6,4 | App tích hợp sẵn để chạy thử |

### Google Apps Script

| File | KB | Vai trò |
|---|---:|---|
| `op/app/LptdData.gs` | 247,8 | `LPTD_LESSONS()` + `LPTD_LESSONS_META()` |
| `op/app/Code.lptd.gs` | 5,1 | `getLptdBootstrap`, `getLptdLessons`, `getLptdBooks`, `getLptdUnit`, debug |
| `op/app/LptdUI.html` | 71,4 | Bundle CSS + data + UI để include |

### Công cụ

| File | KB | Vai trò |
|---|---:|---|
| `op/tools/build-lptd-data.js` | 13,8 | Sinh toàn bộ dữ liệu từ JSON nguồn |
| `op/tools/build-gas-ui.js` | 2,3 | Sinh `LptdUI.html` |
| `op/tools/validate-lptd.js` | 10,4 | Validate 160 unit + file local + đồng bộ JS/GAS |
| `op/tools/verify-cdn.js` | 4,9 | HEAD 160 file CDN |
| `op/tools/test-gas-lptd.js` | 3,9 | Mock test GAS API |
| `op/tools/serve-lptd.js` | 4,2 | Static server có HTTP Range |

### Tài liệu

| File | KB |
|---|---:|
| `op/PLAN-TICH-HOP-LPTD.md` | 17,9 |
| `op/README.md` | 6,3 |
| `op/integration/PATCH-local-study.md` | 3,3 |
| `op/integration/PATCH-GAS.md` | 4,5 |
| `op/integration/CHECKLIST-TRIEN-KHAI.md` | 4,5 |
| `op/REPORT-TICH-HOP-LPTD.md` | file này |

---

## 4. Kiểm thử đã thực hiện

### 4.1. Dữ liệu

```
node op/tools/validate-lptd.js
→ PASS
  • JSON          : 160 unit / 1041 câu / 30555 từ
  • MP3 local     : 160/160 tồn tại
  • lptd-lessons-data.js : 160 unit
  • LptdData.gs   : 160 unit
  • CSV manifest  : 160 dòng
```

Đã kiểm tra:

- 40 unit/cuốn, id duy nhất, đúng chuẩn `lptd-{book}-{NN}`.
- Không còn từ dính do trích xuất PDF.
- Không còn nháy cong, `---`, khoảng trắng kép, dấu câu dính chữ.
- `lptd-lessons-data.js` và `LptdData.gs` khớp 100% JSON nguồn.
- `wordCount`, `lineCount`, totals khớp.

### 4.2. CDN

```
node op/tools/verify-cdn.js --concurrency 12
→ PASS 160/160
```

Đã xác nhận từng file:

- HTTP 200/206.
- `Content-Type: audio/mpeg`.
- `Access-Control-Allow-Origin: *`.
- `Accept-Ranges: bytes`.
- `Content-Length` khớp dung lượng file local.

### 4.3. GAS API (mock)

```
node op/tools/test-gas-lptd.js
→ PASS 13/13
```

Bao gồm: bootstrap 160 unit, CDN base, `cdnUrl` từng unit, 4 cuốn, `getLptdUnit(3,7)`, totals, override Settings audio/docs.

### 4.4. Browser — local (server Range 8096)

| Hạng mục | Kết quả |
|---|---|
| Nút sidebar `📚 LPTD 1–4` | ✅ |
| Thư viện 4 tab cuốn | ✅ |
| 40 unit/cuốn | ✅ |
| Tài liệu PDF (local) | ✅ mở đúng đường dẫn |
| Mở Unit 01 | ✅ |
| Audio local | ✅ phát |
| Seek | ✅ `seekable = [0, 89.22]`, `currentTime = 30` giữ đúng |
| Thời gian hiển thị | ✅ `0:30` |
| Đổi tốc độ | ✅ |
| Phát lại 3 lần | ✅ |
| Dictation 32 ô trống | ✅ |
| Kiểm tra đáp án | ✅ highlight đúng/sai, điểm % |
| Xem đáp án | ✅ mở transcript, read-only |
| Gợi ý | ✅ |
| Lưu tiến độ | ✅ `toeic_lptd_progress` |
| Từ sai | ✅ `toeic_lptd_mistakes` |
| Shadowing | ✅ 9 thẻ câu, 9 nút ghi âm, 9 nút chấm |
| Console | ✅ không lỗi |

### 4.5. Browser — CDN + server không Range (8095)

| Hạng mục | Kết quả |
|---|---|
| Phát hiện không tua được | ✅ hiện nút **⚡ Chuyển sang CDN** |
| Chuyển sang CDN | ✅ src → `https://toeic-audio.netlify.app/audio/lptd/LPTD1U01.mp3` |
| Seek sau chuyển | ✅ `seekableEnd = 89.22` |
| Ẩn nút sau khi chuyển | ✅ |

### 4.6. Không hồi quy

| Màn hình | Kết quả |
|---|---|
| DAY 01 (Hackers) | ✅ hero DAY 01, 10 quiz card, player/tab hiện lại |
| ETS 2026 | ✅ panel ETS mở, hero ETS |
| Ôn từ sai | ✅ hero "Ôn từ sai", nội dung đúng |
| Quay lại LPTD | ✅ mở lại bình thường |

### 4.7. Responsive 375px (iframe)

| Hạng mục | Kết quả |
|---|---|
| Thư viện | ✅ 1 cột (315px), không tràn ngang |
| Tab cuốn | ✅ 1 cột (343px) |
| Unit | ✅ không tràn ngang |
| Seek | ✅ rộng 243px |
| Ô điền | ✅ 32 ô, không cắt |

### 4.8. Hiệu năng

| Thao tác | Thời gian |
|---|---:|
| Mở thư viện 4×40 unit | ~8,8 ms |
| Mở unit + render 32 ô trống | ~5,3 ms |

Không tải trước 160 MP3; chỉ tải file của unit đang mở.

---

## 5. Lỗi phát hiện & đã sửa

### 5.1. Dữ liệu nguồn

- **Từ dính do trích xuất PDF** (26 cụm): `differentareas`, `discoveredmany`, `lisagreat`, `cannotbe`, `musicon`… → thêm bảng `REPAIRS` vào pipeline build, có kiểm chứng ngữ cảnh.
- **Thiếu khoảng trắng sau dấu kết câu**: `rock.The` → `rock. The`; vẫn giữ đúng `a.m.` / `p.m.`.
- **Nháy cong** `’` → `'`; `---` → `—`.
- **Đường dẫn nguồn lồng 2 cấp**: `Listening Practice Through Dictation/Listening Practice Through Dictation 1/...` → sửa `LPTD_DIR_PREFIX`.
- **Số liệu ban đầu lệch**: 30.519 → **30.555 từ** sau khi sửa từ dính.

### 5.2. Kỹ thuật

- **`server.js` gốc không hỗ trợ HTTP Range** → audio local `seekable = [0,0]`.
  - Giải pháp: thêm `op/tools/serve-lptd.js` trả `206` + `Accept-Ranges: bytes`.
  - Bổ sung nút **⚡ Chuyển sang CDN** khi phát hiện nguồn không tua được.
- **Race khi bấm LPTD quá sớm**: core render DAY đè lên thư viện sau khi `loadLessons()` xong.
  - Giải pháp: `MutationObserver` trên `#modeBody`, tự vẽ lại module nếu nội dung bị thay.
- **Gợi ý seek sai do `http://localhost` bị nhận là CDN** → bỏ kiểm tra scheme, dựa trực tiếp vào `audio.seekable`.

---

## 6. Tiêu chí nghiệm thu

| # | Tiêu chí | Kết quả |
|---|---|---|
| 1 | 160 unit, 40/cuốn, 0 rỗng, 0 MP3 thiếu | ✅ |
| 2 | 160/160 CDN HTTP 200/206 + audio/mpeg + Range | ✅ |
| 3 | Dictation + Shadowing chạy đúng | ✅ (đã test Unit 01 LPTD 1; dữ liệu/engine dùng chung cho 160 unit) |
| 4 | Không hồi quy Hackers / ETS / Ôn từ sai | ✅ |
| 5 | Mở thư viện < 1s | ✅ ~8,8 ms |
| 6 | Chrome/Edge desktop + mobile 375px | ✅ desktop; ✅ 375px qua iframe |
| 7 | Không lỗi console, không credential, không Drive | ✅ |

---

## 7. Việc còn lại

| Việc | Mức độ | Ghi chú |
|---|---|---|
| Deploy thử lên GAS thật | Bắt buộc trước go-live | Cần tài khoản/Project Apps Script; làm theo `PATCH-GAS.md` |
| Test Shadowing chấm % thật | Nên làm | Cần micro + Chrome/Edge + mạng; code đã sẵn |
| Test trên điện thoại thật | Nên làm | Đã test 375px bằng iframe; thiết bị thật kiểm tra thêm touch |
| (Tùy chọn) Upload PDF lên CDN | Không bắt buộc | Để bật nút tài liệu trong GAS |
| (Tùy chọn) Audio theo từng câu | Cải tiến sau | Hiện Shadowing dùng 1 file/unit như Hackers |

---

## 8. Rollback

- **Local:** xoá 5 dòng patch khỏi `local-study.html`, hoặc ngừng dùng `op/index.html`.
- **GAS:** xoá include `LptdUI`, xoá 3 file `LptdData.gs` / `Code.lptd.gs` / `LptdUI.html`, deploy version trước.
- **Dữ liệu:** không ảnh hưởng Sheet/Drive/localStorage của Hackers/ETS.
- **Audio:** không upload/xoá file nào trên Netlify.

---

## 9. Kết luận

Phần tích hợp LPTD đã hoàn chỉnh ở mức mã nguồn và kiểm thử local:

- Dữ liệu sạch, validate tự động.
- Audio phát trực tiếp, tua được, CORS mở, không phụ thuộc Drive.
- UI đầy đủ Dictation + Shadowing, tiến độ riêng, không xung đột core.
- Có bộ công cụ build/validate/test tái sử dụng.
- Có tài liệu patch local, patch GAS và checklist go-live.

Bước tiếp theo duy nhất mang tính bắt buộc là **deploy thử trên Apps Script thật** theo `op/integration/PATCH-GAS.md`.

## Cap nhat: Khac phuc loi microphone (Shadowing) - 11/11/2026

- Nguyen nhan: GAS web app trong iframe sandbox chan micro (Permissions Policy).
- Giai phap: Approach A - popup top-level Recording Engine + postMessage (GitHub Pages).
- Deployment @8: `AKfycbyM8huBU37okqYAvNajHt52sNrGKgV-SsL278b270rdXxz52VX0PGN-ZO4XlMKXrzTN`.
- Xac minh E2E: popup mo, target sentence hien thi, postMessage round-trip hoat dong.
