# Quy ước API

- Base URL: `/api/v1`.
- JSON field dùng `camelCase`.
- ID trong API là `integer`, phù hợp Data Model của SRS.
- `DELETE` đối với Customer/Driver/Vehicle là logical delete.
- Danh sách dùng `data` và `pagination`.
- Lỗi dùng `code`, `message`, `details`.
