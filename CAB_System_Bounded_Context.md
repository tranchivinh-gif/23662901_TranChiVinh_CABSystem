# KIẾN TRÚC BOUNDED CONTEXT — CAB SYSTEM

**Trạng thái:** Bản chốt cuối cùng

**Phạm vi:** Bounded Context, Microservice, Domain Model, API Ownership, Database, Communication và Deployment.

---

# 1. Nguyên tắc kiến trúc

1. 1 Bounded Context = 1 Microservice.
2. Mỗi Microservice sở hữu 1 Database riêng.
3. Không Shared Database, Shared Table hoặc Cross-Database JOIN.
4. Service không truy cập trực tiếp Database của Service khác.
5. Cross-service reference dùng ID.
6. Cross-service communication dùng API/contract.
7. Mỗi Domain Entity chỉ có một Owner.
8. Domain Rule thuộc Context sở hữu nghiệp vụ.
9. Public API hiện hành được giữ nguyên; phân chia Context không tạo chức năng nghiệp vụ mới.
10. Không tạo Microservice riêng cho Fare, Rating hoặc DriverLocation.

---

# 2. Domain Scope

## 2.1 Actor

- Customer
- Driver
- Operations Staff
- Leadership
- Payment Provider

## 2.2 Business Area

- Account Management
- Participant/Fleet Management
- Trip Request
- Driver Matching
- Driver Assignment
- Trip Execution & Tracking
- Fare & Payment
- Notification
- Rating
- Operations

## 2.3 Business Rules chính

- Chỉ Driver `Available` và có Vehicle phù hợp được matching.
- Driver có Location hợp lệ được ưu tiên theo khoảng cách.
- Assignment timeout tối đa 60 giây.
- Reject/timeout → tìm Driver tiếp theo.
- Hết ứng viên → `TripRequest = NoDriverFound`.
- Customer được cancel theo điều kiện cho phép trước khi Trip bắt đầu.
- `TotalFare = BaseFare + (DistanceKm × PricePerKm)`.
- Distance làm tròn đến 0,1 km.
- Payment gồm `Cash` và `Electronic`.
- Electronic Payment dùng VNPAY Sandbox.
- Payment retry tối đa 3 lần sau lần thử đầu tiên.
- Notification hiện tại là in-app.
- DriverLocation chỉ lưu vị trí gần nhất.
- Dữ liệu lưu tối thiểu 12 tháng, không tự động purge.
- Operations Staff và Operations Supervisor là hai role vận hành (Baseline 1.1.0).
- FR-31 đến FR-33 thuộc định hướng mở rộng tương lai.

---

# 3. Bounded Context

| ID   | Bounded Context       | Microservice           | Trách nhiệm                                           |
| ---- | --------------------- | ---------------------- | ----------------------------------------------------- |
| BC-A | Participant & Account | `participant-service`  | Account, Customer, Driver, Availability               |
| BC-B | Fleet Supply          | `fleet-service`        | Vehicle, VehicleType, DriverLocation                  |
| BC-C | Ride                  | `ride-service`         | TripRequest, Assignment, Trip, Fare, Rating, Tracking |
| BC-D | Payment               | `payment-service`      | Payment, VNPAY, Retry                                 |
| BC-E | Notification          | `notification-service` | Notification, Inbox, Read State                       |
| BC-F | Operations & Insight  | `operations-service`   | Lookup, Dashboard, KPI, Audit                         |

---

# 4. Context Specification

## 4.1 BC-A — Participant & Account

**Owner:** `participant-service`

### Entity

- `Account`
- `Customer`
- `Driver`

### Trách nhiệm

- Account và authentication.
- Customer/Driver profile.
- Driver availability.
- Participant information.

### State

- `AvailabilityStatus`: `Available`, `Unavailable`.
- `ApprovalStatus`: `PendingApproval`, `Approved`, `Rejected`.

### Rules

- Một Account có một Role.
- Phone Number duy nhất.
- Phone của Customer/Driver đồng bộ với Account.
- Dữ liệu cần giữ lịch sử dùng logical delete.

**Không sở hữu:** Vehicle, VehicleType, DriverLocation, TripRequest, Assignment, Trip, Fare, Payment, Notification.

---

## 4.2 BC-B — Fleet Supply

**Owner:** `fleet-service`

### Entity

