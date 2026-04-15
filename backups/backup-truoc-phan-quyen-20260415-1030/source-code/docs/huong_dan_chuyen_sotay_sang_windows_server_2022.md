# Hướng dẫn chuyển hệ thống Sổ tay sang máy chủ tĩnh Windows Server 2022

Ngày lập: 2026-04-11

## 1. Mục tiêu tài liệu

Tài liệu này mô tả chi tiết cách chuyển phần giao diện web của hệ thống `Sổ tay nghiệp vụ TCĐ, ĐV` sang một máy chủ tĩnh riêng chạy `Windows Server 2022`.

Tài liệu bao gồm:

- Phân tích kiến trúc hiện tại.
- Những gì thực sự được chuyển sang máy chủ mới.
- Những gì vẫn tiếp tục phụ thuộc dịch vụ ngoài.
- Các bước chuẩn bị.
- Quy trình cài đặt và cấu hình chi tiết trên Windows Server 2022.
- Danh sách rủi ro, kiểm thử, cutover và rollback.
- Lộ trình nâng cấp nếu sau này muốn bỏ phụ thuộc dịch vụ ngoài.

## 2. Kết luận ngắn gọn trước khi triển khai

Hệ thống hiện tại **không phải là một website tĩnh thuần 100%**.

Phần có thể chuyển ngay lên máy chủ tĩnh:

- `index.html`
- `app.js`
- `styles.css`
- `directory-module.js`
- `directory-seed.js`
- `firebase-messaging-sw.js`
- thư mục `web/`
- thư mục `build/`
- các file PDF tại thư mục gốc

Nhưng các chức năng sau **không nằm trên máy chủ tĩnh** ở thời điểm hiện tại:

- Chatbot AI: đang gọi `Google Apps Script`
- Thống kê truy cập: đang gọi `Google Apps Script`
- Khảo sát/góp ý: đang gọi `Google Apps Script`
- Dữ liệu nội dung và quản trị: đang dùng `Firebase Firestore`
- Đăng nhập quản trị: đang dùng `Firebase Authentication`
- Thông báo đẩy: đang dùng `Firebase Cloud Messaging`

Ngoài ra còn có một route dẫn ra hệ thống ngoài:

- `https://code-web-sotay.vercel.app/`

Kết luận quan trọng:

- Nếu chỉ chuyển lên Windows Server 2022 dạng static hosting, giao diện website sẽ chạy được.
- Nhưng hệ thống vẫn phải tiếp tục kết nối Internet để gọi Firebase và Google Apps Script.
- `SQL Server` hiện đã cài trên máy chủ nhưng **chưa được ứng dụng này sử dụng**.

## 3. Kiến trúc hiện tại của hệ thống

### 3.1. Frontend

Website hiện là một SPA tĩnh viết bằng:

- HTML
- CSS
- JavaScript thuần

Các file chính:

- `index.html`
- `app.js`
- `styles.css`
- `directory-module.js`
- `directory-seed.js`

### 3.2. Tài nguyên tĩnh phụ trợ

Website còn sử dụng:

- `web/viewer.html`, `web/viewer.mjs`, `web/viewer.css`
- `build/pdf.mjs`, `build/pdf.worker.mjs`, `build/pdf.sandbox.mjs`
- `web/cmaps/`
- `web/locale/`
- `web/standard_fonts/`
- `web/wasm/`
- các file PDF tại thư mục gốc

Các thành phần này phục vụ:

- PDF.js viewer
- wasm
- font chuẩn
- locale của viewer

### 3.3. Dịch vụ ngoài

Ứng dụng hiện gọi ra ngoài các dịch vụ sau:

- Quill CDN
- Font Awesome CDN
- Firebase JS SDK từ `gstatic`
- Firebase Firestore
- Firebase Authentication
- Firebase Cloud Messaging
- Google Apps Script cho chatbot, khảo sát, thống kê
- một số ảnh ngoài từ `postimg`

### 3.4. Ý nghĩa đối với bài toán chuyển host

Việc chuyển sang máy chủ tĩnh mới **không tự động di chuyển**:

- dữ liệu Firestore
- logic Apps Script
- chatbot AI
- push notification backend
- thống kê
- khảo sát

