# Bao cao chenh lech voi he thong that sau dot phan quyen

Ngay cap nhat: 2026-04-16

## 1. Ket luan nhanh

Workspace [he-thong-moi-server-rieng](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng) da duoc dong bo them mot buoc lon va hien da co **UI quan tri tai khoan/quyen tren frontend-static** cung backend API tuong ung. Backend `content` nay da co enforcement quyen cho `save/delete/tree-sync`, va backend `admin permissions` da duoc khoa lai o muc `Authorize + super_admin only`. Migration EF Core cho phan quyen moi da duoc tao va apply len DB test. Tuy nhien, parity voi he thong that van **chua hoan toan tron ven** o muc dong bo van hanh/Firebase.

Da dong bo:
- bo ma `firebase-auth-admin-sync/` de dong bo `Firebase Auth -> admin_users`
- tai lieu phuong an phan quyen va tai lieu dong bo Auth
- nen backend/API cho `admin profile` va `content permissions`
- DTO content da mo rong metadata audit (`createdAt/createdBy/updatedAt/updatedBy`)
- giao dien `Tai khoan & quyen` tren `frontend-static`
- logic chan tao/sua/xoa/sap xep noi dung theo quyen o `frontend-static`
- co che cay quyen va cay noi dung chi mo `level 0` khi dang nhap quan tri
- enforcement quyen ngay o backend `content` cho `save`, `delete`, `tree/sync`
- enforcement cho `admin/permissions/*` chi cho `super_admin`
- endpoint `api/admin/permissions/me` de frontend moi doc ho so admin hien tai
- API cookie challenge da duoc sua de tra `401/403` dung cho route `/api/*`

Chua dong bo day du:
- bo `firebase-auth-admin-sync` da co ma nguon nhung chua duoc deploy/gan vao workspace moi
- chua co enforcement tuong tu neu sau nay can ap vao cac API khac ngoai `content`

## 2. Nhung gi da mang sang workspace moi

### 2.1. Thu muc dong bo Auth
- [firebase-auth-admin-sync](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\firebase-auth-admin-sync)

Muc dich:
- tu dong tao ho so `admin_users` khi co user moi trong `Firebase Auth`
- backfill user cu da co truoc do

### 2.2. Tai lieu da mang sang
- [bao_cao_phuong_an_phan_quyen_quan_tri_noi_dung.md](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\docs\bao_cao_phuong_an_phan_quyen_quan_tri_noi_dung.md)
- [thiet_ke_chi_tiet_phan_quyen_quan_tri_noi_dung.md](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\docs\thiet_ke_chi_tiet_phan_quyen_quan_tri_noi_dung.md)
- [huong_dan_dong_bo_firebase_auth_sang_admin_users.md](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\docs\huong_dan_dong_bo_firebase_auth_sang_admin_users.md)

### 2.3. Nen backend da co
- `auth.ContentPermissions` trong [schema_v1_foundation.sql](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\database\schema_v1_foundation.sql)
- migration [20260416082235_AddAdminProfilesAndContentPermissions.cs](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\backend-api\Sotay.Server.Api\Data\Migrations\20260416082235_AddAdminProfilesAndContentPermissions.cs)
- entity [ContentPermissionEntity.cs](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\backend-api\Sotay.Server.Api\Data\Entities\ContentPermissionEntity.cs)
- service [SqlAdminPermissionService.cs](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\backend-api\Sotay.Server.Api\Services\SqlAdminPermissionService.cs)
- controller [AdminPermissionController.cs](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\backend-api\Sotay.Server.Api\Controllers\AdminPermissionController.cs)
- API client wrappers o [frontend-static\app.js](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\frontend-static\app.js)

### 2.4. Frontend-static da duoc dong bo
- tab `Tai khoan & quyen` o [frontend-static\index.html](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\frontend-static\index.html)
- style permission + metadata noi dung o [frontend-static\styles.css](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\frontend-static\styles.css)
- chuyen mode `content/directory/permissions` o [frontend-static\directory-module.js](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\frontend-static\directory-module.js)
- logic profile admin, cay quyen, va chan CRUD theo quyen o [frontend-static\app.js](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\frontend-static\app.js)

## 3. Tai sao chua the copy nguyen trang phan quyen sang workspace moi

Ly do chinh con lai:
- He thong that hien tai van dang dua tren `treeData` va Firestore client-side
- Workspace moi dang dua tren `ASP.NET Core API + SQL Server + frontend-static` co fallback/strict mode rieng
- Mot phan enforcement da duoc dat o backend `content`, nhung van con viec migration, seed, va test day du tren moi truong that

Neu copy nguyen `app.js/index.html/styles.css` tu he thong that vao `frontend-static`, se de vỡ:
- luong goi API moi
- runtime config
- strict server mode
- auth moi qua backend

## 4. Trang thai khuyen nghi

### Co the dung ngay
- thu muc `firebase-auth-admin-sync/` de dong bo `Firebase Auth -> admin_users`
- tai lieu phan quyen de tiep tuc thiet ke backend moi

### Chua nen coi la hoan tat
- khong nen deploy len production ma chua test lai auth/permissions end-to-end tren IIS/domain that
- khong nen coi `firebase-auth-admin-sync` la dang chay that neu chua deploy len Firebase project

## 5. Dau viec can lam tiep de dat parity

1. Tao migration EF Core cho cac thay doi:
- cot bo sung cua `auth.AdminUsers`
- bang `auth.ContentPermissions`
Da xong tren DB test.
2. Cap nhat smoke test va Postman cho nhom API moi
3. Test that `content save/delete/tree-sync` voi `super_admin` va `editor`
Da xac nhan tren DB test:
- chua dang nhap: `401`
- `editor` tao `level 0`: `403`
- `super_admin` tao `level 0`: `200`
4. Deploy va test `firebase-auth-admin-sync` neu van can dong bo user Firebase Auth vao he thong moi
5. Can nhac mo rong enforcement backend sang cac API khac neu pham vi quan tri tiep tuc duoc tach sau nay

## 6. Khuyen nghi van hanh

Khi copy workspace moi len may chu chinh thuc:
- co the mang theo `firebase-auth-admin-sync/`
- nhung khong nen ghi nhan la da mang sang day du tinh nang phan quyen moi
- can mot pha phat trien rieng cho backend/API truoc khi parity duoc dat