- `Vehicle`
- `VehicleType`
- `DriverLocation`

### Trách nhiệm

- Quản lý Vehicle/VehicleType.
- Lưu Location gần nhất.
- Cung cấp Fleet/Location information cho matching.

### Rules

- Driver có một Vehicle.
- Vehicle thuộc một VehicleType.
- DriverLocation tối đa một record hiện hành.
- `DriverId` tham chiếu Driver của BC-A bằng ID.

---

## 4.3 BC-C — Ride

**Owner:** `ride-service`

### Entity

- `TripRequest`
- `DriverAssignment`
- `Trip`
- `Fare`
- `Rating`

### Trách nhiệm

- Trip Request.
- Driver Matching và Assignment.
- Trip lifecycle và Tracking.
- Fare calculation.
- Rating.
- Điều phối Participant, Fleet và Payment.

### TripRequest

- `Searching`
- `Assigned`
- `Cancelled`
- `NoDriverFound`

### DriverAssignment

- `Pending`
- `Accepted`
- `Rejected`
- `Timeout`

### Trip

- `Arrived`
- `PickedUp`
- `InProgress`
- `Completed`
- `Cancelled`
- `Failed` (terminal; OperationsSupervisor intervention only, per baseline 1.1.0)

### Rules

- Trip được tạo sau Assignment `Accepted`.
- Assignment timeout tối đa 60 giây.
- Reject/timeout → candidate tiếp theo.
- Không còn candidate → `NoDriverFound`.
- Rating chỉ tạo khi Trip `Completed`.
- Một Trip tối đa một Rating.

### Fare

| Vehicle Type | Base Fare | Price/km |
| ------------ | --------: | -------: |
| Xe máy       |    10.000 |    8.000 |
| Ô tô 4 chỗ   |    15.000 |   12.000 |
| Ô tô 7 chỗ   |    20.000 |   14.000 |

```text
TotalFare = BaseFare + (DistanceKm × PricePerKm)
```

---

## 4.4 BC-D — Payment

**Owner:** `payment-service`

### Entity

- `Payment`

### Trách nhiệm

- Payment lifecycle.
- Cash/Electronic Payment.
- VNPAY Sandbox.
- Retry.

### Method

- `Cash`
- `Electronic`

### State

- `Pending`
- `Paid`
- `Failed`

### Rules

- Payment mới có `RetryCount = 0`.
- Tối đa 3 retry sau lần thử đầu tiên.
- Không lưu payment data nhạy cảm ngoài phạm vi hệ thống.
- `TripId` là reference đến Trip của BC-C.

---

## 4.5 BC-E — Notification

**Owner:** `notification-service`

### Entity

- `Notification`

### Trách nhiệm

- Tạo/lưu Notification.
- Notification Inbox.
- Read State.

### State

- `IsRead = false | true`

### Rules

- Chỉ in-app trong phạm vi hiện tại.
- Notification liên kết Account và có thể liên kết Trip.
- Không sở hữu Trip hoặc Payment.

---

## 4.6 BC-F — Operations & Insight

**Owner:** `operations-service`

### Data

- `AuditLog`
- `TransactionReadModel`
- `DashboardReadModel`

### Trách nhiệm

- Transaction Lookup.
- Trip monitoring.
- Dashboard/KPI.
- Audit.
- Tổng hợp dữ liệu cho Operations và Leadership.

### Rules

- Không sở hữu Customer, Driver, Vehicle, Trip hoặc Payment.
- Read Model chỉ phục vụ truy vấn/tổng hợp.
- Domain Entity gốc vẫn thuộc Service nghiệp vụ.

---

# 5. Domain Model

## 5.1 Aggregate

| Context | Aggregate                            |
| ------- | ------------------------------------ |
| BC-A    | Account, Customer, Driver            |
| BC-B    | Vehicle, VehicleType, DriverLocation |
| BC-C    | TripRequest, DriverAssignment, Trip  |
| BC-D    | Payment                              |
| BC-E    | Notification                         |
| BC-F    | AuditLog                             |

## 5.2 Domain Object / Value Object

| Context | Object                                                    |
| ------- | --------------------------------------------------------- |
| BC-A    | PhoneNumber, Role, AvailabilityStatus                     |
| BC-B    | Vehicle information, Location information                 |
| BC-C    | Fare, Rating, BaseFare, PricePerKm, DistanceKm, TotalFare |
| BC-D    | PaymentMethod, PaymentStatus, RetryCount                  |
| BC-E    | IsRead                                                    |
| BC-F    | TransactionReadModel, DashboardReadModel                  |

