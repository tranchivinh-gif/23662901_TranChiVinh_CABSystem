# Tài liệu API hệ thống CAB

## 1. Tổng quan thiết kế API

API được thiết kế theo domain nghiệp vụ và truy xuất về UC/FR/BR trong SRS. Các UC-17 đến
UC-19 chưa tạo endpoint vì actor, phạm vi và cách triển khai được đánh dấu
`[NEED CLARIFICATION]`.

| Miền nghiệp vụ | Use Case | Thao tác | Method | Endpoint | Xác thực |
|---|---|---|---|---|---|
| Xác thực | UC-01 | Đăng ký, đăng nhập, xem tài khoản hiện tại | POST/GET | `/auth/register`, `/auth/login`, `/auth/me` | Đăng ký/đăng nhập công khai; `/auth/me` dùng JWT |
| Quản lý người dùng | UC-01 | Xem/cập nhật hồ sơ cá nhân | GET/PUT | `/users/me` | JWT, tài khoản của chính mình |
| Quản lý tài xế | UC-03/04/06 | Hồ sơ, sẵn sàng, vị trí, phản hồi chuyến | GET/PUT/POST | `/drivers/me`, `/drivers/me/location`, `/drivers/me/availability`, `/trips/{tripId}/driver-response` | JWT tài xế |
| Quản lý chuyến | UC-02/05/06/07/08 | Tạo, theo dõi, phân công, cập nhật, hủy, báo sự cố | POST/GET/PATCH/DELETE | `/trips...` | JWT và RBAC vận hành |
| Thanh toán | UC-09/10/11 | Cước, tiền mặt, thanh toán điện tử | GET/POST | `/trips/{tripId}/fare`, `/trips/{tripId}/payments...` | JWT |
| Vận hành | UC-12/13/14/15 | Thông báo, sự cố, dữ liệu vận hành, audit | GET/PATCH | `/notifications`, `/incidents/{incidentId}`, `/operations/*`, `/audit-records` | JWT, nhân viên vận hành/quản trị viên |
| Báo cáo | UC-16 | Báo cáo hoạt động | GET | `/reports/activity` | Nhân viên vận hành/quản trị viên |

## 2. Mapping Yêu cầu -> API

| API | Requirement | Use Case | Business Rule | Business Operation |
|---|---|---|---|---|
| `/auth/*`, `/users/me` | BR-01, FR-01 | UC-01 | BRULE-01: tài khoản hợp lệ mới được dùng chức năng bảo vệ | Quản lý tài khoản |
| `POST /trips` | BR-02, FR-02, FR-03 | UC-02 | BRULE-02: bắt buộc có điểm đón, điểm đến và loại xe | Tạo yêu cầu chuyến |
| `GET /trips/{tripId}` | BR-03, BR-04, FR-09, FR-10 | UC-07 | BRULE-07: trạng thái chuyến theo đúng tiến trình | Theo dõi chuyến |
| `/trips/{tripId}/assignment`, `/driver-response` | BR-06, BR-08–BR-10, FR-04–FR-07, FR-12 | UC-03–UC-05 | Lọc theo vị trí, sẵn sàng, loại xe; chờ 30 giây; từ chối/không phản hồi thì tìm tiếp | Tìm và phân công tài xế |
| `/drivers/me*` | BR-05, BR-08, FR-04, FR-12 | UC-03, UC-06 | Tài xế cung cấp vị trí và trạng thái sẵn sàng | Cập nhật dữ liệu tài xế |
| `PATCH /trips/{tripId}/status` | BR-07, FR-08 | UC-06 | Không được bỏ qua trạng thái | Cập nhật tiến trình chuyến |
| `DELETE /trips/{tripId}` | BR-04, FR-09 | UC-07 | Chỉ hủy trước trạng thái khóa hủy và trước khi hoàn thành | Hủy chuyến |
| `/trips/{tripId}/incidents`, `/incidents/{incidentId}` | BR-16, FR-11, FR-23, FR-24 | UC-08, UC-14 | Ghi nhận và xử lý sự cố | Quản lý sự cố |
| `/trips/{tripId}/fare` | BR-12, FR-13 | UC-09 | Tính cước sau khi hoàn thành; công thức là `[NEED CLARIFICATION]` | Xem cước |
| `/payments/cash` | BR-13, BR-14, FR-14, FR-15 | UC-10 | Hoàn tất khi tài xế xác nhận đã thu đủ tiền | Xác nhận tiền mặt |
| `/payments/electronic`, `/payments` | BR-14, BR-15, FR-16–FR-18 | UC-11 | Tối đa 3 lần thử trong 30 phút; chỉ lưu mã và trạng thái provider | Thanh toán điện tử |
| `/notifications` | BR-11, FR-19, FR-20 | UC-12 | MVP dùng thông báo trong hệ thống và email | Xem thông báo |
| `/operations/*`, `/audit-records` | BR-05, BR-17, FR-21, FR-22, FR-25 | UC-13, UC-15 | RBAC và audit chi tiết là `[NEED CLARIFICATION]` | Vận hành và kiểm toán |
| `/reports/activity` | BR-18, FR-26, FR-27 | UC-16 | Hỗ trợ kỳ báo cáo và bộ lọc; KPI cần xác nhận | Tạo báo cáo |

