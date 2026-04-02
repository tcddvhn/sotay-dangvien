# Báo cáo thiết kế chức năng Danh bạ

Ngày lập: 2026-04-02

## 1. Mục tiêu

Bổ sung một chức năng mới tên là `Danh bạ` để tra cứu thông tin liên hệ của các đơn vị theo 3 cấp:

- Cấp 1
- Cấp 2
- Cấp 3

Chức năng này phải phù hợp với kiến trúc hiện tại của ứng dụng web tĩnh đang dùng `index.html`, `app.js`, `styles.css`, Firestore và cơ chế quản trị nội dung sẵn có.

## 2. Hiện trạng hệ thống

Qua phân tích mã hiện tại:

- Ứng dụng là SPA thuần HTML/CSS/JS, toàn bộ điều hướng do `switchTab()` trong `app.js` điều khiển.
- Thanh điều hướng dưới hiện có 5 mục: `Trang chủ`, `Quy định`, `Hỏi đáp`, `Biểu mẫu`, `Tài liệu`.
- Nội dung nghiệp vụ hiện tại dùng chung dữ liệu cây `APP_DATA`, lấy realtime từ Firestore document `sotay/dulieu`.
- Khu vực quản trị đang tối ưu cho nội dung dạng bài viết/cây thư mục, có các trường như `summary`, `detail`, `fileUrl`, `pdfRefs`.
- Kiểu dữ liệu danh bạ là dữ liệu có cấu trúc, không phù hợp nếu trộn thẳng vào `APP_DATA`.

Kết luận: `Danh bạ` nên là một module riêng, có dữ liệu riêng, renderer riêng và form quản trị riêng, nhưng vẫn dùng cùng phong cách giao diện và cùng Firebase project hiện tại.

## 3. Nhu cầu nghiệp vụ được hiểu

Chức năng `Danh bạ` cần đáp ứng tối thiểu:

- Liệt kê đơn vị theo 3 cấp rõ ràng.
- Cho phép người dùng mở từng cấp để xem danh sách đơn vị con.
- Hiển thị thông tin liên hệ của từng đơn vị.
- Có thể tìm nhanh theo tên đơn vị, tên cán bộ, số điện thoại.
- Có khả năng quản trị/cập nhật dữ liệu sau này mà không phải sửa mã nguồn thủ công.

## 4. Phương án thiết kế đề xuất

### 4.1. Phương án tổng thể

Đề xuất bổ sung một tab mới tên `Danh bạ` ở giao diện người dùng, đồng thời tách dữ liệu danh bạ sang một nguồn riêng.

Khuyến nghị:

- Tạo tab `Danh bạ` độc lập thay vì nhét vào `Tài liệu` hoặc `Quy định`.
- Tạo biến dữ liệu riêng, ví dụ `DIRECTORY_DATA`.
- Tạo document Firestore riêng, ví dụ `sotay/danhba`.
- Tạo giao diện quản trị riêng cho danh bạ, không dùng chung editor Quill hiện tại.

Lý do:

- Danh bạ là dữ liệu có cấu trúc chặt chẽ, không phải bài viết.
- Dữ liệu 3 cấp cần ràng buộc cấp rõ ràng.
- Tách riêng sẽ giảm rủi ro làm hỏng các chức năng tra cứu hiện có.

### 4.2. Điều hướng giao diện

Đề xuất thêm mục `Danh bạ` vào thanh điều hướng dưới.

Tác động kỹ thuật:

- Mobile hiện đang tối ưu cho 5 mục, thêm mục thứ 6 sẽ làm tab chật hơn.
- Desktop không có vấn đề lớn vì nav dọc bên trái.

Giải pháp đề xuất:

- Vẫn thêm tab thứ 6 để người dùng dễ thấy và dễ truy cập.
- Điều chỉnh CSS mobile của `.bottom-nav` và `.nav-item` để mỗi tab gọn hơn.
- Nếu cần, giảm nhẹ cỡ chữ/icon ở mobile cho riêng thanh điều hướng.

Khuyến nghị duyệt:

- Chọn `Danh bạ` là tab độc lập thứ 6.

