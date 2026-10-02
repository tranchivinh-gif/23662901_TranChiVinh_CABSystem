# 04 Integration Contracts — CAB System

## 5.1 Purpose

Tài liệu này chuyển logical interaction contract trong `03_System_Architecture.md` thành technical communication contract cho đúng tám service CAB System. Tài liệu chốt loại tương tác, hình dạng envelope, quy tắc lỗi, retry, idempotency, versioning và security boundary; không phải đặc tả code hay hạ tầng.

## 5.2 Scope

Phạm vi gồm public REST contract, Gateway downstream IPC, synchronous service-to-service command/query và business event bất đồng bộ. Public API tiếp tục theo OpenAPI; các RPC mapping cụ thể chưa được định nghĩa tại tài liệu này nếu Contract ID/API contract chưa cung cấp đủ chi tiết.

Business contract có một số chi tiết chưa xác định. Tài liệu đánh dấu `OPEN DECISION` ở đúng các điểm đó; việc lựa chọn giao thức hoặc envelope không được hiểu là bổ sung business requirement. `AccountCreated`, `CustomerProfileCreated`, `DriverProfileCreated`, `TripStarted`, `PaymentCompleted`, `PaymentFailed`, `RatingSubmitted` và `NotificationRequested` không được mặc định là event đã chốt. Chỉ event fact có căn cứ trong 04 được đưa vào catalog; các tên cụ thể được chuẩn hóa ở đây ở mức technical contract và cần tương thích với source.

## 5.3 Contract Principles

- Một service chỉ đọc hoặc thay đổi dữ liệu qua contract của service sở hữu dữ liệu. Database per service; không shared database/table, không truy cập database trực tiếp.
- Command yêu cầu một side effect do owner thực hiện; query chỉ đọc dữ liệu và không side effect; event là fact đã xảy ra, không phải yêu cầu thực hiện.
- Payload chỉ mang business identifier/reference và trường tối thiểu cần cho consumer. Không công khai entity nội bộ, credential, schema lưu trữ hoặc dữ liệu nhạy cảm không cần thiết.
- Side-effect command có thể được gửi lại phải có idempotency strategy phù hợp. Consumer event phải dung nạp duplicate.
- Không dùng distributed transaction. Cross-service flow chấp nhận trạng thái trung gian và phối hợp qua response/event phù hợp.
- Contract technical không đổi bounded context, service boundary, ownership, responsibility, dependency, invariant hoặc use case ownership trong 04.

## 5.4 Communication Strategy

| Decision | Chọn cho tài liệu này | Lý do và trade-off |
|---|---|---|
| Public API | Client → API Gateway = REST/HTTP/JSON, phiên bản `/api/v1` | Public API source là OpenAPI hiện có trong `api-document/`. |
| Gateway downstream IPC | API Gateway → mỗi microservice = gRPC | Gateway chuyển REST request thành gRPC invocation; gRPC server/handler thuộc target service. RPC method/schema mapping chưa được suy diễn ở đây. |
| Internal synchronous IPC | Service → Service = REST/HTTP theo interactions đã xác định trong 04/05 | Giữ command/query synchronous hiện có. Không chuyển các interaction này sang gRPC và không thêm dependency. |
| Asynchronous communication | Service → Kafka → consumer, at-least-once | Kafka được chọn trong 06; chỉ dùng event IDs đã có trong catalog. Consumer xử lý duplicate/retry/DLQ theo contract/runtime design. |

| Interaction layer | Transport | Purpose |
|---|---|---|
| Client → Gateway | REST/HTTP/JSON | Public API theo OpenAPI hiện tại |
| Gateway → Service | gRPC | Internal downstream invocation; RPC mapping chi tiết TBD |
| Service → Service | REST/HTTP | Existing synchronous business interaction trong 04/05 |
| Service → Kafka | Kafka | Async event communication theo event catalog hiện có |

Gateway gRPC downstream là lớp chuyển tải các public operations hiện có; nó không tạo thêm business capability/Contract ID. Gateway-facing gRPC server/handler được yêu cầu cho tám service, nhưng RPC mapping là TBD nếu contract hiện tại chưa đủ thông tin. Sync service-to-service tiếp tục REST/HTTP. Event dùng khi consumer phản ứng với business fact mà caller không cần chờ consumer hoàn thành. Không biến mọi logical reference thành API call.

## 5.5 Communication Matrix

| From Service | To Service | Interaction | Type | Protocol | Purpose | Sync/Async |
|---|---|---|---|---|---|---|
| Identity & Access | Customer Management | Create Customer Profile với Account reference sau khi tạo Account | Command | REST/HTTP | Tạo profile bởi owner | Sync |
| Identity & Access | Driver & Fleet Management | Create Driver Profile với Account reference sau khi tạo Account | Command | REST/HTTP | Tạo profile bởi owner | Sync |
| Ride | Fare & Payment | Calculate/Finalize Fare; nhận finalized fare reference/information | Command + response; query nếu cần lấy lại kết quả | REST/HTTP | Fare owner thực hiện calculation/finalization | Sync; trigger/payment timing OPEN DECISION |
| Rating & Review | Ride | Lấy/verify Trip completion | Query | REST/HTTP | Chỉ cho phép rating với Trip COMPLETED | Sync; event alternative chưa chốt |
| Ride | Notifications | Trip request/assignment/status/completion/cancellation facts | Event | Kafka (selected in 06) | Tạo/gửi notification phù hợp | Async |
| Fare & Payment | Notifications | Payment outcome fact | Event | Kafka (selected in 06) | Thông báo outcome payment | Async |
| Ride | Customer Management | Customer profile/reference query cần cho Ride | Query | REST/HTTP | Xác nhận/tham chiếu Customer | Sync; fields tối thiểu OPEN |
| Ride | Driver & Fleet Management | Eligible drivers, availability, latest location, VehicleType reference | Query | REST/HTTP | Matching; Ride không sở hữu Fleet data | Sync |
| Operations & Reporting | Customer Management | Customer query | Query | REST/HTTP | Hỗ trợ/tra cứu vận hành | Sync |
| Operations & Reporting | Driver & Fleet Management | Driver/Vehicle query | Query | REST/HTTP | Hỗ trợ/tra cứu vận hành | Sync |
| Operations & Reporting | Ride | Trip query | Query | REST/HTTP | Theo dõi/hỗ trợ Trip | Sync |
| Operations & Reporting | Fare & Payment | Payment/transaction query | Query | REST/HTTP | Tra cứu giao dịch | Sync |
| Operations & Reporting | Ride | CMD-OPS-002 — Supervisor Trip intervention | Command | REST/HTTP | Ride validates eligibility and owns Trip update; OperationsStaff is forbidden (403), OperationsSupervisor may cancel an unfinished Trip or close a failed Trip as `Failed`; required reason and second confirmation; Operations records audit | Synchronous; finalized baseline |
| Customer Management | Identity & Access | Resolve/verify Account identity khi cần | Query/reference | REST/HTTP nếu cần xác minh | Liên kết Account reference | Conditional sync; không bắt buộc nếu reference đủ |
| Driver & Fleet Management | Identity & Access | Resolve/verify Account identity khi cần | Query/reference | REST/HTTP nếu cần xác minh | Liên kết Account reference | Conditional sync; không bắt buộc nếu reference đủ |
| Rating & Review | Customer Management | Resolve Customer reference khi cần | Query | REST/HTTP | Xác định evaluator | Sync |
| Rating & Review | Driver & Fleet Management | Resolve Driver reference khi cần | Query | REST/HTTP | Xác định subject của rating | Sync |

