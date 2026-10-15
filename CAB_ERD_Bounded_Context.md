# CAB SYSTEM

## ERD & BOUNDED CONTEXT — FINAL BASELINE

> **Trạng thái:** FINAL  
> **Phạm vi:** P1 – 7 tuần  
> **Nguồn chốt:** `srs_baseline_1.0.1(7).md` + `mcroservice_design_final(6).md`  
> **Mục đích:** Baseline ngắn gọn để Dev/QA/BA thống nhất ownership, database, entity/table và quan hệ ERD.

---

# 1. Nguyên tắc khóa

1. P1 có đúng **7 business service** và **7 PostgreSQL database**.
2. **Database per service**: service chỉ đọc/ghi DB mình sở hữu.
3. Không FK hoặc JOIN xuyên database.
4. ID xuyên bounded context là **REF logic**; trao đổi qua gRPC/Kafka.
5. `booking-service` sở hữu booking, matching, offer/timeout/redispatch và fare calculation.
6. `driver-service` sở hữu Driver, vehicle, availability và current location.
7. `trip-service` sở hữu Trip state machine, cancellation/no-show, rating và fare snapshot.
8. `payment-service` sở hữu Payment; `notification-service` sở hữu Push/In-app delivery.
9. Không tạo thêm `dispatch-service`, `pricing-service`, `location-service`, `reporting-service` trong P1.
10. Service phát Kafka event phải dùng **Transactional Outbox**; consumer phải idempotent theo `eventId`.

### Quy ước ERD

| Ký hiệu | Ý nghĩa                                                           |
| ------- | ----------------------------------------------------------------- |
| `PK`    | Primary Key trong DB của service sở hữu                           |
| `FK`    | Foreign Key nội bộ cùng DB/service                                |
| `REF`   | ID tham chiếu logic sang bounded context khác; không phải FK      |
| `TECH`  | Bảng kỹ thuật như `outbox_events`; không tạo business context mới |

---

# 2. Bounded Context FINAL

| #   | Bounded Context   | Service                    | Database              | Bảng chính                                                                                                                                  |
| --- | ----------------- | -------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Identity & Access | `identity-account-service` | `identity-account-db` | `accounts`, `roles`, `permissions`, `role_permissions`, `refresh_sessions`, `otp_verifications`, `audit_events`                             |
| 2   | Customer          | `customer-service`         | `customer-db`         | `customers`, `customer_profile_history`                                                                                                     |
| 3   | Driver            | `driver-service`           | `driver-db`           | `drivers`, `vehicles`, `driver_documents`, `driver_availability`, `driver_current_location`, `driver_location_history`                      |
| 4   | Booking           | `booking-service`          | `booking-db`          | `bookings`, `driver_offers`, `driver_reservations`, `service_types`, `fare_rules`, `fare_calculations`, `booking_policies`, `outbox_events` |
| 5   | Trip              | `trip-service`             | `trip-db`             | `trips`, `trip_status_history`, `trip_cancellations`, `ratings`, `trip_fare_snapshot`, `outbox_events` (TECH)                               |
| 6   | Payment           | `payment-service`          | `payment-db`          | `payments`, `payment_attempts`, `provider_callbacks`, `outbox_events`                                                                       |
| 7   | Notification      | `notification-service`     | `notification-db`     | `notifications`, `notification_templates`, `notification_attempts`, `outbox_events`                                                         |

> `driver-service` cũng phải có `outbox_events` (TECH) khi phát Driver domain event. Các service khác nếu phát Kafka event thì áp dụng cùng quy tắc outbox, nhưng không vì vậy tạo thêm business entity/bounded context.

---

# 3. ERD logic tổng thể

```mermaid
flowchart LR
    ID[Identity & Access\nidentity-account-db]
    CU[Customer\ncustomer-db]
    DR[Driver\ndriver-db]
    BK[Booking\nbooking-db]
    TR[Trip\ntrip-db]
    PA[Payment\npayment-db]
    NO[Notification\nnotification-db]

    CU -. account_id REF .-> ID
    DR -. account_id REF .-> ID

    BK -. customer_id REF .-> CU
    BK -. driver_id / offer.driver_id REF .-> DR

    TR -. booking_id REF .-> BK
    TR -. customer_id REF .-> CU
    TR -. driver_id REF .-> DR

    PA -. trip_id REF .-> TR
    NO -. recipient REF .-> ID
```