### 4.3. Banner Danh bạ tại trang chủ

Theo yêu cầu mới, ngoài tab `Danh bạ`, trang chủ sẽ có thêm một banner điều hướng nhanh đặt ngay dưới banner tìm kiếm.

Nội dung banner:

- `{icon danh bạ}` + `Danh bạ chuyển sinh hoạt đảng`

Vị trí:

- Đặt ngay dưới khối banner tìm kiếm ở trang chủ.

Kích thước:

- Độ rộng bằng đúng độ rộng khối banner tìm kiếm hiện tại.
- Độ cao mục tiêu bằng `1/6` chiều cao banner tìm kiếm.

Giải thích kỹ thuật:

- Hệ thống hiện tại là giao diện responsive, nên chiều cao banner tìm kiếm có thể thay đổi theo thiết bị.
- Vì vậy khi triển khai nên dùng cách tính tương đối theo layout hiện tại, nhưng vẫn đặt `min-height` để tránh banner quá thấp trên màn hình nhỏ.

Khuyến nghị triển khai:

- Giữ đúng tinh thần `1/6` theo yêu cầu.
- Đồng thời đặt `min-height` khoảng `44px` đến `48px` để còn đủ vùng bấm trên mobile.

Hành vi:

- Toàn bộ banner là vùng bấm.
- Khi bấm sẽ chuyển thẳng tới tab `Danh bạ`.

Phong cách hiển thị:

- Màu nổi bật hơn nền trang chủ.
- Nên dùng dải màu đỏ đậm kết hợp vàng nhấn để đồng bộ nhận diện hiện tại.
- Icon đặt trong một khối tròn hoặc vuông bo nhẹ để tạo điểm nhấn.
- Chữ căn trái, dễ đọc, không xuống nhiều dòng.

Vai trò UX:

- Đây là lối vào nhanh cho chức năng mới.
- Giảm việc người dùng phải chú ý đến tab thứ 6 ở thanh điều hướng.
- Phù hợp với nhu cầu truy cập nhanh vào danh bạ chuyển sinh hoạt đảng từ trang chủ.

## 5. Thiết kế dữ liệu

### 5.1. Nguồn dữ liệu

Khuyến nghị dùng document Firestore riêng:

- Collection: `sotay`
- Document: `danhba`

Cấu trúc gợi ý:

```json
{
  "treeData": [
    {
      "id": "db_cap1_001",
      "name": "Đơn vị cấp 1",
      "level": 1,
      "parentId": null,
      "unitCode": "C1-001",
      "address": "",
      "phone": "",
      "email": "",
      "leaders": [
        {
          "role": "Bí thư",
          "name": "Nguyễn Văn A",
          "phone": "09xxxxxxxx",
          "email": ""
        }
      ],
      "staffs": [
        {
          "role": "Cán bộ phụ trách",
          "name": "Trần Thị B",
          "phone": "09xxxxxxxx",
          "email": ""
        }
      ],
      "children": []
    }
  ],
  "updatedAt": "2026-04-02T10:00:00.000Z"
}
```

### 5.2. Mô hình dữ liệu khuyến nghị

Mỗi đơn vị nên có:

- `id`
- `name`
- `level`: chỉ cho phép `1`, `2`, `3`
- `parentId`
- `unitCode`
- `address`
- `phone`
- `email`
- `leaders`: danh sách lãnh đạo chính
- `staffs`: danh sách đầu mối liên hệ
- `notes`
- `children`
- `updatedAt`
- `updatedBy`
- `isActive`

Ghi chú điều chỉnh theo yêu cầu dữ liệu tối giản hiện tại:

Nếu giai đoạn đầu mỗi đơn vị chỉ cần 4 thông tin chính, có thể rút gọn bản ghi hiển thị công khai còn:

- `name`: tên đơn vị
- `phone`: số điện thoại
- `address`: địa chỉ liên hệ
- `location`: vị trí

Khuyến nghị cách hiểu trường `location`:

- Dùng để mô tả vị trí ngắn gọn, ví dụ khu vực, địa bàn, hoặc mô tả điểm đặt đơn vị.
- Nếu sau này muốn mở rộng bản đồ, có thể bổ sung `mapUrl`, `lat`, `lng`.

Khuyến nghị chính thức:

- Ở giai đoạn 1, trường bắt buộc hiển thị ra ngoài chỉ gồm `name`, `phone`, `address`, `location`.
- Các trường mở rộng như `unitCode`, `email`, `notes` có thể giữ ở mức tùy chọn.

### 5.3. Ràng buộc dữ liệu

- Cấp 1 không có `parentId`.
- Cấp 2 phải thuộc một đơn vị cấp 1.
- Cấp 3 phải thuộc một đơn vị cấp 2.
- Không cho phép tạo cấp sâu hơn cấp 3.
- Số điện thoại phải lưu dạng chuỗi để giữ số 0 đầu.
- Trường email, website, địa chỉ là tùy chọn.

### 5.4. Dữ liệu khởi tạo đã triển khai

Nguồn dữ liệu khởi tạo giai đoạn đầu:

- File Excel do chủ đầu tư cung cấp: `Danh sach don vị.xlsx`
- Sheet: `MA_DONVI`
- Số lượng đã đọc được: `132` đơn vị cấp 1
- Cột nguồn hiện có: `TenDonvi`, `Ma_donvi`

Cách đưa vào hệ thống:

- Toàn bộ 132 đơn vị cấp 1 được seed sẵn vào module `Danh bạ`.
- Các trường `Số điện thoại`, `Địa chỉ liên hệ`, `Vị trí` được để trống ban đầu để admin cập nhật dần trong quản trị.
- Dữ liệu seed chỉ là dữ liệu khởi tạo; khi admin chỉnh sửa và lưu thì dữ liệu chính thức sẽ đi theo nguồn `sotay/danhba`.

## 6. Thiết kế giao diện người dùng

### 6.1. Màn hình Danh bạ

Tab `Danh bạ` đề xuất gồm:

- Tiêu đề: `Danh bạ đơn vị`
- Ô tìm kiếm nhanh
- Bộ lọc theo cấp: `Tất cả`, `Cấp 1`, `Cấp 2`, `Cấp 3`
- Khu vực danh sách cây 3 cấp
- Thẻ chi tiết đơn vị khi mở một mục

### 6.2. Cách hiển thị

Đề xuất hiển thị theo dạng accordion:

- Cấp 1: khối chính, nổi bật nhất
- Cấp 2: nhóm con bên trong cấp 1
- Cấp 3: danh sách đơn vị cuối cùng

Khi bấm vào một đơn vị, hiển thị:

- Tên đơn vị
- Mã đơn vị
- Địa chỉ
- Điện thoại cơ quan
- Email
- Danh sách lãnh đạo
- Danh sách đầu mối liên hệ

Hành vi gợi ý:

- Số điện thoại dùng link `tel:`
- Email dùng link `mailto:`
- Có nút `Sao chép số` ở giai đoạn sau nếu cần

### 6.3. Tìm kiếm

Nên hỗ trợ tìm trên:

- Tên đơn vị
- Mã đơn vị
- Tên người liên hệ
- Số điện thoại
- Email

Khuyến nghị:

- Dùng bộ tìm kiếm riêng cho `DIRECTORY_DATA`
- Không trộn ngay vào kết quả tìm kiếm nghiệp vụ hiện có trong giai đoạn đầu

Lý do:

- Giảm rủi ro ảnh hưởng bộ tìm kiếm tài liệu hiện tại.
- Dễ kiểm soát chất lượng kết quả hơn.

### 6.4. Nghiên cứu giao diện danh bạ từ tài liệu internet và đề xuất áp dụng

Sau khi tham khảo một số tài liệu thiết kế giao diện từ các design system chính thức, có thể rút ra các nguyên tắc phù hợp nhất cho `Danh bạ` như sau:

Nguyên tắc 1: thông tin liên hệ phải nhìn thấy ngay

