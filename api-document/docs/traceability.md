# Ma trận truy xuất SRS → API

Coverage phản ánh API contract, không khẳng định backend đã triển khai. `Partial` nghĩa là contract có điểm chính nhưng còn policy/TBD của SRS; `N/A` là ngoài MVP/chưa có actor-scope chốt.

| SRS ID | Requirement | API | Schema | Coverage | Note |
|---|---|---|---|---|---|
| FR-01 | Tài khoản | /auth/*, /users/me | User | Full | UC-01 |
| FR-02, FR-03 | Đặt và tiếp nhận yêu cầu | POST /trips | CreateTripRequest, Trip | Full | UC-02 |
| FR-04, FR-12 | Tìm tài xế/vị trí | internal assignment, /drivers/me/location | Location, Trip | Full | Hệ thống tự động |
| FR-05–FR-07 | Đề xuất, phản hồi, tìm tiếp | driver-response, assignment | DriverResponseRequest | Full | 30 giây |
| FR-08 | Chuỗi trạng thái | /status | TripStatus | Full | Transition mô tả endpoint |
| FR-09, FR-10 | Theo dõi/lịch sử | GET /trips, /trips/{tripId} | TripPage, Trip | Full | ETA theo baseline |
| FR-11 | Báo sự cố | /incidents | Incident | Full | |
| FR-13 | Cước | /fare | Fare | Partial | Formula TBD |
| FR-14, FR-15 | Cash | /payments/cash | Payment | Partial | Policy cash TBD |
| FR-16–FR-18 | Electronic payment | /payments/electronic, /payments | Payment | Full | 3 attempts/30 phút; không dữ liệu nhạy cảm |
| FR-19, FR-20 | Notification | /notifications | Notification | Full | IN_APP/EMAIL, 3 attempts |
| FR-21, FR-22 | Vận hành/RBAC | /operations/* | UserPage, DriverPage, VehiclePage | Partial | CRUD matrix TBD |
| FR-23, FR-24 | Xử lý sự cố | /incidents/{incidentId} | IncidentUpdateRequest | Partial | Policy người nhận TBD |
| FR-25 | Audit | /audit-records | AuditRecord | Full | 12 tháng baseline |
| FR-26, FR-27 | Báo cáo | /reports/activity | Report | Full | KPI completion/cancellation được định nghĩa |
| FR-28 | Thay đổi nền tảng | — | — | N/A | UC-17 future/actor TBD |
| FR-29 | Triển khai từng phần | — | — | N/A | UC-18 future/actor TBD |
| FR-30 | Ảnh hưởng thay đổi | — | — | N/A | UC-19 future/actor TBD |

| SRS ID | Requirement | API | Coverage | Note |
|---|---|---|---|---|
| UC-01 | Quản lý tài khoản | /auth/*, /users/me | Full | |
| UC-02 | Tạo yêu cầu | POST /trips | Full | |
| UC-03 | Tìm tài xế | assignment nội bộ | Full | |
| UC-04 | Phản hồi tài xế | driver-response | Full | |
| UC-05 | Phân công/tìm tiếp | assignment nội bộ | Full | |
| UC-06 | Tiến trình | /status | Full | |
| UC-07 | Theo dõi | GET /trips* | Full | |
| UC-08 | Ghi nhận sự cố | /incidents | Full | |
| UC-09 | Tính cước | /fare | Partial | Formula TBD |
| UC-10 | Tiền mặt | /payments/cash | Partial | Policy TBD |
| UC-11 | Điện tử | /payments/electronic | Full | |
| UC-12 | Thông báo | /notifications | Full | |
| UC-13 | Vận hành | /operations/* | Partial | quyền CRUD TBD |
| UC-14 | Xử lý sự cố | /incidents/{id} | Partial | notification policy TBD |
| UC-15 | Audit | /audit-records | Full | |
| UC-16 | Báo cáo | /reports/activity | Full | |

| SRS ID | Requirement / API evidence | Coverage | Note |
|---|---|---|---|
| AC-01 | /auth/*, /users/me | Full | |
| AC-02 | JWT/status validation | Partial | điều kiện LOCKED chi tiết TBD |
| AC-03 | POST /trips | Full | |
| AC-04 | CreateTripRequest | Full | |
| AC-05 | offline booking | TBD | idempotency/queue TBD |
| AC-06 | assignment nội bộ, Location | Full | |
| AC-07 | assignment, Notification | Full | |
| AC-08 | assignment | Partial | policy thiếu vị trí TBD |
| AC-09 | driver-response | Full | |
| AC-10 | driver-response | Full | |
| AC-11 | assignment | Full | 30 giây |
| AC-12 | assignment | Full | |
| AC-13 | assignment | Full | |
| AC-14 | /status | Full | |
| AC-15 | /status | Full | 409 |
| AC-16 | offline status/tracking | TBD | sync TBD |
| AC-17 | GET /trips* | Full | |
| AC-18 | /incidents | Full | |
| AC-19 | /fare | Partial | formula TBD |
| AC-20 | /fare | Partial | formula TBD |
| AC-21 | /payments/cash | Partial | cash policy TBD |
| AC-22 | /payments/cash | Partial | cash validation TBD |
| AC-23 | /payments/electronic | Full | |
| AC-24 | Payment, Notification | Full | |
| AC-25 | Payment attemptNumber | Full | 3/30 phút |
| AC-26 | ElectronicPaymentRequest | Full | sensitive data excluded |
| AC-27 | Notification | Full | |
| AC-28 | Notification | TBD | recipient policy TBD |
| AC-29 | Notification | Full | |
| AC-30 | /operations/* | Partial | CRUD matrix TBD |
| AC-31 | protected operations | Full | 403 |
| AC-32 | /incidents/{id} | Partial | recipient policy TBD |
| AC-33 | /audit-records | Full | |
| AC-34 | /reports/activity | Full | |
| AC-35 | Report | Partial | missing-data rule TBD |
| AC-36 | — | N/A | UC-17 future scope |
| AC-37 | — | N/A | UC-17 future scope |
| AC-38 | — | N/A | UC-18 future scope |
| AC-39 | — | N/A | UC-18 future scope |
| AC-40 | — | N/A | UC-19 future scope |
| AC-41 | — | N/A | UC-19 future scope |