Do đó cần phân biệt rõ 2 pha:

### Pha A

Chuyển phần web tĩnh sang IIS trên Windows Server 2022.

### Pha B

Nếu mong muốn toàn bộ hệ thống nằm trên máy chủ riêng, phải làm dự án tiếp theo để thay thế:

- Firebase
- Google Apps Script
- push notification backend
- có thể cả chatbot backend

## 4. Phương án triển khai khuyến nghị

Khuyến nghị triển khai theo phương án sau:

### Phương án nên làm ngay

- Dùng `IIS` để phục vụ frontend tĩnh.
- Giữ nguyên các backend ngoài hiện tại.
- Giữ domain chạy ở HTTPS.
- Triển khai theo mô hình cutover có rollback.

### Phương án chưa nên làm ngay

- Không chuyển ngay dữ liệu sang SQL.
- Không viết lại chatbot/backend trong cùng đợt.
- Không thay đồng thời Firebase + Apps Script + hosting.

Lý do:

- Rủi ro quá lớn nếu gộp tất cả vào một lần chuyển.
- Máy chủ hiện mới có SQL, chưa có backend API thay thế.
- Ứng dụng hiện tại đang phụ thuộc khá nhiều vào Firebase và Apps Script.

## 5. Những thứ cần chuẩn bị trước khi triển khai

## 5.1. Hạ tầng

Cần có:

- Máy chủ `Windows Server 2022`
- quyền `Administrator`
- IP public hoặc NAT/public reverse mapping
- domain đang dùng hoặc domain mới
- khả năng mở port `80` và `443`
- chứng chỉ SSL/TLS hợp lệ

## 5.2. Truy cập quản trị

Cần chuẩn bị:

- quyền truy cập DNS của domain
- quyền truy cập máy chủ
- quyền truy cập `Firebase Console`
- quyền truy cập các `Google Apps Script` đang dùng
- quyền kiểm tra firewall mạng ngoài và Windows Firewall

## 5.3. Hồ sơ kỹ thuật

Cần chốt các thông tin:

- domain chính thức sau cutover
- có dùng domain hiện tại `tcddvhn.id.vn` hay không
- hosting ở root domain hay subdomain
- có reverse proxy phía trước hay không
- có yêu cầu whitelist IP nội bộ nào không

## 5.4. Sao lưu

Trước khi cutover cần sao lưu:

- toàn bộ source hiện tại
- dữ liệu Firestore
- mã nguồn Apps Script
- cấu hình Firebase
- bản ghi DNS hiện tại

Khuyến nghị:

- lưu một bản zip source đã xác nhận chạy tốt
- lưu một snapshot Firestore
- lưu nội dung deployment IDs của Apps Script

## 5.5. Quyết định quan trọng cần chốt trước

1. Website có chạy ở domain gốc hay subdomain.
2. Có giữ Firebase/Auth/Firestore/FCM như cũ hay chưa.
3. Có giữ chatbot Apps Script như cũ hay chưa.
4. Có cần chạy trong intranet hay public Internet.
5. Có cần cơ chế rollback về host cũ trong 24 đến 72 giờ đầu hay không.

## 6. Những phụ thuộc phải xử lý khi đổi domain hoặc origin

Khi đổi host hoặc domain, không chỉ web server phải đổi. Cần rà cả những phụ thuộc sau:

### 6.1. Firebase Authentication

Nếu đổi domain chạy web, nên thêm domain mới vào danh sách `Authorized Domains` trong Firebase Authentication để tránh các flow xác thực bị chặn.

### 6.2. Firebase Cloud Messaging

FCM web yêu cầu:

- site chạy bằng `HTTPS`
- service worker được phục vụ đúng từ origin của site

Điều này có nghĩa:

- site mới bắt buộc phải có HTTPS hợp lệ
- file `firebase-messaging-sw.js` phải được phục vụ ở đúng gốc domain

### 6.3. Google Apps Script endpoints

Các endpoint Apps Script hiện đang được gọi trực tiếp từ trình duyệt. Cần kiểm thử từ domain mới để xác nhận:

- endpoint còn phản hồi bình thường
- không phát sinh chặn CORS
- token API hiện tại vẫn được backend chấp nhận