- Các pattern về contact information khuyến nghị đặt thông tin liên hệ ở vị trí dễ thấy, không bắt người dùng phải bấm thêm nhiều bước mới xem được.
- Điều này đặc biệt phù hợp với chức năng danh bạ, vì mục tiêu chính là tra cứu nhanh số điện thoại và địa chỉ.

Nguyên tắc 2: danh sách phải dễ quét mắt

- Các pattern list/search đều nhấn mạnh tính `scannability`, tức mỗi dòng hoặc mỗi thẻ phải có cấu trúc nhất quán để người dùng quét nhanh.
- Với danh bạ, nếu mỗi đơn vị đều có cùng cấu trúc hiển thị thì việc tìm đúng đơn vị sẽ nhanh hơn.

Nguyên tắc 3: phải có tìm kiếm và thứ tự duyệt logic

- Tài liệu về list/search pattern khuyến nghị tổ chức dữ liệu theo thứ tự duyệt được bằng mắt, đồng thời có ô tìm kiếm ngay phần đầu.
- Điều này phù hợp với danh bạ nhiều đơn vị và 3 cấp.

Nguyên tắc 4: nên dùng list/card hơn là bảng

- Với dữ liệu một đơn vị chỉ gồm `Tên đơn vị`, `Số điện thoại`, `Địa chỉ liên hệ`, `Vị trí`, dạng card/list sẽ phù hợp hơn table trên mobile.
- Table chỉ phù hợp hơn khi có rất nhiều cột hoặc thao tác phân tích sâu.

Kết luận nghiên cứu:

- Giao diện tối ưu cho dự án này là `search + group accordion + contact card`.
- Không nên dùng bảng dữ liệu thuần ở giai đoạn đầu.

### 6.5. Đề xuất UI chi tiết cho tab Danh bạ

Tab `Danh bạ` nên có cấu trúc như sau:

1. Khối đầu trang

- Tiêu đề `Danh bạ chuyển sinh hoạt đảng`
- Mô tả ngắn một dòng
- Ô tìm kiếm nhanh
- Bộ lọc cấp: `Tất cả`, `Cấp 1`, `Cấp 2`, `Cấp 3`

2. Khu vực duyệt theo cấp

- Cấp 1 hiển thị dạng accordion chính.
- Bên trong mỗi cấp 1 là danh sách cấp 2.
- Bên trong cấp 2 là danh sách cấp 3 hoặc các thẻ đơn vị cuối.

3. Thẻ đơn vị

Mỗi đơn vị hiển thị theo card/list item thống nhất:

- Dòng 1: `Tên đơn vị` nổi bật nhất
- Dòng 2: `Số điện thoại`
- Dòng 3: `Địa chỉ liên hệ`
- Dòng 4: `Vị trí`

Hành vi đề xuất:

- Bấm vào số điện thoại để gọi nếu đang ở mobile.
- Có nút nhỏ `Xem vị trí` nếu sau này có `mapUrl`.
- Nếu chưa có bản đồ, trường `Vị trí` chỉ hiển thị dạng text.

### 6.6. Cấu trúc card đơn vị đề xuất

Card đơn vị nên có bố cục:

- Header:
  - icon nhỏ
  - tên đơn vị
  - badge cấp
- Body:
  - số điện thoại
  - địa chỉ liên hệ
  - vị trí
- Footer:
  - nút gọi nhanh
  - nút xem chi tiết hoặc xem vị trí nếu có

Ưu điểm:

- Rõ ràng trên mobile
- Dễ tái sử dụng trong cả danh sách và kết quả tìm kiếm
- Dễ mở rộng nếu sau này thêm người liên hệ hoặc map

### 6.7. Phương án hiển thị được khuyến nghị duyệt

Phương án tôi đề nghị duyệt là:

- Trang chủ có banner `Danh bạ chuyển sinh hoạt đảng` ngay dưới banner tìm kiếm.
- Tab `Danh bạ` dùng layout 1 cột, ưu tiên mobile.
- Danh sách chia theo 3 cấp bằng accordion.
- Đơn vị cuối hiển thị dạng contact card.
- Mỗi card chỉ ưu tiên 4 trường: `Tên đơn vị`, `Số điện thoại`, `Địa chỉ liên hệ`, `Vị trí`.
- Tìm kiếm đặt ở đầu trang, lọc ngay trong module danh bạ.

