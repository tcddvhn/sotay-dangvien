# Báo cáo ảnh hưởng của Firebase và Google Apps Script khi đổi sang domain mới

Ngày lập: 2026-04-11

## 1. Bối cảnh

Giả định triển khai mục tiêu:

- Website sẽ chạy public Internet dưới domain ví dụ `sotaynghiepvu.dcs.vn`.
- Web tĩnh được đặt trên máy chủ riêng `Windows Server 2022`.
- Mong muốn dài hạn là dữ liệu nằm tại máy chủ riêng.

Kiến trúc hiện tại của hệ thống trong repo này:

- Frontend tĩnh: `index.html`, `app.js`, `styles.css`, `directory-module.js`, `directory-seed.js`
- Nội dung và quản trị: `Firebase Firestore`
- Đăng nhập quản trị: `Firebase Authentication`
- Thông báo đẩy web: `Firebase Cloud Messaging`
- Chatbot, thống kê, khảo sát: `Google Apps Script`

Kết luận ngắn:

- Đổi sang domain mới `không làm hỏng kiến trúc hiện tại` nếu cấu hình lại đúng.
- Nhưng nếu mục tiêu là `dữ liệu đặt tại máy chủ riêng`, thì việc tiếp tục dùng `Firebase` và `Google Apps Script` có ảnh hưởng trực tiếp vì dữ liệu và logic vẫn nằm một phần trên hạ tầng Google, không nằm hoàn toàn trên máy chủ của đơn vị.

## 2. Những gì bị ảnh hưởng khi đổi domain sang `sotaynghiepvu.dcs.vn`

### 2.1. Ảnh hưởng tới Firebase Authentication

Ảnh hưởng:

- Domain mới phải được thêm vào `Authorized Domains` trong Firebase Authentication.
- Nếu không thêm, các luồng xác thực web có thể bị chặn hoặc hoạt động không ổn định.

Ý nghĩa thực tế với hệ thống này:

- Chức năng đăng nhập admin là phần cần kiểm tra đầu tiên sau khi đổi domain.
- Nếu chỉ đổi host nhưng vẫn giữ cách đăng nhập hiện tại, đây là thay đổi bắt buộc nhưng tương đối đơn giản.

### 2.2. Ảnh hưởng tới Firebase Cloud Messaging

Ảnh hưởng:

- `firebase-messaging-sw.js` phải tiếp tục nằm ở web root của domain mới.
- Web push phụ thuộc theo `origin`, nên khi đổi domain, token thông báo cũ thường không dùng lại như cũ.
- Người dùng có thể phải cấp quyền thông báo lại trên domain mới.

Ý nghĩa thực tế:

- Sau cutover phải kiểm tra lại toàn bộ luồng xin quyền thông báo, lấy token và nhận thông báo.
- Đây không phải lỗi kiến trúc, mà là đặc tính bình thường của web push theo origin.

### 2.3. Ảnh hưởng tới Firestore

Ảnh hưởng:

- Frontend vẫn gọi trực tiếp Firestore từ trình duyệt người dùng qua Internet.
- Dữ liệu nội dung, dữ liệu quản trị và dữ liệu danh bạ chưa chuyển về máy chủ riêng.
- Muốn dùng được ổn định thì người dùng cuối vẫn phải truy cập được các endpoint của Firebase.

Ý nghĩa thực tế:

- Nếu đơn vị yêu cầu `dữ liệu nghiệp vụ phải nằm tại máy chủ riêng`, kiến trúc hiện tại chưa đạt yêu cầu này.
- Nếu môi trường mạng chặn hoặc hạn chế truy cập dịch vụ Google, web sẽ lỗi dù website tĩnh đã đặt trên server riêng.

### 2.4. Ảnh hưởng tới Google Apps Script

Ảnh hưởng:

- Chatbot, khảo sát, thống kê hiện đang gọi tới các URL `script.google.com`.
- Các tác vụ này vẫn chạy trên hạ tầng Google, không chạy trên máy chủ riêng.
- Hệ thống tiếp tục phụ thuộc quota, giới hạn và độ ổn định của Apps Script.

Ý nghĩa thực tế:

- Đổi domain không tự giải quyết bài toán phụ thuộc backend ngoài.
- Nếu Internet đi ra Google bị hạn chế, chatbot, khảo sát và thống kê sẽ ngừng hoạt động.

## 3. Nếu tiếp tục dùng Firebase và Google Apps Script thì có vấn đề gì không

### 3.1. Trường hợp chỉ cần đổi domain và vẫn chấp nhận dùng dịch vụ ngoài

Trong trường hợp này, phương án `vẫn dùng Firebase + Apps Script` là khả thi và ổn định nếu:

- Thêm domain mới vào Firebase Authentication.
- Kiểm tra lại FCM trên domain mới.
- Kiểm tra lại tất cả endpoint Apps Script.
- Giữ máy chủ web có kết nối Internet bình thường.

Đánh giá:

- Đây là phương án ít rủi ro nhất.
- Thời gian triển khai nhanh nhất.
- Không cần viết lại backend ngay.

### 3.2. Trường hợp yêu cầu dữ liệu phải nằm tại máy chủ riêng