## 5.3 Khái niệm không đồng nhất

- `TripRequest` ≠ `Trip`.
- `Fare` ≠ `Payment`.
- `Driver` ≠ `DriverLocation`.
- `PaymentStatus` ≠ `Trip.Status`.
- `AssignmentStatus` ≠ `AvailabilityStatus`.
- Không dùng một `Status` enum chung cho toàn hệ thống.

---

# 6. Entity Ownership

| Entity           | Owner | Microservice           |
| ---------------- | ----- | ---------------------- |
| Account          | BC-A  | `participant-service`  |
| Customer         | BC-A  | `participant-service`  |
| Driver           | BC-A  | `participant-service`  |
| Vehicle          | BC-B  | `fleet-service`        |
| VehicleType      | BC-B  | `fleet-service`        |
| DriverLocation   | BC-B  | `fleet-service`        |
| TripRequest      | BC-C  | `ride-service`         |
| DriverAssignment | BC-C  | `ride-service`         |
| Trip             | BC-C  | `ride-service`         |
| Fare             | BC-C  | `ride-service`         |
| Rating           | BC-C  | `ride-service`         |
| Payment          | BC-D  | `payment-service`      |
| Notification     | BC-E  | `notification-service` |
| AuditLog         | BC-F  | `operations-service`   |

Entity thuộc Service khác chỉ được tham chiếu bằng ID và contract.

---

# 7. Core Business Flows

## 7.1 Driver Matching

```text
TripRequest = Searching
        ↓
Get eligible Drivers
        ↓
Check Availability
        ↓
Check Vehicle
        ↓
Check DriverLocation
        ↓
Select nearest candidate
        ↓
Create DriverAssignment
```

## 7.2 Assignment

```text
Pending

 ├── Accept  → Accepted → Create Trip
 ├── Reject  → Rejected → Find next Driver
 └── Timeout → Timeout  → Find next Driver
```

## 7.3 Trip Lifecycle

```text
Created → Arrived → PickedUp → InProgress → Completed
Supervisor intervention (failed operational case) → Failed (terminal)
```

`Cancelled` được xử lý theo điều kiện cho phép trước khi Trip bắt đầu. `Failed` chỉ do Supervisor intervention, là terminal; Driver không được gán trạng thái này.

## 7.4 Fare

```text
Trip + VehicleType + Distance
        ↓
Tariff
        ↓
BaseFare + DistanceFare
        ↓
Round Distance to 0.1 km
        ↓
TotalFare
```

## 7.5 Rating

```text
Trip = Completed
        ↓
Validate Rating 1..5
        ↓
Check duplicate
        ↓
Create Rating
```

## 7.6 Payment

```text
Create Payment
        ↓
Pending
        ↓
Cash ───────────────→ Confirm
Electronic → VNPAY → Provider Result → Update Status
```

## 7.7 Notification

```text
Business Result
        ↓
Create Notification
        ↓
Inbox
        ↓
Read → IsRead = true
```

## 7.8 Operations

```text
Request
  ↓
Authorize
  ↓
Query Source / Read Model
  ↓
Return Data
  ↓
Audit important administrative action
```

---

# 8. API Ownership

| API                               | Owner                  |
| --------------------------------- | ---------------------- |
| `/auth/*`                         | `participant-service`  |
| `/customers/*`                    | `participant-service`  |
| `/drivers/*`                      | `participant-service`  |
| `/drivers/{id}/availability`      | `participant-service`  |
| `/vehicles/*`                     | `fleet-service`        |
| `/trip-requests/*`                | `ride-service`         |
| `/driver-assignments/*`           | `ride-service`         |
| `/trips/*`                        | `ride-service`         |
| `/trips/{tripId}/fare`            | `ride-service`         |
| `/trips/{tripId}/rating`          | `ride-service`         |
| `/trips/{tripId}/driver-location` | `ride-service`         |
| `/payments/quote`                 | `ride-service`         |
| `/payments`                       | `payment-service`      |
| `/payments/{paymentId}`           | `payment-service`      |
| `/payments/webhook`               | `payment-service`      |
| `/notifications`                  | `notification-service` |
| `/notifications/{id}/read`        | `notification-service` |
| `/operations/transactions`        | `operations-service`   |
| `/operations/dashboard`           | `operations-service`   |