**Chốt:** các đường nét đứt trên là **REF logic**, không tạo FK vật lý xuyên DB.

---

# 4. ERD theo từng context

## 4.1 Identity & Access

```text
roles 1 --- * accounts
roles * --- * permissions   (qua role_permissions)
accounts 1 --- * refresh_sessions
accounts 1 --- * audit_events   (actor/reference logic tùy event)
otp_verifications có thể tồn tại trước khi Account được tạo
```

**Ownership:** OTP, login/logout, JWT/refresh session, RBAC, account lifecycle, centralized audit P1.

**Ràng buộc:**

- Password chỉ lưu one-way hash.
- Customer/Driver profile không nằm trong DB này.
- Audit append-only.

---

## 4.2 Customer

```text
customers 1 --- * customer_profile_history
customers.account_id -. REF .-> identity accounts
```

**Ownership:** Customer profile và profile history.

**Chốt:** login identity/SĐT dùng để xác thực thuộc `identity-account-service`. Nếu Customer giữ bản copy SĐT cho profile/hiển thị thì đó không phải identity authority.

---

## 4.3 Driver

```text
drivers 1 --- * vehicles
drivers 1 --- * driver_documents
drivers 1 --- 0..1 driver_availability
drivers 1 --- 0..1 driver_current_location
drivers 1 --- * driver_location_history
drivers.account_id -. REF .-> identity accounts
```

**Ownership:** Driver profile, vehicle, documents, approval, availability, current/history location.

### Geo physical baseline

```sql
current_location geography(Point, 4326)
```

- Dùng GiST index.
- Heartbeat/location mỗi **10 giây** khi `Available`/`Busy`.
- Location quá **30 giây** là stale và không dùng matching.
- Location history retention: **90 ngày**.
- Matching dùng bán kính **5 km**.
- Endpoint grading `radiusKm=1` không thay thế matching policy 5 km.

---

## 4.4 Booking

```text
service_types 1 --- * bookings
service_types 1 --- * fare_rules
bookings 1 --- * driver_offers
bookings 1 --- * driver_reservations
bookings 1 --- * fare_calculations

bookings.customer_id -. REF .-> customers
bookings.driver_id -. REF .-> drivers
driver_offers.driver_id -. REF .-> drivers
driver_reservations.driver_id -. REF .-> drivers
```

**Ownership:** Booking, matching, sequential offer, timeout/redispatch, service type, fare estimate/final calculation, Map/Geo adapter.

### Matching baseline

| Rule                |              Giá trị |
| ------------------- | -------------------: |
| Search radius       |                 5 km |
| Max candidates/vòng |                   10 |
| Offer timeout       |       60 giây/Driver |
| Total search time   |             120 giây |
| Strategy            |           Sequential |
| Radius expansion    |                Không |
| Ranking             | Khoảng cách tăng dần |
| Tie-break           |    Available sớm hơn |

### Fare baseline

```text
FinalFare = BaseFare + (DistanceKm × PricePerKm) + Surcharge
```

- Không per-minute.
- Không minimum fare P1.
- Fare rule có version.
- Trip giữ snapshot fare rule.

### Booking ↔ Trip

**Chốt chiều chuẩn:**

```text
Trip.booking_id -. REF .-> Booking
```

`Booking.trip_id` **không phải field bắt buộc của physical baseline**. Không tạo vòng tham chiếu hai chiều nếu không có nhu cầu projection riêng.

---

## 4.5 Trip

```text
trips 1 --- * trip_status_history
trips 1 --- 0..1 trip_cancellations
trips 1 --- 0..1 ratings
trips 1 --- 1 trip_fare_snapshot

trips.booking_id -. REF .-> bookings
trips.customer_id -. REF .-> customers
trips.driver_id -. REF .-> drivers
```

**Ownership:** Trip lifecycle/state machine, cancellation/no-show, trip history, rating Customer → Driver, fare snapshot.

### State baseline

```text
Searching
  -> DriverAssigned
  -> DriverArrived
  -> PickedUp
  -> InProgress
  -> Completed
```

Nhánh kết thúc/ngoại lệ: `NoDriverFound`, `Cancelled`, `Failed` theo rule đã chốt.

**Chốt:**

