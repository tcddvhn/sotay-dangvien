# Checklist smoke test backend moi

Ngay lap: 2026-04-13

## 1. Muc tieu

Checklist nay dung de chay thu nhanh backend moi sau khi:

- da cai `.NET SDK 8`
- da tao migration
- da update database test
- da bat `AdminSeed`

## 2. Chuan bi

- Sao chep `appsettings.Test.example.json` thanh `appsettings.Test.json`
- Dien `ConnectionString` test
- Dien `Chatbot.ApiKey` neu muon test gateway AI that
- Chay backend voi moi truong `ASPNETCORE_ENVIRONMENT=Test`

## 3. Chay backend

Lenh goi y:

```powershell
dotnet restore
dotnet ef migrations add InitialFoundation
dotnet ef database update
$env:ASPNETCORE_ENVIRONMENT='Test'
dotnet run --launch-profile "Sotay.Server.Api.Test"
```

## 4. Smoke test API

### 4.1. Health

- Mo `GET /api/health`
- Ky vong:
  - HTTP 200
  - `success = true`

### 4.2. Admin login

- Goi `POST /api/admin/auth/login`
- Payload:

```json
{
  "username": "admin_test",
  "password": "ChangeMe123!"
}
```

- Ky vong:
  - HTTP 200
  - `authenticated = true`

### 4.3. Content tree

- Goi `GET /api/content/tree`
- Ky vong:
  - HTTP 200
  - tra ve mang

### 4.4. Luu mot node content

- Goi `POST /api/content/save`
- Payload mau:

```json
{
  "id": null,
  "parentId": null,
  "title": "Noi dung test",
  "tag": "test",
  "summaryHtml": "<p>Tom tat test</p>",
  "detailHtml": "<p>Chi tiet test</p>",
  "fileUrl": "",
  "fileName": "",
  "pdfRefsJson": "[]",
  "forceAccordion": false,
  "level": 0,
  "sortOrder": 1,
  "isActive": true,
  "updatedBy": "admin_test"
}
```

- Ky vong:
  - HTTP 200
  - tra ve object vua luu

### 4.5. Directory tree

- Goi `GET /api/directory/tree`
- Ky vong:
  - HTTP 200
  - tra ve mang

### 4.6. Luu mot don vi danh ba

- Goi `POST /api/directory/save`
- Payload mau:

```json
{
  "id": null,
  "parentId": null,
  "name": "Don vi test",
  "unitCode": "DVTEST",
  "level": 1,
  "phone": "024-0000000",
  "address": "Ha Noi",
  "location": "Phong test",
  "sortOrder": 1,
  "isActive": true,
  "updatedBy": "admin_test"
}
```

- Ky vong:
  - HTTP 200
  - tra ve object vua luu

### 4.7. Chatbot

- Goi `POST /api/chatbot/ask`
- Payload:

```json
{
  "message": "Chao ban"
}
```

- Ky vong:
  - Neu co `ApiKey`: HTTP 200, co `reply`
  - Neu chua co `ApiKey`: backend fallback mock, van co `reply`

## 5. Smoke test frontend-static

- Dung web server tinh de mo `frontend-static`
- Chinh `SERVER_API_BASE_URL` neu can
- Kiem tra:
  - tai noi dung
  - dang nhap admin
  - luu noi dung
  - tab danh ba
  - chatbot

## 6. Dieu kien dat

- khong loi 500 o cac API chinh
- login admin thanh cong
- content CRUD duoc
- directory CRUD duoc
- chatbot co phan hoi

## 7. Neu loi

- kiem tra `ConnectionString`
- kiem tra migration da chay chua
- kiem tra `AdminSeed.Enabled`
- kiem tra `Chatbot.ApiKey`
- kiem tra CORS va port chay test