Trong trường hợp này, phương án `giữ Firebase + Apps Script` là không đáp ứng hoàn toàn yêu cầu.

Lý do:

- Dữ liệu nội dung hiện vẫn ở Firestore.
- Xác thực admin vẫn phụ thuộc Firebase Authentication.
- Chatbot, khảo sát, thống kê vẫn qua Apps Script.
- Luồng dữ liệu người dùng vẫn đi qua hạ tầng ngoài máy chủ riêng.

Kết luận:

- Nếu yêu cầu chỉ là `website chạy ở domain riêng, file web đặt trên server riêng`, giữ Firebase và Apps Script là chấp nhận được.
- Nếu yêu cầu là `dữ liệu và logic phải nằm trên hạ tầng của đơn vị`, thì phải thay thế dần Firebase và Apps Script.

## 4. Ảnh hưởng về an toàn và quản trị

### 4.1. Dữ liệu không hoàn toàn nằm trong phạm vi server của đơn vị

Đây là ảnh hưởng lớn nhất.

Ngay cả khi website được host tại `sotaynghiepvu.dcs.vn`, các phần sau vẫn nằm ngoài máy chủ riêng:

- dữ liệu nội dung
- dữ liệu quản trị
- xác thực admin
- chatbot
- khảo sát
- thống kê
- thông báo đẩy

### 4.2. Phụ thuộc Internet và dịch vụ Google

Hệ thống sẽ phụ thuộc:

- kết nối Internet từ người dùng đến Google
- trạng thái hoạt động của Firebase
- trạng thái hoạt động của Apps Script
- quota và giới hạn của Apps Script

Điều này ảnh hưởng trực tiếp đến độ chủ động vận hành.

### 4.3. Bề mặt tấn công phía client vẫn lớn

Hiện tại frontend gọi trực tiếp các dịch vụ ngoài từ trình duyệt.

Điều đó dẫn đến:

- endpoint xuất hiện ở phía client
- phải dựa vào `Security Rules`, token, kiểm soát truy cập và cấu hình backend đúng cách
- khó gom toàn bộ kiểm soát vào một điểm như backend nội bộ

### 4.4. Khả năng đáp ứng yêu cầu quản trị nội bộ

Nếu sau này có yêu cầu:

- audit chi tiết
- log tập trung
- phân quyền sâu
- tích hợp tài khoản nội bộ
- sao lưu và khôi phục tập trung trên hạ tầng đơn vị

thì kiến trúc hiện tại sẽ bắt đầu chật chội.

## 5. Phương án thay thế có ổn không

## 5.1. Phương án A: Giữ Firebase và Apps Script, chỉ đổi hosting + domain

Mô tả:

- Web tĩnh chuyển sang `IIS` trên `Windows Server 2022`
- Domain chuyển sang `sotaynghiepvu.dcs.vn`
- Firestore, Firebase Auth, FCM, Apps Script giữ nguyên

Đánh giá:

- Ổn nếu mục tiêu ngắn hạn là đổi host và domain nhanh.
- Không ổn nếu mục tiêu là dữ liệu nằm hoàn toàn trên server riêng.

Ưu điểm:

- Nhanh
- Ít rủi ro
- Không phải viết lại hệ thống lớn

Nhược điểm:

- Vẫn phụ thuộc Google
- Dữ liệu không tập trung hoàn toàn tại server riêng
- Vẫn còn quota và giới hạn Apps Script

Khuyến nghị:

- Dùng cho giai đoạn 1.

## 5.2. Phương án B: Thay Google Apps Script trước, giữ Firebase tạm thời

Mô tả:

- Website vẫn chạy tĩnh trên IIS
- Viết backend riêng trên máy chủ, ví dụ `ASP.NET Core Web API`
- Chuyển chatbot, khảo sát, thống kê từ Apps Script về backend riêng
- Firestore và Firebase Auth tạm thời giữ nguyên

Đánh giá:

- Đây là phương án thay thế tốt và thực tế nhất sau giai đoạn 1.
- Giảm đáng kể phụ thuộc vào Apps Script và quota của Google.
- Phù hợp với máy chủ Windows Server 2022 và SQL Server hiện có.

Ưu điểm:

- Backend quan trọng nằm về server của đơn vị
- Dễ log, audit và kiểm soát hơn
- Tận dụng ngay SQL Server

Nhược điểm:

- Vẫn chưa loại bỏ Firebase
- Cần phát triển thêm API và cơ chế bảo mật backend

Khuyến nghị:

- Đây là giai đoạn 2 nên làm trước tiên nếu muốn tăng quyền kiểm soát hạ tầng.

## 5.3. Phương án C: Thay Firestore bằng SQL Server + API riêng

Mô tả:

- Dữ liệu nội dung, danh bạ, thống kê, khảo sát chuyển sang `SQL Server`
- Frontend không gọi Firestore trực tiếp nữa
- Mọi đọc/ghi đi qua API của đơn vị

Đánh giá:

- Ổn về mặt kiến trúc dài hạn.
- Đây mới là phương án đưa dữ liệu chính về máy chủ riêng theo đúng nghĩa.

