# Lenh PowerShell trien khai backend moi

Ngay lap: 2026-04-13

## 1. Muc tieu

Tai lieu nay la runbook thuc thi nhanh tren may da cai:

- `.NET SDK 8`
- `SQL Server`

Muc tieu:

- khoi tao moi truong test cho backend moi
- tao migration
- update database
- seed admin
- seed du lieu mau
- chay backend test

## 2. Gia dinh duong dan

Gia dinh source nam tai:

```powershell
C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien
```

Project backend:

```powershell
C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\backend-api\Sotay.Server.Api
```

## 3. Buoc 1 - Mo PowerShell va di chuyen vao project

```powershell
Set-Location "C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\backend-api\Sotay.Server.Api"
```

## 4. Buoc 2 - Kiem tra .NET SDK

```powershell
dotnet --info
dotnet --version
```

Ky vong:

- co `.NET SDK 8`

## 5. Buoc 3 - Tao file cau hinh test

```powershell
Copy-Item ".\appsettings.Test.example.json" ".\appsettings.Test.json" -Force
notepad ".\appsettings.Test.json"
```

Can sua:

- `Database.ConnectionString`
- `AdminSeed.UserName`
- `AdminSeed.Password`
- `Chatbot.ApiKey`

## 6. Buoc 4 - Restore package

```powershell
dotnet restore
```

## 7. Buoc 5 - Tao migration dau tien

Chi chay neu project chua co migration:

```powershell
$env:ASPNETCORE_ENVIRONMENT="Test"
dotnet ef migrations add InitialFoundation
```

Neu da co migration thi bo qua buoc nay.

## 8. Buoc 6 - Update database test

```powershell
$env:ASPNETCORE_ENVIRONMENT="Test"
dotnet ef database update
```

Ky vong:

- database `SotayNghiepVu_Test` duoc tao
- bang `auth`, `core`, `directory`, `survey`, `chatbot`, `notify`, `audit` duoc tao

## 9. Buoc 7 - Chay backend moi truong test

```powershell
$env:ASPNETCORE_ENVIRONMENT="Test"
dotnet run --launch-profile "Sotay.Server.Api.Test"
```

Ky vong:

- backend chay o `https://localhost:7243`
- swagger mo duoc

## 10. Buoc 8 - Kiem tra seed admin va seed du lieu mau

Neu `AdminSeed.Enabled = true` va `SampleDataSeed.Enabled = true`, backend se tu:

- tao admin dau tien
- tao du lieu mau cho `content`
- tao du lieu mau cho `directory`

Kiem tra nhanh bang Postman hoac trinh duyet:

```powershell
start https://localhost:7243/swagger
```

## 11. Buoc 9 - Smoke test nhanh bang Postman

Import cac file:

```powershell
C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\docs\postman\Sotay-Server-Api.postman_collection.json
C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\docs\postman\Sotay-Server-Api.Test.postman_environment.json
```

Test theo thu tu:

1. `Health`
2. `Admin Login`
3. `Get Content Tree`
4. `Get Directory Tree`
5. `Ask Chatbot`

## 12. Buoc 10 - Mo frontend-static de test ket noi

Co the dung mot static server don gian. Vi du neu may co Python:

```powershell
Set-Location "C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\frontend-static"
python -m http.server 8080
```

Mo trinh duyet:

```powershell
start http://localhost:8080
```

Luu y:

- frontend hien dang mac dinh goi API theo `SERVER_API_BASE_URL = /api`
- khi test tach cong, can dat reverse proxy hoac sua tam `SERVER_API_BASE_URL`

## 13. Buoc 11 - Neu can sua tam API base cho frontend test

Mo file:

```powershell
notepad "C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\frontend-static\app.js"
```

Tim:

```javascript
SERVER_API_BASE_URL: "/api"
```

Doi tam thanh:

```javascript
SERVER_API_BASE_URL: "https://localhost:7243/api"
```

Sau khi test xong, dua ve cau hinh phu hop voi mo hinh deploy that.

## 14. Buoc 12 - Kiem tra log va tat seed sau khi xong

Sau khi da co du lieu va admin that:

- tat `AdminSeed.Enabled`
- tat `SampleDataSeed.Enabled`

Neu can:

```powershell
notepad ".\appsettings.Test.json"
```

## 15. Neu gap loi

### Loi restore/build

```powershell
dotnet clean
dotnet restore
```

### Loi migration

Kiem tra:

- `ConnectionString`
- quyen tao database
- SQL Server dang chay

### Loi login admin

Kiem tra:

- `AdminSeed.Enabled = true`
- backend da restart sau khi sua cau hinh
- bang `auth` da tao xong

### Loi chatbot

Kiem tra:

- `Chatbot.ApiKey`
- ket noi Internet tu may chay backend
- neu chua co API key, backend se fallback mock

## 16. Tai lieu di kem

- `huong_dan_tao_migration_identity_va_database.md`
- `huong_dan_seed_du_lieu_mau_test.md`
- `checklist_smoke_test_backend_moi.md`
- `postman/README.md`
- `go_live_checklist_chuyen_he_thong_that.md`
