# Bao cao phuong an backup truoc nang cap phan quyen

Ngay lap: 2026-04-15

## 1. Muc tieu

Muc tieu cua phuong an backup nay la:

- dong bang hien trang he thong that truoc khi sua mo hinh quan tri noi dung
- co the quay lai trang thai hien tai neu phuong an phan quyen moi khong dat
- tranh mat du lieu noi dung, danh ba, tai khoan quan tri va cau hinh van hanh

Day la backup cho he thong that dang dung, khong phai cho workspace `he-thong-moi-server-rieng`.

## 2. Nhan dinh ky thuat

He thong that hien tai dang phu thuoc vao:

- ma nguon frontend trong thu muc goc
- `Firebase Auth`
- `Firestore`
- `Firebase Messaging`
- `Google Apps Script` cho chatbot, thong ke, khao sat, thong bao

Thanh phan du lieu can backup truoc khi nang cap phan quyen:

1. ma nguon dang chay
2. du lieu Firestore hien tai
3. danh sach tai khoan auth quan tri
4. cau hinh Firebase/FCM
5. thong tin endpoint Apps Script
6. cac file PDF va tai lieu tinh

## 3. Nguyen tac backup

Toi de xuat 3 lop backup dong thoi:

### Lop 1. Backup ma nguon

- copy toan bo repo hien tai ra thu muc backup co dong dau thoi gian
- dong goi them file zip
- ghi lai commit hoac ma phien ban tai thoi diem backup

### Lop 2. Backup du lieu he thong

- xuat du lieu Firestore ra file JSON
- xuat danh sach user Firebase Auth
- ghi lai cau hinh Firebase project

### Lop 3. Backup phuong an rollback

- tao runbook quay lui
- chot dieu kien rollback
- chot nguoi duyet rollback

Neu chi backup ma nguon ma khong backup Firestore/Auth thi rollback se khong an toan.

## 4. Nhung gi can backup cu the

## 4.1. Ma nguon

Can backup:

- [app.js](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\app.js)
- [index.html](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\index.html)
- [styles.css](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\styles.css)
- [directory-module.js](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\directory-module.js)
- [directory-seed.js](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\directory-seed.js)
- [firebase-messaging-sw.js](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\firebase-messaging-sw.js)
- [build](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\build)
- [web](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\web)
- toan bo file PDF dang dung
- thu muc [docs](C:\Users\ldkie\OneDrive\Documents\GitHub\sotay-dangvien\docs)

De xuat ten thu muc backup:

```text
backup-truoc-phan-quyen-20260415-HHMM
```

## 4.2. Du lieu Firestore

Theo ma nguon hien tai, cac doc du lieu nghiep vu toi thieu can backup:

- `sotay/dulieu`
- `sotay/thongke`

Ngoai ra nen kiem tra va backup them neu ton tai:

- `sotay/danhba`
- collection moi phat sinh do admin thao tac

Noi dung quan trong nhat:

- `sotay/dulieu.treeData`

Vi day la toan bo cay noi dung dang chay that.

## 4.3. Tai khoan quan tri Firebase Auth

Can backup danh sach:

- email
- uid
- disabled/enabled
- metadata tao user

Luu y:

- khong the backup mat khau goc dang doc duoc tu Firebase Auth theo cach thong thuong
- neu rollback, co the phai giu nguyen Firebase project hien tai de user van dang nhap duoc

## 4.4. Cau hinh Firebase/FCM

Can luu lai:

- `projectId`
- `messagingSenderId`
- `appId`
- `authDomain`
- service worker dang dung
- domain dang duoc authorized

## 4.5. Endpoint Apps Script

Can ghi lai day du cac endpoint dang su dung:

- `CHATBOT_WEB_APP_URL`
- `STATS_WEB_APP_URL`
- `SURVEY_WEB_APP_URL`

Va can luu:

- file tai lieu mo ta chuc nang tung endpoint
- tai khoan Google so huu Apps Script
- quyen truy cap vao Apps Script/Sheet lien quan

## 4.6. Du lieu thong bao, thong ke, khao sat

Vi cac chuc nang nay dang di qua Apps Script, can backup them:

- Google Sheet nguon neu co
- Apps Script project neu co quyen truy cap
- log thong ke neu muon bao toan lich su

Neu khong backup lop nay, rollback code van co the thanh cong nhung du lieu phu tro co the khong doi chieu duoc.

## 5. Phuong an backup de xuat

Toi de xuat backup theo 2 muc:

## 5.1. Backup muc toi thieu

Dung khi muon thao tac nhanh nhung van co diem quay lui.

Bao gom:

- copy repo
- zip repo
- xuat `sotay/dulieu`
- xuat `sotay/thongke`
- ghi lai endpoint Apps Script
- ghi lai firebase config

