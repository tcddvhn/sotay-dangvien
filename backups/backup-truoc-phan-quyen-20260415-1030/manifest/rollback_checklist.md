# Rollback checklist

- Xac dinh dung bo backup `backup-truoc-phan-quyen-20260415-1030`
- Kiem tra `backup_manifest.json`
- Kiem tra da co `firestore/sotay_dulieu.json`
- Kiem tra da co `firestore/sotay_thongke.json`
- Kiem tra da co `firebase-auth/auth_users.csv` neu rollback co lien quan auth
- Tam dung sua noi dung tren he thong that
- Khoi phuc ma nguon tu `source-code/`
- Khoi phuc Firestore doc `sotay/dulieu`
- Khoi phuc Firestore doc `sotay/thongke`
- Khoi phuc `sotay/danhba` neu pham vi thay doi co lien quan
- Doi chieu lai Apps Script URL va Firebase config
- Test trang chu
- Test quan tri noi dung
- Test danh ba
- Test chatbot/thong bao neu can