Ưu điểm:

- Dữ liệu tập trung trên server của đơn vị
- Dễ backup, phân quyền, logging, tích hợp hệ thống nội bộ
- Không còn phụ thuộc Firestore ở tầng dữ liệu nghiệp vụ chính

Nhược điểm:

- Phải thiết kế schema SQL
- Phải viết API, xác thực, phân quyền, nhập liệu, migration dữ liệu
- Khối lượng công việc lớn hơn đáng kể

Khuyến nghị:

- Là giai đoạn 3, không nên làm cùng lúc với cutover hosting.

## 5.4. Phương án D: Thay luôn Firebase Authentication

Mô tả:

- Bỏ đăng nhập admin qua Firebase Auth
- Chuyển sang xác thực nội bộ, hoặc `ASP.NET Identity`, hoặc tích hợp `Active Directory/Entra ID` nếu đơn vị có nhu cầu

Đánh giá:

- Ổn nếu đơn vị muốn kiểm soát tập trung tài khoản admin.
- Chưa cần làm ngay nếu số lượng admin ít và hệ thống đang ổn định.

Khuyến nghị:

- Chỉ làm sau khi backend riêng đã hình thành.

## 5.5. Phương án E: Thay FCM bằng mô hình push khác

Mô tả:

- Có thể tiếp tục dùng FCM cho web push ở giai đoạn trung gian.
- Nếu muốn giảm phụ thuộc, có thể triển khai máy chủ gửi push theo chuẩn `Web Push` với `VAPID`.

Đánh giá:

- Khả thi nhưng phức tạp hơn các phần khác.
- Không nên là ưu tiên đầu tiên nếu mục tiêu chính là chuyển host và dữ liệu.

Khuyến nghị:

- Tạm thời giữ FCM ở các giai đoạn đầu.

## 6. Khuyến nghị phương án triển khai thực tế

Khuyến nghị của tôi:

### Giai đoạn 1

- Chuyển frontend sang `IIS`
- Đổi domain sang `sotaynghiepvu.dcs.vn`
- Giữ `Firebase` và `Google Apps Script`
- Bổ sung `Firebase Authorized Domain`
- Kiểm thử lại đăng nhập admin, Firestore, chatbot, khảo sát, thống kê, FCM

Mục tiêu:

- Đổi host và domain nhanh, ít rủi ro

### Giai đoạn 2

- Viết backend riêng trên `Windows Server 2022`, ưu tiên `ASP.NET Core Web API`
- Chuyển `chatbot`, `khảo sát`, `thống kê` từ `Apps Script` sang backend riêng
- Lưu dữ liệu các chức năng này vào `SQL Server`

Mục tiêu:

- Cắt phụ thuộc `Google Apps Script`

### Giai đoạn 3

- Chuyển dữ liệu nội dung, quản trị, danh bạ từ `Firestore` sang `SQL Server`
- Frontend chỉ gọi API nội bộ của đơn vị

Mục tiêu:

- Đưa dữ liệu nghiệp vụ về server riêng

### Giai đoạn 4

- Đánh giá có cần thay `Firebase Authentication` và `FCM` hay không

Mục tiêu:

- Hoàn thiện mức độ tự chủ hạ tầng nếu thật sự cần

## 7. Những việc bắt buộc nếu vẫn giữ Firebase và Apps Script khi đổi domain

1. Thêm `sotaynghiepvu.dcs.vn` vào `Firebase Authentication Authorized Domains`.
2. Kiểm tra lại `firebase-messaging-sw.js` ở root domain mới.
3. Kiểm tra lại việc cấp quyền notification trên domain mới.
4. Kiểm tra toàn bộ endpoint `Google Apps Script` từ domain mới.
5. Kiểm tra kết nối thực tế của người dùng nội bộ ra các domain Google cần thiết.
6. Xem xét bật `Firebase App Check` để giảm rủi ro lạm dụng từ client web.

## 8. Kết luận cuối cùng

- Nếu câu hỏi là `đổi domain sang sotaynghiepvu.dcs.vn và host web trên server riêng có chạy được không`, câu trả lời là `có`.
- Nếu câu hỏi là `làm vậy thì dữ liệu đã nằm trên server riêng chưa`, câu trả lời là `chưa`.
- Nếu câu hỏi là `phương án thay thế có ổn không`, câu trả lời là `ổn nếu làm theo lộ trình từng giai đoạn`, trong đó:
  - giai đoạn đầu giữ Firebase và Apps Script để giảm rủi ro
  - giai đoạn sau thay Apps Script trước
  - sau đó mới thay Firestore và xác thực nếu cần

## 9. Nguồn tham khảo chính thức

- [Firebase Authentication for Web](https://firebase.google.com/docs/auth/web/password-auth)
- [Firebase Cloud Messaging for Web](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Firebase Security Checklist](https://firebase.google.com/support/guides/security-checklist)
- [Firebase App Check for Web](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider)
- [Google Apps Script Web Apps](https://developers.google.com/apps-script/guides/web)
- [Google Apps Script Quotas](https://developers.google.com/apps-script/guides/services/quotas)
