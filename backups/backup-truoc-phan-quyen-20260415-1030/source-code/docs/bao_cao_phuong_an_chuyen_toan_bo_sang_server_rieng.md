# Báo cáo phương án chuyển toàn bộ hệ thống sang server riêng

Ngày lập: 2026-04-13

## 1. Mục tiêu

Mục tiêu mới được hiểu là:

- Website chạy trên domain riêng, ví dụ `sotaynghiepvu.dcs.vn`
- Web tĩnh đặt trên máy chủ riêng
- Dữ liệu nghiệp vụ đặt trên máy chủ riêng
- Backend nghiệp vụ đặt trên máy chủ riêng
- Xác thực quản trị đặt trên máy chủ riêng
- Chatbot không còn gọi trực tiếp từ trình duyệt; chatbot dùng API kết nối qua backend của đơn vị

Kết luận ngắn:

- Mục tiêu này khả thi.
- Nhưng để đạt đúng nghĩa `toàn bộ hệ thống trên server riêng`, cần thay `Firestore`, `Google Apps Script`, `Firebase Auth`, và nếu muốn triệt để thì cả `FCM`.
- Riêng chatbot nếu vẫn dùng API của nhà cung cấp AI bên ngoài thì phần suy luận AI vẫn nằm ngoài hạ tầng đơn vị. Khi đó backend và dữ liệu nằm trên server riêng, nhưng luồng hỏi đáp vẫn có dữ liệu đi ra nhà cung cấp API.

## 2. Ảnh hưởng của kiến trúc hiện tại

Hiện tại hệ thống đang dùng:

- `Firestore` cho dữ liệu nội dung và một phần quản trị
- `Firebase Authentication` cho đăng nhập admin
- `Firebase Cloud Messaging` cho thông báo đẩy web
- `Google Apps Script` cho chatbot, khảo sát, thống kê

Vì vậy, nếu chỉ đổi domain sang `sotaynghiepvu.dcs.vn`:

- hệ thống vẫn chạy được nếu cấu hình đúng
- nhưng dữ liệu và logic vẫn chưa nằm hoàn toàn ở server riêng

Nếu mục tiêu là chuyển toàn bộ về server riêng, các phần dưới đây phải xử lý lại.

## 3. Phương án đích được khuyến nghị

## 3.1. Kiến trúc đích

Kiến trúc nên chuyển sang:

- `IIS` phục vụ web tĩnh
- `ASP.NET Core Web API` làm backend nghiệp vụ
- `SQL Server` làm kho dữ liệu chính
- `ASP.NET Core Identity` hoặc cơ chế xác thực nội bộ tương đương cho admin
- `Web Push chuẩn + VAPID` nếu muốn bỏ hẳn `FCM`
- Chatbot gọi từ backend đến nhà cung cấp API AI

Luồng nên là:

1. Trình duyệt gọi API của đơn vị
2. API của đơn vị xác thực, phân quyền, ghi log, kiểm soát dữ liệu
3. API đọc/ghi `SQL Server`
4. Riêng chatbot, API của đơn vị gọi tiếp sang nhà cung cấp AI

## 3.2. Tại sao nên chọn `ASP.NET Core Web API`

Lý do:

- Phù hợp với `Windows Server 2022`
- Phù hợp với `SQL Server`
- Có tài liệu chính thức tốt
- Hỗ trợ `Identity`, `JWT`, cookie auth, logging, Swagger, background service
- Dễ mở rộng thành backend chuẩn cho nội dung, danh bạ, thống kê, khảo sát, chatbot

## 4. Thay thế từng thành phần

## 4.1. Thay `Firestore`

### Mục tiêu

- Chuyển toàn bộ dữ liệu nội dung, danh bạ, thống kê, khảo sát, cấu hình quản trị về `SQL Server`

### Cách làm

- Thiết kế schema SQL
- Viết API CRUD thay cho việc frontend gọi trực tiếp Firestore
- Viết script migrate dữ liệu từ Firestore sang SQL Server
- Sửa frontend để gọi API nội bộ thay vì Firebase SDK

### Bảng dữ liệu tối thiểu nên có

- `ContentNodes`
- `DirectoryUnits`
- `AdminUsers`
- `AdminRoles`
- `AuditLogs`
- `SurveyResponses`
- `ChatbotLogs`
- `NotificationSubscriptions`
- `SystemSettings`

### Nhận định

- Đây là phần quan trọng nhất nếu muốn dữ liệu nằm trên server riêng.
- Sau bước này, mới có thể nói dữ liệu nghiệp vụ chính đã rời khỏi Firebase.

## 4.2. Thay `Google Apps Script`

### Phạm vi phải thay

- chatbot
- khảo sát
- thống kê

### Cách làm

- Viết API backend cho từng nhóm chức năng
- Lưu kết quả vào `SQL Server`
- Gắn xác thực, rate limit, logging và phân quyền ở backend

### Nhận định

- Đây là bước nên làm sớm, trước cả khi thay hoàn toàn Firebase Auth hoặc FCM.
- Lý do là Apps Script bị ràng buộc quota, runtime và vận hành khó kiểm soát hơn backend riêng.

