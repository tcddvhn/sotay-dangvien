# Bao cao thay the push notification sang backend moi

Ngay cap nhat: 2026-04-13

## 1. Muc tieu

Tai lieu nay ghi nhan viec thay luong `push notification` cu dang phu thuoc Firebase/FCM va Google Apps Script bang huong `Web Push + VAPID` tren backend moi.

## 2. Pham vi da lam

Da bo sung backend moi trong `backend-api/Sotay.Server.Api` cho:

- `GET /api/push/public-key`
- `POST /api/push/subscriptions/save`
- `DELETE /api/push/subscriptions`
- `POST /api/push/send-notice`

Da bo sung cac thanh phan moi:

- `PushOptions`
- entity `notify.Subscriptions`
- `IPushService`
- `SqlPushService`
- `MockPushService`
- `PushController`

Frontend `frontend-static/app.js` da bo sung:

- `ENABLE_SERVER_PUSH_API`
- lay `public key` tu backend
- dang ky `PushSubscription` bang `Push API`
- luu subscription ve backend
- gui `notice push` qua backend neu thong bao la cong khai

Da tao service worker moi tai:

- `frontend-static/push-sw.js`

## 3. Kien truc moi

Luong moi:

1. Nguoi dung bam bat thong bao
2. Frontend goi `GET /api/push/public-key`
3. Frontend dang ky `PushSubscription` qua service worker `push-sw.js`
4. Frontend goi `POST /api/push/subscriptions/save`
5. Admin dang thong bao cong khai
6. Frontend goi `POST /api/push/send-notice`
7. Backend doc `notify.Subscriptions` va gui thong bao qua Web Push

## 4. Cau hinh can co

Trong backend moi can dien:

- `Push.Enabled`
- `Push.Subject`
- `Push.PublicKey`
- `Push.PrivateKey`
- `Push.DefaultClickUrl`

Neu chua cau hinh day du:

- frontend van co the fallback ve luong FCM cu
- backend push moi se chua gui duoc thong bao that

## 5. Du lieu va bang su dung

Bang su dung:

- `notify.Subscriptions`

Bang nay da ton tai trong `schema_v1_foundation.sql`, nay da co entity va service su dung that.

## 6. Danh gia hien tai

Sau buoc nay:

- `push notification` da co duong backend rieng
- co the tien toi cat FCM/Apps Script o pha sau
- van giu fallback cu de khong chan qua trinh test va chuyen tiep

## 7. Viec tiep theo khuyen nghi

1. Tao cap khoa VAPID cho moi truong test va production
2. Dien `PushOptions` vao `appsettings.Test.json` hoac secret store
3. Chay backend moi tren HTTPS
4. Test dang ky thong bao day bang `frontend-static`
5. Test admin gui thong bao cong khai
6. Sau khi on dinh moi bo fallback FCM cu