Các dòng Client/Gateway trong service/API catalogs mô tả public REST operation; Gateway dùng gRPC downstream cho invocation tương ứng. Các dòng service-to-service trong matrix này giữ REST/HTTP. Contract IDs, command/query semantics và RPC method names không được suy ra từ nhau; RPC mapping remains TBD where the existing contract is insufficient.

## 5.6 Identity & Access Service

### 5.6.1 Service Communication Contract

- **Responsibility:** Account, authentication, authorization và role/account status theo 04.
- **Exposed Commands:** Create Account; Authenticate Account; Manage Role/Account Status. Role/status details OPEN.
- **Exposed Queries:** Resolve Account Identity; Check Authentication/Authorization State trong phạm vi đã xác nhận.
- **Published Events:** Không publish registration event trong baseline. 04 nói rõ logical coordination bằng command/reference; không tự tạo `AccountCreated`.
- **Consumed Events:** Không xác định trong 04.
- **Synchronous Dependencies:** Sau Create Account, cung cấp Account identity/reference tới service profile tương ứng. `CMD-CUS-001` là command do Customer Management sở hữu để tạo Customer Profile; `CMD-DFM-001` là command do Driver & Fleet Management sở hữu để tạo Driver Profile. Identity & Access không sở hữu hai business operation này.
- **Asynchronous Dependencies:** Không xác định.

### 5.6.2 Contracts

| Contract ID | Type | From | To | Purpose | Protocol |
|---|---|---|---|---|---|
| CMD-IAM-001 | Command | Client/Gateway | Identity & Access | Create Account | REST/HTTP |
| CMD-IAM-004 | Command | Client/Gateway | Identity & Access | Authenticate Account | REST/HTTP |
| QRY-IAM-001 | Query | Internal authorized caller | Identity & Access | Resolve Account identity/auth state nếu contract consumer cần | REST/HTTP |

Create Account API chỉ trả Account identity/reference và authentication result cần thiết; không trả credential. Nếu profile creation thất bại sau Account creation, hệ thống có partial outcome; rollback/distributed transaction không được giả định. Recovery/compensation cho registration là OPEN DECISION.

## 5.7 Customer Management Service

### 5.7.1 Service Communication Contract

- **Responsibility:** Customer profile và lifecycle.
- **Exposed Commands:** Create/Update Customer Profile; Change Customer Status.
- **Exposed Queries:** Customer profile/reference và status tối thiểu.
- **Published Events:** Không có event được 04 xác nhận.
- **Consumed Events:** Không có event. Nhận Create Customer Profile command từ Identity & Access.
- **Synchronous Dependencies:** Identity & Access identity resolution chỉ khi reference cần xác minh; Operations query; Ride/Rating query/reference theo nhu cầu.
- **Asynchronous Dependencies:** Không xác định.

### 5.7.2 Contracts

| Contract ID | Type | From | To | Purpose | Protocol |
|---|---|---|---|---|---|
| CMD-CUS-001 | Command | Identity & Access | Customer Management | Create Customer Profile | REST/HTTP |
| CMD-CUS-002 | Command | Authorized client/Gateway | Customer Management | Update Customer Profile | REST/HTTP |
| CMD-CUS-003 | Command | Authorized client/Gateway | Customer Management | Change Customer Status | REST/HTTP |
| QRY-CUS-001 | Query | Ride | Customer Management | Resolve Customer reference/required fields | REST/HTTP |
| QRY-CUS-002 | Query | Rating & Review | Customer Management | Resolve Customer reference | REST/HTTP |
| QRY-CUS-003 | Query | Operations & Reporting | Customer Management | Operational Customer lookup | REST/HTTP |

## 5.8 Driver & Fleet Management Service

### 5.8.1 Service Communication Contract

- **Responsibility:** Driver, Vehicle, VehicleType, approval, availability, latest location và eligibility.
- **Exposed Commands:** Create/Update Driver Profile; Manage Vehicle/VehicleType; Review Approval; Update Availability/Latest Location.
- **Exposed Queries:** Find Eligible Drivers; Get Driver/Vehicle/VehicleType reference; Get latest location, approval/availability.
- **Published Events:** Availability/location/eligibility change event chỉ là candidate trong 04; không đưa vào baseline catalog đến khi publication được chốt. Không có registration event.
- **Consumed Events:** Không xác định trong 04.
- **Synchronous Dependencies:** Identity reference verification nếu cần; Ride matching query; Rating/Operations lookup.
- **Asynchronous Dependencies:** Không xác định.

### 5.8.2 Contracts

| Contract ID | Type | From | To | Purpose | Protocol |
|---|---|---|---|---|---|
| CMD-DFM-001 | Command | Identity & Access | Driver & Fleet Management | Create Driver Profile | REST/HTTP |
| CMD-DFM-002 | Command | Authorized client/Gateway | Driver & Fleet Management | Update Driver Profile / manage vehicle and VehicleType | REST/HTTP |
| CMD-DFM-003 | Command | Authorized client/Gateway | Driver & Fleet Management | Review approval / update availability / latest location | REST/HTTP |
| QRY-DFM-001 | Query | Ride | Driver & Fleet Management | Matching eligibility, availability, location and VehicleType reference | REST/HTTP |
| QRY-DFM-002 | Query | Rating & Review | Driver & Fleet Management | Resolve Driver reference | REST/HTTP |
| QRY-DFM-003 | Query | Operations & Reporting | Driver & Fleet Management | Operational Driver/Vehicle lookup | REST/HTTP |

Ride chỉ query/reference VehicleType, Vehicle và Driver fields cần matching; Fleet là owner duy nhất. Exact criteria và freshness/location contract là OPEN DECISION.

## 5.9 Ride Service

### 5.9.1 Service Communication Contract

- **Responsibility:** TripRequest, matching/dispatch, DriverAssignment, Trip lifecycle/status và Current Trip ETA.
- **Exposed Commands:** Request Trip; Match/Assign Driver; update Trip lifecycle; cancel/complete Trip; update ETA.
- **Exposed Queries:** Trip/request/assignment/status/ETA và thông tin Trip tối thiểu.
- **Published Events:** Trip request/assignment/status facts; `TripCompleted`; `TripCanceled`. Tên chi tiết fact khác và payload được định nghĩa ở 5.21-5.22.
- **Consumed Events:** Không có event consumer được chốt; matching dùng Fleet query. Không dùng event Fleet candidate trong baseline.
- **Synchronous Dependencies:** Customer/Fleet queries; Fare & Payment Calculate/Finalize Fare; Rating gọi Ride query để verify completion; Operations query.
- **Asynchronous Dependencies:** Notifications consume Trip events.

### 5.9.2 Contracts

