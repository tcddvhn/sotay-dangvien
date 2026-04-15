# KHOI PHUC HE THONG TRUOC DAY

Ngay cap nhat: 2026-04-15

## Muc dich

File nay dung de Codex hieu va thuc hien quy trinh khôi phuc he thong that ve trang thai backup gan nhat da duoc chap nhan.

Khi anh/chị can quay lui, chi can mo repo va ra lenh:

```text
Khoi phuc lai he thong truoc day
```

Codex phai doc file nay truoc, sau do tim va doc:

1. `docs/runbook_tao_backup_va_khoi_phuc_he_thong_that.md`
2. `docs/huong_dan_nguoi_van_hanh_khi_khoi_phuc.md`
3. file `backup_manifest.json` trong bo backup duoc chon

## Dieu kien de khoi phuc

Codex chi duoc thuc hien khoi phuc khi:

- da co 1 bo backup hoan chinh theo cau truc da quy uoc
- bo backup co `manifest/backup_manifest.json`
- nguoi van hanh da chi ro bo backup nao duoc dung, hoac bo backup nam o vi tri mac dinh

Neu khong co bo backup hop le, Codex phai dung lai va bao ro thieu gi.

## Vi tri backup mac dinh de xuat

Neu nguoi van hanh khong noi ro, Codex duoc phep tim theo thu tu:

1. `C:\backup-sotay\latest`
2. `C:\backup-sotay`
3. thu muc backup duoc ghi trong `backup_manifest.json` gan nhat

## Pham vi khoi phuc

Khi khoi phuc, Codex phai uu tien:

1. khoi phuc ma nguon he thong that trong thu muc goc
2. khoi phuc du lieu Firestore:
   - `sotay/dulieu`
   - `sotay/thongke`
   - `sotay/danhba` neu co trong backup
3. doi chieu cau hinh Firebase/FCM va Apps Script
4. bao cao ro nhung muc nao da khoi phuc thanh cong va nhung muc nao can thao tac tay

## Dieu Codex khong duoc tu y lam

- khong duoc xoa backup goc
- khong duoc ghi de len he thong that khi chua xac nhan bo backup hop le
- khong duoc tu suy dien du lieu Firestore neu backup JSON bi thieu
- khong duoc tu y doi endpoint Apps Script neu backup khong noi ro

## Dau ra bat buoc sau khi khoi phuc

Codex phai bao cao:

- bo backup da dung
- thoi diem backup
- file nao da duoc phuc hoi
- Firestore doc nao da duoc khoi phuc
- file nguon nao da duoc ghi de
- cac buoc kiem tra sau khoi phuc
- muc nao chua tu dong khoi phuc duoc
