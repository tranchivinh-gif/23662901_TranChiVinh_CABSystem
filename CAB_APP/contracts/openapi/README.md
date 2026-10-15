# Public OpenAPI

Đã sao chép nguyên bytes OpenAPI FINAL 1.0.4 từ `CAB_OpenAPI_Final_1.0.4/contracts/openapi` ở workspace root: 62 paths / 64 operations, gồm bản modular và bundled. Không sửa wire contract hoặc metadata lịch sử còn tên Spring Boot; ADR-I00 xác định stack Node.js có hiệu lực.

Public route groups, error envelope, `X-Correlation-Id` và pagination nằm trong baseline. `node scripts/check-contracts.js` từ cab-system kiểm tra YAML/references/operations/proto/event schema. Gate CP-02 đối chiếu SHA-256 từng file với CP-00 và Git attributes giữ nguyên bytes khi clone.

Contract mô tả API P1 hoàn chỉnh. CP-02 chỉ chạy Gateway `/health`; các route khác được triển khai ở checkpoint sau. Tất cả public API đi qua Gateway.
