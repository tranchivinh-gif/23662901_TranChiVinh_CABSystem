# Quy ước API

- Phiên bản base path: `/api/v1`; nội dung: `application/json`; ID path: UUID; thời gian: ISO-8601 date-time.
- List dùng `page` (từ 1) và `pageSize` (1–100). Response page có `items`, `page`, `pageSize`, `total`.
- Client không được tự chuyển trạng thái chuyến: API kiểm tra transition và trả `409` khi xung đột trạng thái.
- `traceId` trong lỗi là correlation ID kỹ thuật; không phải business field. Idempotency/offline queue vẫn cần xác nhận, trừ retry thanh toán đã được SRS nêu.
