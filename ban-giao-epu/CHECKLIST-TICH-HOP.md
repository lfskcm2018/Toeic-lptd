# CHECKLIST TÍCH HỢP — EPI Elementary (book 9)

## A. Server

- [ ] `app/EpiData.gs` (copy từ `files/gas/EpiData.gs`)
- [ ] `app/EpiServer.gs` (copy từ `files/gas/EpiServer.gs`)
- [ ] `app/LptdServer.gs`: thêm `epiLessons` + `epiMeta` trong `getLptdBootstrap()`
- [ ] `EPI_BOOK = 9`
- [ ] `EPI_AUDIO_CDN_BASE` trỏ `https://lfskcm2018.github.io/Toeic-lptd/epu-audio`

## B. Client

- [ ] `app/lptd-data.js`: thêm book 9 vào `BOOKS`
- [ ] `app/lptd-ui.js`: `apply()` concat `res.epiLessons`
- [ ] `app/lptd-ui.js`: `injectSidebarButton()` thêm entry EPI
- [ ] `app/lptd-ui.js`: panel EPI trong `renderUnit()` + bind `.epi-track-btn` / `.epi-reveal`
- [ ] `app/lptd-ui.js`: `ensureEpiCss()`
- [ ] `app/lptd-ui.js`: sửa `function openLibrary(book)` (bug có sẵn)
- [ ] Nhãn tổng: “LPTD 1–9 · 311 unit”

## C. Build & deploy

- [ ] `node tools/build-lptdui-integrated.js` → `app/LptdUI.html`
- [ ] `clasp push`
- [ ] `clasp deploy -m "…"`
- [ ] Nếu lỗi 20 deployment: `clasp list-deployments` + `clasp delete-deployment <id>`

## D. Test E2E

- [ ] `getLptdBootstrap()` → `epiLessonCount = 58`
- [ ] Sidebar có nhánh “EPI Elementary”
- [ ] Thư viện → tab EPI → 58 unit
- [ ] Unit 15 → panel CD B · track 14–19 · 6 nút track + 3 bài tập có đáp án
- [ ] Audio 206 cho CD1-Track01, CD2-Track92, CD3-Track85, CD4-Track55, CD5-Track38
- [ ] Regression: 253 unit cũ không đổi, tổng 311
- [ ] Dictation + Shadowing book cũ vẫn chạy
- [ ] Web app EPI riêng (deploy @18): 50 unit + Section E, E1/E3/E6 render đúng

## E. Bàn giao

- [ ] `SHA256SUMS.txt` cập nhật
- [ ] `op/BAN-GIAO-TONG-HOP-4-DU-AN-CON.md` bổ sung mục EPI (book 9)
- [ ] Commit + push nhánh nguồn `lptd-source-epu`
