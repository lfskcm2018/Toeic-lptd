# PROGRESS — EPI Elementary (English Pronunciation in Use Elementary)

> Cập nhật: 2026-11-13 · Nhánh nguồn: `lptd-source-epu` · Bàn giao: `op/ban-giao-epu/`

## Trạng thái: ✅ HOÀN THÀNH (100%)

| Hạng mục | Trạng thái |
|---|---|
| Units 11–27 (CD2) | ✅ |
| Section A hoàn chỉnh (Units 1–27, CD1–CD2) | ✅ |
| Section B/C/D (CD3–CD4) → Units 28–50 | ✅ |
| Section E (CD5) → bảng âm · sound pairs · số đếm | ✅ E1–E8 |
| Review: mapping audio ↔ unit (đối chiếu marker) | ✅ 351/351 track khớp |
| Review: sửa phonetic symbols OCR sai | ✅ đọc tay từ ảnh sách |
| Test pass | ✅ web app riêng + app tổng (book 9) |

## 1. Deliverables

### Web app EPI riêng
- Script ID `1uamRFmYlNanNmc57OqzPjnGEQ_z02UMa6w7wwVYC7qsGB6FbsuPEwOgG`
- Deploy **@18** — `AKfycbwU7M5B6Rz4RvZY159CMmgYM_D0igL8HlZ4GhBaWxCfiIUDKmXnMoD1rL8goQIlk1-O`
- URL: `https://script.google.com/macros/s/AKfycbwU7M5B6Rz4RvZY159CMmgYM_D0igL8HlZ4GhBaWxCfiIUDKmXnMoD1rL8goQIlk1-O/exec`
- 50 unit + Section E (E1–E8), 5 tab A/B/C/D/E, panel audio theo track, shadowing (🎤 Nói qua Recording Engine popup), bài tập kèm đáp án.

### App tổng (module LPTD — book 9)
- Deploy **@66** — `AKfycbxq8Fg3G8dAxoDszlSXSFCNI96ZPsUTKNYC_pCHn7y1JldeU0Su8dPHzUyEZsRwNIAy`
- `app/EpiData.gs` + `app/EpiServer.gs`; `getLptdBootstrap()` trả `epiLessons` (58) + `epiMeta`.
- Sidebar “📚 LPTD 1–9” → nhánh “🗣️ EPI Elementary” → 58 unit; panel EPI trong unit view (dải track + bài tập).
- Tổng: 160 + 30 + 11 + 32 + 20 + 58 = **311 unit**.
- Đã sửa bug có sẵn: `openLibrary(book)` không nhận tham số → `ReferenceError`.

### Audio
- 351 MP3 trên GitHub Pages: `https://lfskcm2018.github.io/Toeic-lptd/epu-audio/`
- CD1 81 · CD2 92 · CD3 85 · CD4 55 · CD5 38 — mọi URL trả HTTP 206.
- **Không dùng Netlify** (tài khoản hết quota).

## 2. Mapping audio ↔ unit (đọc tay marker trong sách)

Marker = icon tai nghe hồng + nhãn `<CD><số><phần>` (vd `B14a`). Mỗi unit = 1 dải track liên tiếp.

| CD | Unit | Dải track |
|---|---|---|
| A (CD1) | 1–12 | 1–8 · 9–15 · 16–22 · 23–29 · 30–36 · 37–42 · 43–47 · 48–54 · 55–62 · 63–68 · 69–74 · 75–81 → **81** |
| B (CD2) | 13–27 | 1–7 · 8–13 · 14–19 · 20–27 · 28–33 · 34–41 · 42–49 · 50–54 · 55–59 · 60–63 · 64–68 · 69–73 · 74–78 · 79–86 · 87–92 → **92** |
| C (CD3) | 28–43 | 1–6 · 7–12 · 13–18 · 19–23 · 24–28 · 29–31 · 32–37 · 38–43 · 44–49 · 50–53 · 54–56 · 57–62 · 63–67 · 68–73 · 74–78 · 79–85 → **85** |
| D (CD4) | 44–50 + E | 1–6 · 7–10 · 11–14 · 15–18 · 19–22 · 23–26 · 27–30 · E1 31 · E4 32–33 · E5 34–39 · E6 40–52 · E7 53–54 · E8 55 → **55** |
| E (CD5) | E3 | track 1 = intro; sound pair N → track N+1 (1→2 … 37→38) → **38** |

**Tổng 81+92+85+55+38 = 351 ✅ khớp đúng số file MP3.**

### Cách trích marker (bền vững, không phụ thuộc OCR)
1. Render trang PDF (mupdf) → **dải cột** ở x = 0.098–0.158, scale 8.
2. Nhị phân hoá (chữ đen) → tìm các dải hàng có nét.
3. Cắt ảnh, **ghép montage có nhãn** → đọc tay để xác định `<CD><số><phần>`.
4. Đối chiếu tổng số track của từng CD để chốt các đoạn còn mờ.

## 3. Sửa phonetic symbols OCR sai

OCR làm sai IPA (`ɪ→l`, `æ→a`, `θ/ð→0`, `ʃ→S`, `ŋ→n`, `ː→:`). Đã **đọc tay từ ảnh sách**:

- **50 unit**: tiêu đề + âm trọng tâm lấy từ ảnh Mục lục (trang in 5–9).
- **E1 Chart of phonemic symbols**: 4 nhóm · 44 dòng (Short vowels 8 · Long vowels 5 · Diphthongs 7 · Consonants 24).
- **E3 Sound pairs**: 37 cặp, IPA chính xác (đọc bảng index trang in 113).
- **E6 Pronouncing numbers**: 10 nhóm · 52 ví dụ.

## 4. Cấu trúc dữ liệu

```
work/data/epu-lessons.json      ← dataset chuẩn (50 unit + Section E)
work/data/epu-units-meta.js     ← metadata 50 unit (IPA đọc tay)
work/data/epu-track-map.js      ← mapping audio ↔ unit
work/data/epu-section-e.js      ← E1–E8
work/tools/build-epu-data.js    ← sinh epu-lessons.json
work/tools/build-gas-epu.js     ← sinh EPIData.gs (web app riêng)
work/tools/build-main-app-epu.js← sinh EpiData.gs + patch app tổng (idempotent)
work/gas/                        ← web app EPI (Code.gs, EPIData.gs, EPIUI.html, Index.html, Styles.html)
```

## 5. Tài liệu / bàn giao

- `op/ban-giao-epu/` — README, hướng dẫn, checklist, 3 patch, files (data/gas/audio/extract/tools), SHA256SUMS.
- `op/backup_20261112_epu/` — snapshot toàn bộ work/data, work/tools, work/gas.
- `op/BAN-GIAO-TONG-HOP-4-DU-AN-CON.md` — thêm mục 5 (EPI book 9).
- Commit: `8b77634` (lptd-source-epu) · `8c16231` (lptd-content-integration) — đã push.

## 6. Hạn chế còn lại (không chặn release)

- 24/50 unit có **0 câu mẫu** trong dataset (đơn vị tập trung vào âm/nhóm âm — ví dụ U1, U3, U12, U19, U24–U27). Có thể bổ sung bằng key bài tập.
- Câu mẫu lấy từ OCR nên còn nhiễu ở ~10 unit (Section C/D nhiều hội thoại). Cần review tay nếu muốn dùng cho dictation nghiêm ngặt.
- Nút ▶ từng câu đã bỏ (không xác định được track chứa câu đó); thay bằng danh sách track theo unit + “Nghe tuần tự”.
