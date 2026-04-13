# Backend API cho he thong moi

Thu muc nay hien da co skeleton du an tai:

- `Sotay.Server.Api/`

## Trang thai hien tai

- Da dung khung `ASP.NET Core Web API` thu cong.
- Chua chay build vi may hien tai chua cai `.NET SDK`.
- Da bo sung `DbContext`, entity va service doc `SQL Server` cho `content` va `directory`.
- Da mo CRUD nen cho `content` va `directory`.
- Da bo sung nen `ASP.NET Core Identity` o muc du lieu va service registration.
- Da co `IdentityAdminAuthService`: neu co DB thi login admin di qua `Identity`.
- Da co `AdminSeedHostedService`: co the seed admin dau tien bang cau hinh.
- Da co `OpenAiChatbotService`: neu co API key thi chatbot di qua backend gateway goi API AI.
- Da co `Survey`, `Stats`, `Notice` service/controller de thay luong Google Apps Script cu.
- Da mo rong `SampleDataSeedHostedService` de seed du lieu mau cho `content`, `directory`, `usage events` va `notices`.
- Neu chua cau hinh `ConnectionString`, backend se tu chay bang `mock service`.
- Neu co `ConnectionString`, `content`, `directory`, `survey`, `stats`, `notice` se di qua `SQL Server`.
- Neu chua co `ApiKey`, chatbot se tu chay bang `mock service`.

## Endpoint mau hien co

- `GET /api/health`
- `GET /api/content/tree`
- `GET /api/content/{id}`
- `POST /api/content/save`
- `DELETE /api/content/{id}`
- `POST /api/content/tree/sync`
- `GET /api/directory/tree`
- `GET /api/directory/{id}`
- `POST /api/directory/save`
- `DELETE /api/directory/{id}`
- `POST /api/directory/tree/sync`
- `POST /api/admin/auth/login`
- `POST /api/admin/auth/logout`
- `POST /api/chatbot/ask`
- `POST /api/survey/submit`
- `GET /api/stats/dashboard`
- `POST /api/stats/record`
- `GET /api/notices/latest`
- `POST /api/notices/save`
- `GET /api/push/public-key`
- `POST /api/push/subscriptions/save`
- `DELETE /api/push/subscriptions`
- `POST /api/push/send-notice`

## Viec phai lam tiep

- cai `.NET SDK`
- tao migration cho cac bang `auth` va cac bang nghiep vu moi
- build va smoke test backend that
- them logging luu lich su chatbot vao database
- them logging, audit, rate limit, auth that
- cau hinh VAPID va test `Web Push`
- sau do moi bo fallback FCM cu

## Tai lieu ho tro

- `../docs/huong_dan_tao_migration_identity_va_database.md`
- `../docs/checklist_smoke_test_backend_moi.md`
- `../docs/huong_dan_seed_du_lieu_mau_test.md`
- `../docs/postman/README.md`
- `../docs/bao_cao_thay_the_survey_stats_notice.md`
- `../docs/bao_cao_thay_the_push_notification.md`
