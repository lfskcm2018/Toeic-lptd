# DICTATION PART 2 — nguồn nội dung mới

> **Nguồn gốc:** `E:\CÁ NHÂN\03. Quyet.nv\29. Học chép chính tả TOEIC\Dictation Part 2`
> **Nhánh:** `lptd-source-dictation-part2`
> **Ngày khảo sát:** 2026-11-12
> **Trạng thái:** Dữ liệu + audio đã chuẩn hoá và kiểm chứng; web app GAS riêng là bước tiếp theo.

---

## 1. Nguồn gồm những gì?

| Hạng mục | Giá trị |
|---|---|
| PDF | `파트2 출제표현 정리집.pdf` — 64 trang, song ngữ Anh–Hàn |
| Audio | 11 file MP3 (~25,4 MB) |
| Chuyên đề | 11 (When, Where, Who, Why, Which, What, How, General/Tag/Indirect, Suggestions/Offers, Declarative, Alternative) |
| Nội dung | **238 cặp Q/A · 476 dòng · 3.166 từ** |
| ID unit | `dp2-1-01` … `dp2-1-11` |
| Audio CDN | `https://toeic-audio.netlify.app/audio/dictation-part2/DP2U01.mp3` … `DP2U11.mp3` |

---

## 2. Cấu trúc thư mục

```
Dictation Part 2/
├─ 파트2 출제표현 정리집.pdf       ← PDF gốc (copy từ thư mục nguồn)
├─ MP3/                             ← 11 MP3 gốc, tên tiếng Hàn
├─ dictation-part2-lessons.json     ← DỮ LIỆU CHUẨN (11 unit)
├─ dictation-part2-meta.json        ← metadata/tổng hợp
├─ dictation-part2-source.json      ← inventory nguồn + SHA256
├─ dictation-part2-lessons-data.js  ← window.DP2_* cho bản local
├─ dictation-part2-lessons.js       ← bản tương thích LPTD_* (legacy)
├─ audio-cdn/
│  ├─ upload-manifest.json          ← 11 URL + size + SHA256
│  └─ upload-manifest.csv
├─ extract/dp2-raw.txt              ← text PDF đã trích (audit)
├─ gas/
│  ├─ DP2Data.gs                    ← DP2_LESSONS_META / DP2_LESSONS (không wrapper LPTD)
│  └─ Code.dp2.gs                   ← helper server + debug
├─ tools/
│  ├─ build-dp2-data.js             ← sinh lại toàn bộ dữ liệu từ PDF + MP3
│  └─ deploy-audio-merged.js        ← deploy Netlify an toàn (giữ Hacker 1/LPTD)
└─ reports/
   ├─ PROGRESS.md
   ├─ DATA-QUALITY.md
   ├─ CHECKLIST-DEPLOY.md
   └─ last-audio-deploy.json
```

---

## 3. Lệnh thường dùng

```powershell
# Sinh lại dữ liệu từ PDF gốc
node "op/Tích hợp nội dung mới/Dictation Part 2/tools/build-dp2-data.js"

# Deploy audio (giữ nguyên các nguồn khác trên Netlify)
node "op/Tích hợp nội dung mới/Dictation Part 2/tools/deploy-audio-merged.js"
```

---

## 4. Quy ước audio

- Tên gốc tiếng Hàn **không dùng làm URL** (Unicode NFD/NFC + chữ hoa/thường gây 404).
- Tên CDN chuẩn: `DP2U01.mp3` … `DP2U11.mp3`.
- `audioFileName` vẫn giữ tên gốc để đối chiếu; `localPath` trỏ file gốc; `cdnName` là tên ASCII.
- Site Netlify `toeic-audio` dùng chung: **luôn deploy bằng `deploy-audio-merged.js`**, không upload riêng một thư mục.

---

## 5. Trạng thái & việc tiếp theo

Đã xong:

- [x] Khảo sát PDF/MP3, đối chiếu 100% nội dung.
- [x] Chuẩn hoá dữ liệu + sửa tên audio sang ASCII.
- [x] Deploy audio hợp nhất (Hacker 1 + DP2 + LPTD), kiểm tra 41 URL → 206.
- [x] Sinh GAS data + server helper.

Tiếp theo:

- [ ] Dựng web app GAS riêng cho Dictation Part 2 (UI dictation + shadowing).
- [ ] E2E: 11 unit, audio, dictation, shadowing, điều hướng.
- [ ] Backup + folder bàn giao cho AI dự án tổng (book 6).
