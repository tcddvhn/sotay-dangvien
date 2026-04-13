# Ghi chú về xác thực admin trong hệ thống mới

Ngày lập: 2026-04-13

## Định hướng

Xác thực admin cho hệ thống mới nên dùng:

- `ASP.NET Core Identity`
- `SQL Server`

## Lý do không tạo tay bảng auth trong `schema_v1_foundation.sql`

- `ASP.NET Core Identity` có bộ bảng chuẩn và migration chuẩn
- nếu tạo tay từ đầu rất dễ lệch với implementation thực tế sau này
- nên để bước khởi tạo auth tables được tạo bằng migration khi backend bắt đầu tích hợp `Entity Framework Core`

## Các vai trò tối thiểu nên có

- `SuperAdmin`
- `ContentAdmin`
- `DirectoryAdmin`

## Yêu cầu tối thiểu

- khóa tài khoản khi đăng nhập sai nhiều lần
- ghi audit cho mọi thao tác quản trị
- session an toàn qua HTTPS
- có cơ chế đổi mật khẩu và reset mật khẩu
