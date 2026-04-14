# Bao cao phu thuoc con lai trong frontend-static

Ngay cap nhat: 2026-04-14

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

Ngoai ra, moi truong test local hien da bat:

- `STRICT_SERVER_MODE = true` trong `frontend-static/runtime-config.js`

Y nghia:

- frontend test chi di qua backend moi
- neu backend loi hoac thieu endpoint, frontend se bao loi ro thay vi quay ve Firebase/Apps Script

## 3. Cac phan con phu thuoc Firebase

### 3.1. Fallback noi dung cu

Trong `frontend-static/app.js` van con logic fallback:

- khoi tao `firebaseConfig`
- `firebase.firestore()`
- `db.collection("sotay").doc("dulieu")`

Y nghia:

- khi backend moi chua san sang, frontend ban sao van co the quay ve Firestore

Tac dong:

- trong moi truong test local, fallback nay da bi vo hieu hoa boi `STRICT_SERVER_MODE`
- trong ma nguon, fallback van duoc giu lai cho cac moi truong chuyen tiep neu can

### 3.2. Protected access login cu

Trong `frontend-static/app.js` van con fallback:

- `firebase.auth().signInWithEmailAndPassword(...)`

Y nghia:

- trong moi truong test local, fallback nay da bi vo hieu hoa
- trong ma nguon, fallback van con de phuc vu chuyen tiep neu can

### 3.3. Push fallback cu

Trong `frontend-static/app.js` van con:

- `firebase.messaging()`
- `firebase-messaging-sw.js`
- `FCM_VAPID_KEY`

Y nghia:

- trong moi truong test local, fallback FCM da bi vo hieu hoa khi `STRICT_SERVER_MODE = true`
- neu backend Web Push chua cau hinh VAPID, frontend test se dung va bao loi ro

Ket luan:

- de cat dut Firebase hoan toan o ma nguon, van can xoa not code fallback
- con o moi truong test local, Firebase da khong con la duong chay hop le nua

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

- trong moi truong test local, fallback Apps Script da bi vo hieu hoa
- phan con lai trong ma nguon chu yeu la no ky thuat chuyen tiep

## 5. Cac phan con phu thuoc ben ngoai khac

Van con cac phu thuoc CDN/ngoai:

- Quill CDN
- Font Awesome CDN
- mot so tai nguyen anh ngoai

Nhom nay khong phai Firebase/Apps Script, nhung neu muc tieu la tu chu cao hon thi can duoc danh gia sau.

## 6. Danh sach viec con phai thay truoc cutover that

### Bat buoc neu muon bo Firebase/Apps Script o frontend moi tren ma nguon production

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
- moi truong test local da duoc khoa o che do `server-only`
- phan con lai la viec don ma nguon fallback cu cho giai doan production/cutover cuoi cung
