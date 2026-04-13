# Kế hoạch vận hành song song khi xây hệ thống mới

Ngày lập: 2026-04-13

## 1. Mục tiêu

Xây hệ thống mới mà không làm gián đoạn hệ thống thật đang chạy.

## 2. Nguyên tắc vận hành

- Hệ thống thật tiếp tục chạy từ thư mục gốc của repo.
- Hệ thống mới chỉ phát triển trong `he-thong-moi-server-rieng/`.
- Không thay endpoint production trong thư mục gốc chỉ để phục vụ quá trình nghiên cứu hệ thống mới.
- Mọi kiểm thử backend mới và frontend mới thực hiện trên môi trường test riêng.

## 3. Cách làm an toàn

### Giai đoạn 1

- Sao chép frontend hiện tại sang `frontend-static`
- Giữ nguyên hệ thống thật
- Thiết kế backend và database mới trong thư mục riêng

### Giai đoạn 2

- Làm backend API mới
- Làm schema SQL mới
- Chỉnh frontend bản sao để gọi API mới
- Kiểm thử cục bộ hoặc môi trường test

### Giai đoạn 3

- Migrate thử dữ liệu từ hệ thống cũ
- Đối soát dữ liệu
- Kiểm thử nghiệp vụ trên hệ thống mới

### Giai đoạn 4

- Chạy song song kiểm chứng
- Chỉ cutover khi đạt yêu cầu

## 4. Điều kiện để được cutover

- dữ liệu đã migrate và đối soát
- chatbot mới hoạt động ổn định
- admin đăng nhập được
- quản trị nội dung lưu được
- danh bạ hoạt động
- PDF viewer hoạt động
- thông báo đẩy hoạt động theo phương án chốt

## 5. Điều chưa làm trong thư mục này

- chưa tạo backend API thật
- chưa tạo schema SQL thật
- chưa migrate dữ liệu thật
- chưa đổi hệ thống production

