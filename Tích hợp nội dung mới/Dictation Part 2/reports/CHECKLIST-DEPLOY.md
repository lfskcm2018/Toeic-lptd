# CHECKLIST DEPLOY — DICTATION PART 2

## A. Audio (đã xong)

- [x] Upload alias ASCII `DP2U01.mp3` … `DP2U11.mp3` lên Netlify.
- [x] Khôi phục Hacker 1 (`/audio/hacker1`) trong cùng deploy.
- [x] Kiểm tra 41 URL → HTTP 206.
- [x] Manifest: `audio-cdn/upload-manifest.json` + `.csv`.

## B. Web app GAS riêng

- [x] Tạo project Apps Script mới (Script ID `1r0RFaKVQDWZVTrdnVQOwsGuckt7cdKBz-3nAuSP8e11Rn34-pbLVfaAN`).
- [x] Push 7 file (`Code.gs`, `Code.dp2.gs`, `DP2Data.gs`, `Index.html`, `Styles.html`, `LptdUI.html`, `appsscript.json`).
- [ ] Uỷ quyền scope trong Editor (chạy `debugLptd()` hoặc `authorizeLptdDrive()`).
- [ ] Deploy version mới sau uỷ quyền.
- [ ] E2E: 11 unit, audio 206, dictation, shadowing, điều hướng, console sạch.

## C. Backup & bàn giao (chưa làm)

- [ ] Backup nguồn (`op/backup_YYYYMMDD_dp2`).
- [ ] Folder bàn giao (`op/ban-giao-dp2`) + patches + README + SHA256SUMS.
- [ ] Git tag `backup/dp2-YYYY-MM-DD`.

## D. Tích hợp dự án tổng (chưa làm)

- [ ] Server: thêm `DP2Data.gs`, helper `Code.dp2.gs`, patch `getLptdBootstrap()` (book 6).
- [ ] Client: thêm book 6, `L.get()` fallback, `apply(res)` concat `dp2Lessons`.
- [ ] Build `LptdUI.html`, deploy GAS mới, kiểm tra 6 nguồn không regression.
