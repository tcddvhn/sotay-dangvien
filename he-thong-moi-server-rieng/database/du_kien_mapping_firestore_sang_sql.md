# Dự kiến mapping từ Firestore sang SQL Server

Ngày lập: 2026-04-13

## 1. Mục tiêu

Tài liệu này mô tả mapping dữ liệu dự kiến từ kiến trúc cũ sang schema SQL mới trong `schema_v1_foundation.sql`.

## 2. Nguồn dữ liệu hiện tại trong hệ thống cũ

Các nguồn chính đang thấy trong mã nguồn hiện tại:

- `sotay/dulieu`: cây nội dung sổ tay
- `sotay/danhba`: cây danh bạ 3 cấp
- `sotay/thongke`: thống kê truy cập
- localStorage: lịch sử, yêu thích, một số cache giao diện
- Google Apps Script: chatbot, khảo sát, thống kê phụ

## 3. Mapping nội dung sổ tay

Nguồn cũ:

- document `sotay/dulieu`
- trường `treeData`

Đích mới:

- `core.ContentNodes`

Mapping chính:

- `id` -> `Id`
- `title` -> `Title`
- `tag` -> `Tag`
- `summary` -> `SummaryHtml`
- `detail` -> `DetailHtml`
- `fileUrl` -> `FileUrl`
- `fileName` -> `FileName`
- `pdfRefs` -> `PdfRefsJson`
- `level` -> `Level`
- thứ tự node trong mảng -> `SortOrder`
- `updatedAt` hoặc trường tương đương -> `UpdatedAt`
- `updatedBy` nếu có -> `UpdatedBy`
- trạng thái hiển thị nếu có -> `IsActive`
- quan hệ cha con -> `ParentId`

## 4. Mapping danh bạ

Nguồn cũ:

- document `sotay/danhba`

Đích mới:

- `directory.Units`

Mapping chính:

- `id` -> `Id`
- `name` -> `Name`
- `unitCode` -> `UnitCode`
- `level` -> `Level`
- `parentId` -> `ParentId`
- `phone` -> `Phone`
- `address` -> `Address`
- `location` -> `Location`
- `order` hoặc trường thứ tự -> `SortOrder`
- `isActive` -> `IsActive`
- `updatedAt` -> `UpdatedAt`
- `updatedBy` -> `UpdatedBy`

## 5. Mapping khảo sát

Nguồn cũ:

- Google Apps Script nhận đánh giá và góp ý

Đích mới:

- `survey.Responses`

Mapping chính:

- loại hành động `Danh gia` hoặc `Gop y` -> `ResponseType`
- mức đánh giá -> `RatingLabel`
- nội dung góp ý -> `Content`
- thời điểm gửi -> `SubmittedAt`

## 6. Mapping chatbot

Nguồn cũ:

- Google Apps Script trung gian gọi AI

Đích mới:

- `chatbot.Conversations`
- `chatbot.Messages`

Mapping chính:

- session/chat id -> `chatbot.Conversations.Id`
- câu hỏi người dùng -> `chatbot.Messages` với `RoleName = 'user'`
- phản hồi AI -> `chatbot.Messages` với `RoleName = 'assistant'`
- lỗi backend -> `IsError = 1`, `ErrorCode`, `ErrorMessage`

## 7. Mapping thông báo đẩy

Nguồn cũ:

- FCM token phía client

Đích mới nếu bỏ FCM:

- `notify.Subscriptions`

Mapping chính:

- endpoint web push -> `EndpointUrl`
- key `p256dh` -> `P256dh`
- key `auth` -> `AuthSecret`

## 8. Điểm cần kiểm chứng trước khi migrate thật

- đầy đủ trường ngày cập nhật thực tế trong Firestore
- chuẩn dữ liệu HTML của `summary/detail`
- quy tắc thứ tự node cha con
- độ đầy đủ của dữ liệu danh bạ
- khối lượng lịch sử chatbot và khảo sát hiện có

## 9. Khuyến nghị migrate

1. Export dữ liệu Firestore ra JSON.
2. Chạy migrate thử vào môi trường test.
3. Đối soát số lượng node nội dung và đơn vị danh bạ.
4. Kiểm tra mẫu ngẫu nhiên ít nhất 20 bản ghi.
5. Chỉ migrate production khi đã test xong frontend mới trên API mới.
