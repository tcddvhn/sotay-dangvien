# Lịch sử nâng cấp

## 2026-04-02

- Tạo thư mục `docs`.
- Bổ sung báo cáo thiết kế chức năng `Danh bạ` tại `docs/bao_cao_thiet_ke_danh_ba.md`.
- Ghi nhận đề xuất kiến trúc mới cho module danh bạ 3 cấp, tách dữ liệu khỏi `APP_DATA`.
- Bổ sung giải thích chi tiết phạm vi `quản trị cơ bản` và luồng `admin duyệt` trong báo cáo thiết kế.
- Cập nhật báo cáo với quyết định tạm thời giữ mô hình `admin tự duyệt`.
- Bổ sung yêu cầu banner `Danh bạ chuyển sinh hoạt đảng` tại trang chủ.
- Bổ sung nghiên cứu giao diện danh bạ dựa trên tài liệu internet và đề xuất UI theo card/list cho 4 trường thông tin chính.
- Seed sẵn 132 đơn vị cấp 1 từ file Excel `Danh sach don vị.xlsx` vào module `Danh bạ`.
- Triển khai tab `Danh bạ`, banner trang chủ và quản trị cơ bản cho danh bạ trong mã nguồn.
- Tạo tài liệu hướng dẫn chi tiết chuyển website sang máy chủ tĩnh Windows Server 2022 tại `docs/huong_dan_chuyen_sotay_sang_windows_server_2022.md`.
- Tạo thêm checklist triển khai thực địa cho Windows Server 2022 tại `docs/checklist_trien_khai_windows_server_2022.md`.
- Tạo báo cáo riêng đánh giá ảnh hưởng của `Firebase` và `Google Apps Script` khi đổi sang domain mới và phương án thay thế tại `docs/bao_cao_anh_huong_firebase_va_apps_script_khi_doi_ten_mien.md`.
- Tạo báo cáo riêng về phương án chuyển toàn bộ hệ thống sang server riêng, thay thế `Firestore`, `Google Apps Script`, `Firebase Auth`, và đánh giá phương án chatbot qua API backend tại `docs/bao_cao_phuong_an_chuyen_toan_bo_sang_server_rieng.md`.
- Tạo workspace tách biệt `he-thong-moi-server-rieng` để phát triển hệ thống mới song song, bao gồm bản sao frontend hiện tại và các thư mục riêng cho backend, database, tài liệu vận hành song song.
- Dựng skeleton backend `ASP.NET Core Web API` trong `he-thong-moi-server-rieng/backend-api/Sotay.Server.Api`, tạo schema SQL nền trong `he-thong-moi-server-rieng/database`, và bổ sung hướng dẫn khởi động workspace hệ thống mới.
- Bổ sung `DbContext`, entity và service đọc `SQL Server` cho `content` và `directory` trong backend mới; backend hỗ trợ chế độ fallback sang mock khi chưa cấu hình `ConnectionString`.
- Bổ sung nền `ASP.NET Core Identity` ở mức dữ liệu, mở CRUD nền cho `content` và `directory`, và cập nhật schema `auth` cho hệ thống mới trong workspace tách biệt.
- Bổ sung service đăng nhập admin theo `Identity`, service chatbot gateway gọi API AI theo cấu hình, `ApplicationDbContextFactory` cho migration, và tài liệu tạo migration cho hệ thống mới.
- Chuyển `frontend-static` sang lớp API mới cho `content`, `directory`, `admin auth`, `chatbot`, bổ sung endpoint `tree/sync` ở backend mới, và tạo tài liệu trạng thái chuyển frontend.
- Bổ sung `AdminSeedHostedService` và cấu hình `AdminSeed` để có thể seed tài khoản quản trị đầu tiên khi backend mới chạy trên môi trường có `.NET SDK`.
- Bổ sung cấu hình môi trường `Test`, `launchSettings.json`, và checklist smoke test cho backend mới để chuẩn bị chạy thử trên máy có `.NET SDK`.
- Bổ sung `SampleDataSeedHostedService`, cấu hình `SampleDataSeed`, và tài liệu hướng dẫn seed dữ liệu mẫu test cho `content` và `directory` trong hệ thống mới.
- Tạo bộ file Postman/environment mẫu và tài liệu import để đội test có thể gọi trực tiếp các API chính của backend mới.
- Tạo `go_live_checklist_chuyen_he_thong_that.md` để dùng cho ngày cutover thật từ hệ thống cũ sang hệ thống mới.
