# Trang thai chuyen frontend-static sang backend moi

Ngay lap: 2026-04-13

## 1. Muc tieu

Tai lieu nay ghi nhan phan nao cua `frontend-static` da duoc noi sang backend moi trong workspace `he-thong-moi-server-rieng`.

## 2. Cac luong da duoc chuyen sang lop API moi

Trong `frontend-static/app.js` da co lop `window.SOTAY_SERVER_API` de goi:

- `content`
- `directory`
- `admin auth`
- `chatbot`
- `survey`
- `stats`
- `notice`
- `push`

Trong `frontend-static/directory-module.js` da chuyen lop luu/nap danh ba sang API moi neu backend san sang.

## 3. Cac endpoint frontend moi da dung duoc

- tai cay noi dung tu `GET /api/content/tree`
- dong bo cay noi dung qua `POST /api/content/tree/sync`
- luu 1 node noi dung qua `POST /api/content/save`
- xoa 1 node noi dung qua `DELETE /api/content/{id}`
- dang nhap admin qua `POST /api/admin/auth/login`
- dang xuat admin qua `POST /api/admin/auth/logout`
- chatbot qua `POST /api/chatbot/ask`
- tai cay danh ba qua `GET /api/directory/tree`
- dong bo cay danh ba qua `POST /api/directory/tree/sync`
- khao sat/gop y qua `POST /api/survey/submit`
- dashboard thong ke qua `GET /api/stats/dashboard`
- ghi nhan `visit/search/chatbot` qua `POST /api/stats/record`
- tai thong bao qua `GET /api/notices/latest`
- luu thong bao qua `POST /api/notices/save`
- lay public key push qua `GET /api/push/public-key`
- luu subscription push qua `POST /api/push/subscriptions/save`
- gui notice push qua `POST /api/push/send-notice`

## 4. Co che fallback hien tai

Frontend ban sao dang chay theo nguyen tac:

- neu API moi san sang, dung API moi
- neu API moi chua san sang, fallback ve cach cu hoac cache cuc bo

Dieu nay giup qua trinh chuyen doi khong bi chan.

## 5. Nhung phan con dang o trang thai chuyen tiep

Chua chuyen han sang backend moi:

- mot so luong quan tri cu van mang cau truc thao tac tu Firebase/Firestore
- mot so fallback FCM cu de giu van hanh chuyen tiep

## 6. Y nghia hien tai

- workspace moi da co nen frontend du de bat dau test voi backend moi
- nhung chua the coi la hoan tat chuyen doi frontend
- de chay that can co backend `.NET` build duoc va database test

## 7. Viec tiep theo nen lam

1. Dung moi truong `.NET SDK 8`
2. Tao migration that va database test
3. Seed admin dau tien
4. Chay backend moi
5. Mo `frontend-static` tren moi truong test va kiem tra cac luong da chuyen
6. Cau hinh VAPID va test `push notification`
7. Sau khi on dinh moi bo fallback FCM cu
