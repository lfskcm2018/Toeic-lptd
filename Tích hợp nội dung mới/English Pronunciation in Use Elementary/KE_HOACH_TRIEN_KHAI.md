# KẾ HOẠCH TRIỂN KHAI — ENGLISH PRONUNCIATION IN USE (ELEMENTARY)

> **Mục tiêu:** xây dựng web app GAS cho người học phát âm tiếng Anh, dùng tài liệu Cambridge *English Pronunciation in Use Elementary* (Jonathan Marks, CUP 2007) + audio 5 CD, chạy độc lập trước khi merge vào dự án tổng.
> **Trạng thái:** giai đoạn 1 = MVP Section A (Units 1–10) + CD1 audio.
> **Nguyên tắc:** khác các dự án con khác, folder này là nguồn gốc; mọi file build/tạm thời đặt trong `work/`, không sửa MP3/PDF gốc.

---

## 1. Khảo sát nguồn

| Hạng mục | Thông tin |
|---|---|
| PDF | `Marks - English Pronunciation in Use - Elementary.pdf` — 168 trang, 44,7 MB, **bản scan không có text layer** |
| Audio | **351 MP3**, ~150 MB, 5 CD |
| Cấu trúc | 50 unit × 2 trang + Section E (reference) + Key (trang 138–166) |
| CDs | CD1: Units 1–12 (81 track), CD2: Units 13–27 (92), CD3: Units 28–43 (85), CD4: Units 44–50 + E1/E4–E8 (55), CD5: E3 Sound pairs (38) |

### Phân bố Section A (Units 1–27)

| Unit | Chủ đề | Âm |
|---|---|---|
| 1 | How many letters, how many sounds? | spelling ↔ sound |
| 2 | Pizza for dinner | /ɪ/ and /iː/ |
| 3 | A spoonful of sugar | /ʊ/ and /uː/ |
| 4 | Father and mother | /ɑː/ and /ʌ/ |
| 5 | A dog in the corner | /ɒ/ and /ɔː/ |
| 6 | Bread and jam | /e/ and /æ/ |
| 7 | My birthday’s on Thursday | /θ/ and /ð/ |
| 8 | Here and there | /eə/ and /ɪə/ |
| 9 | Have a great time! | /eɪ/, /aɪ/ and /ɔɪ/ |
| 10 | Old town | /əʊ/ and /aʊ/ |
| ... | ... | ... |

---

## 2. Kiến trúc web app GAS

- **Web app GAS riêng** (theo mẫu LPTD/Hacker 1): `Index.html`, `Styles.html`, `LptdStyles.html`, `LptdUI.html`, `EPIData.gs`, `Code.gs`.
- **Dữ liệu:** JSON units (id, unit, title, focus, sounds, exercises, answerKey, audioTracks).
- **Audio:** upload lên Netlify CDN `/audio/epu/...` (alias ASCII, ví dụ `EPU-U01-T01.mp3`).
- **UI:** 8 tab theo Section A/B/C/D/E? MVP: chỉ Units 1–10, mỗi unit mở rộng thành flashcard + listening + shadowing + record.
- **Recording:** dùng Recording Engine hiện có (Drive) để chấm shadowing.
- **Book khi merge:** dự kiến **book 9** (sau 750+ book 8).

---

## 3. Các giai đoạn

### Giai đoạn 1 — MVP: Section A Units 1–10 + CD1 (hiện tại)
- OCR pages 10–29 (Units 1–10) + Key pages.
- Map CD1 tracks → Units 1–10.
- Dựng data `epu-lessons.json` (10 units).
- Web app GAS riêng: listening, dictation, shadowing, record, chấm %.
- E2E: 10 units, audio 206, shadowing render, ghi âm, console sạch.
- Backup + folder bàn giao (book 9).

### Giai đoạn 2 — Section A Units 11–27 + CD2
### Giai đoạn 3 — Section B/C/D (Units 28–50) + CD3/CD4
### Giai đoạn 4 — Section E (Reference) + CD5 Sound pairs
### Giai đoạn 5 — Merge vào dự án tổng (book 9)

---

## 4. Tiêu chí MVP PASS

1. 10 units hiển thị đúng nội dung (OCR đã review).
2. 351? Không: CD1 tracks liên quan Units 1–10 phát được, seek được, HTTP 206.
3. Mỗi unit: nghe audio, điền từ/chọn đáp án, shadowing, ghi âm, chấm %.
4. Web app GAS riêng chạy độc lập, không ảnh hưởng dự án tổng.
5. Backup + handover folder sẵn sàng.

---

## 5. Rủi ro & cách xử lý

| Rủi ro | Cách xử lý |
|---|---|
| OCR sai (phonetic symbols) | Review thủ công từng unit, đối chiếu PDF gốc |
| Audio track không khớp unit | Đối chiếu sách in `(A 12` trong mỗi unit; nghe spot-check |
| Bản quyền Cambridge | Dùng cho cá nhân/nội bộ; không public rộng |
| Dung lượng CDN | 150 MB MP3, Netlify giới hạn? Giữ raw, alias ASCII |
| Merge vào app tổng | Sau khi MVP pass 100%, tái sử dụng pattern LPTD (book 9) |

---

## 6. File trong folder này

```
English Pronunciation in Use Elementary [1999]/
├─ Marks - English Pronunciation in Use - Elementary.pdf   ← gốc, KHÔNG sửa
├─ English pronunciation in Use CD1..CD5/                  ← gốc, KHÔNG sửa
├─ KE_HOACH_TRIEN_KHAI.md                                  ← file này
└─ work/
   ├─ ocr/                  ← ảnh render + text OCR từng trang
   ├─ data/                 ← JSON, scripts build
   ├─ reports/              ← DATA-QUALITY.md, PROGRESS.md
   └─ tools/                ← build.js, deploy-audio.js
```

---

## 7. Lệnh thường dùng

```powershell
# OCR Unit 1-10 (pages 10-29) + Key
node "work/tools/ocr-epu.mjs"

# Build data JSON
node "work/tools/build-epu-data.js"

# Deploy audio merged (Netlify)
node "work/tools/deploy-audio-merged.js"
```

---

## 8. Ghi chú

- Không copy nội dung Cambridge ra ngoài cho phân phối công khai.
- Mọi thay đổi gốc (PDF/MP3) phải backup trước.
- Web app riêng phải deploy độc lập, test pass 100% mới merge.
