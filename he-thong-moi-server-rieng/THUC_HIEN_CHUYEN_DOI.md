# THUC HIEN CHUYEN DOI

Ngay cap nhat: 2026-04-14

## Muc dich

File nay dung de Codex tren may chu moi doc va thuc hien qua trinh chuyen doi he thong sang server rieng.

Khi nguoi van hanh da copy toan bo thu muc `he-thong-moi-server-rieng` sang may chu moi, chi can mo repo va ra lenh:

```text
Hay thuc hien chuyen doi
```

Codex phai doc file nay, file `deployment-manifest.json`, va file `docs/kiem_ke_tai_khoan_va_cau_hinh_hien_tai.md`, sau do thuc hien toan bo cong viec can thiet.

## Pham vi cong viec bat buoc

Codex tren may chu moi phai:

1. Kiem tra moi truong may chu:
   - `Windows Server 2022`
   - `IIS`
   - `.NET SDK 8`
   - `SQL Server`
2. Xac dinh workspace dang dung co dung la thu muc `he-thong-moi-server-rieng`.
3. Kiem tra va tao cac file cau hinh production neu chua co:
   - `backend-api/Sotay.Server.Api/appsettings.Production.json`
   - `frontend-static/runtime-config.js`
4. Cau hinh backend production:
   - `Database.ConnectionString`
   - `Cors.AllowedOrigins`
   - `Auth`
   - `Push`
   - `Chatbot`
5. Tao hoac sinh moi `VAPID keys` cho production.
6. Khong duoc tai su dung `VAPID keys` test neu may chu moi la production that.
7. Restore, build, publish backend.
8. Chay migration database.
9. Tao tai khoan admin dau tien bang `AdminSeed` neu chua co.
10. Neu thu muc `migration-data` co file export live thi import du lieu `content` va `directory` vao SQL Server.
11. Deploy frontend len IIS.
12. Thay `runtime-config.js` bang ban production chi tro toi `/api`.
13. Cau hinh IIS hoac reverse proxy de:
    - `https://domain/` -> frontend
    - `https://domain/api/` -> backend
14. Smoke test toan bo:
    - health
    - admin login
    - content
    - directory
    - stats
    - notice
    - survey
    - push public key
    - chatbot neu da co `ApiKey`
15. Tao bao cao ket qua trien khai sau khi xong.

## Nguyen tac van hanh

- Khong sua he thong cu trong thu muc goc.
- Chi thao tac trong workspace moi.
- Uu tien dung cac file huong dan va runbook da co san trong `docs/`.
- Neu thieu thong tin quan trong cho production, Codex phai dung lai va hoi nguoi van hanh. Khong duoc tu suy dien secret.

## Cac thong tin duoc phep gia dinh

Neu nguoi van hanh khong ghi ro, Codex co the tam gia dinh:

- SQL instance: `.\SQLEXPRESS`
- Database production: `SotayNghiepVu_Production`
- Domain production: `sotaynghiepvu.dcs.vn`
- Physical path frontend tren IIS: `C:\inetpub\sotay-nghiep-vu`
- Site name IIS: `SotayNghiepVu`

Neu may chu thuc te khac cac gia dinh nay, Codex phai sua lai theo moi truong thuc te.

## Cac dieu kien phai hoi lai nguoi van hanh

Codex phai hoi lai neu gap mot trong cac truong hop sau:

- Chua co `Chatbot.ApiKey` ma nguoi van hanh van muon chatbot that.
- Chua co file du lieu import ma nguoi van hanh muon dua du lieu cu sang he thong moi.
- SQL Server ton tai nhieu instance va khong ro instance nao duoc dung.
- IIS chua co binding/domain/SSL ro rang.
- Nguoi van hanh muon dung ten mien khac `sotaynghiepvu.dcs.vn`.

## Thu tu file uu tien can doc

1. `deployment-manifest.json`
2. `docs/kiem_ke_tai_khoan_va_cau_hinh_hien_tai.md`
3. `docs/huong_dan_chot_cau_hinh_production.md`
4. `docs/runbook_trien_khai_frontend_static_len_iis.md`
5. `docs/lenh_powershell_trien_khai_backend_moi.md`
6. `docs/checklist_smoke_test_backend_moi.md`
7. `docs/go_live_checklist_chuyen_he_thong_that.md`

## Dau ra bat buoc sau khi hoan tat

Codex phai bao cao it nhat:

- SQL instance da dung
- ten database da tao
- file cau hinh da tao/sua
- URL backend/frontend sau trien khai
- tai khoan admin khoi tao dau tien
- ket qua tung muc smoke test
- cac muc chua hoan tat, neu co
