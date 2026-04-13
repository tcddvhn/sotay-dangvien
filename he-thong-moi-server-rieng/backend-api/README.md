# Backend API cho hệ thống mới

Thư mục này hiện đã có skeleton dự án tại:

- `Sotay.Server.Api/`

## Trạng thái hiện tại

- Đã dựng khung `ASP.NET Core Web API` thủ công.
- Chưa chạy build vì máy hiện tại chưa cài `.NET SDK`.
- Đã bổ sung `DbContext`, entity và service đọc `SQL Server` cho `content` và `directory`.
- Đã mở CRUD nền cho `content` và `directory`.
- Đã bổ sung nền `ASP.NET Core Identity` ở mức dữ liệu và service registration.
- Đã có `IdentityAdminAuthService`: nếu có DB thì login admin đi qua `Identity`.
- Đã có `OpenAiChatbotService`: nếu có API key thì chatbot đi qua backend gateway gọi API AI.
- Nếu chưa cấu hình `ConnectionString`, backend sẽ tự chạy bằng `mock service`.
- Nếu có `ConnectionString`, `content` và `directory` sẽ đi qua `SQL Server`.
- Nếu chưa có `ApiKey`, chatbot sẽ tự chạy bằng `mock service`.

## Endpoint mẫu hiện có

- `GET /api/health`
- `GET /api/content/tree`
- `GET /api/content/{id}`
- `POST /api/content/save`
- `DELETE /api/content/{id}`
- `GET /api/directory/tree`
- `GET /api/directory/{id}`
- `POST /api/directory/save`
- `DELETE /api/directory/{id}`
- `POST /api/admin/auth/login`
- `POST /api/chatbot/ask`

## Việc phải làm tiếp

- cài `.NET SDK`
- tạo migration cho các bảng `auth`
- bổ sung logout và seed admin ban đầu
- thêm logging lưu lịch sử chatbot vào database
- thêm logging, audit, rate limit, auth thật

## Tài liệu hỗ trợ

- `../docs/huong_dan_tao_migration_identity_va_database.md`
