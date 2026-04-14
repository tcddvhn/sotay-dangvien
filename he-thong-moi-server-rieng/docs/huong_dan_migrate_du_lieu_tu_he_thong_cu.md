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
- Nhap `Danh ba` tu `directory-seed.js` vao DB moi

Ket qua hien tai:

- `directory/tree`: da co 132 don vi cap 1 that tu file seed goc
- `content/tree`: van dang la du lieu mau do chua co file export tu Firestore

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
- `content` hien chua migrate that do repo khong chua `APP_DATA`; du lieu live nam trong Firestore
- Sau khi lay duoc file export live, tool import hien tai da san sang de nap thang vao SQL Server
