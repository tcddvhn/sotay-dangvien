# Runbook tao backup va khoi phuc he thong that

Ngay cap nhat: 2026-04-15

## 1. Muc tieu

Tai lieu nay dung cho 2 viec:

- tao bo backup chuan truoc khi nang cap
- khoi phuc lai he thong that tu bo backup do

## 2. Cau truc bo backup chuan

De xuat luu ngoai repo, vi du:

```text
C:\backup-sotay\backup-truoc-phan-quyen-YYYYMMDD-HHMM\
```

Cau truc:

```text
backup-truoc-phan-quyen-YYYYMMDD-HHMM/
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
|   |-- backup_manifest.json
|   |-- rollback_checklist.md
```

## 3. Tao backup

### 3.1. Backup ma nguon

- copy toan bo repo hien tai vao `source-code/`
- tao zip neu muon luu them ban nen

### 3.2. Backup Firestore

Can xuat it nhat:

- `sotay/dulieu`
- `sotay/thongke`
- `sotay/danhba` neu co

Dung file JSON rieng cho tung doc.

### 3.3. Backup Firebase Auth

- xuat danh sach user
- luu vao `firebase-auth/auth_users.csv`

### 3.4. Backup cau hinh Firebase va Apps Script

- firebase web config vao `firebase_web_config.json`
- endpoint Apps Script vao cac file txt tuong ung

### 3.5. Tao manifest

Bat buoc tao:

- `manifest/backup_manifest.json`

Manifest phai ghi:

- ten bo backup
- ngay gio tao
- nguoi tao
- file da co
- ghi chu

## 4. Kiem tra backup dat

Bo backup duoc coi la dat khi:

- `source-code/` co day du file goc
- `firestore/sotay_dulieu.json` doc duoc
- `manifest/backup_manifest.json` hop le
- doi chieu dung bo backup duoc danh dau `last-known-good`

## 5. Khoi phuc he thong

### 5.1. Chuan bi

- dung moi thao tac quan tri noi dung
- xac dinh dung bo backup
- kiem tra `backup_manifest.json`

### 5.2. Khoi phuc ma nguon

- ghi de cac file trong repo goc bang ban trong `source-code/`

### 5.3. Khoi phuc Firestore

Khoi phuc theo thu tu:

1. `sotay/dulieu`
2. `sotay/thongke`
3. `sotay/danhba` neu co

### 5.4. Doi chieu cau hinh

- firebase config
- service worker
- Apps Script endpoint

### 5.5. Kiem tra sau khoi phuc

- mo trang chu
- test tim kiem
- test danh ba
- test login quan tri
- test luu 1 muc noi dung
- test chatbot/thong bao neu pham vi rollback co lien quan

## 6. Dieu kien rollback thanh cong

- giao dien tro lai nhu truoc
- cay noi dung dung
- admin login duoc
- khong mat du lieu node
- danh ba dung

## 7. Gioi han can biet

- Firebase Auth khong cho lay lai mat khau plain text
- neu Apps Script/Google Sheet da bi sua ngoai he thong, rollback code khong tu dong sua lai du lieu ben do
- rollback Firestore bat buoc phai co file JSON backup hop le
