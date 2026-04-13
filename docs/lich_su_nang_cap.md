# Lich su nang cap

## 2026-04-02

- Tao thu muc `docs`.
- Bo sung bao cao thiet ke chuc nang `Danh ba` tai `docs/bao_cao_thiet_ke_danh_ba.md`.
- Ghi nhan de xuat kien truc moi cho module danh ba 3 cap, tach du lieu khoi `APP_DATA`.
- Bo sung giai thich chi tiet pham vi `quan tri co ban` va luong `admin duyet` trong bao cao thiet ke.
- Cap nhat bao cao voi quyet dinh tam thoi giu mo hinh `admin tu duyet`.
- Bo sung yeu cau banner `Danh ba chuyen sinh hoat dang` tai trang chu.
- Bo sung nghien cuu giao dien danh ba dua tren tai lieu internet va de xuat UI theo card/list cho 4 truong thong tin chinh.
- Seed san 132 don vi cap 1 tu file Excel `Danh sach don vi.xlsx` vao module `Danh ba`.
- Trien khai tab `Danh ba`, banner trang chu va quan tri co ban cho danh ba trong ma nguon.
- Tao tai lieu huong dan chi tiet chuyen website sang may chu tinh Windows Server 2022 tai `docs/huong_dan_chuyen_sotay_sang_windows_server_2022.md`.
- Tao them checklist trien khai thuc dia cho Windows Server 2022 tai `docs/checklist_trien_khai_windows_server_2022.md`.
- Tao bao cao rieng danh gia anh huong cua `Firebase` va `Google Apps Script` khi doi sang domain moi va phuong an thay the tai `docs/bao_cao_anh_huong_firebase_va_apps_script_khi_doi_ten_mien.md`.
- Tao bao cao rieng ve phuong an chuyen toan bo he thong sang server rieng, thay the `Firestore`, `Google Apps Script`, `Firebase Auth`, va danh gia phuong an chatbot qua API backend tai `docs/bao_cao_phuong_an_chuyen_toan_bo_sang_server_rieng.md`.
- Tao workspace tach biet `he-thong-moi-server-rieng` de phat trien he thong moi song song, bao gom ban sao frontend hien tai va cac thu muc rieng cho backend, database, tai lieu van hanh song song.
- Dung skeleton backend `ASP.NET Core Web API` trong `he-thong-moi-server-rieng/backend-api/Sotay.Server.Api`, tao schema SQL nen trong `he-thong-moi-server-rieng/database`, va bo sung huong dan khoi dong workspace he thong moi.
- Bo sung `DbContext`, entity va service doc `SQL Server` cho `content` va `directory` trong backend moi; backend ho tro che do fallback sang mock khi chua cau hinh `ConnectionString`.
- Bo sung nen `ASP.NET Core Identity` o muc du lieu, mo CRUD nen cho `content` va `directory`, va cap nhat schema `auth` cho he thong moi trong workspace tach biet.
- Bo sung service dang nhap admin theo `Identity`, service chatbot gateway goi API AI theo cau hinh, `ApplicationDbContextFactory` cho migration, va tai lieu tao migration cho he thong moi.
- Chuyen `frontend-static` sang lop API moi cho `content`, `directory`, `admin auth`, `chatbot`, bo sung endpoint `tree/sync` o backend moi, va tao tai lieu trang thai chuyen frontend.
- Bo sung `AdminSeedHostedService` va cau hinh `AdminSeed` de co the seed tai khoan quan tri dau tien khi backend moi chay tren moi truong co `.NET SDK`.
- Bo sung cau hinh moi truong `Test`, `launchSettings.json`, va checklist smoke test cho backend moi de chuan bi chay thu tren may co `.NET SDK`.
- Bo sung `SampleDataSeedHostedService`, cau hinh `SampleDataSeed`, va tai lieu huong dan seed du lieu mau test cho `content` va `directory` trong he thong moi.
- Tao bo file Postman/environment mau va tai lieu import de doi test co the goi truc tiep cac API chinh cua backend moi.
- Tao `go_live_checklist_chuyen_he_thong_that.md` de dung cho ngay cutover that tu he thong cu sang he thong moi.
- Tao `lenh_powershell_trien_khai_backend_moi.md` lam runbook lenh PowerShell tuan tu de trien khai backend moi tren may co `.NET SDK`.
- Tao `runbook_trien_khai_frontend_static_len_iis.md` va `bao_cao_phu_thuoc_con_lai_trong_frontend_static.md` de chot cach deploy frontend moi len IIS va xac dinh cac phu thuoc Firebase/Google Apps Script con phai thay not.
- Bo sung backend thay the `survey`, `stats`, `notice` trong workspace `he-thong-moi-server-rieng`, mo rong schema SQL voi `stats.UsageEvents` va `notify.Notices`, dieu chinh `frontend-static` de uu tien goi API moi, va tao bao cao `bao_cao_thay_the_survey_stats_notice.md`.
- Bo sung backend thay the `push notification` theo huong `Web Push + VAPID`, tao `PushController`, `PushOptions`, service luu subscription/gui thong bao day, tao `frontend-static/push-sw.js`, chuyen `frontend-static/app.js` sang uu tien push backend moi, va tao bao cao `bao_cao_thay_the_push_notification.md`.
