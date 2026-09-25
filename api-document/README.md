# CAB System API Document

## 1. Baseline

API Document này theo SRS hiện hành trong workspace, gồm baseline điều chỉnh 1.1.0 tại Chương 18. SRS là nguồn chuẩn cho nghiệp vụ, dữ liệu, trạng thái và quyền; API contract và `test-case/TRACEABILITY.md` truy xuất các yêu cầu tương ứng.

## 2. Authentication

- `POST /api/v1/auth/register` — UC-01
- `POST /api/v1/auth/login` — UC-02
- Login sử dụng `Account.PhoneNumber` và password.
- API yêu cầu xác thực sử dụng Bearer JWT.

## 3. Customer

| Method | Endpoint | Role | UC |
|---|---|---|---|
| POST | `/customers` | OperationsStaff | UC-23 |
| GET | `/customers` | OperationsStaff | UC-24 |
| GET | `/customers/{customerId}` | Customer, OperationsStaff | UC-03, UC-24 |
| PUT | `/customers/{customerId}` | Customer, OperationsStaff | UC-03, UC-25 |
| DELETE | `/customers/{customerId}` | OperationsStaff | UC-26 |

Delete là logical delete.

## 4. Driver

| Method | Endpoint | Role | UC |
|---|---|---|---|
| POST | `/drivers` | OperationsStaff | UC-27 |
| GET | `/drivers` | OperationsStaff | UC-28 |
| GET | `/drivers/{driverId}` | Driver, OperationsStaff | UC-04, UC-28 |
| PUT | `/drivers/{driverId}` | Driver, OperationsStaff | UC-04, UC-29 |
| DELETE | `/drivers/{driverId}` | OperationsStaff | UC-30 |
| PATCH | `/drivers/{driverId}/availability` | Driver | UC-06 |
| PUT | `/drivers/{driverId}/location` | Driver | UC-15 |

## 5. Vehicle

| Method | Endpoint | Role | UC |
|---|---|---|---|
| POST | `/vehicles` | OperationsStaff | UC-31 |
| GET | `/vehicles` | OperationsStaff | UC-32 |
| GET | `/vehicles/{vehicleId}` | Driver, OperationsStaff | UC-05, UC-32 |
| PUT | `/vehicles/{vehicleId}` | Driver, OperationsStaff | UC-05, UC-33 |
| DELETE | `/vehicles/{vehicleId}` | OperationsStaff | UC-34 |

VehicleType: `Xe máy`, `Ô tô 4 chỗ`, `Ô tô 7 chỗ`.

## 6. TripRequest / DriverAssignment / Trip

Flow:

`Customer → TripRequest → DriverAssignment → Driver response → Trip`

TripRequest status: `Searching`, `Assigned`, `Cancelled`, `NoDriverFound`.
DriverAssignment status: `Pending`, `Accepted`, `Rejected`, `Timeout`.
Trip status: `Arrived`, `PickedUp`, `InProgress`, `Completed`, `Cancelled`.

| Method | Endpoint | Role | UC |
|---|---|---|---|
| POST | `/trip-requests` | Customer | UC-07 |
| GET | `/trip-requests/{tripRequestId}` | Customer, OperationsStaff | UC-07, UC-14, UC-35 |
| POST | `/trip-requests/{tripRequestId}/cancel` | Customer | UC-12 |
| GET | `/driver-assignments/{assignmentId}` | Driver | UC-09, UC-10 |
| POST | `/driver-assignments/{assignmentId}/accept` | Driver | UC-10 |
| POST | `/driver-assignments/{assignmentId}/reject` | Driver | UC-09 |
| GET | `/trips` | Customer, OperationsStaff | UC-14, UC-35 |
| GET | `/trips/{tripId}` | Customer, OperationsStaff | UC-14, UC-35 |
| PATCH | `/trips/{tripId}/status` | Driver | UC-13 |
| POST | `/trips/{tripId}/cancel` | Customer | UC-12 |
| GET | `/trips/{tripId}/track` | Customer, OperationsStaff | UC-14, UC-35 |
| GET | `/trips/{tripId}/driver-location` | Customer | UC-16 |
| GET | `/trips/{tripId}/fare` | Customer | UC-17 |
| POST | `/trips/{tripId}/rating` | Customer | UC-22 |

Thiết kế nhận chuyến được thực hiện thông qua resource `DriverAssignment`.

## 7. Fare

`TotalFare = BaseFare + (DistanceKm × PricePerKm)`; DistanceKm được làm tròn đến 0,1 km.

| VehicleType | BaseFare | PricePerKm |
|---|---:|---:|
| Xe máy | 10.000 | 8.000 |
| Ô tô 4 chỗ | 15.000 | 12.000 |
| Ô tô 7 chỗ | 20.000 | 14.000 |

Không áp dụng phụ phí theo giờ cao điểm, thời tiết, khu vực hoặc điều kiện đặc biệt.

## 8. Payment

| Method | Endpoint | UC |
|---|---|---|
| POST | `/payments/quote` | UC-17 |
| POST | `/payments` | UC-18, UC-19 |
| GET | `/payments/{paymentId}` | UC-18, UC-19, UC-20, UC-36 |
| POST | `/payments/{paymentId}/retry` | UC-20 |
| POST | `/payments/webhook` | UC-19, UC-20 |

