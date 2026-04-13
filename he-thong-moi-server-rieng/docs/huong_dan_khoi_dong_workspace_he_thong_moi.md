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

## 3. Trạng thái hiện tại

- Frontend mới: mới là bản sao nền để chuyển đổi dần
- Backend mới: có skeleton, `DbContext`, entity và API mẫu
- Database mới: có schema nền, chưa apply lên SQL Server
- Auth mới: mới dừng ở định hướng, chưa tích hợp Identity thật

Chi tiết backend hiện tại:

- `content` và `directory` đã có service đọc `SQL Server`
- nếu chưa có `ConnectionString`, backend tự rơi về `mock service`
- `auth` và `chatbot` hiện vẫn là mock để khóa phạm vi API trước

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
- Điền `ConnectionString` cho môi trường test
- Tạo migration đầu tiên nếu chọn quản lý schema bằng migration

### Bước 3

- Apply `schema_v1_foundation.sql` hoặc chuyển sang quản lý schema bằng migration
- Tạo database test

### Bước 4

- Thay `MockAdminAuthService` bằng Identity thật
- Thay `MockChatbotService` bằng gateway gọi API AI thật
- Hoàn thiện CRUD cho `content` và `directory`

### Bước 5

- Chỉnh `frontend-static/app.js` để gọi backend mới
- Tách dần các phụ thuộc Firebase và Apps Script

## 7. Quy tắc an toàn

- Không sửa hệ thống cũ ở thư mục gốc nếu chỉ để phục vụ hệ thống mới
- Chỉ làm việc trong `he-thong-moi-server-rieng`
- Mọi kết nối thật đến AI API, SQL production, secret production đều phải quản lý ngoài source code

## 8. Đầu việc tiếp theo nên làm ngay

1. Tạo CRUD cho `ContentNodes` và `DirectoryUnits`
2. Tạo `DbContext`/migration cho auth bằng `ASP.NET Core Identity`
3. Tạo API đăng nhập admin thật bằng `ASP.NET Core Identity`
4. Tạo API chatbot backend gọi API AI thật
5. Bắt đầu chỉnh frontend bản sao để đổi endpoint