Lý do:

- Khớp với cấu trúc dữ liệu hiện tại mà anh/chị mô tả.
- Đọc nhanh hơn table trên điện thoại.
- Phù hợp với các nguyên tắc thiết kế danh sách và contact details từ các design system tham chiếu.

## 7. Thiết kế quản trị

### 7.1. Nguyên tắc

Không nên tận dụng editor Quill hiện tại cho `Danh bạ`. Cần một form quản trị cấu trúc.

### 7.2. Giao diện quản trị đề xuất

Trong `adminPanel`, bổ sung một chế độ riêng:

- `Biên tập nội dung`
- `Quản trị danh bạ`

Màn hình quản trị danh bạ gồm:

- Cây đơn vị 3 cấp bên trái
- Form chi tiết bên phải
- Nút thêm đơn vị cùng cấp
- Nút thêm đơn vị cấp dưới
- Nút xóa
- Nút lưu

### 7.3. Trường quản trị

Form nên có:

- Tên đơn vị
- Mã đơn vị
- Cấp đơn vị
- Đơn vị cha
- Địa chỉ
- Điện thoại cơ quan
- Email
- Ghi chú
- Danh sách lãnh đạo
- Danh sách đầu mối liên hệ

Với `lãnh đạo` và `đầu mối`, nên dùng danh sách dòng lặp:

- Chức vụ
- Họ tên
- Số điện thoại
- Email

### 7.4. Ràng buộc quản trị

- Không cho thêm cấp 4.
- Khi đổi cấp phải kiểm tra lại quan hệ cha-con.
- Khi xóa cấp 1 hoặc cấp 2 phải cảnh báo xóa toàn bộ cấp dưới.
- Có kiểm tra dữ liệu bắt buộc trước khi lưu.

### 7.5. Giải thích phạm vi `quản trị cơ bản`

Trong báo cáo này, `quản trị cơ bản` được hiểu là bộ chức năng tối thiểu để admin có thể vận hành dữ liệu danh bạ hằng ngày mà chưa cần quy trình phức tạp.

`Quản trị cơ bản` gồm:

- Xem cây danh bạ 3 cấp trong trang quản trị.
- Tìm nhanh đơn vị trong cây quản trị.
- Thêm mới đơn vị cấp 1.
- Thêm đơn vị cấp con từ đơn vị đang chọn.
- Sửa thông tin chi tiết của một đơn vị.
- Sắp xếp thứ tự hiển thị các đơn vị trong cùng cấp.
- Xóa đơn vị kèm cảnh báo nếu còn đơn vị con.
- Bật hoặc tắt trạng thái hiển thị của đơn vị bằng trường `isActive`.
- Lưu người cập nhật và thời gian cập nhật cuối.
- Kiểm tra dữ liệu bắt buộc trước khi lưu.

Thông tin admin có thể cập nhật trong `quản trị cơ bản`:

- Tên đơn vị
- Mã đơn vị
- Cấp đơn vị
- Đơn vị cha
- Địa chỉ
- Điện thoại cơ quan
- Email
- Ghi chú
- Danh sách lãnh đạo
- Danh sách đầu mối liên hệ

`Quản trị cơ bản` chưa bao gồm:

- Import Excel
- Export Excel/PDF
- Phân quyền nhiều vai trò
- Nhật ký duyệt chi tiết theo từng trường
- Khôi phục phiên bản cũ
- Quy trình 2 bước người nhập và người duyệt tách biệt
- Thông báo tự động khi có thay đổi

Kết luận phạm vi:

- Giai đoạn đầu, admin có thể tự tạo, sửa, xóa, sắp xếp và công bố dữ liệu danh bạ.
- Chưa triển khai quy trình hồ sơ phức tạp hay vòng đời phê duyệt nhiều bước.

### 7.6. Luồng `admin duyệt` trong giai đoạn đầu

Vì anh/chị lưu ý `admin sẽ duyệt`, cần phân biệt rõ 2 cách hiểu:

