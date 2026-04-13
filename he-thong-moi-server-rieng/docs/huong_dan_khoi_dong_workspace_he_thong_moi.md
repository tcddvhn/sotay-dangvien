# Hướng dẫn khởi động workspace hệ thống mới

Ngày lập: 2026-04-13

## 1. Mục tiêu

Tài liệu này hướng dẫn cách bắt đầu phát triển hệ thống mới trong thư mục `he-thong-moi-server-rieng` mà không ảnh hưởng hệ thống cũ đang chạy.

## 2. Cấu trúc đang có

- `frontend-static/`: bản sao frontend hiện tại
- `backend-api/Sotay.Server.Api/`: skeleton backend mới
- `database/schema_v1_foundation.sql`: schema SQL khởi đầu
- `database/du_kien_mapping_firestore_sang_sql.md`: mapping dữ liệu cũ sang mới
- `database/identity_du_kien.md`: định hướng xác thực admin
- `docs/trang_thai_chuyen_frontend_sang_backend_moi.md`: trạng thái chuyển frontend
- `docs/checklist_smoke_test_backend_moi.md`: checklist chạy thử backend mới
- `docs/huong_dan_seed_du_lieu_mau_test.md`: hướng dẫn seed dữ liệu mẫu test
- `docs/postman/README.md`: bo request import vao Postman/Insomnia
- `docs/go_live_checklist_chuyen_he_thong_that.md`: checklist cutover he thong that

## 3. Trạng thái hiện tại

- Frontend mới: mới là bản sao nền để chuyển đổi dần
- Backend mới: có skeleton, `DbContext`, entity và API mẫu
- Database mới: có schema nền, chưa apply lên SQL Server
- Auth mới: mới dừng ở định hướng, chưa tích hợp Identity thật

Chi tiết backend hiện tại:

- `content` và `directory` đã có service đọc `SQL Server`
- `content` và `directory` đã có CRUD nền
- nếu chưa có `ConnectionString`, backend tự rơi về `mock service`
- `auth` đã có `IdentityAdminAuthService`; nếu có DB thì login admin đi qua `Identity`
- `auth` đã có `AdminSeedHostedService`; có thể seed admin đầu tiên bằng cấu hình
- `chatbot` đã có gateway gọi API AI; nếu có `ApiKey` thì chatbot đi qua backend thật
- nếu chưa có `ApiKey`, chatbot tự rơi về `mock service`

## 4. Những gì chưa cài trên máy hiện tại

Máy làm việc hiện tại chưa có:

- `.NET SDK`

Vì vậy:

- chưa chạy `dotnet restore`
- chưa build được project backend
- chưa tạo migration thật

## 5. Điều kiện để bắt đầu chạy backend thật

Phải cài:

- `.NET SDK 8`
- `SQL Server` hoặc môi trường test có SQL Server
- công cụ quản trị SQL như `SSMS` hoặc `Azure Data Studio`

## 6. Trình tự khuyến nghị để tiếp tục

### Bước 1

- Cài `.NET SDK 8`
- Mở project `backend-api/Sotay.Server.Api`
- Chạy restore và build

### Bước 2

- Chạy restore cho các package `Entity Framework Core`
- Kiểm tra `appsettings.json`
- Chuẩn bị `appsettings.Test.json` từ `appsettings.Test.example.json`
- Điền `ConnectionString` cho môi trường test
- Tạo migration đầu tiên nếu chọn quản lý schema bằng migration
- Tham khảo thêm `huong_dan_tao_migration_identity_va_database.md`

### Bước 3

- Apply `schema_v1_foundation.sql` hoặc chuyển sang quản lý schema bằng migration
- Tạo database test

### Bước 4

- Hoàn thiện CRUD cho `content` và `directory`
- Tạo migration cho các bảng `auth`
- Tạo tài khoản admin đầu tiên
- Cấu hình `ApiKey` chatbot ở secret store hoặc biến môi trường

### Bước 5

- Chỉnh `frontend-static/app.js` để gọi backend mới
- Tách dần các phụ thuộc Firebase và Apps Script

## 7. Quy tắc an toàn

- Không sửa hệ thống cũ ở thư mục gốc nếu chỉ để phục vụ hệ thống mới
- Chỉ làm việc trong `he-thong-moi-server-rieng`
- Mọi kết nối thật đến AI API, SQL production, secret production đều phải quản lý ngoài source code

## 8. Đầu việc tiếp theo nên làm ngay

1. Tạo migration thật cho `Identity` và `SQL Server`
2. Bật `AdminSeed`, tạo tài khoản admin đầu tiên và test login thực tế
3. Bật `SampleDataSeed`, tạo dữ liệu mẫu test cho `content` và `directory`
4. Cấu hình `ApiKey` chatbot và test gateway AI thực tế
5. Bắt đầu chỉnh frontend bản sao để đổi endpoint
6. Sau đó mới mở CRUD quản trị chi tiết cho từng màn hình

Khi chay thu lan dau, dung them:

- `checklist_smoke_test_backend_moi.md`
- `huong_dan_seed_du_lieu_mau_test.md`
- `postman/README.md`

Khi san sang cutover that, dung:

- `go_live_checklist_chuyen_he_thong_that.md`
