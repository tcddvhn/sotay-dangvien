# Bao cao phu thuoc con lai trong frontend-static

Ngay lap: 2026-04-13

## 1. Muc tieu

Tai lieu nay chot ro trong `frontend-static` hien con nhung phan nao:

- da chuyen sang backend moi
- con phu thuoc Firebase
- con phu thuoc Google Apps Script
- can thay not truoc khi cutover that

## 2. Cac phan da duoc chuyen sang backend moi

Da co lop `window.SOTAY_SERVER_API` trong:

- `frontend-static/app.js`

Da co kha nang di qua backend moi cho:

- content tree
- content save/delete/sync
- directory tree
- directory sync
- admin login/logout
- chatbot ask
- survey submit
- stats dashboard
- stats record
- notice list
- notice save
- push public key
- push save/delete subscription
- push send notice

## 3. Cac phan con phu thuoc Firebase

### 3.1. Fallback noi dung cu

Trong `frontend-static/app.js` van con logic fallback:

- khoi tao `firebaseConfig`
- `firebase.firestore()`
- `db.collection("sotay").doc("dulieu")`

Y nghia:

- khi backend moi chua san sang, frontend ban sao van co the quay ve Firestore

Tac dong:

- day la phu thuoc chuyen tiep, chua phai phu thuoc bat buoc neu backend moi da on dinh

### 3.2. Protected access login cu

Trong `frontend-static/app.js` van con fallback:

- `firebase.auth().signInWithEmailAndPassword(...)`

Y nghia:

- neu auth API moi chua bat, frontend van quay ve Firebase Auth

### 3.3. Push fallback cu

Trong `frontend-static/app.js` van con:

- `firebase.messaging()`
- `firebase-messaging-sw.js`
- `FCM_VAPID_KEY`

Y nghia:

- day la fallback an toan khi backend Web Push chua duoc cau hinh VAPID

Ket luan:

- neu muon cat dut Firebase hoan toan, day la mot trong cac diem can lam sach sau khi Web Push backend da on dinh

## 4. Cac phan con phu thuoc Google Apps Script

Da thay sang backend moi theo duong chinh:

- khao sat nhanh
- gop y
- thong ke
- notice
- push notification

Trong `frontend-static/app.js`, Apps Script hien con dong vai tro fallback chuyen tiep va phan push cu.

Hien con lien quan den `STATS_WEB_APP_URL` chu yeu la fallback chuyen tiep cho push cu neu backend Web Push chua san sang.

Ket luan:

- phu thuoc Google Apps Script da giam manh hon nua
- phan con lai chu yeu la code fallback chuyen tiep

## 5. Cac phan con phu thuoc ben ngoai khac

Van con cac phu thuoc CDN/ngoai:

- Quill CDN
- Font Awesome CDN
- mot so tai nguyen anh ngoai

Nhom nay khong phai Firebase/Apps Script, nhung neu muc tieu la tu chu cao hon thi can duoc danh gia sau.

## 6. Danh sach viec con phai thay truoc cutover that

### Bat buoc neu muon bo Firebase/Apps Script o frontend moi

1. Bo fallback Firestore trong `frontend-static/app.js`
2. Bo fallback Firebase Auth trong `frontend-static/app.js`
3. Bo fallback push cu sau khi backend Web Push da on dinh

### Co the de giai doan sau

1. Noi bo hoa CDN
2. Toi uu lai service worker
3. Lam sach code fallback cu sau khi he thong moi da on dinh

## 7. Khuyen nghi cutover

Truoc cutover that, toi khuyen nghi toi thieu phai chot:

- content: da qua backend moi
- directory: da qua backend moi
- admin auth: da qua backend moi
- chatbot: da qua backend moi
- survey: da qua backend moi
- stats: da qua backend moi
- notice: da qua backend moi

Va quyet dinh ro 1 trong 2 huong:

### Huong A

- tam thoi chap nhan push con o luong cu trong giai doan chuyen tiep

### Huong B

- thay not push truoc cutover that

Neu muc tieu la `toan bo he thong server rieng`, huong B la huong dung.

## 8. Ket luan

- `frontend-static` da di duoc them mot buoc quan trong sang backend moi
- survey, stats, notice va push da co duong backend rieng
- nhung chua cat dut hoan toan Firebase va Google Apps Script
- phan con lai tap trung chu yeu o:
  - fallback auth/firestore
  - fallback push cu

Day la danh sach viec can thay not truoc khi co the noi he thong moi la da tach khoi kien truc cu.