| Contract ID | Type | From | To | Purpose | Protocol |
|---|---|---|---|---|---|
| CMD-RID-001 | Command | Customer/Gateway | Ride | Request Trip | REST/HTTP |
| CMD-RID-002 | Command | Authorized client/Gateway | Ride | Cancel Trip | REST/HTTP |
| CMD-RID-003 | Command | Authorized caller/Ride workflow | Ride | Assign Driver / update Trip lifecycle | REST/HTTP/internal owner operation |
| QRY-RID-001 | Query | Rating & Review | Ride | Verify Trip completion | REST/HTTP |
| QRY-RID-002 | Query | Operations & Reporting | Ride | Trip/status lookup | REST/HTTP |
| CMD-RID-004 | Command | Ride | Fare & Payment | Calculate/Finalize Fare | REST/HTTP |
| EVT-RID-001 | Event | Ride | Notifications | Trip request/assignment/status facts | Kafka |
| EVT-RID-002 | Event | Ride | Notifications; Fare & Payment candidate consumer | TripCompleted | Kafka |
| EVT-RID-003 | Event | Ride | Notifications | TripCanceled | Kafka |

Ride may store/reference finalized fare result with Trip; it does not own Fare, Pricing Rule or canonical calculation. Ride can read current VehicleType/Vehicle/Driver matching information from Fleet and cannot change Fleet-owned data.

## 5.10 Fare & Payment Service

### 5.10.1 Service Communication Contract

- **Responsibility:** Fare, Pricing Rule, calculation/finalization, Payment, Transaction and payment lifecycle.
- **Exposed Commands:** Calculate/Finalize Fare; Initiate/Retry Payment; Record Payment Outcome.
- **Exposed Queries:** Fare result, payment status and transaction result.
- **Published Events:** Payment outcome fact to Notifications; concrete outcome status taxonomy OPEN.
- **Consumed Events:** `TripCompleted` is a candidate input identified in 04. Whether fare/payment starts from event or synchronous Ride command, and exact timing, remains OPEN. No event subscription is treated as baseline until decided.
- **Synchronous Dependencies:** Ride sends Trip reference/minimal required facts for fare calculation/finalization; Operations queries payment/transaction.
- **Asynchronous Dependencies:** Notifications consumes payment outcome. Trip completion event consumption is a candidate.

### 5.10.2 Contracts

| Contract ID | Type | From | To | Purpose | Protocol |
|---|---|---|---|---|---|
| CMD-FP-001 | Command | Ride | Fare & Payment | Calculate Fare | REST/HTTP |
| CMD-FP-002 | Command | Ride | Fare & Payment | Finalize Fare | REST/HTTP |
| CMD-FP-003 | Command | Authorized client/workflow | Fare & Payment | Initiate/Retry Payment | REST/HTTP; exact caller flow OPEN |
| CMD-FP-004 | Command | Provider-facing authorized boundary | Fare & Payment | Record Payment Outcome | REST/HTTP/internal boundary; callback design OPEN |
| QRY-FP-001 | Query | Ride | Fare & Payment | Retrieve finalized fare information if needed | REST/HTTP |
| QRY-FP-002 | Query | Operations & Reporting | Fare & Payment | Payment/transaction lookup | REST/HTTP |
| EVT-FP-001 | Event | Fare & Payment | Notifications | Payment outcome recorded | Kafka |
| EVT-FP-002 | Event candidate | Ride | Fare & Payment | TripCompleted input if async flow selected | Kafka; OPEN |

Payment must not modify Ride lifecycle. Fare/Pricing Rule and canonical calculation/finalization remain owned exclusively by Fare & Payment.

## 5.11 Notifications Service

### 5.11.1 Service Communication Contract

- **Responsibility:** Create, persist, list, and mark in-app notifications for Customer/Driver from Trip/payment facts. Notifications owns notification content and persistent read state.
- **Exposed Commands:** Create/persist notification from baseline event; mark an owned notification as read (idempotent one-way transition).
- **Exposed Queries:** Finalized recipient-scoped notification list/read-state capability under QRY-NOT-001.
- **Published Events:** Delivery fact publication not specified in 04; no baseline event.
- **Consumed Events:** Ride Trip request/assignment/status facts and Fare & Payment outcome.
- **Synchronous Dependencies:** May query Ride or Fare only if minimal recipient/content data in event is insufficient; avoid default callback dependency.
- **Asynchronous Dependencies:** Consumes Ride and Fare & Payment events.

### 5.11.2 Contracts

| Contract ID | Type | From | To | Purpose | Protocol |
|---|---|---|---|---|---|
| EVT-NOT-001 | Event consumption | Ride | Notifications | Consume EVT-RID-001 lifecycle facts | Kafka; baseline |
| EVT-NOT-002 | Event consumption | Ride | Notifications | Consume EVT-RID-002 completion fact | Kafka; baseline |
| EVT-NOT-003 | Event consumption | Ride | Notifications | Consume EVT-RID-003 cancellation fact | Kafka; baseline |
| EVT-NOT-004 | Event consumption | Fare & Payment | Notifications | Consume EVT-FP-001 payment outcome | Kafka; baseline |
| QRY-NOT-001 | Query capability | Authorized Customer/Driver via Gateway | Notifications | List own notifications and retrieve updated notification after mark-read; persistent `isRead` | Public REST through Gateway → gRPC; FINALIZED |

Notification is persisted in the Notifications PostgreSQL database. Its `recipientAccountId` references Account owned by Identity & Access; it and the Trip identifier are cross-service references, not foreign keys. Read state is stored as `isRead`; list is scoped to the authenticated recipient and mark-read is idempotent. Delivery retry/retention tuning remains implementation-level; it does not make QRY-NOT-001 provisional. Notification does not become source of truth for Trip or Payment.

## 5.12 Rating & Review Service

### 5.12.1 Service Communication Contract

- **Responsibility:** Validate eligibility and record Customer Rating/Review for a completed Trip/Driver.
- **Exposed Commands:** Create Rating/Review.
- **Exposed Queries:** Get Rating/Review only within a scope that business confirms; scope OPEN.
- **Published Events:** Rating created fact is a candidate only; publication/consumer not specified in 04, so no baseline event.
- **Consumed Events:** No baseline event. `TripCompleted` is a candidate; completion is verified by Ride query in baseline.
- **Synchronous Dependencies:** Query Ride for Trip completion; resolve Customer and Driver references where needed.
- **Asynchronous Dependencies:** None confirmed.

### 5.12.2 Contracts

| Contract ID | Type | From | To | Purpose | Protocol |
|---|---|---|---|---|---|
| CMD-RAT-001 | Command | Customer/Gateway | Rating & Review | Submit Rating/Review for references | REST/HTTP |
| QRY-RAT-001 | Query | Rating & Review | Ride | Verify Trip is COMPLETED | REST/HTTP |
| QRY-RAT-002 | Query | Rating & Review | Customer Management | Resolve Customer reference if needed | REST/HTTP |
| QRY-RAT-003 | Query | Rating & Review | Driver & Fleet Management | Resolve Driver reference if needed | REST/HTTP |