## API đặc biệt

### `/payments/quote`

Fare thuộc BC-C nên request được xử lý bởi `ride-service`.

```text
Client → /payments/quote → ride-service → Fare calculation
```

### `/trips/{tripId}/driver-location`

Endpoint thuộc Trip API nhưng Location data thuộc BC-B.

```text
Client → ride-service → fleet-service → DriverLocation
```

---

# 9. Context Map & Communication

```text
participant-service ── Participant/Availability ──► ride-service

fleet-service ──────── Fleet/Location ────────────► ride-service

ride-service ◄────────────────────────────────────► payment-service

ride-service ─────────┐
payment-service ──────┴──► notification-service

participant-service ──┐
fleet-service ────────┤
ride-service ─────────┼──► operations-service
payment-service ──────┘

VNPAY Sandbox ─────────────► payment-service
```

## Contract

| Producer        | Consumer     | Dữ liệu chính                                     |
| --------------- | ------------ | ------------------------------------------------- |
| Participant     | Ride         | Driver identity, Availability, Participant info   |
| Fleet           | Ride         | Vehicle, VehicleType, DriverLocation, Eligibility |
| Ride            | Payment      | Trip reference, Fare/Payment context              |
| Payment         | Ride         | Payment result, Payment status                    |
| Ride/Payment    | Notification | Business result                                   |
| Source Services | Operations   | Lookup, Monitoring, Dashboard, KPI, Audit data    |

Các quan hệ trên là API/business contracts, không phải Shared Database hoặc Distributed Transaction.

---

# 10. Database Architecture

## 10.1 Database

| Microservice           | Database   |
| ---------------------- | ---------- |
| `participant-service`  | PostgreSQL |
| `fleet-service`        | PostgreSQL |
| `ride-service`         | PostgreSQL |
| `payment-service`      | PostgreSQL |
| `notification-service` | PostgreSQL |
| `operations-service`   | PostgreSQL |

## 10.2 Schema Ownership

```text
participant-service
└── Account, Customer, Driver

fleet-service
└── Vehicle, VehicleType, DriverLocation

ride-service
└── TripRequest, DriverAssignment, Trip, Fare, Rating

payment-service
└── Payment

notification-service
└── Notification

operations-service
└── AuditLog, TransactionReadModel, DashboardReadModel
```

## 10.3 Database Rules

- Service chỉ đọc/ghi Database của chính mình.
- Không Shared Table.
- Không Cross-Database JOIN.
- Không Cross-Database Foreign Key.
- Không truy cập trực tiếp DB của Service khác.
- Cross-service reference dùng ID.
- Cross-service data dùng API/contract hoặc Read Model.

---

# 11. Operations Read Model

`operations-service` dùng Read Model cho:

- Transaction Lookup
- Trip Monitoring
- Dashboard
- KPI

```text
Payment ──► Payment Read Model ──► Transaction Lookup

Trip + Payment + Driver
        ↓
Dashboard Read Model
        ↓
KPI / Dashboard
```

Read Model không thay đổi ownership của Domain Entity.

---

# 12. Audit

`AuditLog` thuộc `operations-service`.

Thông tin chính:

```text
AccountId
Action
EntityType
EntityId
CreatedAt
```

Các Domain Service không sở hữu AuditLog.

---

# 13. Authorization Boundary

| Chức năng           | Context |
| ------------------- | ------- |
| Customer Account    | BC-A    |
| Driver Account      | BC-A    |
| Driver Availability | BC-A    |
| Vehicle Management  | BC-B    |
| Trip Request        | BC-C    |
| Driver Assignment   | BC-C    |
| Trip Management     | BC-C    |
| Fare                | BC-C    |
| Rating              | BC-C    |
| Payment             | BC-D    |
| Notification        | BC-E    |
| Transaction Lookup  | BC-F    |
| Dashboard/KPI       | BC-F    |
| Audit               | BC-F    |

Authorization được thực hiện tại API boundary theo Role của hệ thống.

---

# 14. Test Traceability

