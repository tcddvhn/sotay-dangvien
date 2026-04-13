# Go-live checklist cho ngay chuyen he thong that

Ngay lap: 2026-04-13

## 1. Muc tieu

Checklist nay dung cho ngay cutover tu he thong cu sang he thong moi tren server rieng.

Chi dung khi:

- backend moi da test xong
- frontend-static da test xong
- migration da chay xong o moi truong san sang
- du lieu da doi soat xong

## 2. Truoc ngay cutover

- chot thoi diem cutover
- chot nguoi phu trach tung dau muc
- chot ke hoach rollback
- sao luu source cu
- sao luu du lieu cu
- sao luu database moi truoc cutover
- chot domain va DNS
- chot SSL/TLS

## 3. Truoc gio cutover

- tam dong bang cap nhat noi dung tren he thong cu
- export lan cuoi du lieu can migrate
- import lan cuoi vao he thong moi
- doi soat so luong ban ghi
- xac nhan admin dang nhap duoc tren he thong moi
- xac nhan chatbot tra loi duoc tren he thong moi
- xac nhan content va directory doc/ghi duoc tren he thong moi
- xac nhan frontend moi tro dung backend moi

## 4. Trong luc cutover

- doi cau hinh domain/DNS
- doi binding IIS va cert neu can
- restart dich vu backend moi neu can
- xoa cache tai diem reverse proxy neu co
- xac nhan domain moi tro ve dung server moi

## 5. Kiem tra ngay sau cutover

- mo trang chu bang domain that
- kiem tra HTTPS hop le
- kiem tra load CSS va JS
- kiem tra login admin
- kiem tra mo tab danh ba
- kiem tra tim kiem noi dung
- kiem tra mo PDF
- kiem tra chatbot
- kiem tra luu 1 noi dung thu
- kiem tra luu 1 don vi danh ba thu

## 6. Giam sat 2 gio dau

- theo doi loi truy cap API
- theo doi loi database
- theo doi phan hoi nguoi dung
- theo doi chatbot timeout hoac loi quota
- theo doi tai nguyen may chu

## 7. Dieu kien dat

- khong co loi nghiem trong o login, content, directory, chatbot
- nguoi dung truy cap domain that binh thuong
- admin thao tac duoc tren he thong moi

## 8. Neu phai rollback

Rollback ngay neu gap mot trong cac tinh huong:

- login admin khong on dinh
- content hoac directory ghi sai
- chatbot loi hang loat
- frontend moi loi nghiem trong
- database moi co dau hieu sai du lieu

Buoc rollback:

1. tra DNS/domain ve he thong cu
2. mo lai cap nhat tren he thong cu neu da khoa
3. thong bao noi bo ve trang thai rollback
4. luu log va bang chung loi
5. chi cutover lai sau khi sua xong va test lai

## 9. Sau cutover thanh cong

- tat seed test neu con bat
- doi mat khau admin seed neu chua doi
- khoa hoac thu hoi endpoint cu neu can
- lap bien ban nghiem thu
- chot ke hoach giai doan tiep theo
