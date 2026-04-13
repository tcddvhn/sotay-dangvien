# Bao cao thay the survey, stats va notice sang backend moi

Ngay cap nhat: 2026-04-13

## 1. Muc tieu

Tai lieu nay ghi nhan viec thay the cac luong dang con phu thuoc Google Apps Script trong `frontend-static` bang backend moi:

- survey
- stats dashboard
- notice

## 2. Pham vi da lam

Da bo sung backend moi trong `backend-api/Sotay.Server.Api` cho:

- `POST /api/survey/submit`
- `GET /api/stats/dashboard`
- `POST /api/stats/record`
- `GET /api/notices/latest`
- `POST /api/notices/save`

Da bo sung model va bang du lieu moi:

- `survey.Responses`
- `stats.UsageEvents`
- `notify.Notices`

Da bo sung mock service tuong ung de backend van test duoc khi chua cau hinh `ConnectionString`.

## 3. Frontend-static da doi nhu the nao

Trong `frontend-static/app.js` da them cac co hieu:

- `ENABLE_SERVER_SURVEY_API`
- `ENABLE_SERVER_STATS_API`
- `ENABLE_SERVER_NOTICE_API`

Da bo sung trong `window.SOTAY_SERVER_API`:

- `submitSurveyResponse(...)`
- `recordStatEvent(...)`
- `getDashboardStats()`
- `getLatestNotices(...)`
- `saveNotice(...)`

Da doi cac luong giao dien sau sang uu tien backend moi:

- khao sat nhanh popup tu dong
- gop y popup tu dong
- dashboard thong ke trang chu
- ghi nhan su kien `visit/search/chatbot`
- tai danh sach thong bao
- luu thong bao moi tu giao dien admin
- form survey cu va feedback cu

Nguyen tac hien tai:

- neu backend moi san sang, frontend di qua backend moi
- neu backend moi chua san sang, frontend van fallback ve Apps Script cu

## 4. Du lieu seed mau

Da mo rong `SampleDataSeedHostedService` de tao du lieu mau cho:

- `UsageEvents`
- `Notices`

Y nghia:

- dashboard thong ke co so lieu de test ngay
- modal thong bao co 1 thong bao mau de test ngay

## 5. Phan con lai chua thay

Trong pha nay, `push notification` chua duoc dua sang backend moi.

Van con luong cu:

- `firebase.messaging()`
- `firebase-messaging-sw.js`
- dang ky token/push theo FCM

Do do, neu muc tieu la `toan bo he thong server rieng`, push notification la nhom can thay not tiep theo.

## 6. Danh gia

Sau buoc nay:

- da thay duoc nhom phu thuoc Apps Script lon nhat cho `survey/stats/notice`
- `frontend-static` da sat hon dang dich backend moi
- van con 2 nhom phu thuoc chuyen tiep:
  - push notification
  - fallback Firebase/Auth/Firestore de dam bao van hanh song song

## 7. Viec tiep theo khuyen nghi

1. Chay backend moi tren may co `.NET SDK 8`
2. Apply schema/migration co bo sung `stats.UsageEvents` va `notify.Notices`
3. Chay Postman test cho cac endpoint moi
4. Test `frontend-static` voi backend moi
5. Sau do moi quyet dinh thay not `push notification`
