# Hướng dẫn tạo migration cho Identity và database

Ngày lập: 2026-04-13

## 1. Mục tiêu

Tài liệu này hướng dẫn bước tiếp theo sau khi máy phát triển hoặc máy build đã có `.NET SDK 8`.

Mục tiêu:

- tạo migration đầu tiên cho `ApplicationDbContext`
- sinh các bảng `auth` của `ASP.NET Core Identity`
- quản lý schema thống nhất qua migration

## 2. Điều kiện

Phải có:

- `.NET SDK 8`
- kết nối đến `SQL Server` môi trường test
- chỉnh `ConnectionString` trong `appsettings.Development.json` hoặc secret cục bộ

## 3. Gợi ý trình tự

### Bước 1

- mở thư mục `he-thong-moi-server-rieng/backend-api/Sotay.Server.Api`

### Bước 2

- restore package

Lệnh:

```powershell
dotnet restore
```

### Bước 3

- tạo migration đầu tiên

Lệnh:

```powershell
dotnet ef migrations add InitialFoundation
```

### Bước 4

- apply migration vào database test

Lệnh:

```powershell
dotnet ef database update
```

## 4. Kết quả mong đợi

- có thư mục `Migrations/`
- có bảng nghiệp vụ `core`, `directory`, `survey`, `chatbot`, `notify`, `audit`
- có bảng `Identity` đặt trong schema `auth`
- nếu bật `AdminSeed.Enabled = true`, backend có thể tự tạo admin đầu tiên khi chạy

## 5. Lưu ý

- chỉ chạy migration lên môi trường test trước
- không update production trước khi đối soát schema
- nếu schema được tạo bằng SQL script trước đó, cần thống nhất một đường quản lý chính để tránh lệch
- sau khi seed admin lần đầu thành công, nên tắt `AdminSeed.Enabled` hoặc đổi mật khẩu ngay
