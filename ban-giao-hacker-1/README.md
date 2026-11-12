# BÀN GIAO — HACKER 1 (Hackers TOEIC 1000 LC)

> **Đối tượng:** AI/dev phụ trách **dự án tổng** (Hackers TOEIC 700+ / ETS 2026 / LPTD 1–4).
> **Mục tiêu:** tích hợp nguồn **Hacker 1** (10 TEST × 3 track = 30 track) vào dự án tổng dưới dạng **book 5** của module LPTD, không phá vỡ dữ liệu/tính năng hiện có.
> **Ngày bàn giao:** 2026-11-12
> **Trạng thái nguồn:** E2E PASS trên web app GAS riêng (deployment @4).

---

## 1. Bàn giao gồm những gì?

```
op/ban-giao-hacker-1/
├─ README.md                         ← file này (index + manifest)
├─ HUONG-DAN-AI-TICH-HOP.md          ← HƯỚNG DẪN CHÍNH, đọc trước khi sửa
├─ CHECKLIST-TICH-HOP.md             ← checklist thực thi + tiêu chí Done
├─ SHA256SUMS.txt                    ← hash toàn bộ file bàn giao
├─ patches/
│  ├─ 01-SERVER-CODE.md              ← sửa LptdServer.gs (bootstrap) + thêm helper
│  ├─ 02-CLIENT-UI.md                ← sửa lptd-data.js + lptd-ui.js + build LptdUI.html
│  └─ 03-LOCAL-DATA.md               ← nạp dữ liệu cho bản local (local-study.html)
└─ files/
   ├─ data/
   │  ├─ hacker-1-lessons.json       ← 30 lesson chuẩn (id hacker1-tNN-pYY)
   │  ├─ hacker-1-lessons-data.js    ← window.HACKER1_LESSONS cho bản local
   │  ├─ hacker1-local-glue.js       ← nối 30 track vào LPTD_LESSONS_RAW (book 5)
   │  ├─ hacker-1-meta.json          ← thống kê nguồn
   │  └─ hacker-1-source.json        ← inventory nguồn/audio gốc
   ├─ gas/
   │  ├─ Hacker1Data.gs              ← dữ liệu cho GAS (CHỈ HACKER1_*, không có wrapper LPTD_*)
   │  ├─ Code.hacker1.gs             ← helper server: book 5 + cdnUrl + debug
   │  └─ LptdUI.hacker1-reference.html ← UI standalone đã rebrand (CHỈ THAM KHẢO)
   ├─ audio/
   │  ├─ hacker1-cdn-manifest.json   ← 30 URL + size + sha256
   │  ├─ upload-manifest.json
   │  └─ upload-manifest.csv
   └─ tools/
      ├─ build-hacker1-data.js       ← rebuild dữ liệu từ JSON nguồn
      └─ build-lptdui-integrated.js  ← ghép app/lptd-data.js + app/lptd-ui.js → app/LptdUI.html
```

---

## 2. Thông tin nhanh

| Hạng mục | Giá trị |
|---|---|
| Nguồn | `Hackers TOEIC 1000 1 LC 3rd workbook` |
| Số track | **30** (10 TEST × Part 1-2 / Part 3 / Part 4) |
| Nội dung | **186 câu · 2.559 từ**, 0 bài rỗng |
| ID lesson | `hacker1-t01-p12` … `hacker1-t10-p4` |
| Book khi tích hợp | **5** (LPTD đang dùng 1–4) |
| Audio CDN | `https://toeic-audio.netlify.app/audio/hacker1/<cdnName>` (HTTP 200/206) |
| Script Property (tùy chọn) | `HACKER1_AUDIO_CDN_BASE` |
| Standalone tham chiếu | Deployment @4 — xem `HUONG-DAN-AI-TICH-HOP.md` mục 8 |
| Git nguồn | nhánh `lptd-source-hacker-1`, commit `c56903d` |

---

## 3. Đường dẫn tích hợp

| Đường dẫn | Dùng khi | File cần dùng |
|---|---|---|
| **A. Tích hợp vào module LPTD của app tổng** (khuyến nghị) | App GAS tổng đã có module LPTD 1–4 | `files/gas/Hacker1Data.gs`, `files/gas/Code.hacker1.gs`, patches 01+02 |
| **B. Chạy local** | `local-study.html` | `files/data/hacker-1-lessons-data.js`, patch 03 |

> ⚠️ **Không dùng** `files/gas/LptdUI.hacker1-reference.html` cho app tổng: đây là bản standalone **auto-open**, đã đổi thương hiệu thành Hacker 1 và bỏ LPTD 1–4. Chỉ dùng để đối chiếu hành vi/UI.

---

## 4. Đọc gì trước?

1. `HUONG-DAN-AI-TICH-HOP.md` — kiến trúc + các bước tích hợp.
2. `patches/01-SERVER-CODE.md` — sửa server.
3. `patches/02-CLIENT-UI.md` — sửa UI + build bundle.
4. `CHECKLIST-TICH-HOP.md` — tick từng bước, không bỏ qua mục "Không phá LPTD 1–4".

---

## 5. Nguyên tắc bất di bất dịch

1. **Không sửa core Hackers/ETS** nếu không cần thiết; Hacker 1 chỉ là book 5 trong module LPTD.
2. **Không copy wrapper** `LPTD_LESSONS_META()/LPTD_LESSONS()` từ bản standalone — sẽ ghi đè 160 unit LPTD.
3. **Không deploy chồng** lên deployment đang chạy khi chưa test; tạo deployment mới sau khi sửa.
4. **Audio dùng CDN**, không nhúng base64/file vào GAS.
5. Netlify là site dùng chung: mọi lần deploy audio phải dùng **manifest hợp nhất**, tránh xoá `/audio/lptd`, `/audio/ets`, `/audio/hackers`.

---

## 6. Rollback

- Code: `git revert` commit tích hợp (hoặc bỏ file `Hacker1Data.gs`, revert `LptdServer.gs`, `lptd-data.js`, `lptd-ui.js`, rebuild `LptdUI.html`).
- GAS: Manage deployments → chọn version trước đó → Deploy.
- Dữ liệu người dùng (progress) không bị ảnh hưởng vì book 5 dùng key riêng `5-<unit>` trong `toeic_lptd_progress`.