- Cách 1: admin là người trực tiếp nhập và tự kiểm tra trước khi lưu.
- Cách 2: có người nhập liệu và một admin khác vào duyệt rồi mới công bố.

Khuyến nghị cho giai đoạn đầu:

- Áp dụng `Cách 1`.
- Admin đăng nhập là người có quyền cập nhật chính thức.
- Sau khi admin bấm `Lưu`, dữ liệu được coi là đã duyệt và hiển thị ngay cho người dùng nếu `isActive = true`.

Trạng thái quyết định hiện tại của chủ đầu tư:

- Tạm thời chốt theo hướng `admin tự duyệt`.

Lý do chọn cách này:

- Phù hợp với kiến trúc hiện tại của hệ thống.
- Ít thay đổi nhất vào Firebase và giao diện quản trị.
- Triển khai nhanh, rủi ro thấp, dễ vận hành.

Luồng duyệt giai đoạn đầu:

1. Admin mở `Quản trị danh bạ`.
2. Admin thêm mới hoặc chỉnh sửa một đơn vị.
3. Hệ thống kiểm tra dữ liệu bắt buộc.
4. Admin bấm `Lưu`.
5. Hệ thống ghi `updatedAt`, `updatedBy`, `isActive`.
6. Dữ liệu được xem là đã duyệt và hiển thị ngoài giao diện người dùng.

Nếu cần `ẩn tạm` trước khi công bố:

- Admin có thể lưu bản ghi với `isActive = false`.
- Đơn vị đó vẫn tồn tại trong dữ liệu quản trị nhưng không hiển thị ở tab `Danh bạ`.

### 7.7. Phương án mở rộng nếu sau này cần duyệt 2 bước

Nếu sau này cần đúng nghĩa `nhập liệu xong, admin khác duyệt`, có thể mở rộng thêm các trường:

- `status`: `draft`, `pending`, `approved`, `rejected`
- `submittedBy`
- `submittedAt`
- `approvedBy`
- `approvedAt`
- `rejectedReason`

Luồng mở rộng khi đó:

1. Người nhập tạo hoặc sửa dữ liệu ở trạng thái `draft` hoặc `pending`.
2. Admin duyệt mở danh sách chờ duyệt.
3. Admin chọn `Duyệt` hoặc `Từ chối`.
4. Chỉ bản ghi `approved` mới hiển thị ra tab `Danh bạ`.

Khuyến nghị hiện tại:

- Chưa đưa quy trình này vào giai đoạn 1.
- Chỉ ghi nhận đây là hướng mở rộng của giai đoạn 2 hoặc 3 nếu anh/chị yêu cầu.

## 8. Tác động kỹ thuật dự kiến

### 8.1. File cần thay đổi khi triển khai

- `index.html`
- `app.js`
- `styles.css`

Có thể thêm sau này:

- file JSON seed mẫu hoặc script import nếu cần nạp dữ liệu ban đầu

### 8.2. Các khối cần bổ sung trong mã

Trong `index.html`:

- icon mới cho `Danh bạ`
- nav item mới
- tab pane mới
- cụm giao diện quản trị danh bạ

Trong `app.js`:

- biến `DIRECTORY_DATA`
- listener Firestore cho `sotay/danhba`
- `renderDirectoryTab()`
- `renderDirectoryTree()`
- `searchDirectory()`
- CRUD quản trị danh bạ
- cập nhật `switchTab()`

Trong `styles.css`:

- style cho tab `Danh bạ`
- style cho card/liên hệ
- style responsive cho nav 6 mục
- style form quản trị danh bạ

## 9. Tại sao không nên gộp vào APP_DATA

Không khuyến nghị dùng chung `APP_DATA` vì:

- `APP_DATA` đang phục vụ bài viết, hỏi đáp, biểu mẫu, tài liệu.
- Schema hiện tại thiên về nội dung tự do, không thiên về contact directory.
- Nếu trộn vào, code render và admin hiện tại sẽ phải cài nhiều điều kiện đặc biệt.
- Về lâu dài sẽ khó bảo trì và dễ phát sinh lỗi chéo.