- Tối đa 1 rating/Trip.
- `trip_fare_snapshot` giữ fare rule/version snapshot và cờ `estimated` khi final distance dùng fallback.
- `trip-service` là Kafka producer nên có `outbox_events` TECH.

---

## 4.6 Payment

```text
payments 1 --- * payment_attempts
payments 1 --- * provider_callbacks
payments.trip_id -. REF .-> trips
```

**Ownership:** Cash/Electronic Payment, provider adapter, webhook/callback, retry và payment status.

**Ràng buộc:**

- Payment chỉ tạo sau Trip `Completed`.
- Electronic retry tối đa **3 lần/24 giờ**.
- Không tự chuyển Electronic → Cash khi thất bại.
- Không lưu PAN/CVV.
- Callback phải verify signature, amount/reference và chống replay/idempotency.
- Payment/transaction retention: **5 năm**.

---

## 4.7 Notification

```text
notification_templates 1 --- * notifications
notifications 1 --- * notification_attempts
notifications.recipient_id -. REF .-> recipient logical identity
```

**Ownership:** Push + In-app notification, template, delivery attempt, retry/DeadLetter.

**Ràng buộc:**

- Retry tối đa **3 lần**.
- Hết retry → `DeadLetter` + cảnh báo Admin.
- Notification failure không rollback Booking/Trip/Payment.
- Retention: **90 ngày**.
- Recipient chỉ là logical reference; không FK xuyên DB.

---

# 5. Cross-service REF FINAL

| Reference                        | Hướng                             | Loại |
| -------------------------------- | --------------------------------- | ---- |
| `Customer.account_id`            | Customer → Identity               | REF  |
| `Driver.account_id`              | Driver → Identity                 | REF  |
| `Booking.customer_id`            | Booking → Customer                | REF  |
| `Booking.driver_id`              | Booking → Driver                  | REF  |
| `DriverOffer.driver_id`          | Booking → Driver                  | REF  |
| `DriverReservation.driver_id`    | Booking → Driver                  | REF  |
| `Trip.booking_id`                | Trip → Booking                    | REF  |
| `Trip.customer_id`               | Trip → Customer                   | REF  |
| `Trip.driver_id`                 | Trip → Driver                     | REF  |
| `Payment.trip_id`                | Payment → Trip                    | REF  |
| Rating customer/driver IDs       | Trip → Customer/Driver            | REF  |
| Notification recipient reference | Notification → recipient identity | REF  |

**Không reference nào trong bảng này được triển khai thành cross-database FK.**

---

# 6. Các quyết định ERD cuối cùng

| #   | Quyết định đã chốt                                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Driver current location dùng **PostgreSQL + PostGIS `geography(Point,4326)` + GiST**.                                                            |
| 2   | Quan hệ Booking–Trip chuẩn là **`Trip.booking_id` REF → Booking**; `Booking.trip_id` không bắt buộc.                                             |
| 3   | `trip-service` và `driver-service` phải có **Transactional Outbox** khi phát Kafka event.                                                        |
| 4   | Mọi cross-context relation là **logical REF**, không FK/join xuyên DB.                                                                           |
| 5   | Booking sở hữu matching/fare; Trip sở hữu cancellation/no-show/state machine; không trộn authority.                                              |
| 6   | Identity sở hữu login/account; Customer/Driver chỉ sở hữu profile/domain data.                                                                   |
| 7   | Fare rule phải versioned; Trip giữ fare snapshot.                                                                                                |
| 8   | Physical field length, tên index/constraint, UUID strategy và các chi tiết DDL chưa được SRS/Design khóa **không được tự coi là business rule**. |

---

# 7. Kết luận FINAL

ERD P1 của CAB System được khóa theo **7 bounded context / 7 business service / 7 database**:

```text
Identity & Access
Customer
Driver
Booking
Trip
Payment
Notification
```

Mỗi context sở hữu dữ liệu của mình. Quan hệ xuyên context chỉ dùng **ID logic + gRPC/Kafka**. Không có shared database, cross-service FK hoặc cross-service JOIN.

Tài liệu này là **baseline ERD & Bounded Context cuối cùng** để tiếp tục thiết kế migration/DDL, repository/entity và kiểm thử data ownership. Khi chi tiết implementation chưa được tài liệu này/SRS/Microservice Design khóa, không được tự suy diễn thành business requirement mới.
