# Huong dan seed du lieu mau cho moi truong test

Ngay lap: 2026-04-13

## 1. Muc tieu

Tai lieu nay huong dan cach su dung bo seed du lieu mau trong backend moi de:

- co san noi dung mau cho `content`
- co san du lieu mau cho `directory`
- co san du lieu mau cho `stats`
- co san `notice` mau
- co tai khoan admin dau tien de dang nhap test

## 2. Nguyen tac

Bo seed hien tai duoc thiet ke an toan:

- chi chay khi bat cau hinh
- chi seed `content` neu bang `ContentNodes` dang trong
- chi seed `directory` neu bang `DirectoryUnits` dang trong
- chi seed `UsageEvents` neu bang nay dang trong
- chi seed `Notices` neu bang nay dang trong
- khong ghi de du lieu da ton tai

## 3. Cau hinh can bat

Trong `appsettings.Test.json`:

```json
{
  "AdminSeed": {
    "Enabled": true
  },
  "SampleDataSeed": {
    "Enabled": true
  }
}
```

## 4. Du lieu duoc tao

### 4.1. Admin

- 1 tai khoan admin dau tien theo cau hinh `AdminSeed`
- role mac dinh: `SuperAdmin`

### 4.2. Content

- 1 node goc `PHAN 1`
- 1 node con mau cho hoi dap
- 1 node con mau cho bieu mau

### 4.3. Directory

- 1 don vi cap 1 mau
- 1 don vi cap 2 mau
- 1 don vi cap 3 mau

### 4.4. Stats va notice

- du lieu mau 7 ngay cho dashboard thong ke
- 1 thong bao mau de test modal notice

## 5. Cach chay

1. Tao `appsettings.Test.json` tu file mau
2. Dien `ConnectionString`
3. Bat `AdminSeed.Enabled = true`
4. Bat `SampleDataSeed.Enabled = true`
5. Chay migration
6. Chay backend moi truong `Test`

## 6. Ket qua mong doi

- login duoc bang tai khoan admin test
- `GET /api/content/tree` tra ve du lieu mau
- `GET /api/directory/tree` tra ve du lieu mau
- `GET /api/stats/dashboard` co so lieu mau
- `GET /api/notices/latest` co thong bao mau
- frontend test mo len co du lieu de kiem tra ngay

## 7. Luu y

- Sau khi seed xong va da co du lieu that, nen tat `AdminSeed.Enabled`
- Sau khi seed xong va da co du lieu that, nen tat `SampleDataSeed.Enabled`
- Khong bat seed tren production neu khong co ly do rat ro rang
