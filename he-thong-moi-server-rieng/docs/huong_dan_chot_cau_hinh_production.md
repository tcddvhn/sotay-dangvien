# Huong dan chot cau hinh production

Ngay cap nhat: 2026-04-14

## 1. Muc tieu

Tai lieu nay dung de chot 3 cau hinh cuoi truoc khi dua he thong moi len server that:

- `runtime-config.js` cua frontend
- `appsettings.Production.json` cua backend
- `VAPID keys` cho Web Push

## 2. Frontend production

Frontend production khong duoc de API base la `localhost`.

Dung file mau:

```powershell
he-thong-moi-server-rieng\frontend-static\runtime-config.production.example.js
```

Khi deploy that, copy noi dung file mau nay de thay cho:

```powershell
he-thong-moi-server-rieng\frontend-static\runtime-config.js
```

Gia tri dung cho production:

- `SERVER_API_BASE_URL = "/api"`
- `STRICT_SERVER_MODE = true`
- tat ca URL Apps Script de rong

Ly do:

- frontend va backend nen chay cung domain `https://sotaynghiepvu.dcs.vn`
- frontend chi goi `https://sotaynghiepvu.dcs.vn/api/...`
- khong de sot lai duong dan `localhost` hay Firebase fallback

## 3. Backend production

Tao file:

```powershell
he-thong-moi-server-rieng\backend-api\Sotay.Server.Api\appsettings.Production.json
```

Du lieu nen dua vao:

- `Database.ConnectionString`
- `Cors.AllowedOrigins`
- `Push.Subject`
- `Push.PublicKey`
- `Push.PrivateKey`
- `Chatbot.ApiKey`

Co the lay file nay lam mau:

```powershell
he-thong-moi-server-rieng\backend-api\Sotay.Server.Api\appsettings.Production.example.json
```

## 4. Cau hinh CORS

Backend da duoc sua de doc danh sach origin tu `appsettings`.

Production de xuat:

```json
"Cors": {
  "AllowedOrigins": [
    "https://sotaynghiepvu.dcs.vn"
  ]
}
```

Neu co domain test rieng, them domain test vao cung mang nay.

## 5. Tao VAPID keys

Script tao khoa da co san:

```powershell
.\he-thong-moi-server-rieng\tools\generate-vapid-keys.ps1
```

Neu muon luu ra file:

```powershell
.\he-thong-moi-server-rieng\tools\generate-vapid-keys.ps1 -OutputPath .\he-thong-moi-server-rieng\secrets\vapid.production.json
```

Lay `publicKey` va `privateKey` dien vao:

```json
"Push": {
  "Enabled": true,
  "Subject": "mailto:admin@dcs.vn",
  "PublicKey": "PUBLIC_KEY",
  "PrivateKey": "PRIVATE_KEY",
  "DefaultClickUrl": "https://sotaynghiepvu.dcs.vn/"
}
```

## 6. Chatbot

He thong moi da san sang cho chatbot qua backend rieng, nhung production van can:

- `Chatbot.ApiKey`

Khong duoc de API key trong frontend.

Chi dien vao:

```json
"Chatbot": {
  "ApiKey": "SET_FROM_SECURE_STORE"
}
```

## 7. Thu tu chot cau hinh

1. Tao `appsettings.Production.json`
2. Sinh `VAPID keys`
3. Dien `Push.PublicKey` va `Push.PrivateKey`
4. Dien `Chatbot.ApiKey`
5. Doi `runtime-config.js` cua frontend sang ban production
6. Publish backend va deploy frontend len IIS
7. Smoke test lai tren domain that

## 8. Dieu kien dat

- frontend khong con chuoi `localhost`
- frontend khong con URL Apps Script/Firebase fallback trong `runtime-config.js`
- backend tra `push/public-key` voi `enabled = true`
- chatbot tra loi qua backend moi
- content/directory/admin login van hoat dong binh thuong
