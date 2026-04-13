# Runbook trien khai frontend-static len IIS

Ngay lap: 2026-04-13

## 1. Muc tieu

Tai lieu nay dung de dua `frontend-static` cua he thong moi len `IIS` tren `Windows Server 2022`.

Muc tieu:

- frontend moi chay duoc tren domain test hoac domain that
- frontend goi duoc backend moi
- khong anh huong he thong cu trong qua trinh kiem thu

## 2. Thu muc nguon

Frontend can deploy nam tai:

```powershell
C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\frontend-static
```

## 3. Thu muc dich goi y tren server

Thu muc deploy goi y:

```powershell
C:\inetpub\sotay-nghiep-vu-moi
```

## 4. Buoc 1 - Chuan bi IIS

Phai co:

- `Web Server (IIS)`
- `Static Content`
- `Default Document`
- `Request Filtering`
- `Static Content Compression`
- `Management Console`

## 5. Buoc 2 - Tao thu muc deploy

```powershell
New-Item -ItemType Directory -Force -Path "C:\inetpub\sotay-nghiep-vu-moi" | Out-Null
```

## 6. Buoc 3 - Copy frontend-static len server

```powershell
Copy-Item "C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\frontend-static\*" "C:\inetpub\sotay-nghiep-vu-moi" -Recurse -Force
```

Neu deploy tu may khac, dung zip hoac copy qua share/RDP roi giai nen vao thu muc dich.

## 7. Buoc 4 - Dieu chinh API base neu frontend va backend tach cong

Mac dinh trong `frontend-static/app.js`:

```javascript
SERVER_API_BASE_URL: "/api"
```

Dung cau hinh nay neu:

- frontend va backend cung domain
- co reverse proxy tu IIS vao backend

Neu frontend goi truc tiep backend test port rieng, doi tam thanh:

```javascript
SERVER_API_BASE_URL: "https://localhost:7243/api"
```

Khuyen nghi:

- dung reverse proxy cung domain de giam CORS

## 8. Buoc 5 - Tao website trong IIS

Tao site moi:

- Site name: `SotayNghiepVuMoi`
- Physical path: `C:\inetpub\sotay-nghiep-vu-moi`
- Binding http: `80`
- Binding https: `443`
- Host name: domain test hoac domain that

## 9. Buoc 6 - Cau hinh MIME types

Them neu chua co:

- `.mjs` -> `text/javascript`
- `.wasm` -> `application/wasm`
- `.map` -> `application/json`
- `.bcmap` -> `application/octet-stream`
- `.ftl` -> `text/plain`
- `.pfb` -> `application/octet-stream`
- `.ttf` -> `font/ttf`

## 10. Buoc 7 - Kiem tra default document

Bao dam:

- `index.html` nam trong danh sach `Default Document`

## 11. Buoc 8 - Neu frontend va backend cung domain

Neu backend chay Kestrel hoac service rieng, can co reverse proxy `/api` tu IIS vao backend.

Muc tieu:

- `https://domain/api/...` -> backend moi
- `https://domain/` -> frontend-static

Neu chua co reverse proxy, frontend van co the test bang API base tuyet doi tam thoi.

## 12. Buoc 9 - Kiem tra nhanh sau deploy

- mo `https://domain`
- kiem tra CSS tai du
- kiem tra tab danh ba
- kiem tra tim kiem noi dung
- kiem tra login admin
- kiem tra chatbot
- kiem tra mo PDF viewer

## 13. Buoc 10 - Cac loi hay gap

### Loi 404 voi PDF.js

Kiem tra:

- da copy day du `web/`
- da copy day du `build/`

### Loi MIME voi `.mjs` hoac `.wasm`

Kiem tra:

- MIME type tren IIS

### Loi frontend khong goi duoc backend

Kiem tra:

- `SERVER_API_BASE_URL`
- reverse proxy `/api`
- CORS neu khac domain

### Loi service worker

Kiem tra:

- deploy tai root dung domain
- HTTPS hop le

## 14. Kiem tra dat

- frontend-static mo duoc tren IIS
- goi duoc backend moi
- login admin duoc
- content va directory hien thi dung
- chatbot tra loi duoc