Rating is valid only for a completed Trip. The rating command must verify the Ride-owned status before accepting it; event-based verification can replace this only through an explicit decision.

## 5.13 Operations & Reporting Service

### 5.13.1 Service Communication Contract

- **Responsibility:** Support, authorized intervention, audit and reporting. It does not own source business data of other services.
- **Exposed Commands:** Record Support Note/Audit; finalized synchronous `CMD-OPS-002` Supervisor intervention request to Ride. Ride owns validation and Trip mutation.
- **Exposed Queries:** Operational queries against Customer, Fleet, Ride, Fare & Payment owners.
- **Published Events:** Support/intervention/audit publication is not specified; no baseline event.
- **Consumed Events:** No event consumer specified in 04.
- **Synchronous Dependencies:** Query Customer, Driver/Vehicle, Trip and Payment/transaction owners.
- **Asynchronous Dependencies:** None. Operations does not consume Kafka. Reporting projection refresh calls source owners through existing QRY-OPS-002/003/004 REST contracts.

### 5.13.2 Contracts

| Contract ID | Type | From | To | Purpose | Protocol |
|---|---|---|---|---|---|
| CMD-OPS-001 | Command | Authorized operations actor | Operations & Reporting | Record Support Note/Audit | REST/HTTP |
| QRY-OPS-001 | Query | Operations & Reporting | Customer Management | Operational Customer query | REST/HTTP |
| QRY-OPS-002 | Query | Operations & Reporting | Driver & Fleet Management | Operational Driver/Vehicle query | REST/HTTP |
| QRY-OPS-003 | Query | Operations & Reporting | Ride | Operational Trip query | REST/HTTP |
| QRY-OPS-004 | Query | Operations & Reporting | Fare & Payment | Payment/transaction query, including reportable amount/method/status/update time | REST/HTTP |
| QRY-OPS-005 | Query | Leadership via Client/Gateway | Operations & Reporting | Read-only operations dashboard/KPIs from Operations-owned reporting projection | Gateway REST/JSON → gRPC; FINALIZED |
| CMD-OPS-002 | Command | Operations & Reporting (OperationsSupervisor) | Ride | Cancel eligible unfinished Trip or close failed Trip as `Failed`; reason and second confirmation required | REST/HTTP synchronous; FINALIZED |

Operations must call the owner for any business-data change. It must not directly change Ride, Fleet, Customer or Payment state.

## 5.14 API / IPC Contract Catalog

Trong catalog này, Client/Gateway-facing command/query tiếp tục là public REST contract. Gateway downstream transport là gRPC nhưng không có Contract ID riêng trong 04/05; method/schema mapping được để TBD khi source hiện có chưa đủ. Tất cả cross-service synchronous entries trong catalog/matrix tiếp tục dùng REST/HTTP.

| Contract ID | Type | From | To | Purpose | Protocol |
|---|---|---|---|---|---|
| CMD-IAM-001 | Command | Client/Gateway | Identity & Access | Create Account | REST |
| CMD-IAM-004 | Command | Client/Gateway | Identity & Access | Authenticate Account | REST |
| CMD-CUS-001 | Command | Identity & Access | Customer Management | Create Customer Profile | REST |
| CMD-DFM-001 | Command | Identity & Access | Driver & Fleet Management | Create Driver Profile | REST |
| CMD-RID-001 | Command | Customer/Gateway | Ride | Request Trip | REST |
| CMD-RID-002 | Command | Authorized caller | Ride | Cancel Trip | REST |
| CMD-FP-001/002 | Command | Ride | Fare & Payment | Calculate/Finalize Fare | REST |
| CMD-FP-003 | Command | Authorized payment workflow | Fare & Payment | Initiate/Retry Payment | REST |
| CMD-RAT-001 | Command | Customer/Gateway | Rating & Review | Create Rating/Review | REST |
| CMD-OPS-002 | Command | Client/Gateway → Operations & Reporting → Ride | Supervisor Trip intervention; Gateway ingress remains REST/HTTPS/JSON, Gateway → Operations gRPC, Operations → Ride REST/HTTP | End-to-end synchronous; FINALIZED |
| QRY-IAM-001 | Query | Authorized internal caller | Identity & Access | Resolve identity/auth state | REST |
| QRY-CUS-001/002/003 | Query | Ride/Rating/Operations | Customer Management | Required Customer information | REST |
| QRY-DFM-001/002/003 | Query | Ride/Rating/Operations | Driver & Fleet Management | Matching/Driver/Vehicle information | REST |
| QRY-RID-001/002 | Query | Rating/Operations | Ride | Completion or Trip information | REST |
| QRY-FP-001/002 | Query | Ride/Operations | Fare & Payment | Fare or payment/transaction information | REST |
| QRY-OPS-001..004 | Query | Operations & Reporting | Customer/Fleet/Ride/Fare owners | Operational lookup and reporting-projection refresh inputs | REST |
| QRY-OPS-005 | Query | Leadership via Client/Gateway | Operations & Reporting | KPI dashboard projection | Gateway REST/JSON → gRPC |
| QRY-NOT-001 | Query capability | Customer/Driver via Client/Gateway | Notifications | Recipient-scoped list and persistent read-state capability | Gateway REST/JSON → gRPC; FINALIZED |

The identifiers above are stable catalog identifiers; exact endpoint paths and payload fields not determined by 04 remain OPEN. Request/response envelope is defined in 5.15-5.16. Event contracts are listed separately in 5.21.

`QRY-OPS-002/003/004` additionally support the Operations projection refresh with paginated, incremental source results: Fleet driver reference/display name/source update time; Ride trip reference, optional driver reference, requested time, status, accepted time, terminal time/source update time; Fare & Payment payment reference, optional trip reference, amount, method, status and status-updated time. These remain queries served by each source owner; Operations stores only its aggregate derived view.

## 5.15 Request Contract

REST command/query bodies use JSON. Common metadata is carried in headers where practical (`X-Request-Id`, `X-Correlation-Id`, `Idempotency-Key`, bearer token); a transport adapter may represent it in an envelope while preserving meaning. Business payload does not include database keys or internal model fields.

| Field | Type | Required | Description | Validation |
|---|---|---:|---|---|
| requestId | string | Yes | Unique request identifier for this attempt | Non-empty; unique per attempt where caller can generate it |
| correlationId | string | Yes | End-to-end workflow trace identifier | Non-empty; retain across downstream calls/events |
| idempotencyKey | string/header | Conditional | Stable key for retryable side-effect command | Required for commands listed in 5.18; scope is authenticated caller + command/operation |
| actor | identity claims | Yes for protected command/query | Authenticated user or service identity and relevant delegated context | Derived from verified token/service credential; never trust body claims alone |
| business payload | object | Yes as operation requires | Only fields needed to carry command/query intent and business references | Owner validates business rules; exact fields for several commands OPEN in 04 |

For a query, `Idempotency-Key` is not required because query must not cause side effects. Query still carries request/correlation identifiers and actor context. Credentials/passwords are sent only to Identity & Access over protected client→Gateway→Identity path and are never forwarded to other services.

## 5.16 Response Contract

Successful synchronous calls use:

