# Xác thực

- Đăng ký khách hàng: `POST /api/v1/auth/register`.
- Đăng nhập: `POST /api/v1/auth/login` bằng `phoneNumber` và `password`.
- API yêu cầu đăng nhập sử dụng `Authorization: Bearer <JWT>`.
- `Account.PhoneNumber` là nguồn đăng nhập chính và phải duy nhất.

- Driver self-registration: `POST /api/v1/auth/register-driver`; new profile is `PendingApproval`/`Unavailable` until OperationsStaff/Supervisor approval.
- `OperationsSupervisor` is a separate role and cannot be assigned by public registration.
