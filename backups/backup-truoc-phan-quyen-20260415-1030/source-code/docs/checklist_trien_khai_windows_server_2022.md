# Checklist triển khai Sổ tay trên Windows Server 2022

Ngày lập: 2026-04-11

## 1. Mục đích

Tài liệu này là checklist thao tác thực địa để triển khai website `Sổ tay nghiệp vụ TCĐ, ĐV` lên máy chủ `Windows Server 2022` chạy dạng static hosting bằng `IIS`.

Tài liệu này dùng kèm với:

- `docs/huong_dan_chuyen_sotay_sang_windows_server_2022.md`

## 2. Kết luận vận hành ngắn

- Có thể chuyển phần giao diện web sang máy chủ mới.
- Chưa thể coi là chuyển toàn bộ hệ thống về server riêng vì vẫn còn phụ thuộc `Firebase` và `Google Apps Script`.
- `SQL Server` trên máy chủ hiện chưa tham gia vận hành website hiện tại.

## 3. Checklist trước triển khai

### 3.1. Quyền truy cập

- Có quyền `Administrator` trên máy chủ.
- Có quyền sửa `DNS` của domain.
- Có quyền kiểm tra `Windows Firewall`.
- Có quyền truy cập `Firebase Console`.
- Có quyền truy cập các `Google Apps Script` đang dùng.

### 3.2. Hạ tầng

- Máy chủ đã cài `Windows Server 2022`.
- Máy chủ có IP public hoặc NAT ra Internet.
- Mở cổng `80` và `443`.
- Có chứng chỉ `SSL/TLS`.
- Máy chủ có thể truy cập Internet ra ngoài.

### 3.3. Nguồn triển khai

- Chốt domain chạy chính thức.
- Chốt thư mục deploy, ví dụ `C:\inetpub\sotay-dangvien`.
- Chuẩn bị bộ source đã kiểm tra ổn định.
- Chuẩn bị bản sao lưu source hiện tại.
- Chuẩn bị bản sao lưu `Firestore`.
- Chuẩn bị bản sao lưu mã nguồn `Apps Script`.

### 3.4. Thành phần phải mang sang máy chủ

- `index.html`
- `app.js`
- `styles.css`
- `directory-module.js`
- `directory-seed.js`
- `firebase-messaging-sw.js`
- thư mục `web/`
- thư mục `build/`
- các file PDF đang dùng
- `CNAME` nếu cần giữ thông tin domain hiện có

## 4. Checklist cài đặt IIS

### 4.1. Cài role và tính năng

- Cài `Web Server (IIS)`.
- Bật `Static Content`.
- Bật `Default Document`.
- Bật `HTTP Errors`.
- Bật `Request Filtering`.
- Bật `Static Content Compression`.
- Bật `Management Console`.

### 4.2. Tạo thư mục website

- Tạo thư mục deploy, ví dụ `C:\inetpub\sotay-dangvien`.
- Chép toàn bộ file website vào thư mục này.
- Kiểm tra quyền đọc cho tài khoản `IIS_IUSRS`.

### 4.3. Tạo site trong IIS

- Tạo website mới trong `IIS Manager`.
- Trỏ `Physical Path` tới thư mục deploy.
- Gán binding `http` cổng `80`.
- Gán binding `https` cổng `443`.
- Gán `Host Name` đúng domain nếu chạy theo domain.
- Gắn chứng chỉ SSL đúng binding `https`.

## 5. Checklist cấu hình kỹ thuật bắt buộc

### 5.1. Default document

- Bảo đảm `index.html` có trong danh sách `Default Document`.

### 5.2. MIME types

Thêm nếu máy chủ chưa có:

- `.mjs` -> `text/javascript`
- `.wasm` -> `application/wasm`
- `.map` -> `application/json`
- `.bcmap` -> `application/octet-stream`
- `.ftl` -> `text/plain`
- `.pfb` -> `application/octet-stream`
- `.ttf` -> `font/ttf`

### 5.3. Compression

- Bật `Static Content Compression`.

### 5.4. HTTPS

- Bảo đảm truy cập chính thức qua `https://`.
- Nếu có thể, cấu hình redirect `http` sang `https`.