### 6.4. Ảnh/CDN ngoài

Website hiện vẫn dùng:

- ảnh từ `postimg`
- Quill CDN
- Font Awesome CDN
- Firebase SDK CDN

Nếu máy chủ mới đặt trong môi trường mạng giới hạn outbound, phải mở truy cập tới các domain đó.

## 7. Kiến trúc đích khuyến nghị cho giai đoạn 1

### 7.1. Thành phần trên máy chủ mới

- IIS
- thư mục chứa website tĩnh
- log IIS
- SSL binding
- Windows Firewall rule cho `80`, `443`

### 7.2. Thành phần vẫn ở ngoài

- Firebase Authentication
- Firestore
- FCM
- Google Apps Script chatbot
- Google Apps Script khảo sát
- Google Apps Script thống kê

### 7.3. Vai trò của SQL Server hiện có

Ở giai đoạn 1:

- `SQL Server` chưa được sử dụng bởi ứng dụng.
- Không cần tích hợp SQL để website lên được máy chủ tĩnh.

Khuyến nghị:

- Không gắn SQL vào đợt chuyển host lần này.
- Chỉ xem SQL là nền tảng cho phase backend sau này nếu muốn thay Firestore/Apps Script.

## 8. Lộ trình triển khai khuyến nghị

## Giai đoạn 0. Khảo sát và chuẩn bị

Mục tiêu:

- xác nhận domain
- xác nhận hạ tầng
- backup đầy đủ
- kiểm tra phụ thuộc

Đầu ra:

- checklist triển khai
- bản backup
- domain plan
- rollback plan

## Giai đoạn 1. Dựng máy chủ web

Mục tiêu:

- cài IIS
- tạo website
- copy source tĩnh
- cấu hình MIME types và HTTPS

Đầu ra:

- site mở được nội bộ bằng HTTP/HTTPS

## Giai đoạn 2. Kiểm thử tích hợp

Mục tiêu:

- kiểm thử tất cả chức năng tĩnh
- kiểm thử Firebase/Auth/Firestore/FCM
- kiểm thử Apps Script endpoints từ origin mới

Đầu ra:

- biên bản test pass/fail

## Giai đoạn 3. Cutover DNS

Mục tiêu:

- trỏ domain sang máy chủ mới
- theo dõi lỗi thực tế

Đầu ra:

- site mới public
- rollback window sẵn sàng

## Giai đoạn 4. Ổn định sau cutover

Mục tiêu:

- theo dõi log
- sửa lỗi phát sinh
- xác nhận push/chatbot/login hoạt động ổn định

## Giai đoạn 5. Tùy chọn nâng cấp backend

Nếu sau này muốn “toàn bộ hệ thống” chạy trên máy chủ riêng:

- thay Firestore bằng API + SQL Server
- thay Apps Script bằng API server riêng
- thay chatbot bằng backend riêng
- thay push backend bằng dịch vụ chuẩn hóa hơn

## 9. Quy trình chi tiết triển khai trên Windows Server 2022

## Bước 1. Cài IIS

Khuyến nghị cài bằng PowerShell chạy `Run as Administrator`.

Ví dụ:

```powershell
Install-WindowsFeature Web-Server, Web-Static-Content, Web-Default-Doc, Web-Http-Errors, Web-Http-Logging, Web-Request-Monitor, Web-Filtering, Web-Stat-Compression, Web-Mgmt-Console -IncludeManagementTools
```

Tối thiểu cần:

- `Web-Server`
- `Web-Static-Content`
- `Web-Default-Doc`
- `Web-Http-Logging`
- `Web-Filtering`
- `Web-Stat-Compression`
- `Web-Mgmt-Console`

Không cần cho giai đoạn này:

- ASP.NET
- CGI
- PHP
- .NET hosting bundle

Vì ứng dụng hiện là static frontend.

## Bước 2. Tạo thư mục triển khai

Khuyến nghị tạo riêng:

```powershell
New-Item -ItemType Directory -Path C:\Sites\sotay-dangvien -Force
New-Item -ItemType Directory -Path C:\Sites\logs\sotay-dangvien -Force
```

Khuyến nghị cấu trúc:

```text
C:\Sites\sotay-dangvien
  index.html
  app.js
  styles.css
  directory-module.js
  directory-seed.js
  firebase-messaging-sw.js
  huongdan.pdf
  huongdan06.pdf
  huongdan21.pdf
  huongdan38.pdf
  quydinh294.pdf
  build\
  web\
```

## Bước 3. Copy source lên máy chủ

Copy toàn bộ các file và thư mục sau:

- `index.html`
- `app.js`
- `styles.css`
- `directory-module.js`
- `directory-seed.js`
- `firebase-messaging-sw.js`
- `build`
- `web`
- các file PDF
- `CNAME` nếu muốn lưu hồ sơ, nhưng IIS không dùng file này để binding

Lưu ý:

- không copy `.git` nếu không cần
- không cần copy thư mục `docs` vào webroot để chạy site
- tài liệu có thể lưu ngoài webroot

## Bước 4. Tạo website trong IIS

Có thể tạo qua IIS Manager hoặc PowerShell.

Ví dụ PowerShell:

```powershell
Import-Module WebAdministration

New-WebAppPool -Name "sotay-dangvien-pool"

New-Website `
  -Name "sotay-dangvien" `
  -Port 80 `
  -PhysicalPath "C:\Sites\sotay-dangvien" `
  -ApplicationPool "sotay-dangvien-pool"
```

Nếu dùng host header:

```powershell
New-Website `
  -Name "sotay-dangvien" `
  -Port 80 `
  -HostHeader "tcddvhn.id.vn" `
  -PhysicalPath "C:\Sites\sotay-dangvien" `
  -ApplicationPool "sotay-dangvien-pool"
```

## Bước 5. Cấu hình Default Document

Website phải trả `index.html` khi mở domain gốc.

IIS thường đã có Default Document, nhưng cần kiểm tra:

- `index.html` phải nằm trong danh sách default document

Có thể cấu hình bằng:

```powershell
Set-WebConfigurationProperty -pspath 'MACHINE/WEBROOT/APPHOST' `
  -filter "system.webServer/defaultDocument/files" `
  -name "." `
  -value @{value='index.html'}
```

## Bước 6. Cấu hình MIME types bắt buộc

Đây là bước rất quan trọng, vì site này không chỉ có `.html`, `.js`, `.css`.

Ứng dụng đang dùng thêm:

- `.mjs`
- `.wasm`
- `.bcmap`
- `.ftl`
- `.map`
- `.pfb`
- `.ttf`
- `.svg`
- `.json`
- `.pdf`

Nếu IIS không biết MIME type của file, file có thể bị chặn hoặc tải sai.

Khuyến nghị cấu hình thêm các MIME type sau:

| Extension | MIME type khuyến nghị |
|---|---|
| `.mjs` | `text/javascript` |
| `.wasm` | `application/wasm` |
| `.bcmap` | `application/octet-stream` |
| `.ftl` | `text/plain` |
| `.map` | `application/json` |
| `.pfb` | `application/octet-stream` |
| `.ttf` | `font/ttf` |

Ví dụ PowerShell:

```powershell
Import-Module WebAdministration

$site = "IIS:\Sites\sotay-dangvien"

New-WebMimeType -PSPath $site -Extension ".mjs" -MimeType "text/javascript"
New-WebMimeType -PSPath $site -Extension ".wasm" -MimeType "application/wasm"
New-WebMimeType -PSPath $site -Extension ".bcmap" -MimeType "application/octet-stream"
New-WebMimeType -PSPath $site -Extension ".ftl" -MimeType "text/plain"
New-WebMimeType -PSPath $site -Extension ".map" -MimeType "application/json"
New-WebMimeType -PSPath $site -Extension ".pfb" -MimeType "application/octet-stream"
New-WebMimeType -PSPath $site -Extension ".ttf" -MimeType "font/ttf"
```

Ghi chú:

- nếu đã tồn tại MIME type thì lệnh có thể báo lỗi trùng; khi đó chỉ cần kiểm tra lại cấu hình

## Bước 7. Bật static compression

Site có nhiều file tĩnh lớn như:

- JS
- CSS
- `.mjs`
- locale files

Khuyến nghị bật static compression.

Ví dụ:

```powershell
appcmd set config /section:urlCompression /doStaticCompression:True
```