```json
{
  "requestId": "req-...",
  "correlationId": "corr-...",
  "data": {},
  "error": null
}
```

Failure uses the same envelope with `data: null` and a populated `error` object from 5.17. HTTP status distinguishes transport/API outcome; `error.code` is the stable machine-readable meaning. A command response confirms the owner accepted/completed its local operation; it does not imply a cross-service transaction completed. An accepted asynchronous event is not a synchronous response to its eventual consumers.

| Outcome | HTTP mapping | Contract behavior |
|---|---:|---|
| Success | 200/201; 202 only for explicitly accepted async command | `data` contains minimal result/reference; exact status selection per endpoint |
| Business failure | 422 | Rule prevents operation, e.g. invalid lifecycle transition; no hidden side effect |
| Validation failure | 400 | Malformed or invalid request fields |
| Authentication failure | 401 | Missing/invalid caller authentication |
| Authorization failure | 403 | Authenticated actor lacks permission |
| Not found | 404 | Owner cannot find referenced business resource |
| Conflict | 409 | State conflict or idempotency key reused with different intent |
| Timeout | 504 | Synchronous dependency did not respond within deadline; outcome may be unknown for side-effect call |
| Dependency failure | 502/503 | Downstream unavailable or invalid upstream response |
| Internal error | 500 | Unexpected service failure; do not expose stack/internal detail |

## 5.17 Error Contract

```json
{
  "requestId": "req-...",
  "correlationId": "corr-...",
  "data": null,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Referenced resource was not found",
    "details": {},
    "correlationId": "corr-..."
  }
}
```

| Error Code | HTTP | Retryable | Client action |
|---|---:|---|---|
| VALIDATION_ERROR | 400 | No | Correct request fields |
| AUTHENTICATION_REQUIRED | 401 | No, until credentials refreshed | Authenticate again |
| FORBIDDEN | 403 | No | Use authorized actor or stop |
| RESOURCE_NOT_FOUND | 404 | No | Verify business reference |
| BUSINESS_RULE_VIOLATION | 422 | No unless business state/input changes | Resolve business condition |
| STATE_CONFLICT | 409 | Usually no | Refresh state; do not blindly replay |
| IDEMPOTENCY_CONFLICT | 409 | No | Use original key for identical intent or a new key for a new operation |
| RATE_LIMITED | 429 | Yes after server guidance | Respect `Retry-After` |
| DEPENDENCY_UNAVAILABLE | 503 | Conditional | Retry only if operation is idempotent/safe and within budget |
| DEPENDENCY_TIMEOUT | 504 | Conditional/unknown outcome | Query operation status or retry with same idempotency key |
| INTERNAL_ERROR | 500 | Conditional | Retry only safe/idempotent operations; report correlation ID |

`message` is safe for the caller and not a source for program logic. `details` contains only non-sensitive field/business diagnostics. Do not reveal credentials, tokens, provider secrets, stack trace or internal database identifiers.

## 5.18 Idempotency

`Idempotency-Key` is mandatory for retryable commands that can create/change business state. Scope: `(authenticated actor/service identity, contract/operation, key)`. Owner stores/reconstructs the operation result for the period needed by the workflow; retention duration is OPEN DECISION. The same key and same normalized intent returns the original outcome/reference. Same key with different intent returns `IDEMPOTENCY_CONFLICT`. Concurrent duplicates must produce at most one business effect.

| Command | Required | Duplicate behavior |
|---|---|---|
| Create Account | Yes | Return original Account reference/result; do not create another Account |
| Create Customer Profile | Yes | Return original Customer reference for same Account/intent |
| Create Driver Profile | Yes | Return original Driver reference for same Account/intent |
| Request Trip | Yes | Return original TripRequest/Trip reference; do not create a second request |
| Accept/Assign Trip | Yes | Same assignment result; reject conflicting assignment with state conflict |
| Cancel Trip | Yes | Return resulting canceled state for same command; invalid transition is business failure |
| Calculate/Finalize Fare | Yes for mutating/finalize operation; calculation query-like preview may omit | Return original finalized Fare result for same Trip/operation |
| Initiate Payment | Yes | Return same payment/transaction reference; no duplicate transaction |
| Retry Payment | Yes | Same retry attempt key returns existing attempt outcome; a new intentional retry requires a new key and source-defined retry eligibility |
| Rating submission | Yes | Return original Rating reference; prevent duplicate submission for same operation; uniqueness rule details OPEN |
| Update profile/status/availability/location | Yes when caller may retry mutation | Return current result for same operation; do not apply duplicate transition twice |
| Queries | No | No side effect; no idempotency key required |

Payment processing is explicitly non-repeatable as a business effect in 04. Retry must preserve key for transport retry; a genuinely new retry attempt is a new command only when permitted by payment workflow. Unknown timeout outcomes must be reconciled by same-key retry or owner query, never by issuing an unkeyed payment.

## 5.19 Timeout & Retry

Initial defaults below are technical design values for the đồ án and can be tuned in architecture. Retry only transient network/503/429 failures and only where idempotency or read-only semantics make replay safe. Never retry validation, auth, not-found, business-rule or state-conflict errors automatically.

| Interaction | Timeout | Retry | Max Retry | Backoff | Condition |
|---|---:|---|---:|---|---|
| Identity → Customer/Fleet profile creation | 2 s per call | Yes, same idempotency key | 2 | Exponential 200 ms, jitter | 503/network; timeout outcome reconciled with same key |
| Ride → Fleet matching queries | 1 s | Yes | 1 | 100 ms + jitter | Network/503 only; query is side-effect free |
| Ride → Customer query | 1 s | Yes | 1 | 100 ms + jitter | Network/503 only |
| Ride → Fare calculate/finalize | 2 s | Yes, same key | 1 | 200 ms + jitter | Only idempotent keyed call; do not create second finalization |
| Rating → Ride completion query | 1 s | Yes | 1 | 100 ms + jitter | Network/503 only; otherwise fail submission temporarily |
| Rating → Customer/Fleet reference queries | 1 s each | Yes | 1 | 100 ms + jitter | Network/503 only |
| Operations → owner queries | 2 s per call | Yes | 1 | 150 ms + jitter | Query only, within caller total deadline |
| Payment initiation/retry | 3 s initial request | Conditional, same key | 0 automatic payment replay; status reconciliation only | N/A | Provider outcome may be unknown; query/reconcile before a new attempt |
| Event consumer handling | 5 s processing lease/attempt target | Broker redelivery | bounded retries then DLQ | Exponential with jitter | Consumer effect idempotent; detailed limits broker OPEN |

Deadlines are per-call caps; callers must propagate an overall deadline and avoid retry amplification. Values and budget are provisional technical decision, not source business rules.

## 5.20 Event Contract

Business event envelope:

```json
{
  "eventId": "evt-...",
  "eventType": "cab.ride.trip-completed",
  "eventVersion": 1,
  "occurredAt": "2026-10-02T10:00:00Z",
  "producer": "Ride Service",
  "correlationId": "corr-...",
  "payload": {}
}
```

