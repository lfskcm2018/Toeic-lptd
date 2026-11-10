# CHECKLIST TRIỂN KHAI — LPTD 1–4

> Dùng checklist này cho cả bản local và Google Apps Script.
> Đánh dấu `[x]` khi đã kiểm tra thực tế.

---

## A. Chuẩn bị (1 lần)

- [ ] Node.js ≥ 18 (`node -v`).
- [ ] Đã có thư mục `op/` với đầy đủ file.
- [ ] Có nguồn `Agnes/data/lptd-lessons.json` (chỉ cần khi build lại dữ liệu).
- [ ] Có thư mục audio local `Listening Practice Through Dictation/` (chỉ cần cho chế độ local).

### Kiểm tra artefact

```bash
node op/tools/validate-lptd.js
node op/tools/test-gas-lptd.js
node op/tools/verify-cdn.js
```

- [ ] `validate-lptd` → PASS, 160 unit / 160 MP3 local.
- [ ] `test-gas-lptd` → PASS 13/13.
- [ ] `verify-cdn` → PASS 160/160.

---

## B. Triển khai bản local

### B1. Chạy server có HTTP Range

```bash
node op/tools/serve-lptd.js
```

- [ ] Server báo cổng 8096.
- [ ] Mở `http://localhost:8096/op/index.html`.

> `node server.js` (8095) vẫn dùng được nhưng **không tua được audio local**.
> Khi đó player hiện nút **⚡ Chuyển sang CDN**.

### B2. Kiểm thử giao diện

- [ ] Sidebar có nút **📚 LPTD 1–4**.
- [ ] Bấm nút → thư viện hiển thị, 4 tab cuốn.
- [ ] Mỗi cuốn đủ 40 unit; tìm kiếm theo tên/số hoạt động.
- [ ] Tài liệu PDF mở được ở bản local.
- [ ] Mở Unit 01 (LPTD 1) → audio phát.
- [ ] Seek kéo được; thời gian `0:xx` cập nhật.
- [ ] Đổi tốc độ 0.75x / 1.0x / 1.25x.
- [ ] **🔁 Phát lại 3 lần** chạy đúng.
- [ ] Dictation: điền đúng/sai → highlight xanh/đỏ.
- [ ] **Kiểm tra đáp án** hiện điểm %.
- [ ] **Xem đáp án** mở transcript, ô nhập chuyển read-only.
- [ ] **Gợi ý** hiện chữ cái đầu/cuối + độ dài.
- [ ] Shadowing: 🎙 ghi âm → ▶ nghe lại → 🗣 chấm %.
- [ ] Tiến độ unit hiển thị (`📝 x% · 🗣 y%`) và giữ sau khi tải lại trang.
- [ ] Nút **Xóa từ sai** hoạt động.
- [ ] Quay lại thư viện → tiến độ cuốn cập nhật.

### B3. Không hồi quy

- [ ] Bấm **DAY 01** → Hackers dictation hiển thị, player/tab/footer trở lại.
- [ ] Bấm **ETS 2026** → thư viện ETS mở bình thường.
- [ ] Bấm **Ôn từ sai** → danh sách từ sai hiển thị.
- [ ] Không có lỗi đỏ trong Console.

### B4. Responsive

- [ ] Ở ~375px: thư viện 1 cột, không tràn ngang.
- [ ] Player và ô điền không bị cắt.
- [ ] Nút bấm đủ lớn để chạm.

> Đã đo tự động trong iframe 375px: `scrollWidth == clientWidth` ở cả thư viện và unit.

---

## C. Triển khai Google Apps Script

### C1. Thêm file

- [ ] Tạo script `LptdData.gs` ← `op/app/LptdData.gs`.
- [ ] Tạo script `Code.lptd.gs` ← `op/app/Code.lptd.gs`.
- [ ] Tạo HTML `LptdUI.html` ← `op/app/LptdUI.html`.

### C2. Include

- [ ] Trong `Index.html`, thêm `<?!= include('LptdUI'); ?>` sau `include('JavaScript')`.

### C3. Kiểm tra backend

- [ ] Chạy `debugLptd` trong Editor → log 160 unit, CDN base đúng.
- [ ] (Tùy chọn) chạy `debugLptdAllUrls` → 160/160 HTTP 206.

### C4. Deploy

- [ ] **Manage deployments → Edit → New version → Deploy**.
- [ ] Mở URL Web App, `Ctrl + F5`.
- [ ] Nút LPTD xuất hiện.
- [ ] Audio phát từ `toeic-audio.netlify.app`.
- [ ] Seek được (Network thấy `206`).
- [ ] Dictation + Shadowing chạy.
- [ ] Chuyển DAY/ETS/Ôn từ sai bình thường.
- [ ] Console không lỗi.

### C5. Settings tùy chọn

- [ ] (Nếu đổi CDN) thêm `LPTD_AUDIO_CDN_BASE` vào Sheet `Settings`.
- [ ] (Nếu có PDF trên CDN) thêm `LPTD_DOCS_CDN_BASE`.
- [ ] Tải lại trang, kiểm tra nút PDF bật/tắt đúng.

---

## D. Sau go-live

- [ ] Sao lưu project Apps Script (bản đang chạy tốt).
- [ ] Ghi lại version deployment đã dùng.
- [ ] Theo dõi băng thông Netlify (160 MP3, chỉ tải khi nghe).
- [ ] Kiểm tra định kỳ `verify-cdn` nếu CDN thay đổi.
- [ ] Khi sửa dữ liệu: chạy lại build + validate trước khi deploy.

---

## E. Tiêu chí dừng / rollback

Rollback ngay nếu:

- Bấm LPTD làm hỏng Hackers/ETS.
- Audio không phát hoặc seek lỗi trên CDN.
- Có lỗi console lặp lại.

Cách rollback:

1. Local: xoá 5 dòng patch trong `local-study.html` (hoặc dùng lại bản gốc).
2. GAS: xoá include + 3 file, deploy version trước.
3. Không cần xoá dữ liệu localStorage/Sheet.

Chi tiết: `op/integration/PATCH-local-study.md`, `op/integration/PATCH-GAS.md`.
