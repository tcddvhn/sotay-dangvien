# Huong dan khoi dong workspace he thong moi

Ngay lap: 2026-04-13

## 1. Muc tieu

Tai lieu nay huong dan cach bat dau phat trien he thong moi trong thu muc `he-thong-moi-server-rieng` ma khong anh huong he thong cu dang chay.

## 2. Cau truc dang co

- `frontend-static/`: ban sao frontend hien tai
- `backend-api/Sotay.Server.Api/`: skeleton backend moi
- `database/schema_v1_foundation.sql`: schema SQL khoi dau
- `database/du_kien_mapping_firestore_sang_sql.md`: mapping du lieu cu sang moi
- `database/identity_du_kien.md`: dinh huong xac thuc admin
- `docs/trang_thai_chuyen_frontend_sang_backend_moi.md`: trang thai chuyen frontend
- `docs/checklist_smoke_test_backend_moi.md`: checklist chay thu backend moi
- `docs/huong_dan_seed_du_lieu_mau_test.md`: huong dan seed du lieu mau test
- `docs/postman/README.md`: bo request import vao Postman/Insomnia
- `docs/go_live_checklist_chuyen_he_thong_that.md`: checklist cutover he thong that
- `docs/lenh_powershell_trien_khai_backend_moi.md`: runbook lenh PowerShell thuc thi tuan tu
- `docs/runbook_trien_khai_frontend_static_len_iis.md`: runbook dua frontend moi len IIS
- `docs/bao_cao_phu_thuoc_con_lai_trong_frontend_static.md`: danh sach phu thuoc cu con sot lai
- `docs/bao_cao_thay_the_survey_stats_notice.md`: ket qua thay survey/stats/notice sang backend moi
- `docs/bao_cao_thay_the_push_notification.md`: ket qua thay push notification sang backend moi

## 3. Trang thai hien tai

- Frontend moi: la ban sao nen de chuyen doi dan
- Backend moi: co skeleton, `DbContext`, entity va API mau
- Database moi: co schema nen, chua apply len SQL Server
- Auth moi: da co huong `Identity`, chua build test that tren may nay

Chi tiet backend hien tai:

- `content` va `directory` da co service doc `SQL Server`
- `content` va `directory` da co CRUD nen
- neu chua co `ConnectionString`, backend tu roi ve `mock service`
- `auth` da co `IdentityAdminAuthService`; neu co DB thi login admin di qua `Identity`
- `auth` da co `AdminSeedHostedService`; co the seed admin dau tien bang cau hinh
- `chatbot` da co gateway goi API AI; neu co `ApiKey` thi chatbot di qua backend that
- `survey` da co service va controller ghi nhan du lieu vao `survey.Responses`
- `stats` da co service va controller ghi `UsageEvents` va tong hop dashboard
- `notice` da co service va controller doc/ghi `notify.Notices`
- `push` da co service va controller luu subscription va gui thong bao day theo Web Push
- da tao migration EF Core dau tien `InitialFoundation` trong `Data/Migrations`
- neu chua co `ApiKey`, chatbot tu roi ve `mock service`

## 4. Nhung gi chua cai tren may hien tai

May lam viec hien tai da co:

- `.NET SDK 8.0.419`

Da lam duoc tren may nay:

- `dotnet restore`
- `dotnet build`
- tao migration that

## 5. Dieu kien de bat dau chay backend that

Phai cai:

- `.NET SDK 8`
- `SQL Server` hoac moi truong test co SQL Server
- cong cu quan tri SQL nhu `SSMS` hoac `Azure Data Studio`

## 6. Trinh tu khuyen nghi de tiep tuc

### Buoc 1

- Cai `.NET SDK 8`
- Mo project `backend-api/Sotay.Server.Api`
- Chay restore va build

### Buoc 2

- Chuan bi `appsettings.Test.json` tu `appsettings.Test.example.json`
- Dien `ConnectionString` cho moi truong test
- Tao migration dau tien neu chon quan ly schema bang migration
- Tham khao them `huong_dan_tao_migration_identity_va_database.md`

### Buoc 3

- Apply `schema_v1_foundation.sql` hoac chuyen sang quan ly schema bang migration
- Tao database test

### Buoc 4

- Bat `AdminSeed`, tao tai khoan admin dau tien
- Bat `SampleDataSeed`, tao du lieu mau test cho `content`, `directory`, `usage events`, `notices`
- Cau hinh `ApiKey` chatbot o secret store hoac bien moi truong

### Buoc 5

- Chay Postman test cho `content`, `directory`, `auth`, `chatbot`, `survey`, `stats`, `notice`
- Mo `frontend-static` de test luong backend moi
- Sau do moi mo CRUD quan tri chi tiet cho tung man hinh

## 7. Quy tac an toan

- Khong sua he thong cu o thu muc goc neu chi de phuc vu he thong moi
- Chi lam viec trong `he-thong-moi-server-rieng`
- Moi ket noi that den AI API, SQL production, secret production deu phai quan ly ngoai source code

## 8. Dau viec tiep theo nen lam ngay

1. Xac dinh hoac cai dat instance SQL Server/LocalDB cho may test
2. Chay `database update`
3. Bat `AdminSeed`, tao tai khoan admin dau tien va test login thuc te
4. Bat `SampleDataSeed`, tao du lieu mau test
5. Cau hinh `ApiKey` chatbot va test gateway AI thuc te
6. Dien `PushOptions` va test `Web Push`
7. Mo `frontend-static` de test lai toan bo luong da chuyen
8. Sau khi on dinh moi bo fallback cu

Khi chay thu lan dau, dung them:

- `checklist_smoke_test_backend_moi.md`
- `huong_dan_seed_du_lieu_mau_test.md`
- `postman/README.md`
- `lenh_powershell_trien_khai_backend_moi.md`

Khi san sang cutover that, dung:

- `go_live_checklist_chuyen_he_thong_that.md`
- `runbook_trien_khai_frontend_static_len_iis.md`
- `bao_cao_phu_thuoc_con_lai_trong_frontend_static.md`