## 3. API Contract

Mọi request/response dùng JSON. Endpoint được bảo vệ yêu cầu:

`Authorization: Bearer <JWT>`

- ID trên path dùng UUID.
- Body thiếu hoặc sai dữ liệu trả về `400`.
- JWT thiếu hoặc không hợp lệ trả về `401`.
- Không đủ quyền trả về `403`.
- Không tìm thấy tài nguyên trả về `404`.
- Chuyển trạng thái hoặc thanh toán xung đột trả về `409`.
- Lỗi máy chủ không dự kiến trả về `500`.
- Endpoint danh sách dùng `page`, `pageSize` và bộ lọc phù hợp.
- Request/response schema được khai báo tại [schemas/common.yaml](./schemas/common.yaml).
- Không expose trực tiếp cấu trúc database.

| Nhóm API | Validation chính | Thành công | Lỗi | Phân quyền |
|---|---|---|---|---|
| Tài khoản/hồ sơ | Email, mật khẩu, họ tên; field hồ sơ theo schema | `200`, `201` | `400`, `401`, `409`, `500` | Công khai khi đăng ký/đăng nhập; JWT tài khoản |
| Chuyến | Bắt buộc điểm đón, điểm đến, loại xe; hủy trước khóa hủy | `200`, `201`, `204` | `400`, `401`, `404`, `409`, `500` | Chủ chuyến hoặc vận hành |
| Tài xế | Tọa độ trong giới hạn latitude/longitude; cập nhật khoảng 10 giây khi hoạt động | `200`, `204` | `400`, `401` | Tài xế của chính mình |
| Phân công/trạng thái | Phản hồi `ACCEPT`/`REJECT`; không bỏ qua trạng thái | `200` | `400`, `401`, `403`, `409` | Tài xế hoặc vai trò vận hành |
| Sự cố/thông báo/vận hành | Mô tả sự cố bắt buộc; query phân trang hợp lệ | `200`, `201` | `400`, `401`, `403`, `404` | Người báo sự cố; vận hành xử lý |
| Cước/thanh toán | Không nhận dữ liệu thanh toán nhạy cảm; retry tối đa 3 lần/30 phút | `200`, `202` | `400`, `404`, `409` | Thành viên chuyến hoặc vận hành |
| Báo cáo | `period` bắt buộc; `CUSTOM` cần `from` và `to` | `200` | `400`, `403`, `500` | Nhân viên vận hành/quản trị viên |

## 4. Thiết kế Schema

### Request Schema

`RegisterRequest`, `LoginRequest`, `UpdateProfileRequest`, `CreateTripRequest`,
`DriverResponseRequest`, `StatusUpdateRequest`, `IncidentRequest`,
`ElectronicPaymentRequest`.

### Response Schema

`AuthResponse`, `User`, `Trip`, `Incident`, `Fare`, `Payment`, `Notification`,
`NotificationPage`, `Report`, `Page`, `Error`.

### Entity Schema

Các representation nghiệp vụ gồm `User`, `Trip`, `Incident`, `Fare`, `Payment`,
`Notification` và `Report`. Các field chỉ phục vụ persistence/database không được expose.

## 5. Common Components

- **Parameters:** `TripId`, `Page`, `PageSize`.
- **Responses:** `BadRequest`, `Unauthorized`, `Forbidden`, `NotFound`, `Conflict`, `ServerError`.
- **Security:** `bearerAuth` dùng JWT Bearer.

## 6. Cấu trúc API Document

