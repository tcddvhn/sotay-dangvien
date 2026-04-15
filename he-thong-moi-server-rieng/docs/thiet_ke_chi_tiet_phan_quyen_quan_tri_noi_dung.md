# Thiet ke chi tiet phan quyen quan tri noi dung

Ngay lap: 2026-04-15

## 1. Pham vi tai lieu

Tai lieu nay di sau mot muc so voi bao cao tong quan, de mo ta:

- cau truc collection Firestore
- mau document
- logic phan quyen theo node
- Firestore Rules de xuat
- giao dien quan tri `Tai khoan va phan quyen`
- lo trinh migrate tu du lieu hien tai

Tai lieu nay ap dung cho he thong that dang dung trong thu muc goc.

## 2. Mo hinh du lieu de xuat

## 2.1. Collection `content_nodes`

Moi node noi dung la 1 document rieng.

Duong dan:

```text
content_nodes/{nodeId}
```

Field bat buoc:

- `id`: string
- `title`: string
- `tag`: string
- `summary`: string
- `detail`: string
- `level`: number
- `parentId`: string | null
- `sortOrder`: number
- `isActive`: boolean
- `isDeleted`: boolean
- `pathIds`: string[]
- `pathTitles`: string[]
- `createdAt`: timestamp
- `createdByUid`: string
- `createdByName`: string
- `updatedAt`: timestamp
- `updatedByUid`: string
- `updatedByName`: string

Field mo rong nen co:

- `rootNodeId`: string
- `searchText`: string
- `childCount`: number
- `allowPublicView`: boolean

Mau document:

```json
{
  "id": "node_phan_2",
  "title": "PHẦN 2: CÔNG TÁC ĐẢNG VIÊN",
  "tag": "dang-vien",
  "summary": "<p>...</p>",
  "detail": "<p>...</p>",
  "level": 0,
  "parentId": null,
  "sortOrder": 2,
  "isActive": true,
  "isDeleted": false,
  "pathIds": ["node_phan_2"],
  "pathTitles": ["PHẦN 2: CÔNG TÁC ĐẢNG VIÊN"],
  "rootNodeId": "node_phan_2",
  "searchText": "phan 2 cong tac dang vien",
  "childCount": 14,
  "createdAt": "serverTimestamp",
  "createdByUid": "uid_admin",
  "createdByName": "admin",
  "updatedAt": "serverTimestamp",
  "updatedByUid": "uid_admin",
  "updatedByName": "admin"
}
```

## 2.2. Collection `admin_users`

Duong dan:

```text
admin_users/{uid}
```

Field de xuat:

- `uid`
- `username`
- `displayName`
- `email`
- `role`
- `status`
- `avatarColor`
- `phone`
- `note`
- `createdAt`
- `createdByUid`
- `lastLoginAt`

Gia tri `role`:

- `super_admin`
- `editor`

Gia tri `status`:

- `active`
- `locked`

Mau document:

```json
{
  "uid": "uid_editor_a",
  "username": "nguyenvana",
  "displayName": "Nguyen Van A",
  "email": "nguyenvana@sotay.com",
  "role": "editor",
  "status": "active",
  "avatarColor": "#b30f14",
  "phone": "09xxxxxxxx",
  "note": "Phu trach Phan 2",
  "createdAt": "serverTimestamp",
  "createdByUid": "uid_admin",
  "lastLoginAt": "serverTimestamp"
}
```

## 2.3. Collection `content_permissions`

Toi de xuat dung collection doc lap de de query va de viet Rules.

Duong dan:

```text
content_permissions/{permissionId}
```

Quy uoc `permissionId`:

```text
{uid}_{nodeId}
```

Field:

- `permissionId`
- `uid`
- `nodeId`
- `nodeTitle`
- `rootNodeId`
- `allowRead`
- `allowCreateChild`
- `allowEdit`
- `allowDelete`
- `maxDepthAllowed`
- `inheritToDescendants`
- `grantedAt`
- `grantedByUid`
- `grantedByName`
- `updatedAt`

Mau document:

```json
{
  "permissionId": "uid_editor_a_node_phan_2",
  "uid": "uid_editor_a",
  "nodeId": "node_phan_2",
  "nodeTitle": "PHẦN 2: CÔNG TÁC ĐẢNG VIÊN",
  "rootNodeId": "node_phan_2",
  "allowRead": true,
  "allowCreateChild": true,
  "allowEdit": true,
  "allowDelete": false,
  "maxDepthAllowed": 5,
  "inheritToDescendants": true,
  "grantedAt": "serverTimestamp",
  "grantedByUid": "uid_admin",
  "grantedByName": "admin",
  "updatedAt": "serverTimestamp"
}
```