Không bắt buộc bật dynamic compression vì site hiện không phải app động trên IIS.

## Bước 8. Cấu hình HTTPS

Do website dùng:

- Firebase Authentication
- Firebase Cloud Messaging
- service worker

nên HTTPS là bắt buộc cho môi trường production.

Các bước:

1. Chuẩn bị chứng chỉ SSL/TLS.
2. Import chứng chỉ vào Windows Certificate Store.
3. Tạo HTTPS binding cho site.

Ví dụ binding:

```powershell
New-WebBinding -Name "sotay-dangvien" -Protocol https -Port 443 -HostHeader "tcddvhn.id.vn"
```

Sau đó gán certificate bằng IIS Manager hoặc PowerShell tương ứng với thumbprint chứng chỉ.

Khuyến nghị:

- dùng chứng chỉ từ CA công khai hợp lệ
- không dùng self-signed cho production public Internet

## Bước 9. Mở firewall

Mở inbound rule cho:

- TCP 80
- TCP 443

Ví dụ:

```powershell
New-NetFirewallRule -DisplayName "HTTP 80" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "HTTPS 443" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

Nếu có firewall ngoài hoặc load balancer:

- mở thêm ở lớp mạng ngoài

## Bước 10. Kiểm tra DNS

Nếu domain hiện tại là `tcddvhn.id.vn`, cần kiểm tra:

- hiện nó đang trỏ về đâu
- cắt DNS theo `A record` hay `CNAME`
- TTL hiện tại là bao nhiêu

Khuyến nghị cutover:

1. Giảm TTL trước cutover 24 giờ nếu có thể.
2. Trỏ domain sang IP máy chủ mới.
3. Kiểm tra chứng chỉ sau khi DNS cập nhật.

## 10. Cấu hình web.config khuyến nghị

Nên tạo file `web.config` trong thư mục webroot để cố định các thiết lập quan trọng.

Ví dụ mẫu:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <defaultDocument enabled="true">
      <files>
        <clear />
        <add value="index.html" />
      </files>
    </defaultDocument>

    <staticContent>
      <mimeMap fileExtension=".mjs" mimeType="text/javascript" />
      <mimeMap fileExtension=".wasm" mimeType="application/wasm" />
      <mimeMap fileExtension=".bcmap" mimeType="application/octet-stream" />
      <mimeMap fileExtension=".ftl" mimeType="text/plain" />
      <mimeMap fileExtension=".map" mimeType="application/json" />
      <mimeMap fileExtension=".pfb" mimeType="application/octet-stream" />
      <mimeMap fileExtension=".ttf" mimeType="font/ttf" />
    </staticContent>

    <urlCompression doStaticCompression="true" doDynamicCompression="false" />

    <httpProtocol>
      <customHeaders>
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="Referrer-Policy" value="strict-origin-when-cross-origin" />
      </customHeaders>
    </httpProtocol>

    <httpErrors errorMode="DetailedLocalOnly" />
  </system.webServer>
</configuration>
```

Lưu ý:

- Nếu thêm `web.config`, cần kiểm tra trùng MIME type với cấu hình site-level để tránh lỗi duplicate.
- Có thể dùng `web.config` thay cho cấu hình bằng UI nếu muốn quản trị theo file.

## 11. Checklist kỹ thuật riêng cho hệ thống này

## 11.1. Kiểm tra file gốc

Phải có đủ:

- `index.html`
- `app.js`
- `styles.css`
- `directory-module.js`
- `directory-seed.js`
- `firebase-messaging-sw.js`
- `build/`
- `web/`
- PDF files

## 11.2. Kiểm tra đường dẫn relative

Ứng dụng hiện dùng:

- `PDF_VIEWER_URL = "web/viewer.html"`
- service worker tại root
- nhiều path tương đối sang `build/`, `web/`, `../web/wasm/`, `../web/standard_fonts/`

Khuyến nghị rất quan trọng:

- host toàn bộ site ở root của domain
- không host trong subfolder như `/sotay/` nếu chưa refactor path

Nếu host trong subfolder, rất dễ vỡ:

- PDF viewer
- wasm
- service worker
- locale
- đường dẫn file PDF

