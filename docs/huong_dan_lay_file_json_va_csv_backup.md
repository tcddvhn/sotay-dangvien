# Huong dan lay file JSON va CSV cho backup

Ngay cap nhat: 2026-04-15

## 1. Muc tieu

Tai lieu nay dung de lay 3 nhom file con thieu cho bo backup:

- `sotay_dulieu.json`
- `sotay_thongke.json`
- `auth_users.csv`

Neu he thong dang co doc danh ba rieng trong Firestore, lay them:

- `sotay_danhba.json`

## 2. Lay file JSON tu Firestore

## Cach de nhat

Lam truc tiep tren trinh duyet dang mo he thong that.

### Buoc 1

Mo he thong that tren trinh duyet.

### Buoc 2

Nhan `F12` -> chon tab `Console`.

### Buoc 3

Neu trinh duyet hien canh bao dan code, go:

```text
allow pasting
```

roi nhan `Enter`.

### Buoc 4

Dan doan code sau vao `Console` va nhan `Enter`:

```javascript
(async () => {
  const db = firebase.firestore();

  async function exportDoc(collectionName, docId, fileName) {
    const snap = await db.collection(collectionName).doc(docId).get();
    if (!snap.exists) {
      console.warn(`Khong tim thay ${collectionName}/${docId}`);
      return;
    }

    const payload = {
      path: `${collectionName}/${docId}`,
      exportedAt: new Date().toISOString(),
      data: snap.data()
    };

    const blob = new Blob(
      [JSON.stringify(payload, null, 2)],
      { type: 'application/json;charset=utf-8' }
    );
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    console.log(`Da tai ${fileName}`);
  }

  await exportDoc('sotay', 'dulieu', 'sotay_dulieu.json');
  await exportDoc('sotay', 'thongke', 'sotay_thongke.json');
  await exportDoc('sotay', 'danhba', 'sotay_danhba.json');
})();
```

### Buoc 5

Sau khi trinh duyet tai file ve, chep file vao:

- [firestore](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\backups\backup-truoc-phan-quyen-20260415-1030\firestore)

Can co toi thieu:

- `sotay_dulieu.json`
- `sotay_thongke.json`

Neu `sotay_danhba.json` tai duoc thi chep vao cung thu muc nay.

## 3. Lay file CSV danh sach Firebase Auth users

## Cach uu tien

Dung `Firebase CLI`.

### Dieu kien

May can co:

- `Node.js`
- `Firebase CLI`
- dang nhap duoc vao dung Firebase project

### Buoc 1

Mo `PowerShell`.

### Buoc 2

Kiem tra `firebase`:

```powershell
firebase --version
```

Neu may bao chua co lenh `firebase`, cai bang:

```powershell
npm install -g firebase-tools
```

### Buoc 3

Dang nhap:

```powershell
firebase login
```

### Buoc 4

Xuat user ra CSV:

```powershell
firebase auth:export "C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\backups\backup-truoc-phan-quyen-20260415-1030\firebase-auth\auth_users.csv" --project sotay-dangvien --format=csv
```

### Buoc 5

Kiem tra file da ton tai tai:

- [auth_users.csv](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\backups\backup-truoc-phan-quyen-20260415-1030\firebase-auth\auth_users.csv)

## 4. Neu khong dung duoc Firebase CLI

Neu chua dung duoc CLI, co 2 lua chon:

### Lua chon A

Nho nguoi co quyen Firebase Console / Firebase CLI xuat dum `auth_users.csv`.

### Lua chon B

Tam thoi tao file ghi chu doi chieu thu cong, nhung can hieu ro:

- cach nay khong du chat de rollback auth day du

File tam thoi co the dat ten:

```text
firebase-auth/auth_users_tam_thoi.csv
```

Noi dung toi thieu:

- `uid`
- `email`
- `disabled`
- `displayName`

## 5. Sau khi lay xong

Khi anh/chị da co du:

- `sotay_dulieu.json`
- `sotay_thongke.json`
- `auth_users.csv`

thi nhan cho toi dung cau:

```text
Toi da bo sung du file con thieu cho backup hien tai, kiem tra va chot lai manifest
```

Luc do toi se:

- kiem tra file
- cap nhat `backup_manifest.json`
- doi `backupReadyForRestore` thanh `true`

## 6. Luu y quan trong

- File `auth_users.csv` khong chua mat khau plain text.
- File JSON Firestore can giu nguyen noi dung, khong mo bang Word hoac Excel de sua.
- Sau khi tai ve, nen doi chieu kich thuoc file va mo nhanh bang Notepad/VS Code de chac chan file khong rong.