## 2.4. Collection `content_audit_logs`

Nen co neu anh/chị muon doi chieu sau nay.

Duong dan:

```text
content_audit_logs/{logId}
```

Field:

- `nodeId`
- `action`
- `beforeSnapshot`
- `afterSnapshot`
- `changedAt`
- `changedByUid`
- `changedByName`

`action`:

- `create`
- `update`
- `delete`
- `move`
- `grant_permission`
- `revoke_permission`

## 3. Logic phan quyen

## 3.1. Luat tong quat

### `super_admin`

- duoc tao `level 0`
- duoc CRUD moi node
- duoc sap xep, doi cap, di chuyen nhanh
- duoc tao user, khoa user, cap quyen

### `editor`

- khong duoc tao `level 0`
- khong duoc thao tac ngoai nhanh duoc giao
- khong duoc tao node co `level > 5`
- chi duoc thao tac khi permission hop le

## 3.2. Dieu kien 1 node duoc phep sua

Node `N` hop le cho user `U` neu:

1. `U` la `super_admin`

hoac

2. ton tai `content_permissions` cua `U` tai 1 node `P` ma:
   - `allowEdit = true`
   - `inheritToDescendants = true`
   - `P.nodeId` nam trong `N.pathIds`
   - `N.level <= maxDepthAllowed`

## 3.3. Dieu kien tao node con

Editor duoc them node con duoi node `N` khi:

- co permission `allowCreateChild = true`
- `N.level < 5`
- node moi co `level = N.level + 1`

## 3.4. Dieu kien xoa

Editor duoc xoa khi:

- co `allowDelete = true`
- node khong phai `level 0`

Toi van de xuat chi `super_admin` duoc xoa nhanh lon co nhieu node con. Editor neu duoc xoa thi chi nen xoa trong nhanh duoc giao va theo `soft delete`.

## 4. Firestore Rules de xuat

## 4.1. Nguyen tac

Rules chi kha thi neu moi node la 1 document rieng.

Neu van de `treeData` trong 1 doc, Rules khong the kiem dung pham vi node bi sua.

## 4.2. Ham de xuat

Logic de xuat:

- `isSignedIn()`
- `isSuperAdmin()`
- `isActiveAdmin()`
- `permissionDoc(uid, nodeId)`
- `canReadNode(nodeData)`
- `canEditNode(nodeData)`
- `canCreateChild(parentNodeData, newNodeData)`