Payment method: `Cash`, `Electronic`. Electronic dùng VNPAY Sandbox. Retry tối đa 3 lần sau lần đầu, tổng cộng tối đa 4 attempts.

## 9. Notification

Notification chỉ sử dụng in-app. Schema gồm `notificationId`, `accountId`, `tripId`, `title`, `content`, `isRead`, `createdAt`.

## 10. Operations / Leadership

| Method | Endpoint | Role | UC |
|---|---|---|---|
| GET | `/operations/transactions` | OperationsStaff | UC-36 |
| GET | `/operations/dashboard` | Leadership | UC-37 |

Transaction filters: `paymentId`, `tripId`, `customerId`, `paymentMethod`, `paymentStatus`, `createdFrom`, `createdTo`.

## 11. UC Coverage

| UC | API coverage |
|---|---|
| UC-01 | POST /auth/register |
| UC-02 | POST /auth/login |
| UC-03 | GET/PUT /customers/{customerId} |
| UC-04 | GET/PUT /drivers/{driverId} |
| UC-05 | GET/PUT /vehicles/{vehicleId} |
| UC-06 | PATCH /drivers/{driverId}/availability |
| UC-07 | POST /trip-requests |
| UC-08 | Internal service flow |
| UC-09 | DriverAssignment GET/Reject |
| UC-10 | DriverAssignment Accept |
| UC-11 | Internal service flow + notification |
| UC-12 | TripRequest/Trip cancel |
| UC-13 | PATCH /trips/{tripId}/status |
| UC-14 | Trip GET/track |
| UC-15 | PUT /drivers/{driverId}/location |
| UC-16 | GET /trips/{tripId}/driver-location |
| UC-17 | POST /payments/quote + GET /trips/{tripId}/fare |
| UC-18 | POST /payments |
| UC-19 | POST /payments + webhook |
| UC-20 | POST /payments/{paymentId}/retry |
| UC-21 | Notifications |
| UC-22 | POST /trips/{tripId}/rating |
| UC-23–UC-34 | Customer/Driver/Vehicle CRUD |
| UC-35 | Trip monitoring |
| UC-36 | GET /operations/transactions |
| UC-37 | GET /operations/dashboard |

UC-08, UC-09 (gửi request), UC-11 và UC-21 có các bước hệ thống nội bộ; API Document chỉ công khai các thao tác cần actor gọi trực tiếp.

## 12. Validation

- Trip, TripRequest và DriverAssignment sử dụng các status riêng theo SRS.
- VehicleType chỉ gồm ba loại được SRS xác định.
- ID dùng integer.
- JSON dùng camelCase.
- Customer/Driver/Vehicle DELETE là logical delete.
- Bundle được sinh lại từ `openapi.yaml`.


## 13. Baseline 1.1.0 — Real-time, approvals and operations

- Driver self-registration: `POST /auth/register-driver`; Staff-created Driver uses `POST /drivers` and server creates Account and Driver together. Initial state is `PendingApproval` and `Unavailable`. OperationsStaff or OperationsSupervisor approves/rejects via `PATCH /drivers/{driverId}/approval`; rejection requires a reason.
- Driver location cadence: every 5 seconds while approaching pickup, every 10–15 seconds during a trip, and immediately on trip status changes. Ride service recalculates estimated ETA using an external routing provider. Provider selection, quota, cost and SLA remain deployment decisions.
- `POST /trips/{tripId}/realtime-ticket` issues a single-trip ticket expiring in 60 seconds. Client connects to returned WebSocket URL using the ticket. Event names: `trip.location.updated`, `trip.eta.updated`, `trip.status.updated`; payload schema is `TripLiveUpdate`. Client reconnects and falls back to `GET /trips/{tripId}/driver-location` every 10 seconds. Location is stale after 30 seconds without a fresh position.
- Live event fields: `tripId`, `status`, nullable `latitude`/`longitude`, nullable `etaMinutes`, `updatedAt`, `stale`. Events are only sent to trip participants and authorized operations roles. Stop sharing on cancellation or completion.
- `OperationsStaff` manages profiles, monitors trips, adds support notes and looks up transactions. `OperationsSupervisor` can also cancel/close a trip using the intervention endpoint, with reason, second confirmation and audit. Neither may directly edit finalized fare or payment history.
- Driver availability is changed only through `PATCH /drivers/{driverId}/availability`; profile update does not accept `availabilityStatus`. The service must reject `Available` unless the Driver is approved.
- `POST /payments` takes `tripId` and `paymentMethod`; server derives amount from finalized fare. VNPAY webhook signature verification and idempotency by provider reference are mandatory implementation controls.
- Coursework performance profile: 100 concurrent virtual users, at least 20 trip requests/minute for 10 minutes; ordinary API p95 <2 s, create TripRequest p95 <3 s excluding matching/driver response, live update p95 <=10 s from server receipt to client. These are test targets, not production guarantees.

WebSocket is not an ordinary OpenAPI HTTP operation. Ticket issuance is in OpenAPI; event contract is in `docs/realtime.md`.

New baseline requirement IDs BR-19–BR-23, FR-34–FR-38, NFR-12–NFR-13 and GOV-01 are defined in SRS Chapter 18.8. API operations carry `x-baseline-requirements` metadata where applicable.
