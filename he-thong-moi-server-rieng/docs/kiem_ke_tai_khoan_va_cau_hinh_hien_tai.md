# Kiem ke tai khoan va cau hinh hien tai

Ngay cap nhat: 2026-04-14

## 1. Muc dich

Tai lieu nay ghi lai cac tai khoan, tham so, va quy uoc da dung tren may hien tai de anh/chị quan ly va doi chieu khi dua sang may chu moi.

## 2. SQL Server tren may hien tai

- Cach xac thuc dang dung: `Windows Integrated Security`
- SQL instance dang dung: `.\SQLEXPRESS`
- Database test dang dung: `SotayNghiepVu_Test`
- Database production tren may hien tai: chua tao
- SQL login rieng: chua tao

Ghi chu:

- He thong hien tai khong tao tai khoan SQL username/password rieng.
- Backend ket noi bang `Trusted_Connection=True`.

## 3. Tai khoan quan tri ung dung da seed

Tai khoan test hien tai:

- Username: `admin_test`
- Password: `ChangeMe123!`
- DisplayName: `Quan tri vien test`
- Role: `SuperAdmin`

Can lam khi len production:

- Khong giu lai password test nay.
- Tao tai khoan admin production moi va doi mat khau ngay sau khi khoi tao.

## 4. URL dang dung tren may hien tai

- Frontend local: `http://localhost:5080`
- Backend local: `http://localhost:5243`

## 5. File cau hinh quan trong

Frontend:

- `he-thong-moi-server-rieng/frontend-static/runtime-config.js`
- `he-thong-moi-server-rieng/frontend-static/runtime-config.production.example.js`

Backend:

- `he-thong-moi-server-rieng/backend-api/Sotay.Server.Api/appsettings.Test.json`
- `he-thong-moi-server-rieng/backend-api/Sotay.Server.Api/appsettings.Production.example.json`

Tai lieu van hanh:

- `he-thong-moi-server-rieng/THUC_HIEN_CHUYEN_DOI.md`
- `he-thong-moi-server-rieng/deployment-manifest.json`

## 6. Cau hinh test dang dung tren may hien tai

### Database

- `ConnectionString`: `Server=.\SQLEXPRESS;Database=SotayNghiepVu_Test;Trusted_Connection=True;TrustServerCertificate=True;Encrypt=False;MultipleActiveResultSets=True;`

### CORS

- `http://localhost:5080`
- `http://127.0.0.1:5080`

### Push test

- `Enabled`: `true`
- `Subject`: `mailto:admin_test@sotay.local`
- `PublicKey`: `BD146Vc0b2foVio6kOdC0I-AyDa_QLnkZkk0Xe45jDifEBvYzbtRiopX5lCJqzZ2Z4JR_BUoRWGnNv7nCRrBj4w`
- `PrivateKey`: `W2WqE40v4A5vQMpp9iCgomEcVByMAXE1hLraEtFiH6s`
- `DefaultClickUrl`: `http://localhost:5080/`

Can lam khi len production:

- Sinh cap `VAPID key` moi cho production.
- Khong nen dung lai cap khoa test nay.

### Chatbot

- `Provider`: `OpenAI`
- `Model`: `gpt-5.4-mini`
- `ApiKey`: chua cau hinh
- Trang thai hien tai: backend dang fallback `mock chatbot`

## 7. Du lieu da migrate

Du lieu da dua vao SQL Server test:

- `content`: `319` muc, `8` muc goc
- `directory`: `134` don vi, `132` don vi goc

Nguon:

- import tu file export live Firestore trong `he-thong-moi-server-rieng/migration-data`

## 8. Cau hinh production can anh/chị quan ly rieng

Anh/chị nen quan ly rieng va khong commit cac gia tri sau vao repo:

- `Database.ConnectionString` production
- `AdminSeed.UserName`
- `AdminSeed.Password`
- `Chatbot.ApiKey`
- `Push.PublicKey`
- `Push.PrivateKey`
- thong tin domain/SSL neu khac cau hinh mac dinh

## 9. De xuat bang quan ly ngoai repo

Anh/chị nen co 1 bang quan ly rieng voi cac cot:

- `Hang muc`
- `Gia tri test hien tai`
- `Gia tri production`
- `Nguoi quan ly`
- `Ngay cap nhat`
- `Ghi chu`

## 10. Ket luan van hanh

Bo file nay du de Codex tren may chu moi hieu:

- da co nhung gi
- dang dung tham so nao
- can tao moi nhung secret nao
- khong duoc mang nham cau hinh local/test len production
