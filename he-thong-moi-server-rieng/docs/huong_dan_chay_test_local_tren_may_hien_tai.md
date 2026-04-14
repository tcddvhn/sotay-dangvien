# Huong dan chay test local tren may hien tai

Ngay cap nhat: 2026-04-14

## 1. Trang thai hien tai

May hien tai da co:

- `.NET SDK 8.0.419`
- backend moi build thanh cong
- da tao migration EF Core dau tien `InitialFoundation`
- `SQLEXPRESS` da cai xong va DB test da duoc `database update`
- `appsettings.Test.json` dang noi vao `SotayNghiepVu_Test`
- frontend-static co `runtime-config.js` tro sang backend local

## 2. URL test local

- Frontend: `http://localhost:5080`
- Backend API: `http://localhost:5243`

## 3. Tai khoan dang nhap hien tai

Backend `Test` dang chay voi SQL Server that, tai khoan seed hien tai:

- username: `admin_test`
- password: `ChangeMe123!`

## 4. File cau hinh lien quan

- `frontend-static/runtime-config.js`
- `backend-api/Sotay.Server.Api/appsettings.Test.json`

## 5. Ghi chu quan trong

- backend dang doc du lieu that tu `SotayNghiepVu_Test`
- seed mau da tao du lieu cho `content`, `directory`, `stats`, `notice`, va tai khoan admin
- push hien `enabled = false` vi chua cau hinh VAPID
- chatbot van dung mock vi `Chatbot.ApiKey` trong `appsettings.Test.json` dang de rong

## 6. Cach mo lai neu can

### Backend

```powershell
$env:ASPNETCORE_ENVIRONMENT='Test'
$env:ASPNETCORE_URLS='http://localhost:5243'
dotnet run --no-launch-profile --project .\Sotay.Server.Api.csproj
```

Chay trong thu muc:

- `he-thong-moi-server-rieng/backend-api/Sotay.Server.Api`

### Frontend

```powershell
node serve-local.js
```

Chay trong thu muc:

- `he-thong-moi-server-rieng/frontend-static`

## 7. Viec tiep theo

1. Dien `Chatbot.ApiKey` neu muon test chatbot gateway that
2. Cau hinh `PushOptions` neu muon test Web Push that
3. Chay lai smoke test bang Postman va frontend
4. Thay du lieu mau bang du lieu migrate that tu he thong cu

## 8. Ket qua xac nhan nhanh

- `GET /api/content/tree`: ok
- `GET /api/directory/tree`: ok
- `GET /api/stats/dashboard`: ok
- `GET /api/notices/latest`: ok
- `POST /api/survey/submit`: ok
- `POST /api/admin/auth/login`: ok qua `Identity`
