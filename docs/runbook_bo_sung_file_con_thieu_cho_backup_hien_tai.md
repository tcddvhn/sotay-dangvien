# Runbook bo sung file con thieu cho backup hien tai

Ngay cap nhat: 2026-04-15

## 1. Muc tieu

Tai lieu nay dung de bo sung 3 file con thieu cho bo backup:

- `firestore/sotay_dulieu.json`
- `firestore/sotay_thongke.json`
- `firebase-auth/auth_users.csv`

Bo backup muc tieu:

- [backup-truoc-phan-quyen-20260415-1030](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\backups\backup-truoc-phan-quyen-20260415-1030)

## 2. Firestore export

### Buoc 1

Mo he thong that tren trinh duyet, nhan `F12`, vao `Console`.

### Buoc 2

Neu trinh duyet can, go:

```text
allow pasting
```

### Buoc 3

Mo file:

- [export-firestore-docs-from-browser-console.js](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\backups\backup-truoc-phan-quyen-20260415-1030\tools\export-firestore-docs-from-browser-console.js)

Copy toan bo noi dung, dan vao Console va Enter.

### Buoc 4

Khi trinh duyet tai ve file, chep vao thu muc:

- [firestore](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\backups\backup-truoc-phan-quyen-20260415-1030\firestore)

Ten file can co:

- `sotay_dulieu.json`
- `sotay_thongke.json`
- `sotay_danhba.json` neu he thong da co doc danh ba rieng

Neu script tai ve ten khac, doi ten file cho dung ten tren.

## 3. Firebase Auth export

## Cach uu tien

Dung Firebase CLI hoac Firebase Admin SDK neu moi truong co san.

File dau ra can dat ten:

- `auth_users.csv`

Va chep vao:

- [firebase-auth](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\backups\backup-truoc-phan-quyen-20260415-1030\firebase-auth)

## Neu chua export duoc ngay

Toi thieu can lap 1 file tam ghi ro:

- so luong user
- danh sach email admin quan trong
- ghi chu nguon tai khoan Google/Firebase dang quan ly

Nhung de rollback day du, van nen co `auth_users.csv`.

## 4. Kiem tra sau khi bo sung

Can xac nhan 3 file sau ton tai:

- [sotay_dulieu.json](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\backups\backup-truoc-phan-quyen-20260415-1030\firestore\sotay_dulieu.json)
- [sotay_thongke.json](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\backups\backup-truoc-phan-quyen-20260415-1030\firestore\sotay_thongke.json)
- [auth_users.csv](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\backups\backup-truoc-phan-quyen-20260415-1030\firebase-auth\auth_users.csv)

## 5. Viec phai cap nhat sau cung

Sau khi da chep du file, cap nhat file:

- [backup_manifest.json](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\backups\backup-truoc-phan-quyen-20260415-1030\manifest\backup_manifest.json)

Can sua:

- `backupReadyForRestore = true`
- `firestoreDocumentsIncluded = true`
- `firebaseAuthExportIncluded = true`
- xoa cac muc da hoan tat trong `requiredMissingFiles`

## 6. Cach thong bao cho Codex sau khi bo sung xong

Chi can nhan:

```text
Toi da bo sung du file con thieu cho backup hien tai, kiem tra va chot lai manifest
```

Luc do toi se kiem tra file, cap nhat manifest, va chot backup nay sang trang thai san sang rollback.