All fields are required. `eventId` is globally unique; `eventType` is stable reverse-DNS-like name; `eventVersion` versions payload contract; `occurredAt` is UTC ISO-8601; `producer` is service identity; `correlationId` links originating workflow. Event payload contains business references and facts, not database schema. No password, access token, payment credential or unnecessary personal data.

## 5.21 Event Catalog

Events are limited to business facts and dependencies supported in 04. `Trip request/assignment/status fact` is represented as a compact lifecycle event with `eventName` distinguishing fact; exact event taxonomy is a technical open point. No `AccountCreated`, profile-created, `TripStarted`, rating-submitted or `NotificationRequested` event is implied by this catalog.

| Event ID | Event Name | Producer | Consumers | Trigger | Payload Summary | Version |
|---|---|---|---|---|---|---:|
| EVT-RID-001 | TripLifecycleChanged | Ride Service | Notifications Service | Trip request, assignment, or status fact occurs | Trip reference, fact name/status, recipient Account references, profile references if needed | 1 |
| EVT-RID-002 | TripCompleted | Ride Service | Notifications Service; Fare & Payment candidate; Rating uses query baseline | Trip enters COMPLETED | Trip reference, Customer/Driver and recipient Account references, completion time; minimum fare input references only if agreed | 1 |
| EVT-RID-003 | TripCanceled | Ride Service | Notifications Service | Trip enters CANCELED | Trip reference, recipient Account references, cancellation time; reason only if supported | 1 |
| EVT-FP-001 | PaymentOutcomeRecorded | Fare & Payment Service | Notifications Service | Payment outcome recorded | Trip/payment and recipient Account references, outcome/status, occurred time; no payment credentials | 1 |

Fare & Payment consumption of `TripCompleted` remains explicitly candidate because 04 does not settle sync vs async or trigger. It is not an active consumer until that decision is made. Event consumers are not added merely for technical convenience.

## 5.22 Event Payload

### 5.22.1 TripLifecycleChanged

```json
{
  "eventId": "evt-...",
  "eventType": "cab.ride.trip-lifecycle-changed",
  "eventVersion": 1,
  "occurredAt": "2026-10-02T10:00:00Z",
  "producer": "Ride Service",
  "correlationId": "corr-...",
  "payload": {
    "tripReference": "trip-ref",
    "factType": "REQUESTED|ASSIGNED|STATUS_CHANGED",
    "recipientAccountReferences": ["account-ref"],
    "customerReference": "customer-ref",
    "driverReference": "driver-ref"
  }
}
```

| Field | Type | Required | Description |
|---|---|---:|---|
| tripReference | string | Yes | Ride-owned business reference |
| factType | enum/string | Yes | Which source-supported lifecycle fact occurred; values finalized with Ride contract |
| customerReference | string | Conditional | Recipient/business reference if needed by Notification |
| driverReference | string | Conditional | Assigned Driver reference if applicable |
| recipientAccountReferences | array<string> | Yes | Account references of the Customer/Driver recipients for this fact; references only, no FK |

### 5.22.2 TripCompleted

```json
{
  "eventId": "evt-...",
  "eventType": "cab.ride.trip-completed",
  "eventVersion": 1,
  "occurredAt": "2026-10-02T10:00:00Z",
  "producer": "Ride Service",
  "correlationId": "corr-...",
  "payload": {
    "tripReference": "trip-ref",
    "recipientAccountReferences": ["customer-account-ref", "driver-account-ref"],
    "customerReference": "customer-ref",
    "driverReference": "driver-ref",
    "completedAt": "2026-10-02T10:00:00Z"
  }
}
```

| Field | Type | Required | Description |
|---|---|---:|---|
| tripReference | string | Yes | Ride-owned Trip reference; Rating eligibility and potential Fare input |
| customerReference | string | Yes | Customer linked to completed Trip |
| driverReference | string | Yes | Driver linked to completed Trip |
| completedAt | string/date-time | Yes | Completion time |
| recipientAccountReferences | array<string> | Yes | Account references of the notification recipients |

Fare input details beyond Trip reference are OPEN; do not put canonical fare or pricing data into Ride event. Fare & Payment requests additional minimal data from Ride through its owner contract if needed.

### 5.22.3 TripCanceled

```json
{
  "eventId": "evt-...",
  "eventType": "cab.ride.trip-canceled",
  "eventVersion": 1,
  "occurredAt": "2026-10-02T10:00:00Z",
  "producer": "Ride Service",
  "correlationId": "corr-...",
  "payload": {
    "tripReference": "trip-ref",
    "recipientAccountReferences": ["customer-account-ref", "driver-account-ref"],
    "customerReference": "customer-ref",
    "driverReference": "driver-ref"
  }
}
```

| Field | Type | Required | Description |
|---|---|---:|---|
| tripReference | string | Yes | Ride-owned Trip reference |
| customerReference | string | Conditional | Notification recipient reference |
| driverReference | string | Conditional | Notification recipient reference if assigned |
| recipientAccountReferences | array<string> | Yes | Account references of the notification recipients |

Cancellation reason is omitted until source contract confirms purpose and allowed values.

### 5.22.4 PaymentOutcomeRecorded

```json
{
  "eventId": "evt-...",
  "eventType": "cab.fare-payment.payment-outcome-recorded",
  "eventVersion": 1,
  "occurredAt": "2026-10-02T10:00:00Z",
  "producer": "Fare & Payment Service",
  "correlationId": "corr-...",
  "payload": {
    "tripReference": "trip-ref",
    "paymentReference": "payment-ref",
    "recipientAccountReference": "account-ref",
    "outcome": "SUCCESS|FAILURE",
    "status": "owner-defined-status"
  }
}
```

| Field | Type | Required | Description |
|---|---|---:|---|
| tripReference | string | Yes when payment is trip-related | Business reference for notification context |
| paymentReference | string | Yes | Fare & Payment-owned reference, not provider secret |
| recipientAccountReference | string | Yes for trip-related notification | Authenticated recipient Account reference propagated to the payment owner; reference only |
| outcome | string | Yes | Coarse outcome used by consumer; exact status mapping OPEN |
| status | string | Yes | Payment owner status as agreed in schema; no internal provider payload |

## 5.23 Event Delivery Semantics

- **Delivery:** At-least-once. No exactly-once claim; broker plus independent service storage cannot guarantee atomic effect in this contract alone. At-most-once is unsuitable for important business facts.
- **Duplicates:** Consumer deduplicates by `eventId` and makes its local effect idempotent. Retain deduplication state for at least the broker replay/retention window; exact duration OPEN.
- **Ordering:** Preserve order per business key (`tripReference` for Ride facts; `paymentReference` for payment outcomes) where broker supports it. Consumers must validate business state and tolerate late/out-of-order events. Global ordering is not guaranteed.
- **Retry:** Transient handler failures are retried with backoff; permanent schema/business failures are not retried indefinitely.
- **Dead letter:** After bounded retries, route event to a dead-letter channel with original envelope and failure metadata; alert/inspect and replay after correction. Broker configuration and retention are architecture decisions.
- **Recovery:** Consumer replay is safe through deduplication. Producer must publish committed business facts reliably; transactional outbox or equivalent is a recommended architecture mechanism, not an implementation decision here.
- **Consumer state:** Notifications delivery failure does not reverse Trip or Payment state. Notification is not source of truth.

