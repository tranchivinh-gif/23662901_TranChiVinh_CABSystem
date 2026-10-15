# CAB OpenAPI — FINAL/LOCKED 1.0.4

## 1. Mục đích

Đây là **baseline API đã chốt** của CAB System. Bản 1.0.4 **không thêm, bớt hoặc đổi wire contract** so với bộ API 1.0.3; chỉ refactor cách tổ chức file để dễ đọc, dễ code và tránh hiểu nhầm rằng 7 microservice expose REST public riêng.

**Nguyên tắc đọc duy nhất:**

```text
Customer App / Driver App / Admin Web
                |
                | REST / HTTPS / JSON
                v
           API Gateway
                |
                | gRPC đồng bộ
                v
        7 business services

Kafka được dùng cho luồng bất đồng bộ/event.
```

`contracts/openapi/openapi.yaml` là **file OpenAPI gốc và là public contract duy nhất**. Các file bên dưới `paths/` và `components/` chỉ là phần được `$ref` từ file gốc để chia nhỏ tài liệu; chúng **không phải API public độc lập**.

## 2. Cấu trúc

```text
CAB_OpenAPI_Final_1.0.4/
├─ README.md
└─ contracts/
   └─ openapi/
      ├─ openapi.yaml                 # file bắt đầu đọc/import
      ├─ paths/
      │  ├─ health.yaml
      │  ├─ auth.yaml
      │  ├─ customers.yaml
      │  ├─ drivers.yaml
      │  ├─ bookings.yaml
      │  ├─ driver-offers.yaml
      │  ├─ trips.yaml
      │  ├─ payments.yaml
      │  └─ admin.yaml
      └─ components/
         ├─ security.yaml
         ├─ parameters.yaml
         ├─ responses.yaml
         ├─ headers.yaml
         └─ schemas/
            ├─ common.yaml
            ├─ health.yaml
            ├─ auth.yaml
            ├─ customer.yaml
            ├─ driver.yaml
            ├─ booking.yaml
            ├─ trip.yaml
            ├─ payment.yaml
            └─ admin.yaml
```

## 3. Cách hiểu `paths/`

Các file trong `paths/` chỉ chia public Gateway API theo nhóm nghiệp vụ:

| File | Public paths chính | Service owner chính phía sau Gateway |
|---|---|---|
| `health.yaml` | `/health`, `/ready`, `/health/services` | API Gateway / aggregate health |
| `auth.yaml` | `/auth/**` | `identity-account-service` |
| `customers.yaml` | `/customers/**` (profile) | `customer-service` |
| `drivers.yaml` | `/drivers/**` | `driver-service` |
| `bookings.yaml` | `/bookings`, `/service-types`, `/fares/estimate`, customer booking lookup | `booking-service` |
| `driver-offers.yaml` | `/driver-offers/**` | `booking-service` |
| `trips.yaml` | `/trips/**` lifecycle/rating/cancel | `trip-service` |
| `payments.yaml` | `/payments/**`, payment webhook, trip payment endpoints | `payment-service` |
| `admin.yaml` | `/admin/**` | Gateway route theo authority tương ứng; không có `admin-service` |

Lưu ý quan trọng:

- `driver-offers/**` thuộc **`booking-service`**, không thuộc `driver-service`.
- Matching, timeout, redispatch và fare vẫn thuộc **`booking-service`**; không tạo `dispatch-service` hay `pricing-service`.
- Current location thuộc **`driver-service`**; không tạo `location-service`.
- `notification-service` không có public REST CRUD trong baseline này; service nhận event qua Kafka và xử lý Push/In-app.
- `/admin/**` là **surface dành cho Staff/Admin ở Gateway**, không đồng nghĩa tồn tại `admin-service`.

## 4. Cách hiểu `components/`

`components/` chỉ chứa phần dùng lại của OpenAPI:

- `schemas/`: request/response model.
- `parameters.yaml`: query/header parameter dùng chung.
- `responses.yaml`: error response dùng chung.
- `headers.yaml`: response header dùng chung.
- `security.yaml`: `bearerAuth`.

Việc một schema nằm trong `schemas/booking.yaml` hoặc `schemas/admin.yaml` chỉ để dễ tìm, **không quyết định network boundary**.

## 5. Trạng thái baseline

- Version: **1.0.4**.
- Trạng thái: **FINAL / LOCKED**.
- Public paths: **62**.
- Operations: **64**.
- Không còn file issue tracker trong package này; các API được coi là đã chốt.
- Không còn 7 file OpenAPI theo microservice.
- Khi phát triển hoặc test public API, bắt đầu từ **`contracts/openapi/openapi.yaml`**.
- Internal service contract gRPC thuộc `contracts/proto/` của source code và không được mô tả như REST public trong bộ này.
