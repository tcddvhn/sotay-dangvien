# Huong dan migrate du lieu tu he thong cu

Ngay cap nhat: 2026-04-14

## 1. Muc tieu

Tai lieu nay dung de chuyen du lieu tu he thong cu dang chay tren `Firebase/Firestore` sang he thong moi dung `SQL Server`.

Phan he cu hien co 2 nhom du lieu chinh can migrate:

- `Noi dung so tay`: Firestore `sotay/dulieu`, truong `treeData`
- `Danh ba`: Firestore `sotay/danhba`, truong `treeData`

## 2. Trang thai da lam xong

Da hoan tat:

- Them cot `LegacyId` vao `core.ContentNodes` va `directory.Units`
- Tao migration `AddLegacyIdsForImport`
- Cap nhat DB test `SotayNghiepVu_Test`
- Tao tool import tai `he-thong-moi-server-rieng/tools/import-legacy-data.js`
- Tao script ho tro export Firestore tu browser console tai `he-thong-moi-server-rieng/tools/export-firestore-docs-from-browser-console.js`
- Nhap `Danh ba` live tu file export Firestore vao DB moi
- Nhap `Noi dung so tay` live tu file export Firestore vao DB moi

Ket qua hien tai:

- `directory/tree`: 132 don vi goc, tong 134 don vi
- `content/tree`: 8 muc goc, tong 319 muc
- He thong test khong con du lieu mau o `content` va `directory`

## 3. Cac file va cong cu lien quan

- Tool import: `he-thong-moi-server-rieng/tools/import-legacy-data.js`
- Tool export tu browser: `he-thong-moi-server-rieng/tools/export-firestore-docs-from-browser-console.js`
- Thu muc dat file export: `he-thong-moi-server-rieng/migration-data`

## 4. Cach export du lieu that tu he thong cu

Mo website cu dang doc Firestore.

Mo `Developer Tools -> Console`.

Dan noi dung file:

- `he-thong-moi-server-rieng/tools/export-firestore-docs-from-browser-console.js`

Chay doan script trong console.

Ket qua mong doi:

- tai ve `content-tree.export.json`
- tai ve `directory-tree.export.json`

Sau do chep 2 file vao thu muc:

- `he-thong-moi-server-rieng/migration-data`

## 5. Cach import vao backend moi

Dieu kien:

- backend moi dang chay `Test` o `http://localhost:5243`
- DB `SotayNghiepVu_Test` da update migration

Lenh import day du:

```powershell
node .\he-thong-moi-server-rieng\tools\import-legacy-data.js --updated-by migration-firestore-live
```

Lenh chi import danh ba:

```powershell
node .\he-thong-moi-server-rieng\tools\import-legacy-data.js --skip-content --updated-by migration-directory-only
```

Lenh chi import noi dung:

```powershell
node .\he-thong-moi-server-rieng\tools\import-legacy-data.js --skip-directory --updated-by migration-content-only
```

## 6. Quy tac map du lieu

Tool import dang map nhu sau:

- ID cu dang chuoi nhu `r1`, `n...`, `dir_dv001` duoc doi sang `GUID` xac dinh theo ham bam
- ID cu duoc luu lai o cot `LegacyId`
- `Children` duoc flatten va luu lai theo `ParentId`
- `order` hoac `sortOrder` cu duoc map sang `SortOrder`
- `summary/detail` cu duoc map sang `SummaryHtml/DetailHtml`
- `pdfRefs` hoac `pdfPage` cu duoc map sang `PdfRefsJson`

Loi ich:

- Co the import lap lai nhieu lan ma van giu duoc truy vet nguon cu
- Co the doi chieu ban ghi moi va ban ghi cu khi kiem tra nghiem thu

## 7. Xac nhan sau migrate

Sau khi import, kiem tra:

```powershell
Invoke-RestMethod 'http://localhost:5243/api/content/tree'
Invoke-RestMethod 'http://localhost:5243/api/directory/tree'
```

Can xac nhan:

- so muc goc cua `content`
- so don vi trong `directory`
- mot vai muc co file dinh kem, `pdfRefs`, cap cha/con
- mot vai don vi co `unitCode`, `phone`, `address`, `location`

## 8. Ghi chu quan trong

- `directory-seed.js` chi la nguon fallback trong repo, khong chac chan la du lieu live moi nhat
- Neu he thong cu da sua danh ba tren Firestore, phai uu tien `directory-tree.export.json` tu live system
- `content` va `directory` da duoc import live vao `SotayNghiepVu_Test` ngay 2026-04-14
- Khi can import lai, van dung chinh quy trinh export/import tren

## 9. Ket qua import live ngay 2026-04-14

- Nguon `sotay/dulieu`: `content-tree.export.json`
- Nguon `sotay/danhba`: `directory-tree.export.json`
- Lenh da chay:

```powershell
node .\he-thong-moi-server-rieng\tools\import-legacy-data.js --base-url http://127.0.0.1:5243/api --updated-by migration-firestore-live
```

- Ket qua:
  - `Noi dung`: 319 muc, 8 muc goc
  - `Danh ba`: 134 don vi, 132 don vi goc
