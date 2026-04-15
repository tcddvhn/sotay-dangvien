# Firebase Auth Admin Sync

Bo Cloud Functions nay dong bo user tu `Firebase Auth` sang collection `admin_users` cua Firestore.

## Chuc nang
- Tu dong tao/cap nhat `admin_users/{username}` khi tao user moi trong `Firebase Auth`
- Danh dau `isActive = false` khi user bi xoa khoi `Firebase Auth`
- Co endpoint backfill de dong bo toan bo user cu da ton tai truoc khi deploy

## Tai lieu day du
- [Huong dan dong bo Firebase Auth sang admin_users](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\docs\huong_dan_dong_bo_firebase_auth_sang_admin_users.md)

## Luu y
- Folder nay chi la ma nguon chuan bi san.
- Chua duoc deploy len Firebase project that.
- Sau khi deploy va chay backfill, tab `Tai khoan & quyen` tren web se nhin thay danh sach user moi ma khong can tao tay tung ho so.