## 11.3. Kiểm tra Firebase

Phải kiểm tra:

- Firebase Auth sign-in còn hoạt động
- Firestore load dữ liệu được
- FCM lấy token được
- domain mới được thêm vào Authorized Domains nếu cần

## 11.4. Kiểm tra Apps Script

Phải kiểm tra:

- chatbot trả lời được từ domain mới
- khảo sát gửi được
- thống kê ghi được
- thông báo hệ thống tải được

## 11.5. Kiểm tra route ngoài

Trong `app.js` có cấu hình:

- `https://code-web-sotay.vercel.app/`

Phải xác định:

- route này có còn dùng không
- nếu vẫn dùng thì máy chủ mới vẫn phải cho phép người dùng mở tới domain đó

## 12. Quy trình kiểm thử trước cutover

## 12.1. Kiểm thử local trên máy chủ

Kiểm tra:

- mở `http://localhost`
- mở `http://127.0.0.1`
- mở bằng host header nếu đã bind domain

## 12.2. Kiểm thử file tĩnh

Kiểm tra:

- `index.html`
- `app.js`
- `styles.css`
- `directory-module.js`
- `directory-seed.js`
- các file `.mjs`
- `.wasm`
- `.bcmap`
- `.ftl`
- PDF viewer

## 12.3. Kiểm thử chức năng nghiệp vụ

Kiểm tra tối thiểu:

1. Trang chủ tải bình thường
2. Điều hướng 6 tab hoạt động
3. Danh bạ mở được
4. PDF viewer mở được
5. Tìm kiếm hoạt động
6. Chatbot trả lời được
7. Admin login được
8. Lưu nội dung admin được
9. Lưu danh bạ được
10. Thống kê tải được
11. Khảo sát gửi được
12. Thông báo đẩy đăng ký được

## 12.4. Kiểm thử SSL

Kiểm tra:

- mở bằng HTTPS không cảnh báo chứng chỉ
- service worker đăng ký thành công
- FCM token lấy được

## 12.5. Kiểm thử cache

Kiểm tra:

- đổi version file JS/CSS khi deploy
- trình duyệt không giữ bản cũ quá lâu

Khuyến nghị:

- tiếp tục dùng query version như hiện tại `?v=...`

## 13. Quy trình cutover đề xuất

## Bước 1

Triển khai site mới trên máy chủ nhưng chưa đổi DNS.

## Bước 2

Test qua:

- file hosts cục bộ
- IP trực tiếp
- host header tạm

## Bước 3

Giảm TTL DNS nếu còn đủ thời gian.

## Bước 4

Đổi bản ghi DNS sang máy chủ mới.

## Bước 5

Theo dõi trong 2 đến 4 giờ đầu:

- tải trang
- chatbot
- admin login
- Firestore
- push

## Bước 6

Theo dõi tiếp trong 24 đến 72 giờ:

- log IIS
- phản ánh người dùng
- lỗi JS trên trình duyệt nếu có

## 14. Phương án rollback

Rollback phải được chuẩn bị trước.

Điều kiện rollback:

- site mới không tải ổn định
- chatbot hoặc admin lỗi nghiêm trọng
- push/service worker lỗi diện rộng
- lỗi MIME làm PDF.js hỏng
- lỗi HTTPS/chứng chỉ

Phương án rollback:

1. Trỏ DNS về host cũ.
2. Giữ nguyên source host cũ trong suốt giai đoạn giám sát đầu.
3. Không xóa host cũ ngay sau cutover.

Khuyến nghị:

- giữ host cũ sẵn sàng ít nhất 3 đến 7 ngày

## 15. Những lỗi hay gặp nhất trong bài toán này

1. Quên cấu hình MIME cho `.mjs` hoặc `.wasm`.
2. Host dưới subfolder làm vỡ path tương đối.
3. Thiếu HTTPS làm FCM và service worker không chạy.
4. Domain mới chưa được cho phép trong Firebase Auth.
5. Apps Script phản hồi khác khi gọi từ origin mới.
6. Cache trình duyệt giữ JS cũ sau deploy.
7. Chỉ copy `index.html/app.js/styles.css` mà quên `build/`, `web/`, PDF files.
8. IIS site chạy được nhưng firewall ngoài chưa mở `443`.