Uu diem:

- nhanh

Nhuoc diem:

- chua du chat neu phai rollback sau mot dot sua lon ve auth/quyen

## 5.2. Backup muc day du

Day la muc toi de xuat chot truoc khi lam phan quyen.

Bao gom:

- tat ca backup muc toi thieu
- export danh sach Firebase Auth users
- export ca `sotay/danhba` neu co
- backup Apps Script va Google Sheet lien quan
- tao manifest backup
- tao thu muc rollback script

Ket luan:

- Nen chon `backup muc day du`

## 6. Cau truc thu muc backup de xuat

```text
backup-truoc-phan-quyen-20260415-0930/
|-- source-code/
|-- firestore/
|   |-- sotay_dulieu.json
|   |-- sotay_thongke.json
|   |-- sotay_danhba.json
|-- firebase-auth/
|   |-- auth_users.csv
|-- firebase-config/
|   |-- firebase_web_config.json
|   |-- fcm_config_notes.md
|-- apps-script/
|   |-- chatbot_url.txt
|   |-- stats_url.txt
|   |-- survey_url.txt
|   |-- spreadsheet_links.md
|-- manifest/
|   |-- backup_manifest.md
|   |-- rollback_checklist.md
```

## 7. Quy trinh backup de xuat

## Buoc 1. Dong bang thay doi

- thong bao tam thoi khong sua noi dung quan tri trong luc backup
- chot 1 moc thoi gian backup

## Buoc 2. Backup ma nguon

- copy repo goc
- tao file zip
- neu co git, ghi lai branch va commit

## Buoc 3. Export Firestore

- xuat `sotay/dulieu`
- xuat `sotay/thongke`
- xuat `sotay/danhba` neu co
- dat ten file co ngay gio

## Buoc 4. Export Firebase Auth users

- xuat danh sach user auth
- luu `uid`, `email`, `disabled`, `createdAt`

## Buoc 5. Backup cau hinh ngoai he thong

- firebase config
- FCM config
- Apps Script URL
- link Google Sheet/Apps Script

## Buoc 6. Tao manifest backup

Manifest can ghi:

- ngay gio backup
- nguoi thuc hien
- file nao da tao
- kich thuoc file
- ghi chu bat thuong neu co

## Buoc 7. Kiem tra backup

- mo lai file JSON de dam bao doc duoc
- doi chieu so luong node
- doi chieu file zip mo duoc

## 8. Phuong an rollback

Neu nang cap phan quyen that bai, rollback theo thu tu:

1. dung cap nhat he thong moi
2. khoi phuc ma nguon tu `source-code/`
3. khoi phuc `sotay/dulieu` tu file JSON backup
4. khoi phuc `sotay/thongke` neu bi tac dong
5. khoi phuc danh ba neu bi tac dong
6. kiem tra login admin
7. kiem tra doc noi dung ben ngoai

Dieu kien rollback nen dung ngay:

- mat node trong cay noi dung
- sai thu tu nhanh lon
- editor nhin thay noi dung khong dung quyen
- admin khong luu duoc noi dung
- xuat hien loi auth hoac khong dang nhap duoc

## 9. De xuat cong cu thuc hien

## 9.1. Backup ma nguon

Co the dung:

- copy folder thu cong
- zip thu cong
- git tag neu anh/chị co dung git trong quy trinh van hanh

## 9.2. Backup Firestore

Co 2 cach:

- dung script export JSON nhu da dung truoc day
- hoac dung cong cu admin/Firebase export neu moi truong cho phep

Neu muon thao tac nhanh tren may hien tai, co the dung huong xuat JSON truoc.

## 9.3. Backup Firebase Auth

Nen dung:

- Firebase Admin SDK
- hoac `firebase auth:export` neu moi truong cho phep

## 9.4. Backup Apps Script

Can co tai khoan Google so huu hoac co quyen editor.

Nen backup:

- code Apps Script
- Google Sheet du lieu

## 10. Khuyen nghi chot

Toi de xuat truoc khi code phan quyen, anh/chị chot 4 viec:

1. Tao 1 bo `backup day du` theo cau truc de xuat.
2. Tao 1 thu muc backup co dong dau thoi gian.
3. Xac nhan da export duoc `sotay/dulieu.treeData`.
4. Xac nhan da co danh sach Firebase Auth users va thong tin Apps Script.

## 11. Viec toi co the lam tiep ngay

Neu anh/chị dong y, toi co the lam tiep 1 trong 2 viec:

- tao bo file/thu muc backup mau ngay trong repo de anh/chị dung cho dot backup that
- hoac viet runbook backup chi tiet theo tung lenh va tung file dau ra