```text
api-document/
├── openapi.yaml
├── README.md
├── paths/
│   ├── auth/auth.yaml
│   ├── users/users.yaml
│   ├── employees/employees.yaml
│   ├── orders/orders.yaml
│   ├── payments/payments.yaml
│   ├── operations/operations.yaml
│   └── reports/reports.yaml
├── schemas/common.yaml
├── parameters/parameters.yaml
├── responses/responses.yaml
├── security/bearer.yaml
├── examples/
├── docs/
└── dist/openapi.bundle.yaml
```

SRS không có domain sản phẩm hoặc bàn nên không tạo các thư mục đó.
Không tạo file/folder chỉ để làm đẹp cấu trúc.

## 7. Source of Truth và Bundle

[openapi.yaml](./openapi.yaml) là file nguồn chính. Các file YAML nguồn được nối qua `$ref`
để tạo [dist/openapi.bundle.yaml](./dist/openapi.bundle.yaml).

Bundle chứa độc lập toàn bộ path, schema, parameter, response và security để dùng cho Swagger
Editor, Swagger UI, kiểm thử và chia sẻ. Không chỉnh sửa trực tiếp file trong `dist/`; mọi thay
đổi phải bắt đầu từ file nguồn, kiểm tra rồi bundle lại.

## 8. Truy xuất, phạm vi và các điểm chưa chốt

Ma trận FR/UC/AC có tại [docs/traceability.md](./docs/traceability.md); các quyết định cần BA/customer xác nhận có tại [docs/open-issues.md](./docs/open-issues.md). Phạm vi MVP gồm UC-01 đến UC-16. UC-17 đến UC-19 là future extension, không có public endpoint MVP.

Các bổ sung v2 được phản ánh gồm assignment/tính cước/thông báo tự động, 30 giây phản hồi tài xế, retry thanh toán 3 lần/30 phút, `IN_APP`/`EMAIL` với tối đa 3 attempt, audit baseline 12 tháng và công thức tỷ lệ hoàn thành/hủy. Công thức fare, policy cash/cancellation/refund, ma trận CRUD và rating scale vẫn cần xác nhận.

## 9. Validation

- Các endpoint map tới UC-01–UC-16 và FR-01–FR-27 trong SRS.
- Không tạo endpoint ngoài phạm vi; UC-17–UC-19 được đánh dấu `[NEED CLARIFICATION]`.
- Không có endpoint trùng chức năng và naming convention nhất quán.
- Các quy tắc phân công, timeout 30 giây, tiến trình chuyến, hủy, thanh toán, thông báo,
  audit và báo cáo đã được phản ánh.
- Tất cả file `$ref` nguồn tồn tại và bundle không có external `$ref`.
- Source cần được lint/bundle bằng Redocly hoặc Swagger CLI trước release. Lệnh chuẩn: `npx @redocly/cli lint api-document/openapi.yaml` và `npx @redocly/cli bundle api-document/openapi.yaml --output api-document/dist/openapi.bundle.yaml`.
- Bundle chỉ được generate từ source; không chỉnh tay. Release gate cần kiểm tra mọi $ref, operationId và import Swagger Editor.

## 10. [NEED CLARIFICATION]

Mỗi vấn đề dưới đây cần được xác nhận trước khi triển khai chính thức:

1. **API host và môi trường:** SRS chưa nêu domain development, staging, production; ảnh hưởng tất cả API.
2. **Authentication:** Chưa chốt password policy, refresh token, logout, verification, token lifetime và key rotation; ảnh hưởng UC-01.
3. **Driver/vehicle:** Chưa chốt field hồ sơ, giấy phép, catalog loại xe và quyền cập nhật vận hành; ảnh hưởng UC-03, UC-13.
4. **Matching/trip state:** Chưa chốt công thức ETA, stale location, ma trận chuyển trạng thái và cancellation-lock; ảnh hưởng UC-03–UC-07.
5. **Fare/payment:** Chưa chốt công thức cước, làm tròn, tiền tệ, provider webhook, đối soát và lịch retry; ảnh hưởng UC-09–UC-11.
6. **Notification/incident:** Chưa chốt template, recipient, provider, loại sự cố, bằng chứng và escalation; ảnh hưởng UC-08, UC-12, UC-14.
7. **Authorization/audit/report:** Chưa chốt RBAC matrix, audit event/retention, KPI, timezone, boundary ngày và export; ảnh hưởng UC-13, UC-15, UC-16.
8. **Offline:** Chưa chốt retry, idempotency, local queue, đồng bộ và xử lý conflict khi mất kết nối; ảnh hưởng UC-02, UC-06, UC-07, UC-11.
