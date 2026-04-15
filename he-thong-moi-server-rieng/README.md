# Workspace chuyển hệ thống sang server riêng

Ngày tạo: 2026-04-13

## Mục đích

Thư mục này là workspace tách biệt để xây dựng hệ thống mới chạy trên server riêng.

Mục tiêu:

- không làm ảnh hưởng website đang chạy ở thư mục gốc
- toàn bộ mã mới cho hệ thống đích được phát triển tại đây
- cho phép xây dựng song song frontend mới, backend API mới, database schema mới và tài liệu chuyển đổi

## Nguyên tắc bắt buộc

1. Không sửa luồng chạy production ở thư mục gốc nếu thay đổi đó chỉ phục vụ hệ thống mới.
2. Mọi mã nguồn mới cho hệ thống server riêng phải đặt trong thư mục này.
3. Khi cần dùng lại giao diện hiện tại, chỉ chỉnh trên bản sao trong `frontend-static`.
4. Backend mới, schema SQL mới, script migrate và tài liệu triển khai mới đều đặt trong cây thư mục này.
5. Chỉ khi đã kiểm thử xong mới lên kế hoạch hợp nhất hoặc cutover sang hệ thống mới.

## Cấu trúc hiện tại

- `frontend-static/`: bản sao frontend hiện tại để chỉnh sửa độc lập cho hệ thống mới
- `backend-api/`: nơi xây backend mới thay Firebase và Google Apps Script
- `database/`: nơi đặt schema SQL, script migrate, seed và tài liệu dữ liệu
- `docs/`: tài liệu thiết kế, kế hoạch chuyển đổi và checklist riêng cho hệ thống mới
- `firebase-auth-admin-sync/`: bộ Cloud Functions đồng bộ `Firebase Auth -> admin_users` để phục vụ pha phân quyền mới

## Ghi chú quan trọng

- Bản sao trong `frontend-static/` được tạo từ trạng thái hiện tại của website tại thời điểm 2026-04-13.
- Hệ thống thật vẫn tiếp tục chạy từ thư mục gốc của repo.
- Các thay đổi trong thư mục này không làm thay đổi website đang chạy cho đến khi có kế hoạch triển khai chính thức.
- Sau đợt nâng cấp phân quyền ở hệ thống thật ngày 2026-04-15, workspace này đã được bổ sung tài liệu và bộ đồng bộ Auth, nhưng chưa đạt parity đầy đủ cho tính năng `Tài khoản & quyền`. Xem thêm [bao_cao_chenh_lech_voi_he_thong_that_sau_dot_phan_quyen.md](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\he-thong-moi-server-rieng\docs\bao_cao_chenh_lech_voi_he_thong_that_sau_dot_phan_quyen.md).
