# Bao cao phuong an phan quyen quan tri noi dung

Ngay lap: 2026-04-15

## 1. Muc tieu nghiep vu

Yeu cau phan quyen duoc hieu nhu sau:

- `Admin` duoc tao, sua, xoa toan bo noi dung.
- `Admin` la tai khoan duy nhat duoc tao muc goc `level 0`.
- Tai khoan cap duoi chi duoc thao tac voi noi dung `level 1 -> 5`.
- Tai khoan cap duoi duoc phep `them`, `sua`, `xoa` trong pham vi duoc giao.
- `Admin` co chuc nang phan quyen theo tung noi dung cho cac tai khoan da duoc tao.
- Trong quan tri noi dung can hien thi `ngay gio chinh sua gan nhat` va `nguoi chinh sua`.

## 2. Hien trang he thong that

Qua doc ma nguon hien tai:

- Dang nhap quan tri dung `Firebase Auth` ngay trong frontend.
- Noi dung duoc luu trong `Firestore`, doc: `sotay/dulieu`.
- Toan bo cay noi dung dang duoc luu trong 1 truong mang `treeData`.
- Cac thao tac `addNewRoot`, `addSubItem`, `deleteCurrentItem`, `saveCurrentNodeToServer`, `saveTreeToFirebase` deu ghi truc tiep tu frontend vao cung 1 doc.

He qua ky thuat:

- Phan quyen theo tung nhanh noi dung tren 1 doc duy nhat la rat kho lam an toan.
- Neu van giu kieu ghi ca cay `treeData`, Firestore Rules kho kiem soat dung muc nao duoc sua, muc nao khong.
- Frontend co the an nut theo quyen, nhung neu mot nguoi biet cach goi Firestore truc tiep thi van co nguy co ghi sai pham vi, neu rule khong du chat.

## 3. Ket luan kien truc

Co 2 huong:

### Huong A: Lam nhanh tren he thong that hien tai

Lam duoc nhanh hon, nhung muc do an toan chi o muc trung binh.

Nguyen ly:

- van dung `Firebase Auth`
- van dung `Firestore`
- bo sung bang user/pham vi quyen
- frontend an/hien nut va chan thao tac theo quyen
- ghi metadata `updatedAt`, `updatedBy`

Han che:

- van phu thuoc frontend check
- phan quyen theo node tren 1 doc lon khong that su dep
- de gap xung dot khi 2 nguoi sua dong thoi

### Huong B: Lam dung va an toan

Day la huong nen trien khai neu anh/chị muon dung lau dai.

Nguyen ly:

- tach noi dung khoi truong `treeData`
- moi muc noi dung thanh 1 document rieng
- phan quyen luu thanh document rieng
- Firestore Rules hoac backend co the kiem tra quyen tren tung node

Uu diem:

- phan quyen theo noi dung ro rang
- kiem soat duoc ai duoc sua node nao
- co the ghi lich su, ngay sua, nguoi sua de dang hon
- phu hop voi bai toan admin giao tung nhanh cho nhieu tai khoan

Ket luan de xuat:

- Khong nen trien khai phan quyen chi bang cach sua giao dien tren cau truc `treeData` hien tai.
- Nen trien khai theo `Huong B`, du la van o he thong that dang dung.

## 4. Phuong an de xuat chot

Toi de xuat phuong an trien khai nhu sau:

### 4.1. Doi mo hinh du lieu noi dung

Khong dung 1 doc `sotay/dulieu.treeData` nua.

Thay bang 3 nhom du lieu:

#### a. Bang node noi dung

Collection de xuat:

```text
content_nodes/{nodeId}
```

Field moi node:

- `id`
- `title`
- `tag`
- `summary`
- `detail`
- `level`
- `parentId`
- `sortOrder`
- `isDeleted`
- `createdAt`
- `createdByUid`
- `createdByName`
- `updatedAt`
- `updatedByUid`
- `updatedByName`

Field mo rong nen co:

- `pathIds`: mang id tu root den node hien tai
- `pathTitles`: mang tieu de de de tim va hien thi breadcrumb
- `isActive`

#### b. Bang user quan tri

Collection de xuat:

```text
admin_users/{uid}
```

Field:

- `uid`
- `username`
- `displayName`
- `email`
- `role`
- `status`
- `createdAt`
- `createdBy`
- `lastLoginAt`

Gia tri `role`:

- `super_admin`
- `editor`

#### c. Bang phan quyen theo noi dung

Collection de xuat:

```text
content_permissions/{permissionId}
```

Hoac luu theo user:

```text
admin_users/{uid}/permissions/{permissionId}
```

Field:

- `uid`
- `nodeId`
- `nodeTitle`
- `allowRead`
- `allowCreateChild`
- `allowEdit`
- `allowDelete`
- `maxDepthAllowed`
- `grantedAt`
- `grantedByUid`
- `grantedByName`

## 5. Quy tac phan quyen nghiep vu

### 5.1. `super_admin`

Duoc:

- tao node `level 0`
- sua, xoa, sap xep moi node
- giao quyen cho user
- tao tai khoan
- khoa/mo tai khoan
- xem toan bo lich su cap nhat

### 5.2. `editor`

Khong duoc:

- tao node `level 0`
- sua nhung nhanh khong duoc giao
- sua phan quyen
- tao tai khoan

Duoc:

- xem nhanh duoc cap quyen
- them node con neu duoc `allowCreateChild = true`
- sua node duoc giao neu `allowEdit = true`
- xoa node duoc giao neu `allowDelete = true`

Rang buoc `level`:

