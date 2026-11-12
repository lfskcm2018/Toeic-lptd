# ENGLISH PRONUNCIATION IN USE — ELEMENTARY (dự án con)

> **Nguồn gốc:** `E:\CÁ NHÂN\03. Quyet.nv\29. Học chép chính tả TOEIC\English Pronunciation in Use Elementary [1999]`  
> **Nhánh:** `lptd-source-epu`  
> **Trạng thái:** MVP Section A (Units 1–10) + CD1 audio — E2E PASS.

> ⚠️ Folder này là **bản làm việc có version control**. PDF gốc (44,7 MB) và 351 MP3 **không** commit vì quá lớn — chúng nằm ở folder nguồn ở trên.  
> Audio đã được đẩy lên GitHub Pages: `https://lfskcm2018.github.io/Toeic-lptd/epu-audio` (81 file CD1).

## Cấu trúc

```
English Pronunciation in Use Elementary/
├─ .gitignore
└─ work/
   ├─ gas/                  ← web app GAS (Code.gs, EPIData.gs, EPIUI.html, Index.html, Styles.html)
   ├─ ocr/                  ← text OCR từng trang (Units 1–10 + Key)
   ├─ reports/              ← PROGRESS.md, DATA-QUALITY.md, CHECKLIST-E2E.md
   └─ tools/                ← OCR + deploy audio
```

## Web app GAS riêng (MVP)

| Hạng mục | Giá trị |
|---|---|
| Script ID | `1uamRFmYlNanNmc57OqzPjnGEQ_z02UMa6w7wwVYC7qsGB6FbsuPEwOgG` |
| Deploy @14 | `AKfycbxlTm4XHUmB4JLPe-KBgXrs6VguapvFpxuSj_pGsG7e5EEVVMxeiOPhtYUGwiMIWZdq` |
| Link | https://script.google.com/macros/s/AKfycbxlTm4XHUmB4JLPe-KBgXrs6VguapvFpxuSj_pGsG7e5EEVVMxeiOPhtYUGwiMIWZdq/exec |
| Nội dung | 10 units · 84 câu mẫu · 30 exercises |
| Audio | `https://lfskcm2018.github.io/Toeic-lptd/epu-audio/CD1-Track01.mp3` … `CD1-Track81.mp3` |

## Lệnh

```powershell
# OCR trang 10–29 (Units 1–10) và 138–142 (Key)
node "op/Tích hợp nội dung mới/English Pronunciation in Use Elementary/work/tools/ocr-epu.mjs" 10 29
node "op/Tích hợp nội dung mới/English Pronunciation in Use Elementary/work/tools/ocr-key.mjs" 138 142

# Deploy audio lên Netlify (đang bị chặn credit) / GitHub Pages (đang dùng)
node "op/Tích hợp nội dung mới/English Pronunciation in Use Elementary/work/tools/deploy-audio-epu.js"

# Push web app
cd "op/Tích hợp nội dung mới/English Pronunciation in Use Elementary/work/gas"
clasp push --force && clasp deploy --description "..."
```

## Giai đoạn tiếp theo

1. Units 11–27 + CD2
2. Section B/C/D (Units 28–50) + CD3/CD4
3. Section E + CD5
4. Backup + handover (book 9) sau khi đủ 50 units
