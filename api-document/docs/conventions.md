# Quy ước API

- Phiên bản: `/api/v1`.
- Kiểu nội dung: `application/json`.
- Định danh: tham số đường dẫn dạng UUID.
- Danh sách: sử dụng `page`, `pageSize` và bộ lọc theo từng tài nguyên.
- Ngày giờ: định dạng ISO-8601 date-time.
- Phân quyền được mô tả trên mọi thao tác được bảo vệ.
- Path theo domain và schema được tách thành các file riêng, sau đó tham chiếu từ `openapi.yaml`.
