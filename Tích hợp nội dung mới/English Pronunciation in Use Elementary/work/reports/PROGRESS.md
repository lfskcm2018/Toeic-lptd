# TIẾN ĐỘ — EPI ELEMENTARY (Section A MVP)

**Ngày khảo sát:** 2026-11-13  
**Mục tiêu gần:** MVP Section A (Units 1–10) + CD1 audio, test trước khi merge.

## 1. Khảo sát nguồn

- PDF 168 trang, 44,7 MB, bản scan 2007 (Cambridge), không text layer.
- 351 MP3, ~150 MB, 5 CD.
- OCR bằng mupdf + tesseract: đọc được TOC, unit structure, Key.

## 2. Đã thực hiện

- Tạo `KE_HOACH_TRIEN_KHAI.md` trong folder nguồn.
- OCR Units 1–10 (pages 10–29) + Key (pages 138–142) → `work/ocr/`.
- Dựng GAS web app MVP:
  - Script ID: `1uamRFmYlNanNmc57OqzPjnGEQ_z02UMa6w7wwVYC7qsGB6FbsuPEwOgG`
  - Deploy @14: `AKfycbxlTm4XHUmB4JLPe-KBgXrs6VguapvFpxuSj_pGsG7e5EEVVMxeiOPhtYUGwiMIWZdq`
  - UI: list 10 units, audio player từng câu, ghi âm + chấm % (Web Speech API), exercises + xem đáp án.
- Audio CD1 (81 file, ~30 MB) upload lên **GitHub Pages**:
  - Base: `https://lfskcm2018.github.io/Toeic-lptd/epu-audio`
  - 81/81 URL trả HTTP 206.
- Data: 10 units, 84 câu mẫu, 30 exercises.

## 3. Bug đã sửa trong quá trình E2E

| Bug | Nguyên nhân | Cách sửa |
|---|---|---|
| Trang kẹt "Đang tải…" | `EPIUI.html` có markup riêng nằm **ngoài** `#modeBody`, script render vào phần tử không tồn tại | Đổi `EPIUI.html` thành script-only, render vào `#modeBody` |
| Khoảng trắng ~600px | `include('EPIUI')` nằm **sau** `</div>` đóng `.app-shell` (cao 100dvh) → nội dung bị đẩy xuống dưới 1 màn hình | Render trong `#modeBody` (nằm trong `.container`) |
| Hero badge kẹt "Đang tải" | Không cập nhật sau khi load | Set `✅ Sẵn sàng` khi render xong |

## 4. E2E đã kiểm chứng (trình duyệt)

- Khoảng cách hero → danh sách unit: **18px** (trước: ~600px).
- Console: **0 lỗi**.
- Bấm ▶: `GET .../CD1-Track01.mp3` → **HTTP 206**; `CD1-Track17.mp3` → **206**.
- Đổi unit (Unit 01 → Unit 03): tiêu đề, số câu, số exercise đổi đúng.

## 5. Chưa xong / cần làm tiếp

- Audio mapping CD1 → Unit 1–10 là **ước lượng ban đầu** (chưa đối chiếu từng track với sách).
- OCR phonetic symbols còn lỗi (iː/ɪ, æ, ʌ, ɜː…) → cần review thủ công.
- Các hạng mục còn lại: Units 11–27 (CD2), Section B/C/D (CD3–CD4), Section E (CD5).
- Khi 50 units hoàn chỉnh: backup + handover (book 9).