## 5.24 Versioning

- **REST API:** Prefix `/api/v1/...`; compatible optional response fields may be added. Removing/renaming fields, changing semantics, or making optional input required is breaking and requires `/v2` or an agreed migration.
- **Internal service-to-service IPC:** REST/HTTP uses the same major-version and compatibility rules as the external REST contract. Internal status does not waive compatibility.
- **Gateway-facing gRPC:** RPC method/message versioning and compatibility mapping remain TBD; do not derive them mechanically from `/api/v1` paths or Contract IDs.
- **Events:** Stable `eventType` plus integer `eventVersion`. Additive optional fields may remain v1; field removal, type/meaning change, or required-field change increments version. Consumers ignore unknown optional fields and reject/quarantine unsupported major versions.
- **Migration:** Deploy consumers that accept old and new versions first; then producers; monitor adoption; retire old version after all consumers migrate and retention/replay window passes. Do not dual-publish semantically duplicate facts without deduplication identity strategy.
- **Compatibility ownership:** Producer owns schema documentation; each consumer declares supported version. Schema registry choice is OPEN DECISION.

## 5.25 Authentication & Authorization

### External client → Gateway → Service

External client authenticates through Identity & Access and presents an access token to Gateway over public REST/HTTP. Gateway validates token and routes only permitted operations, then invokes the target service through gRPC. For delegated requests, propagate a verifiable token/claims context; downstream service validates identity and enforces resource/business authorization. RPC method/schema mapping and authentication context representation are TBD where contracts do not specify them. Password is sent only to Identity & Access over TLS; never pass password to profile services.

### Service → Service

Each service authenticates as its own service identity over TLS. Calls carry caller identity and correlation metadata; caller user context is propagated only when required for authorization/audit and must remain distinguishable from service identity. Target authorizes the specific contract/action (least privilege); internal network location alone is not authorization. Tokens/secrets must not appear in event payloads or logs. Credential issuance mechanism, mTLS vs signed service token, and rotation are OPEN technical decisions.

Events are accepted only from authenticated producer identity at the broker boundary; consumers authorize producer/topic and validate envelope. Broker transport encryption and credential mechanisms are decided in architecture.

## 5.26 Cross-Service Contract Matrix

This matrix is the single source of truth for baseline inter-service communication. External client calls are cataloged in service/API sections but are not inter-service edges.

| Contract | Producer | Consumer | Type | Protocol | Sync/Async | Idempotent | Auth | Version |
|---|---|---|---|---|---|---|---|---|
| CMD-CUS-001 | Identity & Access | Customer Management | Command | REST | Sync | Yes | Service identity + delegated registration context | v1 |
| CMD-DFM-001 | Identity & Access | Driver & Fleet Management | Command | REST | Sync | Yes | Service identity + delegated registration context | v1 |
| QRY-IAM-001 | Customer Management/Driver & Fleet (conditional) | Identity & Access | Query | REST | Sync | N/A | Service identity | v1 |
| QRY-CUS-001 | Ride | Customer Management | Query | REST | Sync | N/A | Service identity + caller context as needed | v1 |
| QRY-CUS-002 | Rating & Review | Customer Management | Query | REST | Sync | N/A | Service identity + caller context | v1 |
| QRY-CUS-003 | Operations & Reporting | Customer Management | Query | REST | Sync | N/A | Operations service identity + authorized actor context | v1 |
| QRY-DFM-001 | Ride | Driver & Fleet Management | Query | REST | Sync | N/A | Service identity | v1 |
| QRY-DFM-002 | Rating & Review | Driver & Fleet Management | Query | REST | Sync | N/A | Service identity + caller context | v1 |
| QRY-DFM-003 | Operations & Reporting | Driver & Fleet Management | Query | REST | Sync | N/A | Operations service identity + authorized actor context | v1 |
| CMD-RID-004 | Ride | Fare & Payment | Command | REST | Sync | Yes | Service identity | v1 |
| QRY-FP-001 | Ride | Fare & Payment | Query | REST | Sync | N/A | Service identity | v1 |
| QRY-RID-001 | Rating & Review | Ride | Query | REST | Sync | N/A | Service identity + caller context | v1 |
| QRY-RID-002 | Operations & Reporting | Ride | Query | REST | Sync | N/A | Operations service identity + authorized actor context | v1 |
| CMD-OPS-002 | Operations & Reporting | Ride | Command | REST | Sync | Yes | Operations service identity + authenticated OperationsSupervisor actor context; Staff denied (403) | v1 FINALIZED |
| QRY-FP-002 | Operations & Reporting | Fare & Payment | Query | REST | Sync | N/A | Operations service identity + authorized actor context | v1 |
| QRY-OPS-005 | Leadership via Client/Gateway | Operations & Reporting | Query | REST via Gateway → gRPC | Sync | N/A | Leadership role | v1 FINALIZED |
| QRY-NOT-001 | Customer/Driver via Client/Gateway | Notifications | Query capability (list + mark-read) | REST via Gateway → gRPC | Sync | Mark-read idempotent | Recipient identity; resource must belong to authenticated recipient | v1 FINALIZED |
| EVT-RID-001 | Ride | Notifications | Event | Kafka | Async | Consumer idempotent | Producer service identity/topic authorization | v1 |
| EVT-RID-002 | Ride | Notifications; Fare candidate | Event | Kafka | Async | Consumer idempotent | Producer service identity/topic authorization | v1 |
| EVT-RID-003 | Ride | Notifications | Event | Kafka | Async | Consumer idempotent | Producer service identity/topic authorization | v1 |
| EVT-FP-001 | Fare & Payment | Notifications | Event | Kafka | Async | Consumer idempotent | Producer service identity/topic authorization | v1 |
| EVT-FP-002 | Ride | Fare & Payment candidate | Event candidate | Kafka | Async if selected | Consumer idempotent | Producer service identity/topic authorization | v1 if selected |

## 5.27 Contract Invariants

- Ride does not own Fare, Pricing Rule, canonical calculation or finalization; it requests Fare & Payment and holds/references finalized fare only.
- Driver & Fleet owns Driver, Vehicle and VehicleType; Ride only queries/references required facts.
- Identity & Access owns Account/authentication; Customer Management or Driver & Fleet creates the corresponding profile using Account identity/reference. There is no shared owner/database.
- No service accesses another service's database or exposes internal storage model.
- Payment cannot change Trip lifecycle. Ride is the Trip lifecycle owner.
- Rating is accepted only for a Ride-owned completed Trip.
- Notifications does not become source of truth for Trip or Payment state.
- Operations & Reporting does not own source business data; changes are executed by source owner.
- `CMD-OPS-002` is synchronous: OperationsSupervisor only; Ride validates and mutates Trip; Operations records the SRS-defined audit fields. OperationsStaff receives 403. Operations has no Ride Database access and does not consume Kafka for intervention.
- Event consumers handle duplicates and do not claim exactly-once processing.
- Side-effect commands have suitable idempotency. Ordinary read-only queries have no side effects; the mark-read state transition is explicitly idempotent under the existing QRY-NOT-001 capability per the finalized SC-15 contract.
- No distributed transaction or circular synchronous call is required by baseline contracts.