## 4.3. Mau Rules muc y tuong

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }

    function adminUser() {
      return get(/databases/$(database)/documents/admin_users/$(request.auth.uid));
    }

    function isActiveAdmin() {
      return isSignedIn()
        && adminUser().data.status == 'active';
    }

    function isSuperAdmin() {
      return isActiveAdmin()
        && adminUser().data.role == 'super_admin';
    }

    match /content_nodes/{nodeId} {
      allow read: if isActiveAdmin();
      allow create: if isSuperAdmin();
      allow update, delete: if isSuperAdmin();
    }

    match /admin_users/{uid} {
      allow read: if isSuperAdmin() || (isSignedIn() && request.auth.uid == uid);
      allow write: if isSuperAdmin();
    }

    match /content_permissions/{permissionId} {
      allow read: if isSuperAdmin() || isActiveAdmin();
      allow write: if isSuperAdmin();
    }
  }
}
```

Nhan xet:

- Rules tren moi chi la khung an toan co ban.
- Neu muon editor sua truc tiep Firestore tu client, Rules se phuc tap hon nhieu.
- An toan hon la cho editor goi qua `Cloud Function` hoac backend trung gian.

## 4.4. De xuat thuc dung

Neu anh/chị muon ben va it rui ro:

- frontend chi doc danh sach
- moi thao tac `create/update/delete/grant` di qua `Cloud Function` hoac backend

Ly do:

- de kiem soat permission phuc tap
- de ghi log de dang
- de validate `level`, `pathIds`, `sortOrder`, `updatedBy`

## 5. Giao dien quan tri de xuat

## 5.1. Them mode moi trong quan tri

Hien tai co:

- `Biên tập nội dung`
- `Quản trị danh bạ`

De xuat them:

- `Tài khoản và phân quyền`

## 5.2. Man hinh `Tài khoản và phân quyền`

Bo cuc de xuat:

- cot trai: danh sach tai khoan
- cot giua: thong tin tai khoan
- cot phai: cay noi dung + quyen

Chuc nang cot trai:

- tim user
- loc `super_admin/editor`
- xem trang thai `active/locked`
- nut `+ Tao tai khoan`

Chuc nang cot giua:

- username
- ho ten hien thi
- email
- vai tro
- trang thai
- ngay tao
- dang nhap gan nhat
- nut `Dat lai mat khau`
- nut `Khoa/Mo`

Chuc nang cot phai:

- chon node tren cay noi dung
- checkbox:
  - `Doc`
  - `Them cap duoi`
  - `Sua`
  - `Xoa`
- input `Do sau toi da`
- switch `Ap dung cho tat ca node con`
- nut `Cap quyen`
- danh sach quyen da cap phia duoi

## 5.3. Man hinh `Biên tập nội dung`

Hanh vi theo role:

- `super_admin`: thay toan bo
- `editor`: thay toan bo hoac thay rieng nhanh duoc giao

Toi de xuat:

- editor chi thay nhanh duoc giao de tranh nham lan

Tren khung sua, bo sung block thong tin:

```text
Tao boi: Nguyen Van A - 10/04/2026 08:20
Sua lan cuoi: Tran Thi B - 15/04/2026 09:32
```

Neu user khong co quyen:

- an nut `Luu`
- an nut `Xoa`
- an nut `Them muc con`
- hien nhan `Khong duoc cap quyen chinh sua`

## 6. Luong nghiep vu

## 6.1. Tao tai khoan editor

1. Admin vao `Tai khoản và phân quyền`
2. Bam `+ Tao tai khoan`
3. Nhap `username`, `displayName`, `email`, `password tam`
4. He thong tao Firebase Auth user
5. He thong tao `admin_users/{uid}`
6. Admin chon nhanh noi dung va cap quyen

## 6.2. Cap quyen

1. Admin chon 1 user
2. Chon 1 node trong cay noi dung
3. Tick quyen
4. Chon `maxDepthAllowed`
5. Bam `Cap quyen`
6. He thong tao/ghi de `content_permissions/{uid}_{nodeId}`

## 6.3. Editor sua noi dung

1. Editor dang nhap
2. He thong nap profile `admin_users/{uid}`
3. He thong nap quyen cua user
4. Cay noi dung chi hien nhanh duoc phep
5. Khi bam `Luu`, he thong cap nhat node va ghi `updatedAt`, `updatedBy`
6. Neu bat audit log, he thong tao log moi

## 7. Migrate du lieu

## 7.1. Nguon hien tai

Du lieu hien tai dang nam trong:

```text
sotay/dulieu.treeData
```

## 7.2. Dich moi

Du lieu se duoc bung thanh nhieu doc trong:

```text
content_nodes/{nodeId}
```

## 7.3. Script migrate can lam

Script can:

1. doc `treeData`
2. duyet de quy
3. tao `nodeId` on dinh
4. gan `parentId`
5. tinh `level`
6. tinh `pathIds`, `pathTitles`
7. tao `sortOrder`
8. ghi metadata khoi tao

## 7.4. Chot `nodeId`

Toi de xuat:

- root giu id on dinh theo ten ky thuat
- node con tao id moi dang `node_{timestamp}` hoac uuid

Luu y:

- mot khi da cap permission theo `nodeId` thi khong nen doi `nodeId` nua

## 8. Pham vi code can sua

Tren he thong that, se phai sua:

- [app.js](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\app.js)
- [index.html](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\index.html)

Nhom viec chinh:

- bo login admin don gian hien tai
- bo sung load `admin_users`
- bo sung mode `Tai khoan va phan quyen`
- doi luong luu noi dung tu `treeData` sang `content_nodes`
- bo sung metadata cap nhat
- bo sung UI quyen theo node

## 9. De xuat chot de code

Toi de xuat chot 5 diem sau truoc khi code:

1. Role chi co `super_admin` va `editor`
2. Editor khong duoc tao `level 0`
3. Editor chi duoc thao tac toi `level 5`
4. Permission cap theo node va ap dung xuong cac node con
5. Ghi `createdAt/createdBy/updatedAt/updatedBy` tren moi node

## 10. Viec toi co the lam tiep ngay

Neu anh/chị chot tai lieu nay, toi co the lam tiep 1 trong 2 viec:

- dung tiep `thiet ke giao dien chi tiet` cho tab `Tai khoản và phân quyền`
- hoac bat dau `code pha 1`: tao collection moi va script migrate tu `treeData` sang `content_nodes`