| Scenario                     | Context            |
| ---------------------------- | ------------------ |
| SC-01 Customer Account       | BC-A               |
| SC-02 Driver Account         | BC-A               |
| SC-03 Vehicle                | BC-B               |
| SC-04 Driver Availability    | BC-A               |
| SC-05 Trip Request           | BC-C               |
| SC-06 Driver Matching        | BC-A + BC-B + BC-C |
| SC-07 Assignment & Response  | BC-C               |
| SC-08 No Driver Found        | BC-C + BC-E        |
| SC-09 Trip Status            | BC-C               |
| SC-10 Trip Tracking          | BC-C               |
| SC-11 Driver Location        | BC-B + BC-C        |
| SC-12 Trip Fare              | BC-C               |
| SC-13 Cash Payment           | BC-D               |
| SC-14 Electronic Payment     | BC-D               |
| SC-15 Notification           | BC-E               |
| SC-16 Trip Rating            | BC-C               |
| SC-17 Operations CRUD        | BC-A + BC-B + BC-F |
| SC-18 Operations Trip Lookup | BC-C + BC-F        |
| SC-19 Payment Transactions   | BC-D + BC-F        |
| SC-20 System KPI             | BC-F               |

**Baseline trước thay đổi:** 20 Scenario, 233 Test Case. Baseline 1.1.0 gộp 26 test case chức năng mới vào các scenario hiện có; tổng là 20 Scenario và 259 Test Case trong 20 sheet scenario của workbook `CAB_Test_Cases.xlsx`. Test case kiểm tra decision log đã bỏ khỏi Excel vì đây là tài liệu quản trị, không phải scenario sản phẩm.

---

# 15. Deployment Architecture

```text
                          Client
                            │
                            ▼
                       API Gateway
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
       participant-service fleet-service  ride-service
             │              │              │
             ▼              ▼              ▼
        PostgreSQL      PostgreSQL      PostgreSQL
                                            │
                                            ▼
                                      payment-service
                                            │
                                            ▼
                                         PostgreSQL

notification-service ──► PostgreSQL

operations-service ────► PostgreSQL
```

Mỗi Microservice có thể được triển khai và cập nhật độc lập.

---

# 16. Final Architecture

## Bounded Context

| BC   | Context               | Microservice           | Database   |
| ---- | --------------------- | ---------------------- | ---------- |
| BC-A | Participant & Account | `participant-service`  | PostgreSQL |
| BC-B | Fleet Supply          | `fleet-service`        | PostgreSQL |
| BC-C | Ride                  | `ride-service`         | PostgreSQL |
| BC-D | Payment               | `payment-service`      | PostgreSQL |
| BC-E | Notification          | `notification-service` | PostgreSQL |
| BC-F | Operations & Insight  | `operations-service`   | PostgreSQL |

## Entity Boundary

```text
BC-A
├── Account
├── Customer
└── Driver

BC-B
├── Vehicle
├── VehicleType
└── DriverLocation

BC-C
├── TripRequest
├── DriverAssignment
├── Trip
├── Fare
└── Rating

BC-D
└── Payment

BC-E
└── Notification

BC-F
├── AuditLog
├── TransactionReadModel
└── DashboardReadModel
```

## Service Boundary

```text
participant-service  → Account, Customer, Driver

fleet-service        → Vehicle, VehicleType, DriverLocation

ride-service         → TripRequest, DriverAssignment, Trip, Fare, Rating

payment-service      → Payment

notification-service → Notification

operations-service   → AuditLog, TransactionReadModel, DashboardReadModel
```

## Database Boundary

```text
participant-service  → PostgreSQL

fleet-service        → PostgreSQL

ride-service         → PostgreSQL

payment-service      → PostgreSQL

notification-service → PostgreSQL

operations-service   → PostgreSQL
```

---

# 17. Kiến trúc chốt

CAB System gồm **6 Bounded Context / 6 Microservice**, với **Database riêng cho từng Service**.

Entity có **một Owner duy nhất**; các Service giao tiếp qua **API/contract**; `operations-service` sử dụng **Read Model** cho tra cứu và tổng hợp; Public API hiện hành được giữ nguyên trong phạm vi kiến trúc.


# 18. Baseline điều chỉnh 1.1.0

Chương này là thay đổi có hiệu lực; khi khác các phần trước áp dụng Chương 18 và SRS Chương 18. Các Bounded Context hiện hữu vẫn là owner duy nhất của entity.