- editor chi thao tac tren node co `level` tu `1` den `5`
- neu mot nhanh da o `level 5` thi editor khong duoc them cap duoi nua

### 5.3. Quy tac giao quyen theo noi dung

Admin giao quyen tai node goc cua nhanh duoc phu trach.

Vi du:

- giao cho user A node `PHẦN 2`
- user A duoc sua `PHẦN 2` va cac muc con ben duoi
- user A khong duoc sua `PHẦN 1`, `PHẦN 3`...

Kiem tra ky thuat:

- node dang thao tac hop le neu `node.pathIds` co chua `nodeId` da duoc cap quyen
- va `level <= maxDepthAllowed`

## 6. Giao dien quan tri de xuat

## 6.1. Quan ly tai khoan

Them 1 tab moi trong quan tri:

- `Tai khoan va phan quyen`

Chuc nang:

- tao tai khoan editor
- dat lai mat khau
- khoa/mo tai khoan
- xem danh sach quyen da cap

## 6.2. Phan quyen theo noi dung

Tai man hinh chi tiet tai khoan:

- cot trai: cay noi dung
- cot phai: danh sach quyen da cap

Thao tac:

- chon 1 node
- tick `Doc`, `Them cap duoi`, `Sua`, `Xoa`
- chon `Do sau toi da`
- bam `Cap quyen`

## 6.3. Quan tri noi dung

Trong cay noi dung:

- admin thay toan bo
- editor chi thay nhanh duoc cap quyen, hoac thay toan bo nhung node khong duoc quyen bi khoa thao tac

Tai man hinh sua noi dung, bo sung:

- `Ngay cap nhat cuoi`
- `Nguoi cap nhat cuoi`
- `Ngay tao`
- `Nguoi tao`

O cay ben trai, nen hien them 1 dong nho:

- `Sua lan cuoi: 15/04/2026 09:30 - nguyenvana`

## 7. Phuong an ky thuat chi tiet

## 7.1. Xac thuc

Tiep tuc dung `Firebase Auth` cho he thong that neu chua doi backend.

Nhung can bo sung:

- khong dung quy uoc username + `@sotay.com` mot cach mem nhu hien tai cho phan quyen
- moi user phai co `uid` on dinh
- metadata quyen phai gan theo `uid`, khong gan theo text username

## 7.2. Firestore Rules

Neu trien khai dung cach, Rules co the kiem tra:

- user da dang nhap hay chua
- role co phai `super_admin` khong
- user co permission tren `nodeId` khong

Dieu kien de Rules lam duoc:

- moi node la 1 document rieng
- permission cung la du lieu rieng

Neu van giu `treeData` trong 1 doc thi Rules se khong du manh de lam phan quyen tinh.

## 7.3. Metadata cap nhat

Moi lan luu node:

- `updatedAt = serverTimestamp()`
- `updatedByUid = currentUser.uid`
- `updatedByName = admin_users/{uid}.displayName`

Moi lan tao moi:

- them `createdAt`, `createdByUid`, `createdByName`

## 7.4. Xoa noi dung

De xuat `soft delete` thay vi xoa cung ngay.

Field:

- `isDeleted = true`
- `deletedAt`
- `deletedByUid`

Ly do:

- de khoi phuc neu xoa nham
- de doi chieu lich su

## 8. Lo trinh trien khai de xuat

### Giai doan 1: Chuan hoa du lieu

- tao collection `content_nodes`
- viet script migrate tu `treeData` sang `content_nodes`
- giu nguyen giao dien doc ben ngoai

### Giai doan 2: Quan ly user va permission

- tao collection `admin_users`
- tao man hinh tao tai khoan editor
- tao man hinh cap quyen theo node

### Giai doan 3: Sua man hinh quan tri noi dung

- load cay tu `content_nodes`
- loc thao tac theo permission
- hien metadata `updatedAt`, `updatedBy`

### Giai doan 4: Rules va kiem thu

- viet Firestore Rules moi
- test cac tinh huong vuot quyen
- test xung dot sua dong thoi

### Giai doan 5: Cat chuyen

- backup `treeData` cu
- khoa sua tren he thong cu trong luc migrate cuoi
- cutover sang mo hinh moi

## 9. Danh gia tac dong

Tac dong len he thong that:

- co anh huong den phan quan tri
- khong bat buoc phai doi giao dien nguoi dung ben ngoai ngay
- can migrate du lieu 1 lan
- can test rat ky phan quyen va xoa/sua

Rui ro neu lam tat:

- loi mat nhanh du lieu neu migrate sai quan he cha-con
- cap quyen nham do map sai `nodeId`
- hien thi cay sai thu tu neu khong co `sortOrder`

## 10. De xuat chot

Toi de xuat chot nhu sau:

1. Khong trien khai phan quyen tren cau truc `treeData` hien tai, vi khong ben va kho an toan.
2. Tach mo hinh noi dung sang `content_nodes` theo tung document.
3. Tao 2 vai tro:
   - `super_admin`
   - `editor`
4. Admin duoc tao `level 0`.
5. Editor chi duoc CRUD trong nhanh duoc giao, voi `level 1 -> 5`.
6. Ghi metadata `createdAt`, `createdBy`, `updatedAt`, `updatedBy` tren moi node.
7. Bo sung tab `Tai khoan va phan quyen` trong quan tri.

## 11. Viec toi co the lam tiep

Neu anh/chị duyet phuong an nay, toi co the lam tiep 1 trong 2 huong:

- lap tiep `thiet ke du lieu chi tiet + Firestore collections + Rules de xuat`
- hoac bat dau dung `bao cao giao dien quan tri phan quyen` de anh/chị duyet truoc khi code