## 5.28 Contract Validation

| Check | Result |
|---|---|
| Cross-service database access? | No. Contracts are REST queries/commands or events; no shared DB/table. |
| Ownership overlap? | No. Fare and VehicleType ownership are assigned to their decided owners; Notifications owns notification persistence/read state; Operations owns only its derived reporting projection, not source business data. |
| Circular dependency? | No baseline cycle. Registration is IAM→profile owner; Ride→Fleet/Fare and Ride→Notifications events; Rating→Ride query; Operations queries owners. No response path from consumer is required. |
| Command has response/error contract? | Yes for synchronous commands through common envelopes/status mapping. Async event consumption is explicitly not a command response. Exact operation payload/results remain OPEN where 04 has no detail. |
| Side-effect command idempotency? | Covered for registration, trip request/assignment/cancel, fare finalization, payment, rating and retryable mutations. |
| Event producer/consumer identified? | Yes for baseline four event types. Candidate Fare consumption of TripCompleted is explicitly not active pending decision. No consumers are invented for candidate profile/rating/delivery events. |
| Internal data exposed in events? | No schema/storage fields, credentials or unnecessary personal data; business references only. |
| Distributed monolith risk? | Synchronous edges exist where immediate owner response is needed (registration coordination, matching queries, fare response, rating eligibility). Notifications is asynchronous. Availability coupling is bounded with timeouts; no synchronous Notification callback. Matching freshness and fare timing are OPEN risks. |
| Retry can duplicate effect? | Idempotency keys used for side-effect commands; payment unknown outcome is reconciled, not blindly retried. Query/event consumer retry is safe by semantics/deduplication. |
| Security boundary? | External token via Gateway and independent service identity for internal calls/events; target authorization required. Mechanism details OPEN. |
| Versioning strategy? | REST major path and event version/compatibility migration defined. |
| Conflict with 04? | No ownership/boundary conflict identified. Exact lower-level payload constraints, fare trigger/sync-vs-async, notification retention and delivery retry tuning, and refresh batch/retry tuning remain open. QRY-NOT-001, QRY-OPS-005, SC-15 read behavior, and SC-20 KPI definitions/data path are finalized. CMD-OPS-002 is finalized by SRS 18.2–18.4; intervention audit internal schema detail remains open only where it exceeds SRS-defined fields. |

### Conflict / Open Decision

Không phát hiện mâu thuẫn cần thay đổi 04. Các chi tiết technical còn mở được ghi rõ ở 5.29; các candidate event/command không được trình bày thành business fact đã được chốt. Không phát `AccountCreated` vì 04 xác định registration coordination bằng lệnh tạo profile sau Create Account và ghi rõ không có registration event đã chốt. `CMD-OPS-002` is the finalized synchronous command exception; no intervention event is introduced.

## 5.29 Open Technical Decisions

| Decision | Current Decision | Reason | Impact | Status |
|---|---|---|---|---|
| Broker product (Kafka/RabbitMQ) | Apache Kafka theo TAD trong 06; local single-node KRaft | Runtime broker đã được chọn tại 06 | Deployment, routing, replay, DLQ configuration | Chốt tại 06 |
| Kafka topic names | Dùng topic mapping đã xác định trong 06 cho bốn baseline events | Runtime routes/topics đã có trong 06 | Producer/consumer binding | Chốt tại 06; event payload/semantics vẫn theo 05 |
| Gateway gRPC RPC mapping | Gateway downstream dùng gRPC; RPC method/schema chưa đủ căn cứ để định nghĩa | Không tự suy RPC từ REST path hoặc thêm Contract ID | Gateway/service handler generation và compatibility | TBD |
| Fare trigger and interaction timing | Ride gọi Calculate/Finalize đồng bộ; Fare consume TripCompleted chỉ là candidate | 04 chưa chốt timing hoặc sync/async | Fare readiness, Trip completion latency, recovery | OPEN |
| Timeout/retry tuning | Dùng initial defaults ở 5.19, cần xác nhận theo runtime | Chưa có latency/SLO baseline | End-to-end deadline and load behavior | OPEN |
| Service authentication mechanism | Require service identity + TLS; mTLS vs signed token undecided | Credential/infrastructure choice thuộc architecture | Identity issuance, rotation, trust config | OPEN |
| Idempotency retention/key format | Scope and semantics defined; exact key format/retention undecided | Depends on operation/replay windows | Storage/duplicate window | OPEN |
| Event schema registry | Version field and compatibility rules defined; registry choice undecided | Tooling depends on broker/scale | Validation and schema publication | OPEN |
| Event retention and DLQ retention | At-least-once, retry/DLQ semantics defined; durations undecided | Operational recovery needs runtime sizing | Replay horizon and storage | OPEN |
| Registration partial failure recovery | IAM creates Account then profile owner command; no distributed rollback | 04 does not define compensation | Orphan Account handling/support workflow | OPEN |
| Notification retention and delivery retry tuning | Notification service owns persistent Notification and `isRead`; QRY-NOT-001 listing/mark-read finalized | SRS 12.3.12 and SC-15; 04/06 | Retention and delivery retry configuration only | OPEN implementation detail |
| Reporting refresh tuning | Operations-owned projection, source queries, KPI formulas, API, one-minute refresh and five-minute stale threshold finalized | SRS UC-37/BR-14 and SC-20; 04/06 | Pagination batch size, backoff and refresh retry only | OPEN implementation detail |
| CMD-OPS-002 Trip intervention | Ride validates and updates Trip; Operations records audit; Staff denied, Supervisor permitted for the two SRS actions | SRS 18.2–18.4, AC-171–AC-175 | Synchronous REST/HTTP command; audit records actorAccountId, role, action, entityType, entityId, reason, before/after, createdAt and correlationId | FINALIZED; only internal persistence representation OPEN |
| Payload details/status taxonomy | References/minimal fields selected; exact field constraints and business status values need source-owner confirmation | 04 marks exact schemas/statuses unspecified | Validation and consumer compatibility | OPEN |

## 5.30 Handoff to Microservice Architecture

Tài liệu này đã xác định:

- Service-to-service communication và communication matrix.
- API/IPC contract catalog, tách command, query và event.
- Request/response envelope và error handling.
- Idempotency cho side-effect command.
- Timeout/retry policy ban đầu.
- Event envelope, catalog, payload và delivery semantics.
- API/IPC/event versioning.
- External và service-to-service security boundary.

Bước tiếp theo là thiết kế `03_System_Architecture.md`, sử dụng contract này để xác định runtime architecture, service deployment/instances, API Gateway, broker, network, infrastructure, observability và health/readiness. Các OPEN DECISION trong 5.29 là đầu vào cho bước đó; không thay đổi ba business decision và ownership đã chốt trong `03_System_Architecture.md`.

## Contract ID Consistency Check

- CMD-IAM-002: Removed
- CMD-IAM-003: Removed
- CMD-CUS-001: Unique – Create Customer Profile
- CMD-DFM-001: Unique – Create Driver Profile
- Các Contract ID còn lại: không bị thay đổi.
