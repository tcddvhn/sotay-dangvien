# Frontend cho hệ thống mới

Thư mục này là bản sao của frontend hiện tại, dùng để chuyển dần sang kiến trúc mới.

Phạm vi chỉnh sửa tại đây:

- đổi toàn bộ luồng dữ liệu từ Firebase sang API nội bộ
- đổi luồng chatbot từ Apps Script sang backend API
- đổi đăng nhập admin sang auth nội bộ
- đổi thông báo đẩy theo phương án được chốt
- thay cấu hình domain và endpoint cho hệ thống mới

Quy tắc:

- không đồng bộ ngược thay đổi trong thư mục này về thư mục gốc nếu chưa được duyệt
- mọi endpoint mới phải gọi về backend trong `backend-api`

