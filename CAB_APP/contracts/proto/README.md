# Internal gRPC contracts

CP-02 có `common.proto` và 7 proto theo context: identity/customer/driver/booking/trip/payment/notification, package `cab.<context>.v1`. Đây là internal contract skeleton cho các luồng chính; thêm field/RPC tương thích ở checkpoint nghiệp vụ, giữ field numbers đã có.

`common.proto` định nghĩa internal health, error envelope, page request/meta, geo và money decimal string. Public error/page shape giữ theo OpenAPI. Proto có optional page/limit để phân biệt giá trị thiếu và zero; int64 load thành string để tránh mất chính xác trong JavaScript. Default pagination 0/10, limit 1..100 sẽ áp dụng trong domain tại checkpoint tương ứng.

Load bằng `@grpc/proto-loader`: camelCase, longs String, enums String, defaults/oneofs true. Gateway và từng service load `.proto` trực tiếp; không có generated Java/TypeScript hoặc shared domain/entity/repository. CP-06 đã triển khai Identity Customer-auth và Customer.CreateProfile; các business RPC khác còn `UNIMPLEMENTED`.

`cab.common.v1.InternalHealth/Check` đo process liveness (`SERVING`) và readiness của owning DB/migration ledger (CP-05). `ready=false` khi DB lỗi, ledger thiếu migration 1/2 hoặc probe vượt 400 ms. Không đọc DB service khác. Truyền/echo UUID ở metadata `x-correlation-id` và response correlationId; ID thiếu được sinh bằng randomUUID, ID sai trả INVALID_ARGUMENT. Gateway health call deadline 500 ms; aggregate kiểm tra tên service/correlation/status trước khi chấp nhận ready.

CP-06 append optional/defaulted fields, giữ nguyên field numbers trước đó: VerifyOtpRequest phone/purpose, RegisterRequest email, TokenPair accountId/role/refreshExpiresIn, CreateProfileRequest email. Public phoneNumber/registrationContext được chuyển ở Gateway adapter; proto không định nghĩa public wire shape. Identity health yêu cầu migration 3. Metadata authorization dùng access JWT cho logout và audience/scope riêng cho service CreateProfile, luôn cùng correlation/deadline của request.

CP13 bổ sung InternalHealth.EventMetrics; Identity IssueNotificationToken và
ListNotificationOperators; Customer/Driver ResolveAccount; Notification fields
channel/title/body/contentJson/readAt/createdAt/correlationId/eventId. Notification
get/list/mark chỉ đọc InApp của actor; internal resolver cần RS256 capability riêng,
không nhận public access JWT. PageRequest giữ default page=0/limit=10.
Health owning schema hiện yêu cầu Identity 1..10, Customer 1..3, Driver/Booking/Trip/
Payment 1..5, Notification 1..4. Metrics phân biệt broker/consumer health, lag và
Inbox effects. Public OpenAPI không đổi. [CP13 guide](../../docs/KAFKA_NOTIFICATION.md).
