# 🗂️ BẢN SAO LƯU (BACKUP) — THƯ MỤC `op/`

**Ngày tạo:** 10/11/2026  
**Mục đích:** Sao lưu trước khi triển khai LPTD lên Google Apps Script (GAS) — đảm bảo có thể khôi phục nếu cần.

## Nội dung backup

| Thư mục / File | Mô tả |
|----------------|-------|
| `app/` | Mã nguồn module LPTD: `lptd-data.js`, `lptd-ui.js`, `lptd-ui.css`, `Code.lptd.gs`, `LptdData.gs`, `LptdUI.html` |
| `data/` | Dữ liệu đã build: `lptd-lessons.json`, `lptd-stats.json`, `lptd-cdn-manifest.csv` |
| `gas-standalone/` | Bản GAS độc lập (`.clasp.json`, `appsscript.json`, `Code.gs`, `Index.html`, `Styles.html`, `LptdData.gs`, `LptdUI.html`) |
| `integration/` | Hướng dẫn tích hợp: `PATCH-local-study.md`, `PATCH-GAS.md`, `CHECKLIST-TRIEN-KHAI.md` |
| `tools/` | Công cụ: `build-lptd-data.js`, `validate-lptd.js`, `verify-cdn.js`, `serve-lptd.js`, ... |
| `index.html` | App tích hợp sẵn (local) |
| `README.md`, `PLAN-TICH-HOP-LPTD.md`, `REPORT-TICH-HOP-LPTD.md` | Tài liệu dự án |

## Cách khôi phục (rollback)

Nếu cần quay lại trạng thái trước khi deploy GAS:

1. Xoá hoặc đổi tên thư mục `op/` hiện tại.
2. Copy toàn bộ nội dung từ `op/backup_20261110/` về vị trí gốc `op/`.
3. Nếu đã deploy GAS, vào [Apps Script Dashboard](https://script.google.com/home/deployments), chọn project `LPTD 1-4 Standalone` → **Manage deployments** → **Edit** → chọn version cũ → Deploy.

## Lưu ý

- Bản backup này **không chứa file âm thanh (.mp3)** vì audio nằm ngoài thư mục `op/` (thư mục gốc dự án).
- Web app Hackers TOEIC hiện tại (project `LuLuNaNa TOEIC`) **không bị ảnh hưởng** bởi bản backup này.