Khuyến nghị chính thức:

- Tách `Danh bạ` thành module dữ liệu riêng.

## 10. Giai đoạn triển khai đề xuất

### Giai đoạn 1

- Tạo tab `Danh bạ`
- Tạo dữ liệu Firestore riêng
- Hiển thị tra cứu 3 cấp
- Tìm kiếm trong danh bạ
- Quản trị CRUD cơ bản
- Admin tự duyệt theo mô hình một bước: lưu là công bố nếu `isActive = true`
- Tạo banner `Danh bạ chuyển sinh hoạt đảng` tại trang chủ
- Hiển thị card đơn vị theo 4 trường chính: tên đơn vị, số điện thoại, địa chỉ liên hệ, vị trí

### Giai đoạn 2

- Sao chép số điện thoại
- Lọc theo cấp
- Ưu tiên đơn vị thường dùng
- Đồng bộ kết quả danh bạ với tìm kiếm toàn hệ thống
- Có thể bổ sung quy trình duyệt 2 bước nếu phát sinh nhu cầu

### Giai đoạn 3

- Import từ Excel/Google Sheet
- Export dữ liệu
- Nhật ký thay đổi riêng cho danh bạ

## 11. Rủi ro và lưu ý

- Thanh điều hướng mobile cần chỉnh lại vì thêm tab thứ 6.
- Dữ liệu danh bạ có thể chứa số cá nhân, cần xác định phạm vi công khai.
- Nếu dữ liệu nhiều, form quản trị danh sách liên hệ lặp sẽ cần UX gọn.
- Nếu cần nhập nhanh số lượng lớn, nên tính sớm phương án import thay vì nhập tay.

## 12. Kiến nghị duyệt

Đề nghị anh/chị duyệt 4 điểm sau:

1. `Danh bạ` là tab độc lập trên thanh điều hướng.
2. Dữ liệu danh bạ lưu riêng tại `sotay/danhba`, không gộp vào `APP_DATA`.
3. Cấu trúc dữ liệu dùng cây 3 cấp với danh sách liên hệ có cấu trúc.
4. Giai đoạn đầu triển khai tra cứu + quản trị cơ bản, chưa làm import Excel.

Các điểm đã được chủ đầu tư chốt tạm thời:

- Giai đoạn đầu giữ mô hình `admin tự duyệt`.
- Trang chủ có banner `Danh bạ chuyển sinh hoạt đảng` nằm ngay dưới banner tìm kiếm.

Các điểm còn chờ xác nhận cuối:

- Trường `vị trí` sẽ là text mô tả hay sẽ kèm link bản đồ.
- Có cần giữ thêm `email` trong form quản trị giai đoạn 1 hay không.

## 13. Nguồn tham chiếu giao diện

Các tài liệu được tham khảo để rút ra nguyên tắc thiết kế:

- Scottish Government Design System, Contact details: [https://designsystem.gov.scot/components/contact-details](https://designsystem.gov.scot/components/contact-details)
- DWP Design System, Contact a service: [https://design-system.dwp.gov.uk/patterns/contact-a-service](https://design-system.dwp.gov.uk/patterns/contact-a-service)
- Scottish Government Design System, Search results list: [https://designsystem.gov.scot/patterns/search-results](https://designsystem.gov.scot/patterns/search-results)
- Ant Design, List Page research: [https://ant.design/docs/spec/research-list/](https://ant.design/docs/spec/research-list/)
- University of Leeds Design System, People profile search results: [https://designsystem.leeds.ac.uk/components/detail/uol-people-profile-search-results.html](https://designsystem.leeds.ac.uk/components/detail/uol-people-profile-search-results.html)

## 14. Kết luận

Phương án phù hợp nhất với hệ thống hiện tại là bổ sung một module `Danh bạ` độc lập về dữ liệu nhưng đồng nhất về giao diện và cách vận hành. Cách làm này ít rủi ro hơn so với việc nhúng danh bạ vào cây nội dung hiện hữu, đồng thời tạo nền tảng tốt cho mở rộng quản trị và tra cứu sau này.