## 18.1. Ownership bổ sung

| Dữ liệu | Owner | Ghi chú |
|---|---|---|
| Driver.approvalStatus | participant-service (BC-A) | `PendingApproval`, `Approved`, `Rejected`; ban đầu Unavailable |
| DriverLocation mới nhất | fleet-service (BC-B) | PostgreSQL, chỉ vị trí mới nhất; không lưu lịch sử tuyến |
| ETA hiện hành | ride-service (BC-C) | Tính lại khi nhận vị trí hoặc thay đổi tuyến; định tuyến ngoài là dependency |
| TripSupportNote, TripIntervention audit | operations-service (BC-F) | Note bất biến; intervention có reason/actor/time/before-after |
| WebSocket ticket/event orchestration | ride-service (BC-C) | Ticket ngắn hạn theo Trip; gateway/channel không là datastore |

## 18.2. Real-time và ETA

Driver app gửi vị trí mỗi 5 giây khi tới điểm đón, mỗi 10–15 giây trong chuyến và ngay khi status đổi. Fleet phát cập nhật qua contract tới Ride; Ride dùng routing provider cấu hình được để tính ETA, phát `trip.location.updated`, `trip.eta.updated`, `trip.status.updated` tới người có quyền qua WebSocket. Client lấy ticket dùng một lần, hết hạn 60 giây; reconnect tự động và fallback đọc API mỗi 10 giây. Sau 30 giây không có vị trí mới, sự kiện/API đánh `stale=true`. Mục tiêu kiểm thử p95 từ lúc server nhận vị trí tới client ≤10 giây (BR-19/FR-34/NFR-12). Dừng stream khi chuyến hủy/hoàn thành.

## 18.3. Registration, approval và roles

Driver có thể tự đăng ký hoặc do OperationsStaff tạo; hồ sơ đầu `PendingApproval` và `Unavailable`. Staff/Supervisor duyệt hoặc từ chối (từ chối bắt buộc reason); chỉ Approved được đặt Available. `OperationsStaff` quản lý hồ sơ, xem/track Trip, tạo support note và tra cứu giao dịch. `OperationsSupervisor` có quyền Staff cộng can thiệp hủy/chuyển Trip lỗi sang Failed hoặc hủy chuyến theo action giới hạn (Cancelled hoặc terminal Failed), reason bắt buộc, xác nhận lần hai. Không role nào sửa Payment history, finalized Fare hoặc vị trí Driver trực tiếp.

## 18.4. Giao tiếp và failure handling

Fleet sở hữu và lưu DriverLocation trong PostgreSQL; gửi location update qua API/business contract tới Ride. Ride sở hữu ETA và Trip stream. Nếu routing provider lỗi, giữ ETA cũ và báo stale; không phát ETA giả. Nếu WebSocket lỗi, client polling API mỗi 10 giây trong khi reconnect. Payment/Notification lỗi không rollback Trip đã commit. Payment callbacks idempotent theo provider reference. Webhook phải xác minh chữ ký theo cấu hình VNPAY.

## 18.5. NFR nghiệm thu đồ án

100 virtual users đồng thời; ít nhất 20 TripRequest/phút trong 10 phút; p95 API thông thường <2 giây; p95 create TripRequest <3 giây (không tính matching/driver response); p95 live update ≤10 giây; backup PostgreSQL hằng ngày và có ít nhất một lần restore được ghi nhận. Đây là mục tiêu test trong môi trường đồ án, không phải production SLA. PostgreSQL là RDBMS duy nhất; không dùng NoSQL.

## 18.6. Traceability và Decision log

Requirement delta BR-19–BR-23 / FR-34–FR-38 / NFR-12–NFR-13 / GOV-01 và AC-165–AC-187 được định nghĩa trong SRS Chương 18.8. Workbook giữ 20 sheet scenario; các test case mới được gộp vào scenario liên quan. Liên kết từng test case delta tới Requirement/AC được ghi trong `test-case/TRACEABILITY.md`.

### Decision log

Các quy tắc đã làm rõ được quản lý trong `decision_log.md` với trạng thái Proposed/Approved/Rejected và bằng chứng xác nhận. Workspace hiện không có bằng chứng xác nhận; các quyết định được ghi là Proposed cho tới khi có xác nhận được lưu. Công việc triển khai không được coi là phê duyệt nghiệp vụ.