## 16. Lộ trình nâng cấp sau khi chuyển host xong

## Giai đoạn tiếp theo nếu muốn bỏ phụ thuộc Google/Firebase

### Phase 2A

Viết API riêng trên máy chủ để thay:

- chatbot gateway
- khảo sát
- thống kê

### Phase 2B

Thiết kế backend dữ liệu dùng SQL Server thay cho:

- Firestore
- một phần Auth hoặc toàn bộ Auth

### Phase 2C

Chuẩn hóa deploy:

- source control
- build package
- release checklist
- backup và restore

## 17. Khuyến nghị thực thi thực tế

Nếu mục tiêu của anh/chị là:

### “Website chạy trên máy chủ riêng càng sớm càng tốt”

thì nên làm theo cách:

- chuyển frontend tĩnh sang IIS ngay
- giữ backend ngoài như cũ

Nếu mục tiêu là:

### “Toàn bộ hệ thống nằm trên hạ tầng riêng”

thì phải mở dự án giai đoạn 2, vì khi đó không còn là bài toán hosting tĩnh nữa mà là:

- tái kiến trúc backend
- thay đổi mô hình dữ liệu
- thay cơ chế xác thực
- thay chatbot backend

## 18. Nguồn tham khảo chính thức

- Microsoft Learn, Build a Static Website on IIS: [https://learn.microsoft.com/en-us/iis/manage/creating-websites/scenario-build-a-static-website-on-iis](https://learn.microsoft.com/en-us/iis/manage/creating-websites/scenario-build-a-static-website-on-iis)
- Microsoft Learn, Create a Web Site: [https://learn.microsoft.com/en-us/iis/get-started/getting-started-with-iis/create-a-web-site](https://learn.microsoft.com/en-us/iis/get-started/getting-started-with-iis/create-a-web-site)
- Microsoft Learn, Default Document: [https://learn.microsoft.com/en-us/iis/configuration/system.webServer/defaultDocument/](https://learn.microsoft.com/en-us/iis/configuration/system.webServer/defaultDocument/)
- Microsoft Learn, MIME Map: [https://learn.microsoft.com/en-us/iis/configuration/system.webserver/staticcontent/mimemap](https://learn.microsoft.com/en-us/iis/configuration/system.webserver/staticcontent/mimemap)
- Microsoft Learn, URL Compression: [https://learn.microsoft.com/en-us/iis/configuration/system.webserver/urlcompression](https://learn.microsoft.com/en-us/iis/configuration/system.webserver/urlcompression)
- Microsoft Learn, Bindings: [https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/sites/site/bindings/](https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/sites/site/bindings/)
- Microsoft Learn, Configure Request Filtering in IIS: [https://learn.microsoft.com/en-us/iis/manage/configuring-security/configure-request-filtering-in-iis](https://learn.microsoft.com/en-us/iis/manage/configuring-security/configure-request-filtering-in-iis)
- Firebase Cloud Messaging for Web: [https://firebase.google.com/docs/cloud-messaging/js/client?hl=vi](https://firebase.google.com/docs/cloud-messaging/js/client?hl=vi)
- Firebase Cloud Messaging receive messages: [https://firebase.google.com/docs/cloud-messaging/js/receive](https://firebase.google.com/docs/cloud-messaging/js/receive)
- Firebase Auth password-based accounts: [https://firebase.google.com/docs/auth/web/password-auth](https://firebase.google.com/docs/auth/web/password-auth)

## 19. Kết luận cuối

Máy chủ `Windows Server 2022` hiện tại hoàn toàn có thể dùng để host phần web tĩnh của Sổ tay qua `IIS`.

Tuy nhiên, với kiến trúc hiện tại:

- đây là bài toán `chuyển frontend tĩnh sang host mới`
- chưa phải bài toán `chuyển toàn bộ hệ thống sang máy chủ riêng`

Khuyến nghị thực hiện:

1. Làm cutover frontend tĩnh trước.
2. Giữ nguyên Firebase và Apps Script.
3. Kiểm thử kỹ từ domain mới.
4. Chỉ sau khi ổn định mới bàn đến phase dùng `SQL Server` để thay backend hiện tại.
