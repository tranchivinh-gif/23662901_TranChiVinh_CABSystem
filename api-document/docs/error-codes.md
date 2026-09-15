# Mã lỗi

| HTTP | Mã | Ý nghĩa |
|---:|---|---|
| 400 | `VALIDATION_ERROR` | Dữ liệu request bị thiếu, sai định dạng hoặc không hợp lệ |
| 401 | `UNAUTHORIZED` | Thiếu JWT hoặc JWT không hợp lệ |
| 403 | `FORBIDDEN` | Người dùng đã xác thực nhưng không có quyền |
| 404 | `NOT_FOUND` | Tài nguyên không tồn tại hoặc không được phép xem |
| 409 | `CONFLICT` | Trạng thái nghiệp vụ không hợp lệ, trùng lặp hoặc chuyển trạng thái đồng thời |
| 500 | `INTERNAL_ERROR` | Lỗi máy chủ không dự kiến |

Các mã trên là quy ước kỹ thuật, không phải mã nghiệp vụ mới. Lỗi dùng cấu trúc `Error` chung gồm `code`, `message`, `details` và `traceId` tùy chọn.
