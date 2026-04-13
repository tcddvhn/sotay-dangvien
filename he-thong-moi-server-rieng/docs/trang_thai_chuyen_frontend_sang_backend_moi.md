# Trạng thái chuyển frontend-static sang backend mới

Ngày lập: 2026-04-13

## 1. Mục tiêu

Tài liệu này ghi nhận phần nào của `frontend-static` đã được nối sang backend mới trong workspace `he-thong-moi-server-rieng`.

## 2. Các luồng đã được chuyển sang lớp API mới

Trong [app.js](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\frontend-static\app.js) đã có lớp `window.SOTAY_SERVER_API` để gọi:

- `content`
- `directory`
- `admin auth`
- `chatbot`

Các luồng đã có khả năng đi qua backend mới:

- tải cây nội dung từ `GET /api/content/tree`
- đồng bộ cây nội dung qua `POST /api/content/tree/sync`
- lưu 1 node nội dung qua `POST /api/content/save`
- xóa 1 node nội dung qua `DELETE /api/content/{id}`
- đăng nhập admin qua `POST /api/admin/auth/login`
- đăng xuất admin qua `POST /api/admin/auth/logout`
- chatbot qua `POST /api/chatbot/ask`
- tải cây danh bạ qua `GET /api/directory/tree`
- đồng bộ cây danh bạ qua `POST /api/directory/tree/sync`

Trong [directory-module.js](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\frontend-static\directory-module.js) đã chuyển lớp lưu/nạp danh bạ sang API mới nếu backend sẵn sàng.

## 3. Cơ chế fallback hiện tại

Frontend bản sao đang chạy theo nguyên tắc:

- nếu API mới sẵn sàng, dùng API mới
- nếu API mới chưa sẵn sàng, fallback về cách cũ hoặc cache cục bộ

Điều này giúp quá trình chuyển đổi không bị chặn.

## 4. Những phần còn đang ở trạng thái chuyển tiếp

Chưa chuyển hẳn sang backend mới:

- khảo sát
- thống kê
- thông báo đẩy
- một số luồng quản trị cũ vẫn mang cấu trúc thao tác từ Firebase/Firestore

## 5. Ý nghĩa hiện tại

- Workspace mới đã có nền frontend đủ để bắt đầu test với backend mới
- nhưng chưa thể coi là hoàn tất chuyển đổi frontend
- để chạy thật cần có backend `.NET` build được và database test

## 6. Việc tiếp theo nên làm

1. Dựng môi trường `.NET SDK 8`
2. Tạo migration thật và database test
3. Seed admin đầu tiên
4. Chạy backend mới
5. Mở `frontend-static` trên môi trường test và kiểm tra các luồng đã chuyển
