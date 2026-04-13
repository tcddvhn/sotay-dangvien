# Backend API cho hệ thống mới

Thư mục này hiện đã có skeleton dự án tại:

- `Sotay.Server.Api/`

## Trạng thái hiện tại

- Đã dựng khung `ASP.NET Core Web API` thủ công.
- Chưa chạy build vì máy hiện tại chưa cài `.NET SDK`.
- Đã bổ sung `DbContext`, entity và service đọc `SQL Server` cho `content` và `directory`.
- Nếu chưa cấu hình `ConnectionString`, backend sẽ tự chạy bằng `mock service`.
- Nếu có `ConnectionString`, `content` và `directory` sẽ đi qua `SQL Server`.

## Endpoint mẫu hiện có

- `GET /api/health`
- `GET /api/content/tree`
- `GET /api/directory/tree`
- `POST /api/admin/auth/login`
- `POST /api/chatbot/ask`

## Việc phải làm tiếp

- cài `.NET SDK`
- thêm `ASP.NET Core Identity`
- tạo `DbContext` cho auth và các bảng phụ trợ khác
- thay mock auth/chatbot bằng service thật
- thêm logging, audit, rate limit, auth thật