## 6. Checklist cấu hình dịch vụ ngoài

### 6.1. Firebase Authentication

- Nếu đổi domain, thêm domain mới vào `Authorized Domains`.

### 6.2. Firebase Cloud Messaging

- Bảo đảm `firebase-messaging-sw.js` nằm đúng tại web root.
- Nếu đổi origin/domain, kiểm tra lại đăng ký nhận thông báo trên trình duyệt.

### 6.3. Firestore

- Kiểm tra rules hiện tại có cho phép domain/origin mới hoạt động bình thường hay không.
- Kiểm tra đăng nhập admin và đọc/ghi dữ liệu nội dung.

### 6.4. Google Apps Script

- Kiểm tra các endpoint chatbot, khảo sát, thống kê còn truy cập được từ domain mới.
- Nếu script có ràng buộc origin hoặc token, xác minh lại trước cutover.

## 7. Checklist kiểm thử trước cutover

### 7.1. Kiểm thử truy cập cơ bản

- Mở được trang chủ.
- CSS tải đầy đủ.
- JavaScript tải đầy đủ.
- Không lỗi 404 với `web/` và `build/`.
- Không lỗi MIME với `.mjs` và `.wasm`.

### 7.2. Kiểm thử chức năng nghiệp vụ

- Tìm kiếm trang chủ hoạt động.
- Mở các tab chính hoạt động.
- Tab `Danh bạ` hiển thị đúng.
- Mở PDF bằng viewer thành công.
- Chatbot trả lời được.
- Khảo sát/góp ý gửi được.
- Thống kê truy cập không lỗi.
- Đăng nhập admin thành công.
- Quản trị nội dung lưu được.
- Quản trị danh bạ lưu được.

### 7.3. Kiểm thử trình duyệt

- Chrome
- Edge
- Điện thoại Android

## 8. Checklist cutover

- Giảm `TTL` DNS trước cutover nếu cần.
- Chốt thời gian cutover ngoài giờ cao điểm.
- Sao lưu lại source lần cuối.
- Sao lưu lại dữ liệu `Firestore` lần cuối.
- Xác nhận website trên server mới đã test xong qua IP hoặc host tạm.
- Đổi bản ghi DNS về máy chủ mới.
- Theo dõi log truy cập và phản hồi người dùng trong 1 đến 2 giờ đầu.

## 9. Checklist sau cutover

- Kiểm tra truy cập bằng domain chính thức.
- Kiểm tra HTTPS hợp lệ.
- Kiểm tra không có cảnh báo mixed content.
- Kiểm tra chatbot thực tế.
- Kiểm tra đăng nhập admin thực tế.
- Kiểm tra cập nhật nội dung thực tế.
- Kiểm tra push notification nếu đang dùng.
- Kiểm tra hiệu năng tải trang giờ đầu tiên.

## 10. Checklist rollback

Rollback ngay nếu gặp một trong các tình huống:

- Trang không tải ổn định.
- Admin không đăng nhập được.
- Firestore không đọc/ghi được.
- Chatbot lỗi hàng loạt.
- PDF viewer không hoạt động.
- HTTPS lỗi nghiêm trọng.

Các bước rollback:

- Trả bản ghi DNS về host cũ.
- Xóa cache DNS cục bộ nếu cần.
- Kiểm tra lại website cũ hoạt động ổn định.
- Ghi nhận nguyên nhân lỗi trên host mới.
- Chỉ cutover lại sau khi kiểm thử lại đầy đủ.

## 11. Những việc chưa làm trong đợt này

- Chưa chuyển dữ liệu sang `SQL Server`.
- Chưa viết backend API riêng.
- Chưa thay thế `Firebase`.
- Chưa thay thế `Google Apps Script`.
- Chưa chuyển toàn bộ hệ thống về nội bộ máy chủ riêng.

## 12. Khuyến nghị triển khai

- Nên triển khai theo 2 giai đoạn.
- Giai đoạn 1 chỉ chuyển frontend sang `IIS`.
- Sau khi ổn định mới đánh giá giai đoạn 2: viết backend riêng và chuyển dữ liệu sang `SQL Server`.