## 4.3. Thay `Firebase Authentication`

### Mục tiêu

- Đăng nhập admin không còn phụ thuộc Firebase

### Phương án phù hợp

- `ASP.NET Core Identity` + `SQL Server`

Có thể đi theo một trong hai hướng:

- cookie auth cho admin panel nếu admin chủ yếu thao tác trên web cùng domain
- JWT bearer nếu cần tách frontend/backend rõ hơn hoặc có thêm client khác

### Nhận định

- Nếu hệ thống chỉ có admin nội bộ, cookie auth thường đơn giản và an toàn hơn.
- Nếu sau này có tích hợp nhiều ứng dụng, có thể mở rộng theo hướng `OIDC` hoặc SSO nội bộ.

## 4.4. Thay `Firebase Cloud Messaging`

### Hai lựa chọn

#### Lựa chọn 1: giữ FCM tạm thời

- Giảm khối lượng chuyển đổi
- Nhưng vẫn còn phụ thuộc Firebase

#### Lựa chọn 2: chuyển sang `Web Push` chuẩn với `VAPID`

- Backend của đơn vị lưu `PushSubscription`
- Backend gửi push qua chuẩn Web Push
- Trình duyệt vẫn cần `service worker`
- Vẫn bắt buộc chạy trên `HTTPS`

### Nhận định

- Nếu mục tiêu là `toàn bộ hệ thống server riêng`, nên chọn `Web Push + VAPID`
- Nếu mục tiêu là chuyển nhanh, có thể giữ FCM thêm một giai đoạn rồi thay sau

## 4.5. Chatbot dùng API kết nối

### Mô hình khuyến nghị

- Trình duyệt không gọi trực tiếp API AI
- Frontend gọi API chatbot của đơn vị
- Backend của đơn vị gọi nhà cung cấp AI
- Backend ghi log câu hỏi, mã lỗi, thời gian phản hồi, và áp dụng rate limit

### Lợi ích

- Không lộ API key ra client
- Có thể kiểm soát prompt hệ thống tập trung
- Có thể lọc dữ liệu nhạy cảm trước khi gửi ra ngoài
- Có thể thay nhà cung cấp AI mà không phải sửa toàn bộ frontend

### Lưu ý quan trọng

- Nếu vẫn dùng API AI bên ngoài, thì chatbot chưa phải là `on-premise` hoàn toàn
- Nếu có yêu cầu dữ liệu tuyệt đối không đi ra ngoài, phải dùng mô hình AI chạy nội bộ

## 5. Ảnh hưởng của việc đổi domain sang `sotaynghiepvu.dcs.vn`

## 5.1. Ảnh hưởng nếu vẫn còn dùng Firebase trong giai đoạn chuyển tiếp

Trong giai đoạn chuyển tiếp, nếu vẫn còn dùng `Firebase Auth` hoặc `FCM`, cần lưu ý:

- thêm domain mới vào `Authorized Domains`
- giữ `firebase-messaging-sw.js` ở web root
- kiểm tra lại permission thông báo
- kiểm tra lại token/subscription trên domain mới

Lý do:

- xác thực web và web push gắn với origin/domain
- khi đổi domain, token cũ và quyền cũ có thể không còn dùng như trước

## 5.2. Ảnh hưởng nếu đã bỏ Firebase

Khi đã bỏ Firebase:

- không còn yêu cầu `Authorized Domains` của Firebase
- không còn yêu cầu `firebase-messaging-sw.js`
- nhưng vẫn cần service worker riêng nếu dùng `Web Push`
- người dùng vẫn có thể phải cấp quyền thông báo lại vì permission gắn với origin mới

## 5.3. Ảnh hưởng tới đăng nhập

- Nếu đổi từ Firebase Auth sang auth nội bộ, toàn bộ session đăng nhập cũ hết hiệu lực
- Admin sẽ phải đăng nhập lại trên hệ thống mới
- Cookie auth phải được cấu hình đúng `SameSite`, `Secure`, `HttpOnly`, và domain

## 5.4. Ảnh hưởng tới API và CORS

- Nếu frontend và backend cùng domain, có thể giảm đáng kể vấn đề CORS
- Nếu tách `api.sotaynghiepvu.dcs.vn`, phải cấu hình `CORS` rõ ràng

## 6. Lộ trình thực hiện khuyến nghị

## Giai đoạn 1: Dựng nền backend riêng

Thực hiện:

- Dựng `ASP.NET Core Web API`
- Kết nối `SQL Server`
- Tạo schema dữ liệu ban đầu
- Tạo cơ chế đăng nhập admin nội bộ
- Tạo bảng log, audit và cấu hình hệ thống

Kết quả:

- Server riêng đã có nền tảng backend thực sự

## Giai đoạn 2: Chuyển `Google Apps Script`

Thực hiện:

- Viết API chatbot
- Viết API khảo sát
- Viết API thống kê
- Sửa frontend chuyển sang gọi API mới

Kết quả:

- Bỏ được `Google Apps Script`

## Giai đoạn 3: Chuyển dữ liệu từ `Firestore` sang `SQL Server`

