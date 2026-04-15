# Bao cao chenh lech voi he thong that sau dot phan quyen

Ngay cap nhat: 2026-04-15

## 1. Ket luan nhanh

Workspace [he-thong-moi-server-rieng](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng) da duoc dong bo **mot phan** cac thay doi moi tu he thong that, nhung **chua dat parity day du** cho tinh nang phan quyen noi dung.

Da dong bo:
- bo ma `firebase-auth-admin-sync/` de dong bo `Firebase Auth -> admin_users`
- tai lieu phuong an phan quyen va tai lieu dong bo Auth
- nen backend/API cho `admin profile` va `content permissions`
- DTO content da mo rong metadata audit (`createdAt/createdBy/updatedAt/updatedBy`)

Chua dong bo day du:
- giao dien `Tai khoan & quyen` vao `frontend-static`
- logic chan thao tac tao/sua/xoa/sap xep theo quyen trong `frontend-static`

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
- entity [ContentPermissionEntity.cs](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\backend-api\Sotay.Server.Api\Data\Entities\ContentPermissionEntity.cs)
- service [SqlAdminPermissionService.cs](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\backend-api\Sotay.Server.Api\Services\SqlAdminPermissionService.cs)
- controller [AdminPermissionController.cs](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\backend-api\Sotay.Server.Api\Controllers\AdminPermissionController.cs)
- API client wrappers o [frontend-static\app.js](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\frontend-static\app.js)

## 3. Tai sao chua the copy nguyen trang phan quyen sang workspace moi

Ly do chinh con lai:
- He thong that hien tai van dang dua tren `treeData` va Firestore client-side
- Workspace moi dang dua tren `ASP.NET Core API + SQL Server + frontend-static` co fallback/strict mode rieng
- Frontend moi hien chua co UI `Tai khoan & quyen` va chua ap quyen len thao tac content

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
- khong nen xem workspace moi da co tinh nang `Tai khoan & quyen`
- khong nen deploy frontend-static va ky vong phan quyen noi dung giong het he thong that

## 5. Dau viec can lam tiep de dat parity

1. Mo rong `frontend-static`:
- them tab `Tai khoan & quyen`
- them giao dien cap quyen theo node
- chan tao/sua/xoa theo quyen
2. Cap nhat smoke test va Postman cho nhom API moi
3. Tao migration EF Core cho cac thay doi:
- cot bo sung cua `auth.AdminUsers`
- bang `auth.ContentPermissions`

## 6. Khuyen nghi van hanh

Khi copy workspace moi len may chu chinh thuc:
- co the mang theo `firebase-auth-admin-sync/`
- nhung khong nen ghi nhan la da mang sang day du tinh nang phan quyen moi
- can mot pha phat trien rieng cho backend/API truoc khi parity duoc dat
