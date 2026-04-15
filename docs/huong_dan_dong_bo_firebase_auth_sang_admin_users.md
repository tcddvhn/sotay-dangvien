# Huong dan dong bo Firebase Auth sang admin_users

## Muc tieu
- Khi tao user moi trong `Firebase Auth`, ho so quan tri tuong ung se tu dong xuat hien trong collection `admin_users`.
- Danh sach trong tab `Tai khoan & quyen` cua website se doc tu `admin_users`, vi client SDK khong the liet ke truc tiep toan bo user trong `Firebase Auth`.
- Co them mot endpoint backfill de dong bo ca cac tai khoan da tao truoc do.

## Thu muc ma nguon
- [firebase-auth-admin-sync](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\firebase-auth-admin-sync)

## Thanh phan da duoc tao
- [package.json](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\firebase-auth-admin-sync\package.json)
- [index.js](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\firebase-auth-admin-sync\index.js)
- [firebase.json.example](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\firebase-auth-admin-sync\firebase.json.example)
- [.firebaserc.example](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\firebase-auth-admin-sync\.firebaserc.example)

## Cac function da tao
1. `syncAdminProfileOnAuthCreate`
- Trigger khi `Firebase Auth` tao user moi
- Tao hoac cap nhat document `admin_users/{username}`
- `username` duoc lay tu phan truoc dau `@` cua email
- User moi mac dinh:
  - `role = editor`
  - `isActive = true`
- Rieng `admin@sotay.com` se luon duoc ep:
  - `role = super_admin`
  - `isActive = true`

2. `markAdminProfileOnAuthDelete`
- Trigger khi user bi xoa khoi `Firebase Auth`
- Khong xoa document `admin_users`
- Danh dau:
  - `isActive = false`
  - `authDeleted = true`
  - `syncStatus = auth_deleted`

3. `syncFirebaseAuthUsersToAdminProfiles`
- HTTP endpoint de backfill toan bo user cu da co trong `Firebase Auth`
- Bao ve bang `Bearer token`
- Dung khi:
  - vua deploy function lan dau
  - can dong bo lai hang loat

## Cach trien khai
1. Cai Firebase CLI neu chua co
```powershell
npm.cmd install -g firebase-tools
```

2. Dang nhap Firebase
```powershell
firebase.cmd login
```

3. Di chuyen vao thu muc function
```powershell
cd C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\firebase-auth-admin-sync
```

4. Tao file cau hinh thuc te
- copy `firebase.json.example` thanh `firebase.json`
- copy `.firebaserc.example` thanh `.firebaserc`

5. Cai dependency
```powershell
npm.cmd install
```

6. Dat bien moi truong cho function backfill
```powershell
firebase.cmd functions:secrets:set SYNC_ADMIN_TOKEN
```

Luu y:
- Neu dung Firebase Functions Gen 2 voi secret manager, co the can bo sung mapping secret trong buoc deploy theo quy trinh thuc te cua du an.
- Neu muon don gian, co the doi code sang doc `process.env.SYNC_ADMIN_TOKEN` tu bien moi truong cục bo/emulator khi test.

7. Deploy functions
```powershell
firebase.cmd deploy --only functions
```

## Cach backfill user cu
Sau khi deploy, goi HTTP endpoint `syncFirebaseAuthUsersToAdminProfiles` bang `Bearer token` da dat o tren.

Vi URL function phu thuoc khu vuc deploy, cach nhanh nhat la:
1. lay URL function trong Firebase Console
2. goi bang PowerShell:

```powershell
$token = "TOKEN_DA_DAT_KHI_SECRETS_SET"
Invoke-RestMethod -Method Post -Uri "FUNCTION_URL" -Headers @{ Authorization = "Bearer $token" }
```

Neu thanh cong, ket qua se co dang:
```json
{
  "ok": true,
  "synced": 7
}
```

## Cau truc document admin_users du kien sau dong bo
```json
{
  "username": "pbvctnb",
  "email": "pbvctnb@sotay.com",
  "displayName": "pbvctnb",
  "role": "editor",
  "isActive": true,
  "authUid": "firebase-auth-uid",
  "authProviderIds": ["password"],
  "authEmailVerified": false,
  "authDisabled": false,
  "syncSource": "firebase_auth_sync",
  "syncStatus": "synced",
  "syncedAt": "2026-04-15T...",
  "createdAt": "2026-04-15T...",
  "createdBy": "firebase_auth_sync",
  "updatedAt": "2026-04-15T...",
  "updatedBy": "firebase_auth_sync"
}
```

## Hanh vi tren website sau khi dong bo
- Cac user moi tao trong `Firebase Auth` se tu xuat hien trong tab `Tai khoan & quyen`
- `super_admin` khong can nhap tay tung ho so nua
- `super_admin` chi can:
  - sua `displayName` neu can
  - cap quyen noi dung trong `content_permissions`

## Gioi han va luu y
- Web frontend hien tai van khong doc truc tiep duoc danh sach `Firebase Auth`.
- Co che tu dong nay chi hoat dong sau khi anh/chị deploy Functions len Firebase project that.
- Neu user co email khong theo mau `username@sotay.com`, document van tao theo phan truoc dau `@`.
- Neu muon dong bo ten hien thi day du tieng Viet, nen cap nhat `displayName` cho user ngay trong `Firebase Auth` khi tao tai khoan.

## Khuyen nghi van hanh
- Giữ `admin@sotay.com` lam tai khoan goc he thong.
- Moi user tao moi trong `Firebase Auth` nen co `displayName` ngay tu dau.
- Sau khi deploy function, chay backfill 1 lan de keo toan bo user cu vao `admin_users`.