Thực hiện:

- Thiết kế mapping dữ liệu
- Export dữ liệu Firestore
- Viết tool import sang SQL Server
- Sửa frontend và admin panel dùng API mới
- Chạy song song kiểm chứng dữ liệu

Kết quả:

- Dữ liệu nghiệp vụ chính nằm trên server riêng

## Giai đoạn 4: Chuyển xác thực admin

Thực hiện:

- Bỏ `Firebase Auth`
- Dùng `ASP.NET Core Identity`
- Tạo vai trò, quyền và chính sách mật khẩu
- Bật audit cho admin actions

Kết quả:

- Xác thực quản trị nằm trên server riêng

## Giai đoạn 5: Chuyển thông báo đẩy

Thực hiện:

- Quyết định giữ FCM hay chuyển Web Push
- Nếu bỏ FCM: tạo `PushSubscription`, VAPID keys, API đăng ký/hủy đăng ký, job gửi thông báo

Kết quả:

- Hoàn tất tự chủ hạ tầng ở lớp thông báo

## Giai đoạn 6: Đổi domain chính thức

Thực hiện:

- chuyển sang `sotaynghiepvu.dcs.vn`
- cấu hình `HTTPS`
- test service worker
- test đăng nhập
- test push
- test chatbot

Kết quả:

- Hệ thống vận hành bằng domain chính thức trên hạ tầng mới

## 7. Phương án kỹ thuật chi tiết nên chốt

## 7.1. Tầng dữ liệu

Nên chốt:

- `SQL Server` là kho dữ liệu chính
- backup hằng ngày
- tài khoản DB riêng cho ứng dụng
- không để frontend truy cập DB trực tiếp

## 7.2. Tầng backend

Nên chốt:

- `ASP.NET Core Web API`
- logging tập trung
- audit log cho admin
- rate limit cho chatbot và các API public
- cơ chế cấu hình bằng file môi trường hoặc secret store

## 7.3. Tầng xác thực

Nên chốt:

- admin dùng `ASP.NET Core Identity`
- cookie auth cho giao diện quản trị web
- phân vai trò tối thiểu: `SuperAdmin`, `ContentAdmin`, `DirectoryAdmin`

## 7.4. Tầng chatbot

Nên chốt:

- backend là nơi giữ API key
- ghi log request/response metadata
- không lưu tràn lan nội dung nhạy cảm nếu không cần
- có timeout, retry, fallback message

## 7.5. Tầng push notification

Nên chốt:

- nếu giữ FCM tạm thời: xác định rõ đây là phần còn phụ thuộc Firebase
- nếu bỏ hoàn toàn Firebase: chọn `Web Push + VAPID`

## 8. Rủi ro chính

### Rủi ro 1: Làm tất cả trong một lần

Không nên:

- đổi hosting
- đổi domain
- đổi dữ liệu
- đổi auth
- đổi push
- đổi chatbot backend

trong cùng một đợt.

### Rủi ro 2: Di chuyển dữ liệu thiếu đối soát

Phải có:

- export dữ liệu nguồn
- import thử
- đối soát số lượng bản ghi
- test ngẫu nhiên theo mẫu

### Rủi ro 3: Chatbot làm lộ API key hoặc dữ liệu

Không được gọi API AI trực tiếp từ trình duyệt.

### Rủi ro 4: Push notification gián đoạn sau đổi domain

Đây là rủi ro bình thường vì quyền thông báo và subscription gắn với origin mới.

## 9. Khuyến nghị cuối cùng

Khuyến nghị của tôi là:

1. Dựng backend riêng trên `Windows Server 2022` với `ASP.NET Core Web API` và `SQL Server`
2. Chuyển `Google Apps Script` sang backend riêng trước
3. Chuyển dữ liệu `Firestore` sang `SQL Server`
4. Chuyển đăng nhập admin sang `ASP.NET Core Identity`
5. Quyết định giữ hay bỏ `FCM`
6. Chatbot chỉ đi qua backend của đơn vị; không gọi trực tiếp từ client

Nếu mục tiêu là `toàn bộ hệ thống server riêng`, đây là hướng đúng.

Nếu mục tiêu là `toàn bộ dữ liệu tuyệt đối không đi ra ngoài`, thì chatbot cũng phải chạy bằng mô hình nội bộ, không dùng API AI bên ngoài.

## 10. Nguồn tham khảo chính thức

- [ASP.NET Core documentation](https://learn.microsoft.com/en-us/aspnet/core/)
- [Configure JWT bearer authentication in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication?view=aspnetcore-10.0)
- [Introduction to Identity on ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity?view=aspnetcore-10.0)
- [Firebase Authentication for Web](https://firebase.google.com/docs/auth/web/password-auth)
- [Authenticate Using Google with JavaScript](https://firebase.google.com/docs/auth/web/google-signin)
- [Firebase Cloud Messaging for Web](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Receive messages using Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/js/receive)
- [Google Apps Script Web Apps](https://developers.google.com/apps-script/guides/web)
- [Google Apps Script Quotas](https://developers.google.com/apps-script/guides/services/quotas)
- [MDN Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [MDN Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
