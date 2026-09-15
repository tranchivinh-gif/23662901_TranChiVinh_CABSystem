# Xác thực

`POST /auth/register` và `POST /auth/login` là public. Các endpoint khác yêu cầu `Authorization: Bearer <accessToken>`.

JWT thiếu hoặc không hợp lệ trả `401`; JWT hợp lệ nhưng không đủ quyền trả `403`. SRS chưa chốt refresh token, logout, xác minh email/số điện thoại, password policy, token lifetime và key rotation; vì vậy không có endpoint tương ứng.
