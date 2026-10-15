# SOFTWARE REQUIREMENTS SPECIFICATION

# CAB SYSTEM – NỀN TẢNG ĐẶT XE

| Thuộc tính              | Giá trị                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Khách hàng              | Công ty ABC                                                                                                              |
| Nguồn yêu cầu           | `Customer-Requirement.docx` + `CAB_Customer_Decision_Baseline_v2.md` (FINAL, 2026-10-03)                                 |
| Nguồn grading alignment | `phieucham(2).md` – 30 tiêu chí thực hành/Postman/security                                                               |
| Phiên bản               | 1.0.1 (Customer Baseline + Grading Alignment)                                                                            |
| Ngày                    | 2026-10-03                                                                                                               |
| Trạng thái              | **Baseline 1.0.1 – giữ nguyên Customer Decision Baseline v2.0 và bổ sung Grading Alignment theo `phieucham(2).md`**      |
| Thời gian dự án         | 7 tuần (theo yêu cầu khách hàng)                                                                                         |
| File theo dõi           | `SRS_Issue_Tracker_baseline_1.0.md` (Customer decisions); grading alignment được truy vết trực tiếp tại mục 16.6 và 17.3 |

**Quy ước đọc tài liệu**

- `Q-xx`: mã quyết định nghiệp vụ đã được khách hàng chốt trong `CAB_Customer_Decision_Baseline_v2.md`; trạng thái áp dụng xem mục 18.6.1 và `SRS_Issue_Tracker_baseline_1.0.md`.
- `AS-xx`: chỉ dùng cho giả định thiết kế còn độc lập với Q đã chốt. Các AS cũ gắn với Q-01..Q-31 đã được retired/superseded và không còn là nguồn yêu cầu.
- `[TBD]`: chỉ còn được dùng cho chi tiết triển khai chưa thuộc phạm vi quyết định khách hàng (ví dụ TTL token/coverage test); không được dùng thay cho giá trị nghiệp vụ đã chốt.
- Mức ưu tiên: **P1** = bắt buộc cho baseline 7 tuần; **P2** = mở rộng, không chặn demo P1.
- `GA-xx`: yêu cầu **Grading Alignment** bổ sung từ `phieucham(2).md`; đây là ràng buộc triển khai/kiểm thử để đáp ứng bài chấm, **không thay đổi các quyết định nghiệp vụ Q-01..Q-31**.

## Mục lục

- [1. Mục tiêu](#1-mục-tiêu)
- [2. Stakeholders](#2-stakeholders)
- [3. Actors](#3-actors)
- [4. Business Goals](#4-business-goals)
- [5. Scope](#5-scope)
- [6. Business Workflows](#6-business-workflows)
- [7. State Machine](#7-state-machine)
- [8. Use Cases](#8-use-cases)
- [9. Functional Requirements theo Actor](#9-functional-requirements-theo-actor)
- [10. Business Rules theo Actor](#10-business-rules-theo-actor)
- [11. Audit Requirements](#11-audit-requirements)
- [12. Notification Requirements](#12-notification-requirements)
- [13. Data Model](#13-data-model)
- [14. Deployment Components](#14-deployment-components)
- [15. Microservice Ownership](#15-microservice-ownership)
- [16. Non-functional Requirements](#16-non-functional-requirements)
- [17. Traceability](#17-traceability)
- [18. Quy tắc quyền và dữ liệu](#18-quy-tắc-quyền-và-dữ-liệu)
- [19. Lịch sử thay đổi](#19-lịch-sử-thay-đổi)

---

# 1. Mục tiêu

## 1.1 Mục đích tài liệu

Tài liệu này đặc tả yêu cầu phần mềm (SRS) cho **CAB System** – nền tảng đặt xe trực tuyến của Công ty ABC. Tài liệu được xây dựng từ bản "Yêu cầu của khách hàng", làm rõ phạm vi, tác nhân, quy trình nghiệp vụ, yêu cầu chức năng, yêu cầu phi chức năng, quy tắc nghiệp vụ, các trường hợp ngoại lệ, đồng thời ghi nhận **các quyết định khách hàng đã chốt** làm baseline để nhóm phát triển, QA và DevOps xây dựng/kiểm thử giải pháp.

Đối tượng đọc: Ban lãnh đạo/Product Owner (xác nhận), Business Analyst, Solution/Software Architect, nhóm phát triển, QA, DevOps.

## 1.2 Mục tiêu nghiệp vụ

Hiện tại khách hàng đặt xe qua tổng đài hoặc ứng dụng đơn giản; việc phân công tài xế chủ yếu thủ công, khách khó theo dõi chuyến, thông tin thanh toán chưa quản lý tập trung, vận hành khó mở rộng. Doanh nghiệp cần một nền tảng có khả năng:

- Tự động hóa toàn bộ vòng đời: tạo yêu cầu → tìm & phân công tài xế → thực hiện chuyến → tính cước → thanh toán → thông báo → đánh giá.
- Phục vụ số lượng lớn khách hàng và tài xế, ổn định ở giờ cao điểm.
- Cho phép bộ phận vận hành giám sát, hỗ trợ, kiểm soát và có dữ liệu báo cáo.
- Phát triển lâu dài: thêm loại dịch vụ, phương thức thanh toán, nhà cung cấp thông báo mà không xây dựng lại toàn bộ.

Chi tiết xem mục 4 (Business Goals).

## 1.3 Mục tiêu hệ thống

- Cung cấp ứng dụng/giao diện cho 3 nhóm người dùng chính: **Khách hàng, Tài xế, Nhân viên vận hành** (kèm vai trò Admin cho thao tác nhạy cảm).
- Tự động tìm tài xế phù hợp, có cơ chế fallback khi tài xế từ chối/không phản hồi.
- Tính cước, hỗ trợ tiền mặt và thanh toán điện tử qua nhà cung cấp bên ngoài; **không lưu dữ liệu nhạy cảm thẻ/tài khoản thanh toán**.
- Thông báo theo sự kiện, có thể mở rộng kênh/nhà cung cấp.
- Bảo mật, phân quyền, lưu vết (audit) thao tác quan trọng.
- Kiến trúc cô lập lỗi, mở rộng độc lập từng thành phần, triển khai từng phần.

## 1.4 Phạm vi truy vết yêu cầu

Bảng truy vết từ từng đoạn của tài liệu yêu cầu khách hàng sang các thành phần trong SRS:

| Đoạn nguồn                 | Nội dung chính                                                                                                | Business Goal       | Use Case                   | FR / NFR                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------- | -------------------------- | --------------------------------------------- |
| Đoạn 1 – Bối cảnh          | Hạn chế hệ thống hiện tại, mục tiêu nền tảng mới, 7 tuần                                                      | BR-01, BR-08, BR-10 | —                          | NFR-01..06                                    |
| Đoạn 2 – Khách hàng        | Đăng ký, đăng nhập, hồ sơ, đặt xe, theo dõi, lịch sử, đánh giá                                                | BR-01, BR-02, BR-11 | UC-01..08                  | FR-01..13                                     |
| Đoạn 3 – Tài xế            | Hồ sơ, phương tiện, trạng thái, nhận/từ chối chuyến, cập nhật chuyến, vị trí                                  | BR-01, BR-02, BR-03 | UC-11..16                  | FR-15..21                                     |
| Đoạn 4 – Tìm tài xế        | Tiêu chí phù hợp, fallback, thông báo khi không tìm được                                                      | BR-03               | UC-18, UC-19               | FR-23..27                                     |
| Đoạn 5 – Thanh toán & cước | Tính cước, tiền mặt/điện tử, provider ngoài, không lưu dữ liệu thẻ, xử lý lỗi                                 | BR-04               | UC-09, UC-10, UC-20, UC-21 | FR-13, FR-14, FR-21, FR-28..31                |
| Đoạn 6 – Thông báo         | Sự kiện thông báo KH/TX, mở rộng kênh                                                                         | BR-05, BR-10        | UC-22                      | FR-32, FR-33                                  |
| Đoạn 7 – Vận hành          | Giao diện quản trị, phân quyền, báo cáo                                                                       | BR-06, BR-07        | UC-23..31                  | FR-35..46                                     |
| Đoạn 8 – Ổn định           | Chịu tải cao, cô lập lỗi, scale độc lập, deploy từng phần                                                     | BR-08               | —                          | NFR-01..06                                    |
| Đoạn 9 – Bảo mật           | Xác thực, kiểm soát quyền, bảo vệ dữ liệu, lưu vết                                                            | BR-09               | UC-02, UC-29, UC-32        | FR-01, FR-02, FR-34, FR-42, FR-46; SEC-01..14 |
| Đoạn 10 – Điểm chưa chốt   | Cách tính cước, tiêu chí ưu tiên, thời gian phản hồi, chính sách hủy, mất mạng, lưu trữ dữ liệu               | BR-10               | —                          | Q-01..Q-07                                    |
| Đoạn 11 – Kỳ vọng          | Nền tảng dài hạn, quy trình đầu-cuối, BA làm rõ phạm vi/tác nhân/quy trình/FR/NFR/BRULE/ngoại lệ/điểm chưa rõ | Tất cả              | Tất cả                     | Toàn tài liệu                                 |

## 1.5 Nguyên tắc thiết kế và triển khai

1. **Chia theo bounded context:** mỗi service sở hữu dữ liệu và logic nghiệp vụ của riêng mình (mục 15).
2. **Database per service:** không truy cập trực tiếp database của service khác; dùng API / Event / Projection.
3. **Cô lập lỗi:** lỗi ở thanh toán, thông báo, báo cáo, audit **không được làm ngừng** luồng đặt xe – tìm tài xế – thực hiện chuyến (NFR-04, BRULE-25, BRULE-27).
4. **Event-driven cho tác vụ bất đồng bộ** (thông báo, audit, báo cáo, cập nhật projection); REST đồng bộ cho thao tác cần phản hồi tức thì.
5. **Adapter cho hệ thống ngoài:** Payment Provider, Notification Provider, Map/Geo Provider được đặt sau interface thống nhất để thay thế/thêm mới không ảnh hưởng core (BRULE-37).
6. **Policy theo cấu hình:** công thức cước, thời gian phản hồi, bán kính tìm kiếm, chính sách hủy... là cấu hình có phiên bản, không hard-code; các giá trị baseline đã chốt vẫn phải cấu hình để audit/versioning.
7. **Idempotency & exactly-once effect** cho các thao tác quan trọng: gán tài xế, thanh toán, xử lý callback, consume event.
8. **Triển khai độc lập, tương thích ngược:** API versioning, event schema tương thích ngược.
9. **Bảo mật theo mặc định:** xác thực mọi API (trừ public), RBAC, mã hóa truyền tải, không lưu dữ liệu thẻ, che dữ liệu nhạy cảm trong log.

# 2. Stakeholders

## 2.1 Stakeholders Table

| #   | Stakeholder                                                    | Vai trò & Trách nhiệm                                                                       | Mối quan tâm                                                                                                                  |
| --- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1   | Ban giám đốc / Ban lãnh đạo Công ty ABC                        | Sponsor, phê duyệt phạm vi, chính sách kinh doanh (cước, hủy, ưu tiên tài xế)               | Hệ thống phục vụ số lượng lớn, mở rộng được; báo cáo số chuyến, doanh thu, tỷ lệ hoàn thành/hủy, hiệu quả tài xế; chốt 7 tuần |
| 2   | Khách hàng (hành khách)                                        | Người đặt xe, thanh toán, đánh giá                                                          | Đặt xe nhanh, theo dõi rõ ràng, giá minh bạch, thanh toán an toàn                                                             |
| 3   | Tài xế                                                         | Cung cấp dịch vụ vận chuyển                                                                 | Nhận chuyến phù hợp, thao tác đơn giản, được ghi nhận đúng chuyến/cước                                                        |
| 4   | Nhân viên vận hành (Operations / CSKH / tổng đài)              | Quản lý khách hàng, tài xế, phương tiện, chuyến; hỗ trợ xử lý chuyến lỗi; tra cứu giao dịch | Công cụ giám sát thời gian thực, xử lý ngoại lệ, phân quyền thao tác nhạy cảm                                                 |
| 5   | Quản trị hệ thống / Admin nghiệp vụ                            | Quản lý nhân viên, phân quyền, cấu hình chính sách, thao tác nhạy cảm, identity-account     | Kiểm soát quyền, lưu vết, an toàn vận hành                                                                                    |
| 6   | Business Analyst                                               | Làm rõ phạm vi/quy trình/yêu cầu, xác nhận điểm chưa rõ với các bên                         | Yêu cầu đầy đủ, nhất quán, truy vết được                                                                                      |
| 7   | Nhóm phát triển, QA, DevOps                                    | Thiết kế, xây dựng, kiểm thử, triển khai                                                    | Yêu cầu rõ ràng, kiến trúc khả thi trong 7 tuần                                                                               |
| 8   | Nhà cung cấp thanh toán (Payment Provider)                     | Xử lý giao dịch điện tử                                                                     | Tích hợp đúng hợp đồng API, bảo mật, đối soát                                                                                 |
| 9   | Nhà cung cấp thông báo (Notification Provider)                 | Gửi push/SMS/email...                                                                       | Tích hợp, giới hạn tốc độ, chi phí                                                                                            |
| 10  | Tài chính / Kế toán _(giả định – chưa được nêu trong yêu cầu)_ | Đối soát doanh thu, giao dịch                                                               | Dữ liệu giao dịch chính xác, đối soát được                                                                                    |
| 11  | Pháp chế / Bảo mật _(stakeholder tham chiếu)_                  | Tuân thủ baseline bảo mật/dữ liệu P1                                                        | Dữ liệu cá nhân/vị trí, retention và audit theo Q-07/Q-25/Q-30                                                                |

# 3. Actors

## 3.1 Customer (Khách hàng)

- Người dùng cuối đặt xe. Phải đăng ký và xác thực để dùng chức năng yêu cầu tài khoản.
- Hành động chính: đăng ký/đăng nhập, cập nhật hồ sơ, tạo yêu cầu đặt xe, theo dõi chuyến, hủy, thanh toán, xem lịch sử, đánh giá tài xế.
- Use case: UC-01..UC-10.

## 3.2 Driver (Tài xế)

- Người cung cấp dịch vụ. Có thể tự đăng ký hoặc được Staff tạo tài khoản; **bắt buộc được Staff duyệt hồ sơ** trước khi nhận chuyến (Q-14).
- Hành động chính: cập nhật hồ sơ/phương tiện, chuyển trạng thái hoạt động, gửi vị trí, nhận/từ chối chuyến, cập nhật tiến trình chuyến, xác nhận thu tiền mặt.
- Use case: UC-02, UC-09, UC-11..UC-17.

## 3.3 Staff (Nhân viên vận hành)

- Nhân viên thông thường của bộ phận vận hành; thao tác nhạy cảm bị giới hạn (BRULE-29, BRULE-30).
- Hành động chính: quản lý khách hàng, tài xế, phương tiện; giám sát chuyến; hỗ trợ xử lý chuyến lỗi; tra cứu giao dịch.
- Use case: UC-11, UC-23..UC-28.

## 3.4 Admin (Quản trị viên)

- Có toàn bộ quyền của Staff **cộng thêm** thao tác nhạy cảm: quản lý nhân viên/phân quyền, khóa tài khoản, điều chỉnh cước, đóng chuyến cưỡng bức, cấu hình chính sách, xem báo cáo, tra cứu audit log.
- P1 chỉ có hai vai trò vận hành `Staff` và `Admin`; không tạo role `Manager`. Admin xem dashboard vận hành cơ bản; báo cáo nâng cao thuộc P2 (Q-11, Q-20).
- Use case: UC-24, UC-27, UC-29..UC-32.

## 3.5 System (Scheduler / Event Processor) – Actor nội bộ

- Thành phần tự động: tìm tài xế, timeout offer, tính cước, tạo payment, gửi thông báo, ghi audit, đánh dấu tài xế offline khi mất heartbeat.
- Use case: UC-18..UC-22.

## 3.6 External System

| External System       | Vai trò                                                  | Ghi chú                                                                                                  |
| --------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Payment Provider      | Xử lý thanh toán điện tử, trả kết quả (callback/webhook) | P1 tích hợp 1 provider qua adapter; có thể dùng mock/sandbox; CAB không lưu PAN/CVV (Q-08).              |
| Notification Provider | Gửi push notification                                    | P1 dùng Push + In-app; SMS/email ngoài P1; provider đặt sau adapter; retry tối đa 3 lần (Q-16).          |
| Map / Geo Provider    | Geocoding, route, quãng đường/thời gian, ETA             | P1 dùng 1 provider qua adapter; vùng phục vụ TP. Hồ Chí Minh; không tạo `location-service` riêng (Q-13). |
| OTP Provider          | Xác minh SĐT khi Customer đăng ký                        | Bắt buộc OTP xác minh SĐT; đăng nhập bằng SĐT + password (Q-15).                                         |

# 4. Business Goals

## 4.1 Business Goals Table

| BR    | Mục tiêu nghiệp vụ                                                     | Kết quả mong đợi                                                                                                   | FR liên quan                      | Business Rules                         |
| ----- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------- | -------------------------------------- |
| BR-01 | Tự động hóa quy trình đặt xe đầu-cuối thay cho xử lý thủ công/tổng đài | Khách tự tạo yêu cầu, hệ thống tự phân công, chuyến đi vận hành qua hệ thống                                       | FR-04..FR-08, FR-13, FR-20        | BRULE-04, BRULE-05, BRULE-06, BRULE-14 |
| BR-02 | Minh bạch trạng thái chuyến cho khách hàng                             | Khách biết hệ thống đang tìm tài xế, tài xế nào nhận, ETA, trạng thái hiện tại                                     | FR-09, FR-18, FR-20               | BRULE-14, BRULE-33                     |
| BR-03 | Tìm và phân công tài xế phù hợp, có fallback                           | Ưu tiên tài xế gần/phù hợp; tự tìm tài xế khác khi từ chối/không phản hồi; thông báo rõ khi không tìm được         | FR-19, FR-23..FR-27               | BRULE-07..BRULE-13                     |
| BR-04 | Quản lý tập trung cước và thanh toán, an toàn dữ liệu                  | Cước tính nhất quán; hỗ trợ tiền mặt & điện tử; không lưu dữ liệu nhạy cảm thẻ                                     | FR-13, FR-14, FR-21, FR-28..FR-31 | BRULE-18..BRULE-25                     |
| BR-05 | Thông báo kịp thời, mở rộng kênh                                       | Khách/tài xế nhận thông báo theo sự kiện; thêm kênh mới không đổi toàn hệ thống                                    | FR-32, FR-33                      | BRULE-27, BRULE-28, BRULE-37           |
| BR-06 | Cung cấp công cụ vận hành và phân quyền                                | Staff quản lý KH/TX/phương tiện/chuyến, xử lý chuyến lỗi; thao tác nhạy cảm bị kiểm soát                           | FR-35..FR-41, FR-43A..FR-43C      | BRULE-17, BRULE-29..BRULE-31           |
| BR-07 | Cung cấp dữ liệu điều hành cho Ban lãnh đạo                            | Báo cáo số chuyến, doanh thu, tỷ lệ hoàn thành/hủy, hiệu quả tài xế                                                | FR-45                             | BRULE-36                               |
| BR-08 | Ổn định, chịu tải cao, cô lập lỗi, scale độc lập                       | Lỗi thanh toán/thông báo không làm ngừng đặt xe; scale từng thành phần                                             | (NFR-01..NFR-05)                  | BRULE-25, BRULE-27                     |
| BR-09 | Bảo mật và lưu vết                                                     | Xác thực, kiểm soát quyền, bảo vệ dữ liệu cá nhân/vị trí/giao dịch, audit thao tác quan trọng                      | FR-01, FR-02, FR-34, FR-42, FR-46 | BRULE-29..BRULE-32, BRULE-35           |
| BR-10 | Kiến trúc linh hoạt để mở rộng dài hạn                                 | Thêm loại dịch vụ, phương thức thanh toán, nhà cung cấp thông báo, thay đổi thành phần kỹ thuật không phải xây lại | FR-29, FR-33, FR-44               | BRULE-37                               |
| BR-11 | Nâng cao chất lượng dịch vụ qua đánh giá                               | Khách đánh giá tài xế sau chuyến, dữ liệu dùng cho vận hành/ưu tiên                                                | FR-12                             | BRULE-26                               |

# 5. Scope

## 5.1 Chức năng hệ thống

### 5.1.1 P1 – Bắt buộc trong 7 tuần

- 7 business service bắt buộc: `identity-account-service`, `customer-service`, `driver-service`, `booking-service`, `trip-service`, `notification-service`, `payment-service`.
- API Gateway + Redis + Kafka + 7 PostgreSQL database (database per service); Docker/Docker Compose; GitHub Actions CI/CD; Java Spring Boot.
- Customer Mobile App, Driver Mobile App, Staff/Admin Web App; giao diện tiếng Việt.
- Tài khoản & xác thực: Customer đăng ký bằng SĐT + password, OTP xác minh SĐT; JWT; RBAC Staff/Admin.
- Đặt xe trong **TP. Hồ Chí Minh**: nhập địa chỉ/chọn bản đồ/dùng vị trí hiện tại; hai loại dịch vụ `MOTORBIKE`, `CAR_4_SEATS`.
- Tính cước ước tính/cuối; automatic matching + sequential offer + timeout + redispatch; **không gán Driver thủ công**.
- Trip lifecycle, hủy/no-show, lịch sử, rating Customer→Driver.
- Thanh toán Cash/Electronic với 1 provider; retry electronic payment tối đa 3 lần/24 giờ; không lưu PAN/CVV.
- Push + In-app notification; Kafka event; retry gửi tối đa 3 lần.
- Admin Web cơ bản: Trip đang chạy, Driver online, Trip lỗi, Payment status; quản lý Customer/Driver/vehicle; duyệt Driver; xử lý Trip lỗi; tra cứu giao dịch.
- Audit cơ bản cho thao tác quan trọng; health check, configuration, seed/demo data.
- Grading-aligned API/security evidence: exact health endpoints, lookup/paging endpoints, Driver OTP self-registration, encryption-at-rest, injection/XSS/JWT/rate-limit/replay tests và Postman collection (mục 16.6, 17.3).

### 5.1.2 P2 – Không chặn demo P1

- Báo cáo nâng cao: số chuyến, doanh thu, tỷ lệ hoàn thành/hủy, hiệu quả Driver; export báo cáo.
- SMS/email và Notification Provider/kênh bổ sung.
- Driver cancellation policy sau khi Accept (P1 Driver không tự hủy; báo Staff khi có sự cố).
- Password reset nâng cao (tách UC riêng khi triển khai).
- Payment Provider bổ sung.
- Các tính năng mở rộng liệt kê tại mục 5.2.

## 5.2 Ngoài phạm vi P1

- Đặt xe trước giờ; đặt xe hộ; nhiều điểm dừng; voucher/promotion; ví điện tử nội bộ; chat; gọi điện tích hợp; chia sẻ chuyến; Driver đánh giá Customer.
- Tổng đài/CTI tích hợp vào CAB; tổng đài cũ tiếp tục hoạt động độc lập.
- Migration dữ liệu cũ.
- Refund tự động qua Payment Provider; e-invoice; module VAT riêng; chi trả/đối soát thu nhập Driver.
- OCR/eKYC tự động; Kubernetes.
- Lưu trực tiếp PAN/CVV hoặc dữ liệu thẻ nhạy cảm.
- Manual Driver Assignment bởi Staff/Admin.

## 5.3 Phạm vi Phase/Priority và kế hoạch 7 tuần

| Phase | Nội dung  | Quyết định                                        |
| ----- | --------- | ------------------------------------------------- |
| P1    | Mục 5.1.1 | Bắt buộc hoàn thành, build/demo/test trong 7 tuần |
| P2    | Mục 5.1.2 | Không chặn demo P1                                |

Kế hoạch baseline:

- Tuần 1: architecture + contracts + database.
- Tuần 2–4: build service.
- Tuần 5: integration.
- Tuần 6: testing/performance.
- Tuần 7: UAT/fix/demo.

# 6. Business Workflows

## 6.1 Đăng ký và đăng nhập

1. Customer đăng ký bằng **SĐT + password**, xác minh SĐT bằng OTP; email là thông tin bổ sung.
2. Driver **tự đăng ký** phải xác minh SĐT bằng OTP trước khi hồ sơ được tạo ở trạng thái `Pending` (GA-07); sau đó nộp họ tên, SĐT, CCCD/giấy tờ định danh, GPLX, thông tin phương tiện, biển số và tài liệu upload. Trường hợp Staff tạo tài khoản Driver thay mặt không yêu cầu public OTP flow nhưng hồ sơ vẫn `Pending` và phải được Approve.
3. Staff duyệt hồ sơ Driver; Reject bắt buộc lý do và Driver được nộp lại.
4. Staff/Admin do Admin quản lý; P1 chỉ có hai role `Staff`, `Admin`.
5. Đăng nhập thành công cấp JWT; mọi API ngoài public endpoint phải kiểm tra xác thực/RBAC.

## 6.2 Đặt xe và tìm Driver

1. Customer chọn điểm đón/đến bằng nhập địa chỉ, bản đồ hoặc vị trí hiện tại trong vùng phục vụ **TP. Hồ Chí Minh**.
2. Customer chọn `MOTORBIKE` hoặc `CAR_4_SEATS`; `booking-service` lấy route/distance qua Map/Geo adapter và trả cước ước tính.
3. Customer chọn Cash/Electronic Payment và tạo booking.
4. `booking-service` lấy Driver hợp lệ từ `driver-service`: `Available`, đã duyệt, đúng loại dịch vụ, vị trí không stale (>30 giây là stale), trong bán kính **5 km**.
5. Xếp hạng: khoảng cách tới điểm đón tăng dần; nếu bằng nhau, Driver có thời điểm `Available` sớm hơn được ưu tiên. P1 không dùng rating/acceptance/cancellation rate.
6. Mỗi vòng xét tối đa **10 Driver**; gửi offer tuần tự, mỗi Driver có **60 giây** Accept/Reject.
7. Reject/Expired → tự động redispatch Driver kế tiếp; không phạt Driver.
8. Tổng thời gian tìm tối đa **2 phút**, không mở rộng bán kính. Hết thời gian/ứng viên → `NoDriverFound` và thông báo Customer.

## 6.3 Thực hiện Trip

1. Trip sau khi gán Driver đi theo state: `Searching → DriverAssigned → DriverArrived → PickedUp → InProgress → Completed`.
2. `PickedUp` và `InProgress` là hai trạng thái riêng.
3. Driver gửi heartbeat/vị trí mỗi **10 giây** khi `Available` hoặc `Busy`; mất heartbeat **30 giây** → Driver `Offline` và không được matching.
4. Trip đang chạy không tự hủy khi Driver mất mạng; app queue cập nhật và gửi lại khi có mạng; request/event quan trọng phải idempotent.
5. Customer theo dõi trạng thái bằng REST polling **5 giây/lần** và nhận push cho sự kiện quan trọng.

## 6.4 Tính cước

```text
DistanceFare = DistanceKm × PricePerKm
FinalFare = BaseFare + DistanceFare + Surcharge
```

- Không tính theo phút; không có minimum fare trong P1.
- `BaseFare`, `PricePerKm`, `Surcharge` cấu hình theo loại dịch vụ.
- Estimate dùng quãng đường ước tính; Final dùng quãng đường thực tế.
- Thiếu GPS cuối chuyến → dùng quãng đường ước tính và đánh dấu `estimated`.
- Làm tròn đến **1.000 VND**; fare rule có version và snapshot vào Trip.

## 6.5 Thanh toán

1. Payment được tạo sau khi Trip `Completed`.
2. Cash: Driver xác nhận đã thu tiền.
3. Electronic: P1 dùng 1 Payment Provider qua adapter; có thể mock/sandbox; CAB chỉ lưu reference, amount, method, status.
4. Electronic payment thất bại: Customer retry tối đa **3 lần trong 24 giờ**; không tự đổi Electronic→Cash.
5. Sau 3 lần thất bại: Payment `Failed`, thông báo Customer và tạo yêu cầu xử lý cho Staff; không chặn Customer đặt Trip mới.

## 6.6 Hủy / No-show

- `Searching`: Customer hủy miễn phí.
- `DriverAssigned`, chưa đón khách, trong 30 giây đầu: miễn phí.
- `DriverAssigned`, chưa đón khách, sau 30 giây: phí hủy **20.000 VND**.
- Từ `PickedUp` trở đi: Customer không được tự hủy.
- No-show: Driver đến điểm đón chờ **5 phút**, chọn `CustomerNoShow`; Trip kết thúc với reason `NO_SHOW`, phí **20.000 VND**.
- Driver **không được tự hủy sau khi Accept trong P1**; có sự cố thì báo Staff. Staff/Admin xử lý theo quyền.

## 6.7 Quản lý Driver

- Staff tra cứu, duyệt/từ chối hồ sơ Driver và xử lý nghiệp vụ thông thường.
- Admin có toàn bộ quyền Staff, đồng thời khóa/mở khóa account, force-close Trip, điều chỉnh cước/giao dịch và cấu hình policy.
- Mọi thao tác nhạy cảm của Admin bắt buộc có lý do, actor, timestamp, before/after và audit log.

## 6.8 Thông báo

- P1: Push + In-app notification; không SMS/email.
- Event nghiệp vụ phát qua Kafka; `notification-service` consume idempotent.
- Provider đặt sau adapter; lỗi gửi retry tối đa **3 lần** rồi DeadLetter/cảnh báo; lỗi notification không làm thất bại nghiệp vụ gốc.

## 6.9 Rating

- Customer đánh giá Driver 1–5 sao; comment không bắt buộc.
- Mỗi Trip chỉ rating 1 lần, trong **7 ngày** sau `Completed`.
- P1 không tự khóa Driver theo rating; Driver không đánh giá Customer.

## 6.10 Dashboard vận hành P1 / Reporting P2

P1 Admin Web chỉ cần dashboard cơ bản: Trip đang chạy, Driver online, Trip lỗi, Payment status. Báo cáo nâng cao theo kỳ, export và các chỉ số doanh thu/hiệu quả Driver thuộc P2.

# 7. State Machine

## 7.1 Trip

| State          | Ý nghĩa                             | Transition ra chính                                           |
| -------------- | ----------------------------------- | ------------------------------------------------------------- |
| Searching      | Đang tìm Driver                     | DriverAssigned / NoDriverFound / Cancelled                    |
| DriverAssigned | Driver đã Accept, đang đến điểm đón | DriverArrived / Cancelled theo policy / force-close bởi Admin |
| DriverArrived  | Driver đã đến điểm đón              | PickedUp / CustomerNoShow→Cancelled/ended reason NO_SHOW      |
| PickedUp       | Đã đón khách                        | InProgress                                                    |
| InProgress     | Đang di chuyển                      | Completed / force-close bởi Admin                             |
| Completed      | Trip hoàn thành                     | Trạng thái cuối; kích hoạt Payment/Rating                     |
| Cancelled      | Trip bị hủy hợp lệ                  | Trạng thái cuối                                               |
| NoDriverFound  | Hết 2 phút hoặc hết ứng viên        | Trạng thái cuối                                               |
| Failed         | Admin force-close Trip lỗi          | Trạng thái cuối                                               |

`PickedUp` và `InProgress` được giữ riêng theo Q-24. P1 không có transition Driver tự hủy để quay về `Searching`.

## 7.2 Driver Offer

| State     | Quy tắc                                               |
| --------- | ----------------------------------------------------- |
| Pending   | Chờ Driver phản hồi, tối đa 60 giây                   |
| Accepted  | Accept hợp lệ; exactly-once assignment                |
| Rejected  | Driver Reject; booking-service chọn ứng viên kế tiếp  |
| Expired   | Quá 60 giây; không phạt Driver; chọn ứng viên kế tiếp |
| Cancelled | Booking/Trip bị hủy hoặc offer không còn hợp lệ       |

## 7.3 Driver Account

| State     | Quy tắc                                     |
| --------- | ------------------------------------------- |
| Pending   | Hồ sơ chờ Staff duyệt                       |
| Active    | Được phép chuyển Available và nhận Trip     |
| Rejected  | Bị từ chối kèm lý do; Driver có thể nộp lại |
| Suspended | Admin khóa; không được matching             |

## 7.4 Driver Availability

| State     | Quy tắc                                          |
| --------- | ------------------------------------------------ |
| Offline   | Không nhận Trip; mất heartbeat 30 giây → Offline |
| Available | Đủ điều kiện matching; gửi location mỗi 10 giây  |
| Busy      | Đang phục vụ Trip; vẫn gửi location mỗi 10 giây  |

## 7.5 Payment

| State      | Quy tắc                                                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| Pending    | Tạo sau Trip Completed                                                                                |
| Processing | Electronic payment đang xử lý                                                                         |
| Succeeded  | Provider xác nhận hoặc Driver xác nhận Cash                                                           |
| Failed     | Electronic payment thất bại; Customer có thể retry tối đa 3 lần/24 giờ; sau ngưỡng chuyển Staff xử lý |
| Cancelled  | Chỉ dùng khi nghiệp vụ giao dịch cho phép; mọi điều chỉnh nhạy cảm phải audit                         |

P1 **không tự động đổi Electronic → Cash** sau thất bại.

## 7.6 Notification

| State      | Quy tắc                                   |
| ---------- | ----------------------------------------- |
| Pending    | Chờ gửi Push/In-app                       |
| Sent       | Gửi thành công                            |
| Failed     | Lỗi tạm thời; retry                       |
| DeadLetter | Hết tối đa 3 lần retry; cảnh báo vận hành |

# 8. Use Cases

## 8.1 Use Cases P1

| UC    | Tên Use Case                          | Actor                          | FR                             | Priority |
| ----- | ------------------------------------- | ------------------------------ | ------------------------------ | -------- |
| UC-01 | Đăng ký tài khoản khách hàng          | Customer                       | FR-04                          | P1       |
| UC-02 | Đăng nhập / Đăng xuất                 | Customer, Driver, Staff, Admin | FR-01, FR-02                   | P1       |
| UC-03 | Cập nhật thông tin cá nhân khách hàng | Customer                       | FR-05                          | P1       |
| UC-04 | Tạo yêu cầu đặt xe                    | Customer                       | FR-06..FR-08                   | P1       |
| UC-05 | Theo dõi chuyến đi                    | Customer                       | FR-09                          | P1       |
| UC-06 | Hủy chuyến / No-show                  | Customer, Driver, Staff        | FR-10                          | P1       |
| UC-07 | Xem lịch sử chuyến đi và chi phí      | Customer                       | FR-11                          | P1       |
| UC-08 | Đánh giá tài xế                       | Customer                       | FR-12                          | P1       |
| UC-09 | Thanh toán chuyến đi                  | Customer, Driver               | FR-13, FR-21                   | P1       |
| UC-10 | Xử lý lại thanh toán điện tử thất bại | Customer, Staff                | FR-14                          | P1       |
| UC-11 | Đăng ký/duyệt tài xế                  | Driver, Staff                  | FR-15, FR-36                   | P1       |
| UC-12 | Cập nhật hồ sơ và phương tiện         | Driver                         | FR-16                          | P1       |
| UC-13 | Cập nhật trạng thái hoạt động         | Driver                         | FR-17                          | P1       |
| UC-14 | Cập nhật vị trí tài xế                | Driver                         | FR-18                          | P1       |
| UC-15 | Nhận và phản hồi đề xuất chuyến       | Driver                         | FR-19                          | P1       |
| UC-16 | Cập nhật trạng thái thực hiện chuyến  | Driver                         | FR-20                          | P1       |
| UC-18 | Tìm và đề xuất tài xế                 | System                         | FR-23..FR-25                   | P1       |
| UC-19 | Reject/Expired và redispatch          | System                         | FR-26, FR-27                   | P1       |
| UC-20 | Tính cước                             | System                         | FR-28                          | P1       |
| UC-21 | Xử lý Electronic Payment Provider     | System, Payment Provider       | FR-29..FR-31                   | P1       |
| UC-22 | Gửi thông báo                         | System, Notification Provider  | FR-32, FR-33                   | P1       |
| UC-23 | Quản lý khách hàng                    | Staff                          | FR-35                          | P1       |
| UC-24 | Quản lý tài xế                        | Staff, Admin                   | FR-36, FR-37, FR-43A           | P1       |
| UC-25 | Quản lý phương tiện                   | Staff                          | FR-38                          | P1       |
| UC-26 | Dashboard/giám sát vận hành cơ bản    | Staff, Admin                   | FR-39                          | P1       |
| UC-27 | Hỗ trợ xử lý chuyến lỗi               | Staff, Admin                   | FR-40, FR-43B, FR-43CB, FR-43C | P1       |
| UC-28 | Tra cứu lịch sử giao dịch             | Staff                          | FR-41                          | P1       |
| UC-29 | Quản lý nhân viên và phân quyền       | Admin                          | FR-42                          | P1       |
| UC-30 | Cấu hình chính sách vận hành          | Admin                          | FR-44                          | P1       |
| UC-32 | Tra cứu Audit Log                     | Admin                          | FR-34, FR-46                   | P1       |

## 8.2 Use Cases P2

| UC    | Tên Use Case                              | Actor                          | FR    | Priority |
| ----- | ----------------------------------------- | ------------------------------ | ----- | -------- |
| UC-17 | Driver cancellation policy sau khi Accept | Driver                         | FR-22 | P2       |
| UC-31 | Báo cáo vận hành nâng cao / export        | Admin                          | FR-45 | P2       |
| UC-33 | Đặt lại mật khẩu nâng cao                 | Customer, Driver, Staff, Admin | FR-03 | P2       |

## 8.3 Đặc tả chi tiết Use Case

## 8.3 Đặc tả chi tiết Use Case

### UC-01 — Đăng ký tài khoản khách hàng

**Actor:** Customer

**FR:** FR-04

**Scope:** identity-account-service, customer-service

**Preconditions:**

- Customer chưa có tài khoản với định danh (SĐT) đó.

**Main Flow:**

1. Customer nhập họ tên, **SĐT + mật khẩu**; email là tùy chọn; hệ thống gửi OTP để xác minh SĐT (Q-15).
2. System kiểm tra định dạng và tính duy nhất (BRULE-01).
3. System chỉ kích hoạt Customer sau khi OTP xác minh SĐT thành công.
4. System tạo hồ sơ Customer, ghi audit `UserRegistered`.
5. System trả kết quả đăng ký; Customer có thể đăng nhập.

**Postconditions:**

- Có tài khoản Customer Active; mật khẩu được băm, không lưu dạng rõ.

**Alternative / Exception Flow:**

- A1. Đăng ký kèm xác minh OTP: bước 3 chỉ hoàn tất sau khi OTP đúng.
- E1. Dữ liệu không hợp lệ → 400 kèm danh sách lỗi theo trường.
- E2. SĐT đã tồn tại → 409.

**Acceptance Criteria:**

- AC-01.1: Đăng ký hợp lệ trả 201 và tạo đúng 1 tài khoản Customer.
- AC-01.2: SĐT trùng bị từ chối 409, không tạo bản ghi mới.
- AC-01.3: Mật khẩu được lưu dưới dạng băm (SEC-03).

### UC-02 — Đăng nhập / Đăng xuất

**Actor:** Customer, Driver, Staff, Admin

**FR:** FR-01, FR-02

**Scope:** identity-account-service, api-gateway

**Preconditions:**

- Tài khoản tồn tại.

**Main Flow:**

1. Người dùng gửi định danh và mật khẩu.
2. System xác thực thông tin, kiểm tra trạng thái tài khoản (BRULE-02).
3. System cấp access token (kèm role) và refresh token; ghi audit `LoginSucceeded`.
4. Khi đăng xuất, System thu hồi refresh token.

**Postconditions:**

- Có phiên hợp lệ (đăng nhập) hoặc phiên bị thu hồi (đăng xuất).

**Alternative / Exception Flow:**

- A1. Làm mới token bằng refresh token hợp lệ.
- E1. Sai thông tin → 401, audit `LoginFailed`; vượt số lần sai cho phép → khóa tạm (SEC-05).
- E2. Tài khoản Suspended hoặc Driver chưa được duyệt đăng nhập vào chức năng bị giới hạn → 403.
- E3. Quên mật khẩu (P2, FR-03) → luồng đặt lại mật khẩu.

**Acceptance Criteria:**

- AC-02.1: Đăng nhập đúng trả token chứa account id và role.
- AC-02.2: Sai mật khẩu trả 401; tài khoản Suspended trả 403.
- AC-02.3: Sau đăng xuất, refresh token cũ không dùng lại được.

### UC-03 — Cập nhật thông tin cá nhân khách hàng

**Actor:** Customer

**FR:** FR-05

**Scope:** customer-service, identity-account-service

**Preconditions:**

- Customer đã đăng nhập.

**Main Flow:**

1. Customer mở hồ sơ, chỉnh họ tên, email, ảnh đại diện (nếu có).
2. System validate và lưu.
3. System ghi audit `ProfileUpdated` và trả hồ sơ mới.

**Postconditions:**

- Hồ sơ được cập nhật.

**Alternative / Exception Flow:**

- A1. Thay đổi SĐT đăng nhập phải xác minh lại bằng OTP.
- E1. Dữ liệu không hợp lệ → 400.

**Acceptance Criteria:**

- AC-03.1: Customer chỉ xem/sửa được hồ sơ của chính mình.
- AC-03.2: Cập nhật thành công được phản ánh ở lần truy vấn kế tiếp.

### UC-04 — Tạo yêu cầu đặt xe

**Actor:** Customer

**FR:** FR-06, FR-07, FR-08

**Scope:** booking-service

**Preconditions:**

- Customer đã đăng nhập, tài khoản Active.

**Main Flow:**

1. Customer nhập địa chỉ, chọn trên bản đồ hoặc dùng vị trí hiện tại cho điểm đón/đến trong **TP. Hồ Chí Minh**.
2. System kiểm tra tính hợp lệ, vùng phục vụ (BRULE-04) và geocode tọa độ.
3. System hiển thị `MOTORBIKE` và `CAR_4_SEATS` cùng ước tính cước (BRULE-06, BRULE-19).
4. Customer chọn loại xe và phương thức thanh toán (tiền mặt/điện tử), xác nhận.
5. `booking-service` tạo Booking và phối hợp `trip-service` tạo Trip ở trạng thái `Searching`, lưu estimate/fare rule snapshot; phát `BookingCreated`.
6. System thông báo "yêu cầu đã được tiếp nhận"; `booking-service` bắt đầu automatic matching.

**Postconditions:**

- Booking/Trip tồn tại ở trạng thái Searching; `booking-service` bắt đầu tìm Driver (UC-18).

**Alternative / Exception Flow:**

- A1. Customer đổi loại xe/điểm đến trước khi xác nhận → tính lại ước tính.
- E1. Thiếu/trùng điểm đón-điểm đến hoặc ngoài vùng phục vụ → 400.
- E2. Không lấy được route/cước estimate từ Map/Geo adapter → báo lỗi và cho thử lại; không tạo Booking.
- E3. Service type ngoài `MOTORBIKE`/`CAR_4_SEATS` hoặc bị vô hiệu → 400/409.

**Acceptance Criteria:**

- AC-04.1: Yêu cầu hợp lệ tạo Booking/Trip ở `Searching` đúng một lần.
- AC-04.2: Sự kiện `BookingCreated` được phát đúng 1 lần (outbox).
- AC-04.3: Customer nhận thông báo đã tiếp nhận yêu cầu.

### UC-05 — Theo dõi chuyến đi

**Actor:** Customer

**FR:** FR-09

**Scope:** trip-service, driver-service

**Preconditions:**

- Customer có chuyến thuộc quyền sở hữu.

**Main Flow:**

1. Customer mở màn hình chuyến.
2. System trả trạng thái hiện tại: đang tìm tài xế / tài xế đã nhận / đã đến / đang di chuyển / hoàn thành...
3. Khi có tài xế, System trả thông tin tài xế (tên, đánh giá), xe (biển số, loại), vị trí gần nhất và ETA.
4. Customer App REST polling trạng thái **5 giây/lần**; push notification cho sự kiện quan trọng, cho tới khi Trip kết thúc.

**Postconditions:**

- Customer biết trạng thái và tiến trình chuyến.

**Alternative / Exception Flow:**

- A1. Chuyến NoDriverFound → hiển thị thông báo rõ ràng và cho phép đặt lại.
- E1. Truy cập chuyến của người khác → 403/404.
- E2. Không lấy được vị trí → vẫn hiển thị trạng thái, báo "tạm thời chưa có vị trí".

**Acceptance Criteria:**

- AC-05.1: Customer App polling trạng thái 5 giây/lần; sự kiện quan trọng đồng thời được push theo NFR-12.
- AC-05.2: Vị trí tài xế chỉ hiển thị cho Customer của chuyến đang hoạt động (BRULE-33).
- AC-05.3: Thông tin tài xế hiển thị sau khi chuyến có tài xế.

### UC-06 — Hủy chuyến

**Actor:** Customer (Staff hỗ trợ hủy trong UC-27)

**FR:** FR-10

**Scope:** trip-service, booking-service, driver-service

**Preconditions:**

- Trip ở `Searching` hoặc đã gán Driver nhưng **chưa `PickedUp`**; phí phụ thuộc thời gian từ lúc `DriverAssigned` (BRULE-16).

**Main Flow:**

1. Customer chọn hủy; System tính/hiển thị phí: `Searching` = 0; `DriverAssigned`/`DriverArrived` trong 30 giây đầu = 0; sau 30 giây = **20.000 VND**.
2. Customer xác nhận.
3. System chuyển Trip → Cancelled, ghi người hủy và lý do; phát `TripCancelled`.
4. `booking-service` hủy offer Pending; Driver (nếu đã gán) về trạng thái phù hợp và không còn gắn với Trip.
5. System thông báo Driver (nếu có) và Customer.

**Postconditions:**

- Trip Cancelled (trạng thái cuối).

**Alternative / Exception Flow:**

- E1. Từ `PickedUp` trở đi → Customer tự hủy bị từ chối 409.
- A1. No-show: khi Driver đã đến điểm đón và chờ **5 phút**, Driver chọn `CustomerNoShow`; Trip kết thúc reason `NO_SHOW`, phí **20.000 VND**.
- E2. Hủy đồng thời với Accept → chỉ một thao tác thắng (BRULE-13), thao tác thua trả 409.

**Acceptance Criteria:**

- AC-06.1: Hủy hợp lệ → Trip Cancelled, offer Pending bị Cancelled, tài xế về Available.
- AC-06.2: Hủy ở trạng thái không cho phép trả 409.
- AC-06.3: Phí hủy/no-show đúng policy 20.000 VND và có audit actor/reason/timestamp.

### UC-07 — Xem lịch sử chuyến đi và chi phí

**Actor:** Customer

**FR:** FR-11

**Scope:** trip-service

**Preconditions:**

- Customer đã đăng nhập.

**Main Flow:**

1. Customer mở lịch sử.
2. System trả danh sách chuyến của Customer, sắp xếp mới nhất, có phân trang.
3. Customer chọn chuyến để xem chi tiết: lộ trình, tài xế, cước (chi tiết thành phần), phương thức & trạng thái thanh toán.

**Postconditions:**

- Không thay đổi dữ liệu.

**Alternative / Exception Flow:**

- A1. Lọc theo trạng thái/khoảng thời gian.
- E1. Truy cập chuyến của người khác → 403/404.

**Acceptance Criteria:**

- AC-07.1: Chỉ trả chuyến của Customer đang đăng nhập.
- AC-07.2: Số tiền hiển thị trùng với cước đã chốt (snapshot).
- AC-07.3: Trip history được lưu **5 năm**; có thể hiển thị biên lai điện tử đơn giản; hết retention xử lý theo BRULE-32.

### UC-08 — Đánh giá tài xế

**Actor:** Customer

**FR:** FR-12

**Scope:** trip-service, driver-service

**Preconditions:**

- Chuyến Completed, thuộc Customer, chưa được đánh giá (BRULE-26).

**Main Flow:**

1. Customer chọn **1–5 sao**, comment tùy chọn, trong **7 ngày** sau `Completed`.
2. System lưu đánh giá, phát `TripRated`.
3. driver-service cập nhật điểm trung bình tài xế.

**Postconditions:**

- Chuyến có đúng 1 đánh giá.

**Alternative / Exception Flow:**

- E1. Chuyến chưa Completed hoặc không thuộc Customer → 403/409.
- E2. Đã đánh giá → 409.
- E3. Điểm ngoài khoảng cho phép → 400.

**Acceptance Criteria:**

- AC-08.1: Mỗi chuyến tối đa 1 đánh giá.
- AC-08.2: Điểm trung bình tài xế cập nhật sau khi nhận `TripRated` (eventual consistency).

### UC-09 — Thanh toán chuyến đi

**Actor:** Customer, Driver

**FR:** FR-13, FR-21

**Scope:** payment-service, trip-service

**Preconditions:**

- Chuyến Completed, đã có cước cuối cùng.

**Main Flow (tiền mặt):**

1. payment-service tạo Payment Pending (method=Cash, amount=cước cuối).
2. Customer trả tiền mặt cho Driver.
3. Driver xác nhận "đã thu tiền" trên ứng dụng.
4. System chuyển Payment → Succeeded, phát `PaymentSucceeded`, thông báo Customer.

**Main Flow (điện tử):**

1. payment-service tạo Payment Pending (method=Electronic) và gọi UC-21 để khởi tạo giao dịch tại provider.
2. Customer hoàn tất thanh toán trên môi trường của provider.
3. Kết quả trả về qua UC-21; System cập nhật trạng thái và thông báo Customer.

**Postconditions:**

- Trip có trạng thái thanh toán (Succeeded/Failed/Pending); Trip vẫn Completed bất kể kết quả (BRULE-25).

**Alternative / Exception Flow:**

- A1. Payment chỉ được tạo sau khi Trip `Completed` (Q-08).
- E1. Driver xác nhận thu tiền cho chuyến không thuộc mình → 403.
- E2. Payment đã Succeeded mà xác nhận lại → 409 (BRULE-23).
- E3. Điện tử thất bại → UC-10 (P1), Customer được thông báo.

**Acceptance Criteria:**

- AC-09.1: Mỗi chuyến có tối đa một Payment Succeeded.
- AC-09.2: Số tiền thanh toán bằng cước cuối cùng của chuyến.
- AC-09.3: Lỗi payment-service không làm Trip thay đổi trạng thái hay chặn đặt chuyến mới.

### UC-10 — Xử lý lại thanh toán thất bại

**Actor:** Customer, Staff

**FR:** FR-14

**Scope:** payment-service

**Preconditions:**

- Payment Electronic ở trạng thái Failed và còn trong giới hạn **3 lần retry/24 giờ**.

**Main Flow:**

1. Customer nhận thông báo thanh toán thất bại.
2. Customer chọn **Retry Electronic Payment**; P1 không tự động và không cho flow này đổi sang Cash.
3. System tạo electronic attempt mới (cùng payment, idempotency key mới) và xử lý theo UC-21.

**Postconditions:**

- Payment Succeeded hoặc vẫn Failed khi hết số lần thử.

**Alternative / Exception Flow:**

- E1. Quá **3 lần** hoặc quá **24 giờ** → giữ Payment `Failed`, thông báo Customer và tạo yêu cầu Staff xử lý; không tự đổi sang Cash.

**Acceptance Criteria:**

- AC-10.1: Tối đa **3 lần retry trong 24 giờ**.
- AC-10.2: Không phát sinh hai giao dịch thành công cho một chuyến; retry không tự đổi sang Cash.

### UC-11 — Đăng ký tài xế / Staff tạo tài khoản tài xế

**Actor:** Driver, Staff

**FR:** FR-15, FR-36

**Scope:** identity-account-service, driver-service

**Preconditions:**

- Driver tự đăng ký (không cần đăng nhập) hoặc Staff đã đăng nhập có quyền.

**Main Flow:**

1. Với Driver tự đăng ký: Driver nhập SĐT, System gửi OTP và chỉ cho tiếp tục sau khi OTP hợp lệ (GA-07). Với Staff tạo thay mặt: bỏ qua public OTP flow nhưng Staff phải xác thực/RBAC hợp lệ.
2. Driver (hoặc Staff thay mặt) nhập họ tên, SĐT, CCCD/giấy tờ định danh, GPLX, thông tin phương tiện, biển số và upload tài liệu bắt buộc.
3. System kiểm tra trùng (SĐT, biển số), tạo tài khoản Driver trạng thái Pending.
4. Staff xem danh sách chờ duyệt, xem hồ sơ, chọn Approve hoặc Reject (kèm lý do).
5. Approve → tài khoản Active, thông báo Driver; Reject → Rejected, thông báo kèm lý do.
6. System ghi audit `DriverApproved`/`DriverRejected`.

**Postconditions:**

- Driver Active có thể chuyển Available (BRULE-03).

**Alternative / Exception Flow:**

- A1. Staff có thể tạo hồ sơ Driver, nhưng Driver chỉ được nhận Trip sau khi có hành động **Approve** hợp lệ và audit.
- E1. SĐT/biển số đã tồn tại → 409.
- E2. Hồ sơ thiếu thông tin bắt buộc → 400.

**Acceptance Criteria:**

- AC-11.1: Driver tự đăng ký không thể tạo hồ sơ `Pending` nếu chưa OTP verify SĐT; Staff-created Driver không dùng public OTP flow nhưng vẫn cần Staff authorization.
- AC-11.2: Driver tự đăng ký không thể nhận chuyến trước khi được duyệt.
- AC-11.3: Approve/Reject có audit và thông báo cho Driver.
- AC-11.4: Biển số xe không trùng giữa các tài xế đang hoạt động.

### UC-12 — Cập nhật hồ sơ và phương tiện

**Actor:** Driver

**FR:** FR-16

**Scope:** driver-service

**Preconditions:**

- Driver đã đăng nhập và chỉ cập nhật dữ liệu thuộc quyền của mình.

**Main Flow:**

1. Driver sửa hồ sơ cá nhân, thông tin phương tiện (biển số, hãng, mẫu, màu, loại xe/dịch vụ, số chỗ).
2. System validate và lưu; ghi audit `VehicleUpdated`/`ProfileUpdated`.
3. System ghi audit các trường thay đổi. Baseline 1.0 không quy định tự động đưa hồ sơ về Pending khi sửa; nếu cần rule này phải được đặc tả ở change/design issue riêng.

**Postconditions:**

- Hồ sơ/phương tiện được cập nhật theo quyền; trạng thái approval không tự thay đổi nếu chưa có rule riêng.

**Alternative / Exception Flow:**

- E1. Dữ liệu không hợp lệ → 400.

**Acceptance Criteria:**

- AC-12.1: Driver chỉ sửa được hồ sơ/phương tiện của mình.
- AC-12.2: Không áp dụng ngầm rule re-approval ngoài Customer Decision Q-14.

### UC-13 — Cập nhật trạng thái hoạt động

**Actor:** Driver

**FR:** FR-17

**Scope:** driver-service, booking-service

**Preconditions:**

- Driver Active (BRULE-03), có phương tiện hợp lệ.

**Main Flow:**

1. Driver chuyển trạng thái Offline ↔ Available.
2. System kiểm tra điều kiện và cập nhật; phát `DriverStatusChanged`.
3. `booking-service` nhận/cập nhật dữ liệu availability phục vụ matching.

**Postconditions:**

- Chỉ Driver `Available` mới là ứng viên matching.

**Alternative / Exception Flow:**

- A1. Chuyển Offline khi có offer Pending → offer không còn hợp lệ; `booking-service` tiếp tục redispatch.
- E1. Chưa được duyệt/bị khóa/không có phương tiện → 403.

**Acceptance Criteria:**

- AC-13.1: Tài xế Offline/Busy không xuất hiện trong danh sách ứng viên.
- AC-13.2: Driver chưa duyệt không thể chuyển Available.

### UC-14 — Cập nhật vị trí tài xế

**Actor:** Driver

**FR:** FR-18

**Scope:** driver-service

**Preconditions:**

- Driver đã đăng nhập, trạng thái Available hoặc Busy.

**Main Flow:**

1. Ứng dụng Driver gửi vị trí (lat, lng, heading, speed, accuracy, timestamp) mỗi **10 giây** khi `Available` hoặc `Busy`.
2. System validate và ghi vị trí mới nhất (hot store) và lịch sử (theo chuyến nếu Busy).
3. Vị trí phục vụ tìm tài xế gần (UC-18), ETA và hiển thị cho Customer (UC-05).

**Postconditions:**

- Vị trí gần nhất của tài xế được cập nhật.

**Alternative / Exception Flow:**

- A1. Mất kết nối: app lưu cập nhật tạm và gửi bù khi có mạng; request/event quan trọng idempotent; mất heartbeat **30 giây** → Driver `Offline`.
- E1. Tọa độ không hợp lệ hoặc timestamp quá cũ → 400, bỏ qua.
- E2. Không nhận heartbeat quá ngưỡng → tài xế Available bị chuyển Offline (BRULE-34).

**Acceptance Criteria:**

- AC-14.1: Vị trí cũ hơn ngưỡng stale không được dùng để chọn ứng viên (BRULE-07).
- AC-14.2: Location history chi tiết lưu **90 ngày**, hết retention xóa/anonymize theo batch job.
- AC-14.3: Endpoint cập nhật vị trí chịu được tải theo NFR-03.

### UC-15 — Nhận và phản hồi đề xuất chuyến

**Actor:** Driver

**FR:** FR-19

**Scope:** booking-service, trip-service, driver-service, notification-service

**Preconditions:**

- Driver `Available` và vừa được `booking-service` tạo offer `Pending`.

**Main Flow:**

1. Driver nhận thông báo đề xuất chuyến (điểm đón, điểm đến, khoảng cách tới điểm đón, cước ước tính nếu chính sách cho phép, thời hạn phản hồi).
2. Driver chọn Accept.
3. System xác minh offer còn Pending, chưa hết hạn, Trip còn Searching (BRULE-13) rồi gán tài xế.
4. Offer → Accepted; Trip → DriverAssigned; Driver → Busy; phát `DriverOfferAccepted`/`DriverAssigned`.
5. System thông báo Customer.

**Postconditions:**

- Trip có đúng một tài xế; các offer khác của Trip bị đóng.

**Alternative / Exception Flow:**

- A1. Driver Reject → offer Rejected, chuyển UC-19.
- E1. Accept sau khi offer hết hạn / Trip đã Cancelled / đã gán → 409 "offer không còn hiệu lực".
- E2. Mất kết nối trong lúc có offer; nếu không có phản hồi trong **60 giây** → `OfferExpired`, không phạt Driver.

**Acceptance Criteria:**

- AC-15.1: Accept hợp lệ gán tài xế chính xác một lần, kể cả khi bị gọi lặp/đồng thời.
- AC-15.2: Accept sau hết hạn bị từ chối 409.
- AC-15.3: Driver chỉ thao tác trên offer gửi cho chính mình.

### UC-16 — Cập nhật trạng thái thực hiện chuyến

**Actor:** Driver

**FR:** FR-20

**Scope:** trip-service, booking-service, driver-service

**Preconditions:**

- Driver là tài xế được gán của Trip.

**Main Flow:**

1. Driver cập nhật lần lượt: Đã đến điểm đón → Đã đón khách → Đang di chuyển → Hoàn thành.
2. System kiểm tra trình tự hợp lệ (BRULE-14) và quyền (BRULE-15), cập nhật Trip, ghi lịch sử trạng thái.
3. Mỗi bước phát event tương ứng; Customer được thông báo ở "đã đến điểm đón" và "hoàn thành" (và các bước khác theo catalog mục 12).
4. Khi Hoàn thành: System tính cước cuối cùng (UC-20), Trip → Completed, Driver → Available, phát `TripCompleted`.

**Postconditions:**

- Trip ở trạng thái mới; khi Completed có cước cuối cùng và kích hoạt thanh toán.

**Alternative / Exception Flow:**

- A1. Mất mạng: app lưu hàng đợi cập nhật và gửi lại khi có mạng; Trip trên server không tự hủy; System xử lý idempotent.
- E1. Sai thứ tự (vd. Hoàn thành khi chưa đón khách) → 409.
- E2. Không phải tài xế được gán → 403.
- E3. Không có actual distance/GPS cuối chuyến → UC-20 dùng estimated distance và đánh dấu `estimated` theo Q-01.

**Acceptance Criteria:**

- AC-16.1: Trình tự hợp lệ duy nhất: Assigned → Arrived → PickedUp → InProgress → Completed.
- AC-16.2: Cập nhật lặp lại cùng trạng thái là idempotent (không tạo event trùng).
- AC-16.3: Hoàn thành chuyến giải phóng tài xế về Available.

### UC-17 — Driver cancellation policy sau khi Accept (P2)

**Actor:** Driver

**FR:** FR-22

**Scope:** P2 – chưa triển khai trong baseline P1

**Baseline decision:**

- P1 Driver **không được tự hủy Trip sau khi Accept**.
- Nếu có sự cố, Driver báo Staff; Staff/Admin xử lý theo quyền.
- Cơ chế Driver cancellation và penalty để P2. Customer Decision Baseline **không chốt flow/penalty P2 chi tiết**, vì vậy SRS 1.0 không tự suy diễn transition hay quy tắc xếp hạng cho UC này.

### UC-18 — Tìm và đề xuất tài xế

**Actor:** System

**FR:** FR-23, FR-24, FR-25

**Scope:** booking-service, driver-service

**Preconditions:**

- Nhận `BookingCreated` / Trip `Searching` (hoặc Staff kích hoạt redispatch cho trường hợp được phép).

**Main Flow:**

1. `booking-service` nạp policy baseline (radius 5 km, offer timeout 60s, max 10 Driver, total 120s).
2. Lấy ứng viên: tài xế Available, Approved, đúng loại xe, trong bán kính, vị trí còn mới (BRULE-07).
3. Xếp hạng: khoảng cách tới điểm đón tăng dần; nếu bằng nhau, ưu tiên Driver có thời điểm `Available` sớm hơn. Không dùng rating/acceptance/cancellation rate trong P1.
4. Chọn ứng viên đầu và tạo offer `Pending` với hạn 60 giây; cơ chế lock/idempotency ngăn double assignment.
5. Phát `DriverOfferCreated`; notification-service gửi Push/In-app tới Driver.
6. Chờ phản hồi (UC-15) hoặc timer hết hạn (UC-19).

**Postconditions:**

- Có đúng một offer Pending cho Trip tại một thời điểm.

**Alternative / Exception Flow:**

- A1. Không có ứng viên: giữ bán kính **5 km**, không mở rộng; UC-19 tiếp tục tuần tự tối đa **10 Driver** và tổng thời gian **2 phút**.
- E1. Không lấy được current location hợp lệ từ driver-service/Map adapter → không dùng Driver đó; nếu không còn ứng viên → NoDriverFound và cảnh báo vận hành.

**Acceptance Criteria:**

- AC-18.1: Ứng viên đầu tiên là tài xế hợp lệ có thứ hạng cao nhất theo tiêu chí hiện hành.
- AC-18.2: Không bao giờ có hai offer Pending cho cùng một Trip; một tài xế không có hai offer Pending cùng lúc.
- AC-18.3: Tài xế Offline/Busy/khác loại xe/vị trí cũ không bao giờ được đề xuất.

### UC-19 — Xử lý tài xế từ chối/không phản hồi và tìm lại

**Actor:** System

**FR:** FR-26, FR-27

**Scope:** booking-service, trip-service, notification-service

**Preconditions:**

- Offer chuyển Rejected hoặc Expired; Trip còn Searching.

**Main Flow:**

1. `booking-service` đánh dấu candidate vừa Reject/Expired để không offer lại trong vòng tìm hiện tại.
2. Nếu còn ứng viên và chưa vượt ngưỡng (BRULE-11) → quay lại bước 3 của UC-18 với ứng viên kế tiếp.
3. Nếu hết ứng viên hoặc vượt ngưỡng → phát `NoDriverFound`; Trip → NoDriverFound.
4. notification-service thông báo rõ cho Customer; Staff nhận cảnh báo (nếu cấu hình).

**Postconditions:**

- Có offer mới Pending, hoặc Trip NoDriverFound.

**Alternative / Exception Flow:**

- A1. Customer hủy trong lúc tìm → dừng tìm, đóng offer.
- E1. Timer lỗi/mất → cơ chế quét offer quá hạn định kỳ đảm bảo không kẹt.

**Acceptance Criteria:**

- AC-19.1: Từ chối/timeout tự động chuyển cho tài xế khác mà không cần Customer thao tác.
- AC-19.2: Tài xế đã từ chối/hết hạn không nhận lại offer cùng chuyến.
- AC-19.3: Khi không tìm được, Customer nhận thông báo "không tìm được tài xế" và Trip ở NoDriverFound.
- AC-19.4: Không có Trip nào kẹt vô hạn ở Searching (có giới hạn thời gian tối đa).

### UC-20 — Tính cước

**Actor:** System

**FR:** FR-28

**Scope:** booking-service

**Preconditions:**

- Có loại dịch vụ và thông tin chuyến (điểm đón/đến; khi cuối chuyến: quãng đường/thời gian thực tế).

**Main Flow:**

1. Ước tính: `booking-service` lấy quãng đường dự kiến qua Map/Geo adapter và áp dụng fare rule hiện hành.
2. Cước cuối: `booking-service` dùng quãng đường thực tế của Trip và fare rule snapshot; thiếu GPS thì dùng quãng đường ước tính và đánh dấu `estimated`.
3. Lưu bản ghi tính cước (đầu vào, kết quả, version rule) và snapshot vào Trip (BRULE-20).

**Postconditions:**

- Trip có `estimatedFare` và (sau hoàn thành) `finalFare` kèm chi tiết thành phần.

**Alternative / Exception Flow:**

- A1. Cước cuối theo công thức `BaseFare + DistanceKm×PricePerKm + Surcharge`, không tính phút/minimum fare; làm tròn **1.000 VND**.
- E1. Thiếu GPS cuối chuyến → dùng quãng đường ước tính và đánh dấu `estimated`.

**Acceptance Criteria:**

- AC-20.1: Cùng đầu vào và cùng version rule cho cùng kết quả (deterministic).
- AC-20.2: Thay đổi fare rule không làm thay đổi cước của chuyến đã chốt.
- AC-20.3: Có thể thêm loại dịch vụ mới bằng cấu hình mà không sửa mã lõi (BRULE-37).

### UC-21 — Xử lý thanh toán điện tử qua Payment Provider

**Actor:** System, Payment Provider

**FR:** FR-29, FR-30, FR-31

**Scope:** payment-service

**Preconditions:**

- Payment điện tử ở Pending.

**Main Flow:**

1. payment-service gọi adapter provider để khởi tạo giao dịch kèm mã tham chiếu duy nhất (idempotency key).
2. Provider trả thông tin chuyển hướng/token thanh toán; Customer thanh toán trên môi trường của provider (thông tin thẻ không đi qua CAB).
3. Provider gọi callback/webhook kết quả; payment-service xác thực chữ ký, đối chiếu mã tham chiếu và số tiền.
4. Cập nhật Payment (Succeeded/Failed), phát `PaymentSucceeded`/`PaymentFailed`.
5. notification-service thông báo Customer.

**Postconditions:**

- Payment có trạng thái cuối; chỉ lưu mã tham chiếu/token do provider cấp, **không** lưu PAN/CVV/…(BRULE-22).

**Alternative / Exception Flow:**

- A1. Không nhận callback trong thời hạn → chủ động truy vấn trạng thái giao dịch tại provider (đối soát) rồi cập nhật.
- E1. Callback trùng → xử lý idempotent, không cập nhật lặp.
- E2. Sai chữ ký/sai số tiền → từ chối, ghi audit/cảnh báo bảo mật.
- E3. Provider không phản hồi/lỗi → Payment Failed; Customer được thông báo; Trip không bị ảnh hưởng (BRULE-25).

**Acceptance Criteria:**

- AC-21.1: Không có dữ liệu thẻ/tài khoản thanh toán trong database, log, event của CAB.
- AC-21.2: Callback lặp lại không tạo thay đổi/giao dịch thứ hai.
- AC-21.3: Webhook sai chữ ký bị từ chối.
- AC-21.4: Đổi provider chỉ cần thay adapter/cấu hình (BRULE-37).

### UC-22 — Gửi thông báo

**Actor:** System, Notification Provider

**FR:** FR-32, FR-33

**Scope:** notification-service

**Preconditions:**

- Có domain event thuộc catalog (mục 12.1).

**Main Flow:**

1. notification-service nhận event (consumer idempotent theo `eventId`).
2. Xác định người nhận (Customer/Driver/Staff...) theo Recipient Matrix (mục 12.4), template và kênh theo cấu hình.
3. Tạo notification và gửi **Push + In-app**; lỗi provider retry tối đa **3 lần**.
4. Ghi Sent/Failed; thử lại theo chính sách; quá ngưỡng → DeadLetter và cảnh báo.

**Postconditions:**

- Người nhận có thông báo (hoặc vết lỗi).

**Alternative / Exception Flow:**

- A1. Một kênh lỗi → thử kênh dự phòng (nếu cấu hình).
- E1. Provider lỗi → retry với backoff; không ảnh hưởng service nguồn (BRULE-27).
- E2. Thiết bị chưa đăng ký token → lưu in-app, bỏ qua push.

**Acceptance Criteria:**

- AC-22.1: Customer nhận thông báo ở: tiếp nhận yêu cầu, có tài xế nhận, tài xế đến điểm đón, chuyến hoàn thành, kết quả thanh toán, không tìm được tài xế, chuyến bị hủy.
- AC-22.2: Driver nhận thông báo: đề xuất chuyến mới, chuyến bị hủy/thay đổi.
- AC-22.3: Event nhận lặp không tạo thông báo trùng.
- AC-22.4: Thêm kênh/provider mới không sửa mã nghiệp vụ của service khác.

### UC-23 — Quản lý khách hàng

**Actor:** Staff

**FR:** FR-35

**Scope:** customer-service, API Gateway

**Preconditions:**

- Staff đã đăng nhập, có quyền xem khách hàng.

**Main Flow:**

1. Staff tìm kiếm khách hàng (SĐT, tên, mã).
2. Staff xem hồ sơ, lịch sử chuyến, trạng thái; cập nhật thông tin được phép.
3. System che một phần dữ liệu nhạy cảm theo quyền (BRULE-31).
4. Hành động ghi audit.

**Postconditions:**

- Dữ liệu được xem/cập nhật có kiểm soát.

**Alternative / Exception Flow:**

- A1. Khóa/mở khóa tài khoản → thao tác nhạy cảm của Admin (BRULE-30).
- E1. Không đủ quyền → 403.

**Acceptance Criteria:**

- AC-23.1: Staff không khóa được tài khoản khách hàng.
- AC-23.2: Dữ liệu nhạy cảm được che theo quy tắc.

### UC-24 — Quản lý tài xế

**Actor:** Staff, Admin

**FR:** FR-36, FR-37, FR-43A

**Scope:** driver-service, API Gateway

**Preconditions:**

- Đã đăng nhập, có quyền.

**Main Flow:**

1. Staff tìm kiếm/lọc tài xế theo trạng thái duyệt, trạng thái hoạt động, loại xe.
2. Staff xem hồ sơ, phương tiện, điểm đánh giá, lịch sử chuyến; duyệt/từ chối hồ sơ (UC-11); cập nhật thông tin.
3. Admin khóa/mở khóa tài xế kèm lý do (BRULE-30); System ép tài xế Offline, hủy offer đang chờ.
4. Ghi audit; thông báo tài xế.

**Postconditions:**

- Trạng thái tài xế thay đổi đúng quyền.

**Alternative / Exception Flow:**

- E1. Nếu Driver đang `Busy`, Admin/Staff xử lý Trip hiện tại theo quyền; tài khoản Suspended không được nhận offer mới. Mọi force-close nếu có phải theo FR-43B và audit.
- E2. Staff gọi thao tác khóa → 403.

**Acceptance Criteria:**

- AC-24.1: Chỉ Admin khóa/mở khóa; mọi lần khóa có lý do và audit.
- AC-24.2: Tài xế Suspended không nhận được offer mới.

### UC-25 — Quản lý phương tiện

**Actor:** Staff

**FR:** FR-38

**Scope:** driver-service

**Preconditions:**

- Staff đã đăng nhập, có quyền.

**Main Flow:**

1. Staff tìm kiếm phương tiện (biển số, tài xế, loại xe).
2. Staff xem/tạo/cập nhật phương tiện, gán loại dịch vụ, kích hoạt/vô hiệu.
3. System validate (biển số duy nhất) và lưu; ghi audit.

**Postconditions:**

- Dữ liệu phương tiện chính xác; phương tiện vô hiệu không dùng để nhận chuyến.

**Alternative / Exception Flow:**

- E1. Biển số trùng → 409.
- E2. Vô hiệu phương tiện của tài xế Busy → 409.

**Acceptance Criteria:**

- AC-25.1: Một biển số chỉ gắn với một phương tiện đang hoạt động.
- AC-25.2: Phương tiện vô hiệu không thể dùng khi chuyển Available.

### UC-26 — Giám sát chuyến đang diễn ra và trạng thái tài xế

**Actor:** Staff

**FR:** FR-39

**Scope:** API Gateway, trip-service, driver-service, payment-service

**Preconditions:**

- Staff đã đăng nhập, có quyền.

**Main Flow:**

1. Staff mở màn hình giám sát: danh sách chuyến hoạt động, lọc theo trạng thái.
2. System hiển thị chuyến, tài xế, khách (đã che), thời gian ở trạng thái hiện tại, cờ chuyến bất thường (BRULE-17).
3. Staff xem trạng thái/vị trí tài xế; mở chi tiết chuyến (lịch sử trạng thái, offers, thanh toán).

**Postconditions:**

- Không thay đổi dữ liệu.

**Alternative / Exception Flow:**

- E1. Một service nguồn lỗi → hiển thị dữ liệu còn lại và đánh dấu phần thiếu (graceful degradation).

**Acceptance Criteria:**

- AC-26.1: Chuyến kẹt quá ngưỡng cấu hình được gắn cờ.
- AC-26.2: Danh sách có phân trang/lọc, phản hồi theo NFR-02.

### UC-27 — Hỗ trợ xử lý chuyến lỗi

**Actor:** Staff, Admin

**FR:** FR-40, FR-43B, FR-43C

**Scope:** trip-service, booking-service, payment-service, API Gateway

**Preconditions:**

- Chuyến chưa ở trạng thái cuối, hoặc Payment cần xử lý.

**Main Flow:**

1. Staff xác định chuyến lỗi/khiếu nại (UC-26/UC-28).
2. Staff chọn thao tác được phép: hủy hỗ trợ (thay Customer), kích hoạt lại tìm tài xế, ghi chú xử lý.
3. Thao tác nhạy cảm — khóa/mở account, force-close Trip, điều chỉnh cước/giao dịch, đổi policy — chỉ Admin thực hiện; **không có manual Driver Assignment trong P1**.
4. System bắt buộc nhập lý do, thực hiện, ghi audit, thông báo bên liên quan.

**Postconditions:**

- Chuyến về trạng thái hợp lệ; có vết xử lý.

**Alternative / Exception Flow:**

- E1. Thao tác không hợp lệ với trạng thái hiện tại → 409.
- E2. Staff thực hiện thao tác nhạy cảm → 403.

**Acceptance Criteria:**

- AC-27.1: Mọi thao tác xử lý có lý do và audit (người thực hiện, thời điểm, trước/sau).
- AC-27.2: Staff không thể điều chỉnh cước/đóng cưỡng bức.
- AC-27.3: Chuyến bị đóng Failed giải phóng tài xế.

### UC-28 — Tra cứu lịch sử giao dịch

**Actor:** Staff

**FR:** FR-41

**Scope:** payment-service, API Gateway

**Preconditions:**

- Staff có quyền xem giao dịch.

**Main Flow:**

1. Staff tìm theo mã chuyến, mã giao dịch, khách hàng, khoảng thời gian, trạng thái, phương thức.
2. System trả danh sách giao dịch và chi tiết: số tiền, phương thức, trạng thái, các lần thử, mã tham chiếu provider.
3. System không hiển thị dữ liệu thẻ (không tồn tại trong hệ thống).

**Postconditions:**

- Không thay đổi dữ liệu; việc truy cập có thể được audit.

**Alternative / Exception Flow:**

- E1. Không đủ quyền → 403.

**Acceptance Criteria:**

- AC-28.1: Tìm kiếm theo tối thiểu: mã chuyến, mã giao dịch, khoảng thời gian, trạng thái.
- AC-28.2: Dữ liệu nhạy cảm bị che theo BRULE-31.

### UC-29 — Quản lý nhân viên và phân quyền

**Actor:** Admin

**FR:** FR-42

**Scope:** identity-account-service

**Preconditions:**

- Admin đã đăng nhập.

**Main Flow:**

1. Admin tạo/cập nhật/vô hiệu tài khoản Staff/Admin.
2. Admin gán vai trò và quyền (RBAC).
3. System lưu, thu hồi phiên khi quyền thay đổi; ghi audit `RoleChanged`.

**Postconditions:**

- Quyền có hiệu lực theo vai trò mới.

**Alternative / Exception Flow:**

- E1. Admin tự gỡ quyền Admin cuối cùng → 409.
- E2. Không phải Admin → 403.

**Acceptance Criteria:**

- AC-29.1: Quyền thay đổi có hiệu lực trong thời gian token còn lại ≤ ngưỡng SEC-06.
- AC-29.2: Mọi thay đổi vai trò được audit.

### UC-30 — Cấu hình chính sách vận hành

**Actor:** Admin

**FR:** FR-44

**Scope:** booking-service, trip-service

**Preconditions:**

- Admin đã đăng nhập.

**Main Flow:**

1. Admin quản lý policy có version; các giá trị baseline P1: service type `MOTORBIKE`/`CAR_4_SEATS`, offer timeout 60s, radius 5km, max 10 Driver, search 2 phút, cancellation/no-show policy theo mục 6.6, fare formula theo mục 6.4.
2. System validate, lưu phiên bản mới có hiệu lực (từ thời điểm xác định).
3. Ghi audit `PolicyConfigChanged` (giá trị cũ/mới).

**Postconditions:**

- Chính sách mới áp dụng cho chuyến/offer **mới**; chuyến đang chạy giữ snapshot (BRULE-20).

**Alternative / Exception Flow:**

- E1. Giá trị ngoài miền hợp lệ → 400.

**Acceptance Criteria:**

- AC-30.1: Thay đổi chính sách không cần deploy lại.
- AC-30.2: Thay đổi có phiên bản và audit.

### UC-31 — Xem báo cáo vận hành (P2)

**Actor:** Admin

**FR:** FR-45

**Scope:** reporting-service

**Preconditions:**

- Admin đã đăng nhập.

**Main Flow:**

1. Admin chọn khoảng thời gian, bộ lọc (loại xe, khu vực...).
2. System trả: số chuyến, doanh thu, tỷ lệ hoàn thành, tỷ lệ hủy, hiệu quả tài xế (định nghĩa chỉ số ).
3. (Tùy chọn) xuất dữ liệu.

**Postconditions:**

- Không thay đổi dữ liệu nghiệp vụ.

**Alternative / Exception Flow:**

- E1. reporting-service lỗi → không ảnh hưởng luồng đặt xe.

**Acceptance Criteria:**

- AC-31.1: Số liệu khớp với dữ liệu chuyến/thanh toán nguồn trong sai số cho phép của eventual consistency.
- AC-31.2: Chỉ Admin truy cập.

### UC-32 — Tra cứu Audit Log

**Actor:** Admin

**FR:** FR-34, FR-46

**Scope:** identity-account-service

**Preconditions:**

- Admin đã đăng nhập.

**Main Flow:**

1. Hệ thống liên tục nhận audit event từ các service và ghi append-only (FR-34).
2. Admin tìm theo thời gian, actor, hành động, đối tượng, correlationId, kết quả.
3. System trả bản ghi (dữ liệu nhạy cảm đã che).

**Postconditions:**

- Có vết kiểm tra phục vụ điều tra sự cố.

**Alternative / Exception Flow:**

- E1. Không đủ quyền → 403.

**Acceptance Criteria:**

- AC-32.1: Audit log không thể sửa/xóa qua API.
- AC-32.2: Truy vết được toàn bộ chuỗi sự kiện của một chuyến qua `correlationId`.
- AC-32.3: Việc truy cập audit log cũng được ghi lại.

# 9. Functional Requirements theo Actor

## 9.1 Common

| FR-ID | Requirement                                                                                      | UC    | Priority |
| ----- | ------------------------------------------------------------------------------------------------ | ----- | -------- |
| FR-01 | Đăng nhập bằng SĐT + password (Customer; account tương ứng cho Driver/Staff/Admin), cấp JWT/RBAC | UC-02 | P1       |
| FR-02 | Đăng xuất/thu hồi refresh session                                                                | UC-02 | P1       |
| FR-03 | Password reset nâng cao qua kênh xác minh                                                        | UC-33 | P2       |

## 9.2 Customer

| FR-ID | Requirement                                                                                    | UC    | Priority |
| ----- | ---------------------------------------------------------------------------------------------- | ----- | -------- |
| FR-04 | Đăng ký Customer bằng SĐT + password và OTP xác minh SĐT; email tùy chọn                       | UC-01 | P1       |
| FR-05 | Xem/cập nhật hồ sơ cá nhân                                                                     | UC-03 | P1       |
| FR-06 | Chọn điểm đón/đến bằng địa chỉ, bản đồ hoặc vị trí hiện tại; validate trong TP.HCM             | UC-04 | P1       |
| FR-07 | Hiển thị `MOTORBIKE`, `CAR_4_SEATS` và cước ước tính                                           | UC-04 | P1       |
| FR-08 | Tạo booking, chọn phương thức Cash/Electronic và bắt đầu automatic matching                    | UC-04 | P1       |
| FR-09 | Theo dõi Trip bằng polling 5s/lần, xem Driver/vehicle/ETA/current location đúng quyền          | UC-05 | P1       |
| FR-10 | Hủy/no-show theo policy 30s/20.000 VND/5 phút; không tự hủy từ PickedUp                        | UC-06 | P1       |
| FR-11 | Xem lịch sử Trip, fare, payment và biên lai điện tử đơn giản                                   | UC-07 | P1       |
| FR-12 | Rating Driver 1–5 sao, comment tùy chọn, 1 lần/Trip trong 7 ngày                               | UC-08 | P1       |
| FR-13 | Thanh toán Trip Completed bằng Cash hoặc Electronic                                            | UC-09 | P1       |
| FR-14 | Retry Electronic Payment tối đa 3 lần trong 24 giờ; sau ngưỡng chuyển Staff, không tự đổi Cash | UC-10 | P1       |

## 9.3 Driver

| FR-ID | Requirement                                                                                                                        | UC    | Priority |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------- | ----- | -------- |
| FR-15 | Đăng ký Driver và upload hồ sơ tối thiểu; Driver self-registration OTP verify theo GA-07; bắt buộc Staff duyệt trước khi nhận Trip | UC-11 | P1       |
| FR-16 | Cập nhật hồ sơ/phương tiện theo quyền                                                                                              | UC-12 | P1       |
| FR-17 | Chuyển `Offline ↔ Available` khi đủ điều kiện                                                                                      | UC-13 | P1       |
| FR-18 | Gửi current location mỗi 10s khi Available/Busy; stale >30s không dùng matching                                                    | UC-14 | P1       |
| FR-19 | Nhận offer và Accept/Reject trong 60s                                                                                              | UC-15 | P1       |
| FR-20 | Cập nhật `DriverArrived → PickedUp → InProgress → Completed`                                                                       | UC-16 | P1       |
| FR-21 | Xác nhận đã thu Cash sau Trip Completed                                                                                            | UC-09 | P1       |
| FR-22 | Driver cancellation policy sau Accept                                                                                              | UC-17 | P2       |

## 9.4 System

| FR-ID | Requirement                                                                                                | UC    | Priority |
| ----- | ---------------------------------------------------------------------------------------------------------- | ----- | -------- |
| FR-23 | Lọc Driver: Available, approved, đúng service type, trong 5km, current location ≤30s                       | UC-18 | P1       |
| FR-24 | Xếp hạng nearest-first; tie-breaker là Available time sớm hơn                                              | UC-18 | P1       |
| FR-25 | Offer tuần tự, một offer Pending/Trip, timeout 60s                                                         | UC-18 | P1       |
| FR-26 | Reject/Expired → redispatch tự động Driver kế tiếp, không cần Customer tạo lại                             | UC-19 | P1       |
| FR-27 | Dừng sau tối đa 10 Driver hoặc 2 phút; không mở rộng radius; chuyển NoDriverFound                          | UC-19 | P1       |
| FR-28 | Fare estimate/final theo `BaseFare + DistanceKm×PricePerKm + Surcharge`, round 1.000 VND, version/snapshot | UC-20 | P1       |
| FR-29 | Tích hợp 1 Payment Provider qua adapter; sandbox/mock được phép                                            | UC-21 | P1       |
| FR-30 | Không lưu PAN/CVV; chỉ lưu payment reference, amount, method, status                                       | UC-21 | P1       |
| FR-31 | Callback/webhook an toàn, idempotent, verify chữ ký/số tiền                                                | UC-21 | P1       |
| FR-32 | Gửi Push + In-app theo event nghiệp vụ                                                                     | UC-22 | P1       |
| FR-33 | Notification adapter; retry tối đa 3 lần; lỗi không chặn core                                              | UC-22 | P1       |
| FR-34 | Ghi audit append-only cho thao tác quan trọng                                                              | UC-32 | P1       |

## 9.5 Staff

| FR-ID | Requirement                                                                                  | UC           | Priority |
| ----- | -------------------------------------------------------------------------------------------- | ------------ | -------- |
| FR-35 | Tra cứu Customer; dữ liệu nhạy cảm theo nguyên tắc least privilege, SĐT masked               | UC-23        | P1       |
| FR-36 | Tạo/tra cứu/duyệt/từ chối Driver; Reject có lý do                                            | UC-11, UC-24 | P1       |
| FR-37 | Tìm/lọc Driver và xem current location phục vụ vận hành                                      | UC-24, UC-26 | P1       |
| FR-38 | Quản lý phương tiện Driver                                                                   | UC-25        | P1       |
| FR-39 | Dashboard cơ bản: Trip đang chạy, Driver online, Trip lỗi, Payment status                    | UC-26        | P1       |
| FR-40 | Hỗ trợ Trip lỗi/force-cancel theo quyền, kích hoạt redispatch; **không gán Driver thủ công** | UC-27        | P1       |
| FR-41 | Tra cứu transaction/payment không chứa dữ liệu thẻ                                           | UC-28        | P1       |

## 9.6 Admin

| FR-ID  | Requirement                                                                                 | UC           | Priority |
| ------ | ------------------------------------------------------------------------------------------- | ------------ | -------- |
| FR-42  | Quản lý Staff/Admin account và RBAC                                                         | UC-29        | P1       |
| FR-43A | Khóa/mở khóa account; bắt buộc lý do và audit                                               | UC-23, UC-24 | P1       |
| FR-43B | Force-close Trip; bắt buộc lý do và audit                                                   | UC-27        | P1       |
| FR-43C | Điều chỉnh fare/transaction khi được phép; lưu actor, time, before/after, reason và audit   | UC-27        | P1       |
| FR-44  | Cấu hình policy có version cho service type, fare, matching, cancellation và vận hành       | UC-30        | P1       |
| FR-45  | Báo cáo nâng cao/export: số Trip, revenue, completion/cancellation rate, Driver performance | UC-31        | P2       |
| FR-46  | Tra cứu audit log theo time/actor/action/resource/correlationId                             | UC-32        | P1       |

# 10. Business Rules theo Actor

> BRULE-ID được giữ ổn định theo ISS-06. Giá trị dưới đây là baseline chính thức, không còn là giả định Q-01..Q-31.

## 10.1 Account & Booking

| BRULE-ID | Group   | Rule                                                                                                                                             | UC           |
| -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| BRULE-01 | Account | Customer login identity là SĐT duy nhất; đăng ký phải OTP verify; email optional                                                                 | UC-01        |
| BRULE-02 | Account | Chỉ account hợp lệ/đủ quyền dùng protected API; Suspended bị từ chối                                                                             | UC-02        |
| BRULE-04 | Booking | Pickup/destination hợp lệ và thuộc vùng phục vụ TP.HCM                                                                                           | UC-04        |
| BRULE-05 | Booking | P1 không hỗ trợ đặt hộ, đặt trước giờ, nhiều điểm dừng                                                                                           | UC-04        |
| BRULE-06 | Booking | Service type P1 chỉ `MOTORBIKE`, `CAR_4_SEATS`                                                                                                   | UC-04        |
| BRULE-16 | Trip    | Customer cancel: Searching miễn phí; DriverAssigned ≤30s miễn phí; >30s phí 20.000 VND; từ PickedUp không tự hủy. No-show sau 5 phút: 20.000 VND | UC-06        |
| BRULE-26 | Rating  | Customer→Driver, 1–5 sao, comment optional, 1 lần/Trip, trong 7 ngày; không auto-lock Driver                                                     | UC-08        |
| BRULE-33 | Data    | Customer chỉ xem realtime location của Driver được gán cho Trip của mình; location history retention 90 ngày                                     | UC-05, UC-14 |

## 10.2 Driver, Matching & Trip

| BRULE-ID | Group    | Rule                                                                                                               | UC           |
| -------- | -------- | ------------------------------------------------------------------------------------------------------------------ | ------------ |
| BRULE-03 | Driver   | Driver phải được Staff approve và hồ sơ/phương tiện hợp lệ trước khi Available/nhận Trip                           | UC-11, UC-13 |
| BRULE-07 | Matching | Candidate: Available, approved, đúng service type, distance ≤5km, location age ≤30s                                | UC-18        |
| BRULE-08 | Matching | Nearest-first; tie → Available time sớm hơn; không dùng rating/acceptance/cancellation rate                        | UC-18        |
| BRULE-09 | Matching | Một offer Pending tại một thời điểm/Trip; timeout 60s                                                              | UC-15, UC-18 |
| BRULE-10 | Matching | Driver Reject/Expired không được offer lại cùng booking trong vòng tìm hiện tại                                    | UC-19        |
| BRULE-11 | Matching | Max 10 Driver, max 2 phút, không mở rộng 5km; hết ngưỡng → NoDriverFound                                           | UC-19        |
| BRULE-12 | Matching | booking-service là authority matching/offer/timeout/redispatch; chống double assignment bằng idempotency/lock      | UC-15, UC-18 |
| BRULE-13 | Matching | Accept hợp lệ đầu tiên thắng; race Accept/Cancel/Timeout phải có exactly-once effect                               | UC-15, UC-06 |
| BRULE-14 | Trip     | State order `Searching→DriverAssigned→DriverArrived→PickedUp→InProgress→Completed`; PickedUp/InProgress tách riêng | UC-16        |
| BRULE-15 | Trip     | Chỉ Driver được gán mới cập nhật Trip execution state                                                              | UC-16        |
| BRULE-34 | Network  | Location/heartbeat mỗi 10s; không nhận 30s → Offline; Trip đang chạy không tự hủy; app gửi bù idempotent           | UC-14, UC-16 |

## 10.3 Fare & Payment

| BRULE-ID | Group   | Rule                                                                                                                     | UC           |
| -------- | ------- | ------------------------------------------------------------------------------------------------------------------------ | ------------ |
| BRULE-18 | Fare    | `FinalFare = BaseFare + DistanceKm×PricePerKm + Surcharge`; không TimeFare/minimum fare P1                               | UC-20        |
| BRULE-19 | Fare    | Estimate dùng estimated distance; Final dùng actual distance; thiếu GPS dùng estimate và cờ `estimated`; round 1.000 VND | UC-04, UC-20 |
| BRULE-20 | Fare    | Fare rule versioned và snapshot vào Trip; currency VND                                                                   | UC-20, UC-30 |
| BRULE-21 | Payment | Cash/Electronic; Payment tạo sau Completed; Cash do Driver confirm                                                       | UC-09        |
| BRULE-22 | Payment | Không lưu PAN/CVV/dữ liệu thẻ nhạy cảm                                                                                   | UC-21        |
| BRULE-23 | Payment | Mỗi Trip tối đa một Payment Succeeded; callback/request idempotent                                                       | UC-09, UC-21 |
| BRULE-24 | Payment | Electronic retry tối đa 3 lần/24h; không auto switch Cash; hết ngưỡng Failed + notify + Staff handling                   | UC-10, UC-21 |
| BRULE-25 | Payment | Payment Failed không đổi trạng thái Completed và không chặn Customer đặt Trip mới                                        | UC-09, UC-21 |

## 10.4 Notification, Operations & Data

| BRULE-ID | Group         | Rule                                                                                                                                                               | UC                         |
| -------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| BRULE-27 | Notification  | Kafka async; Push/In-app; retry max 3; notification failure không chặn core                                                                                        | UC-22                      |
| BRULE-28 | Notification  | Notification không chứa secret/payment sensitive data                                                                                                              | UC-22                      |
| BRULE-17 | Operations    | Staff/Admin dashboard cơ bản phải hiển thị Trip running, Driver online, Trip lỗi, Payment status                                                                   | UC-26                      |
| BRULE-29 | Admin         | P1 chỉ `Staff` và `Admin`; server-side RBAC                                                                                                                        | UC-23..UC-29               |
| BRULE-30 | Admin         | Chỉ Admin: suspend/activate account, force-close Trip, fare/transaction adjustment, policy config; bắt buộc reason + audit; không manual assign                    | UC-24, UC-27, UC-30        |
| BRULE-31 | Privacy       | Staff xem dữ liệu cần thiết, SĐT masked; Driver không thấy full Customer phone; Customer không thấy full private Driver contact; sensitive Admin access phải audit | UC-23, UC-24, UC-28        |
| BRULE-32 | Data          | Trip/Payment/locked account 5 năm; audit 1 năm; detailed location/notification 90 ngày; hết retention xóa/anonymize batch                                          | UC-07, UC-14, UC-32        |
| BRULE-35 | Audit         | Sensitive/admin actions phải audit append-only, có actor/time/before-after/reason/correlation                                                                      | UC-32                      |
| BRULE-36 | Report        | P1 chỉ dashboard cơ bản; advanced metrics/export P2                                                                                                                | UC-26, UC-31               |
| BRULE-37 | Extensibility | Payment/Notification/Map external integration qua adapter; không phá core contract                                                                                 | UC-20, UC-21, UC-22, UC-30 |

# 11. Audit Requirements

## 11.1 Audit Events

P1 audit tối thiểu: register/login/logout; Driver approve/reject; account suspend/activate; vehicle/profile change; booking/offer; Trip state/cancel/force-close; fare calculated/adjusted; Payment lifecycle/webhook reject; Staff/Admin role/policy change; PermissionDenied; AuditLogViewed.

Mọi thao tác Admin nhạy cảm phải lưu: `actor`, `action`, `resource`, `reason`, `occurredAt`, `before`, `after`, `correlationId`.

## 11.2 Audit Log

- Append-only; không cung cấp API sửa.
- Retention: **1 năm**; hết retention xóa/anonymize theo batch policy.
- Chỉ Admin được tra cứu; truy cập dữ liệu nhạy cảm/audit log phải được audit.
- Không ghi password, token, PAN/CVV; SĐT/email/địa chỉ che hoặc băm khi không cần thiết.
- 7 business service phát audit/domain event qua Kafka; P1 lưu audit tập trung trong phạm vi `identity-account-service` để không tạo business service thứ 8.
- Lỗi ghi audit bất đồng bộ không làm dừng core flow; riêng thao tác Admin nhạy cảm phải bảo đảm audit record được persist/outbox trước khi báo thành công.

# 12. Notification Requirements

## 12.1 Event / Notification Catalog

Kafka event P1 chính: `BookingCreated`, `DriverOfferCreated`, `DriverOfferAccepted`, `DriverOfferRejected`, `DriverOfferExpired`, `DriverAssigned`, `DriverArrived`, `TripPickedUp`, `TripInProgress`, `TripCompleted`, `TripCancelled`, `PaymentSucceeded`, `PaymentFailed`, `NotificationRequested`.

- Producer là service sở hữu aggregate: booking-service cho booking/offer; trip-service cho Trip; payment-service cho Payment.
- notification-service consume event và tạo Push/In-app notification.

## 12.2 Event Envelope

```json
{
  "eventId": "uuid",
  "eventType": "TripCompleted",
  "eventVersion": "1.0",
  "occurredAt": "2026-10-03T08:15:30.123Z",
  "producer": "trip-service",
  "correlationId": "uuid",
  "aggregateId": "tripId",
  "payload": {}
}
```

Consumer phải idempotent theo `eventId`; payload không chứa dữ liệu nhạy cảm không cần thiết.

## 12.3 Flow and Recipients

1. Service nghiệp vụ commit dữ liệu + outbox cùng transaction và publish Kafka.
2. notification-service xác định người nhận/template tiếng Việt.
3. P1 tạo **In-app** và gọi Push Provider qua adapter.
4. Lỗi gửi retry tối đa **3 lần**; hết ngưỡng → DeadLetter/cảnh báo Admin.
5. Notification failure không làm rollback Booking/Trip/Payment.

## 12.4 Recipient Matrix

| Event                             | Customer | Driver          | Staff | Admin | External Provider |
| --------------------------------- | -------- | --------------- | ----- | ----- | ----------------- |
| BookingCreated/Searching          | Y        | N               | N     | N     | Push              |
| DriverOfferCreated                | N        | Y               | N     | N     | Push              |
| DriverAssigned                    | Y        | Y               | N     | N     | Push              |
| NoDriverFound                     | Y        | N               | Y     | N     | Push              |
| DriverArrived                     | Y        | N               | N     | N     | Push              |
| TripCompleted/Cancelled/Failed    | Y        | Y khi liên quan | N     | N     | Push              |
| PaymentSucceeded                  | Y        | N               | N     | N     | Push              |
| PaymentFailed                     | Y        | N               | Y     | N     | Push              |
| DriverApproved/Rejected/Suspended | N        | Y               | N     | N     | Push              |
| Notification DeadLetter           | N        | N               | N     | Y     | —                 |

# 13. Data Model

## 13.1 Nguyên tắc

- PostgreSQL database per service; service chỉ ghi DB mình sở hữu.
- Cross-service chỉ lưu ID tham chiếu, không foreign key xuyên database.
- Đồng bộ cần phản hồi ngay qua gRPC; bất đồng bộ qua Kafka.
- Redis chỉ dùng cho API Gateway token/session cache, rate limit và cache.
- Retention theo BRULE-32.

## 13.2 Database theo 7 business service

### 13.2.1 identity-account-service / `identity-account-db`

`accounts`, `roles`, `permissions`, `role_permissions`, `refresh_sessions`, `otp_verifications`, `audit_events`.

### 13.2.2 customer-service / `customer-db`

`customers`, `customer_profile_history`.

### 13.2.3 driver-service / `driver-db`

`drivers`, `vehicles`, `driver_documents`, `driver_availability`, `driver_current_location`, `driver_location_history`.

- Current location cập nhật mỗi 10s khi Available/Busy; >30s stale.
- Detailed location history retention 90 ngày.

### 13.2.4 booking-service / `booking-db`

`bookings`, `driver_offers`, `driver_reservations`, `service_types`, `fare_rules`, `fare_calculations`, `booking_policies`, `outbox_events`.

- P1 service types: `MOTORBIKE`, `CAR_4_SEATS`.
- Matching policy: radius 5km, max 10 candidates, offer 60s, total search 120s, sequential offer, no radius expansion.
- Fare rule: `base_fare`, `price_per_km`, `surcharge`, version/effective time; không `per_minute`/minimum fare P1.

### 13.2.5 trip-service / `trip-db`

`trips`, `trip_status_history`, `trip_cancellations`, `ratings`, `trip_fare_snapshot`.

Trip lưu fare rule/version snapshot và cờ `estimated` nếu final distance fallback.

### 13.2.6 notification-service / `notification-db`

`notifications`, `notification_templates`, `notification_attempts`, `outbox_events`. Retention notification 90 ngày.

### 13.2.7 payment-service / `payment-db`

`payments`, `payment_attempts`, `provider_callbacks`, `outbox_events`. Retention Payment/Transaction 5 năm. Không lưu PAN/CVV.

## 13.3 Cross-service references

Ví dụ: `booking.customer_id`, `booking.driver_id`, `trip.booking_id`, `payment.trip_id` là ID logic; service lấy dữ liệu cần thiết qua gRPC hoặc event projection, không join DB xuyên service.

## 13.4 Map/Geo data

Không có `location-service`. `booking-service` gọi 1 Map/Geo Provider qua adapter cho geocode/route/distance/ETA; current Driver location thuộc `driver-service`.

# 14. Deployment Components

## 14.1 Kiến trúc P1

```text
Customer Mobile / Driver Mobile / Staff-Admin Web
                    |
             REST HTTPS/JSON
                    |
               API Gateway
          (Redis cache/rate-limit)
                    |
            gRPC synchronous
                    |
  +---------+---------+---------+---------+
  |         |         |         |         |
identity  customer  driver   booking    trip
  |                               |        |
  +-------------------------------+--------+
                  payment   notification
                       \       /
                          Kafka
```

External adapters: 1 Payment Provider, 1 Map/Geo Provider, 1 Push Provider/notification provider.

**Nhiệm vụ API Gateway P1:**

- Là **public entry point duy nhất** cho Customer/Driver/Staff/Admin client; business-service port không được expose như public API.
- Terminate/validate HTTPS ở biên triển khai; verify JWT signature/expiry và áp dụng route-level authorization trước khi forward; service đích vẫn phải kiểm tra authorization theo resource.
- Chuyển public REST/JSON thành gRPC call nội bộ, chuẩn hóa error/status và truyền `correlationId` xuyên luồng.
- Thực hiện rate limit/throttling, request-size/basic validation, CORS/security headers phù hợp bề mặt web.
- Tổng hợp `/health`, `/ready`, `/health/services`; không chứa business logic matching/fare/payment/trip.

## 14.2 Communication contract

| Luồng                               | Protocol                       |
| ----------------------------------- | ------------------------------ |
| Client → API Gateway                | REST API, HTTPS/JSON           |
| API Gateway → Service               | gRPC synchronous               |
| Service → Service cần phản hồi ngay | gRPC synchronous               |
| Async domain/integration event      | Kafka                          |
| Payment/Map/Notification Provider   | Adapter + external API/webhook |

Không service nào truy cập trực tiếp DB của service khác.

## 14.3 Deployment components

| Component     | Baseline P1                                    |
| ------------- | ---------------------------------------------- |
| Runtime       | Java Spring Boot                               |
| API Gateway   | Bắt buộc                                       |
| Redis         | Gateway token/session cache, rate limit, cache |
| Kafka         | Message broker bắt buộc                        |
| Database      | 7 PostgreSQL DB, database per service          |
| Container     | Docker                                         |
| Orchestration | Docker Compose                                 |
| CI/CD         | GitHub Actions                                 |
| Kubernetes    | Không dùng P1                                  |

## 14.4 P1 / P2 Deployment Scope

P1 chỉ triển khai 7 business service ở mục 13.2 cùng Gateway/Redis/Kafka/PostgreSQL. Không tạo `dispatch-service`, `pricing-service`, `location-service` hoặc `reporting-service` trong P1. Reporting nâng cao có thể bổ sung ở P2 mà không ảnh hưởng core.

## 14.5 Source Code Organization – Grading Baseline

P1 sử dụng **monorepo** để dễ compose/demo/chấm bài. Cấu trúc tối thiểu:

```text
cab-system/
├─ api-gateway/
├─ services/
│  ├─ identity-account-service/
│  ├─ customer-service/
│  ├─ driver-service/
│  ├─ booking-service/
│  ├─ trip-service/
│  ├─ notification-service/
│  └─ payment-service/
├─ contracts/
│  ├─ openapi/
│  └─ proto/
├─ infra/
│  ├─ docker-compose.yml
│  └─ db-init/
├─ scripts/
│  └─ seed/
├─ postman/
├─ docs/
├─ .env.example
├─ .gitignore
└─ README.md
```

- Mỗi service có `src/main`, `src/test`, Dockerfile và cấu hình riêng; không import code/domain package trực tiếp xuyên service.
- `contracts/openapi` chứa public REST contract; `contracts/proto` chứa gRPC contracts.
- `postman/` chứa collection/environment dùng để chứng minh 30 tiêu chí chấm.
- `infra/docker-compose.yml` phải compose được Gateway, Redis, Kafka, 7 service và 7 PostgreSQL DB; container name/port/healthcheck phải được mô tả trong README.

## 14.6 Git Hygiene / Environment Configuration

- `.gitignore` **bắt buộc** ignore: `.env`, `.env.*` có secret, IDE/build output, local DB volume/dump, log, key/certificate private và file credential; phải có exception `!.env.example` để file mẫu được commit.
- Repository chỉ commit `.env.example` với tên biến và **giá trị giả/placeholder**, tuyệt đối không commit password/API key/JWT private key/webhook secret thật.
- Secret runtime lấy từ environment/secret store; CI/CD secret lấy từ GitHub Actions Secrets (hoặc cơ chế tương đương), không hard-code.
- Evidence chấm: `git ls-files` không được liệt kê `.env` chứa secret; README chỉ dẫn copy `.env.example` → `.env` cục bộ.

# 15. Microservice Ownership

## 15.1 7 Business Services

| Service                    | Ownership chính                                                                                 | Database            |
| -------------------------- | ----------------------------------------------------------------------------------------------- | ------------------- |
| `identity-account-service` | OTP, login, JWT, RBAC, Staff/Admin accounts, P1 audit store                                     | identity-account-db |
| `customer-service`         | Customer profile                                                                                | customer-db         |
| `driver-service`           | Driver profile, vehicle, approval, availability, current location                               | driver-db           |
| `booking-service`          | Booking, matching, offer/timeout/redispatch, service type, estimate/final fare, Map/Geo adapter | booking-db          |
| `trip-service`             | Trip lifecycle, cancellation/no-show, rating, Trip history                                      | trip-db             |
| `notification-service`     | Push/In-app, template, delivery retry                                                           | notification-db     |
| `payment-service`          | Cash/Electronic Payment, provider adapter, retry/payment status                                 | payment-db          |

## 15.2 Ownership rules

- `booking-service` là authority cho matching/offer/timeout/redispatch và fare calculation; không có dispatch/pricing service riêng.
- `driver-service` là authority cho Driver/vehicle/approval/availability/current location; không có location service riêng.
- `trip-service` là authority cho Trip state machine, cancellation/no-show/rating/history.
- `payment-service` không được cập nhật trực tiếp Trip DB; phát Kafka event và/hoặc dùng gRPC theo contract.
- Cross-service không dùng database join/foreign key; chỉ ID + gRPC/Kafka.

## 15.3 Architectural Decisions (ADR baseline)

| ADR    | Quyết định                                                                                                 |
| ------ | ---------------------------------------------------------------------------------------------------------- |
| ADR-01 | Microservices bắt buộc, đúng 7 business service P1                                                         |
| ADR-02 | PostgreSQL database per service; không direct DB access xuyên service                                      |
| ADR-03 | Client REST/HTTPS/JSON qua API Gateway                                                                     |
| ADR-04 | Synchronous nội bộ dùng gRPC                                                                               |
| ADR-05 | Asynchronous dùng Kafka, outbox/idempotent consumer                                                        |
| ADR-06 | booking-service là authority matching và chống double assignment                                           |
| ADR-07 | Driver current location thuộc driver-service; Map/Geo external qua adapter                                 |
| ADR-08 | Fare/matching/cancellation policy cấu hình có version; Trip snapshot fare rule                             |
| ADR-09 | External provider sau adapter; mock/sandbox được phép cho đồ án                                            |
| ADR-10 | P1 Docker Compose + GitHub Actions; không Kubernetes                                                       |
| ADR-11 | P1 monorepo theo mục 14.5; contracts tách `openapi/` và `proto/`; không shared business code xuyên service |
| ADR-12 | Exact grading endpoints/security evidence theo GA-01..GA-14; các GA không thay đổi Q-01..Q-31              |

# 16. Non-functional Requirements

## 16.0 Health, Quality và Security

### 16.0.1 Health Check

Mỗi service cung cấp health/readiness; Docker Compose dependency health; Gateway không route vào service chưa ready. Để đáp ứng grading smoke test, Gateway phải expose chính xác các endpoint public sau:

| Endpoint               | Mục đích                | Expected tối thiểu                                                                                        |
| ---------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------- |
| `GET /health`          | Liveness/overall health | `200` và `status=HEALTHY` khi Gateway sống; không yêu cầu mọi external provider phải online               |
| `GET /ready`           | Readiness               | `200` + `status=READY` khi dependency nội bộ bắt buộc sẵn sàng; nếu chưa ready trả `503` + dependency lỗi |
| `GET /health/services` | Tổng hợp service health | `200` và danh sách Gateway + **7 business service** với `name`, `status`, `ready`                         |

Các endpoint health là public theo SEC-01, nhưng không được trả secret, connection string hoặc stack trace. Service nội bộ có thể dùng Spring Boot Actuator/private health endpoint; Postman grading chỉ gọi ba endpoint Gateway ở trên (GA-03).

### 16.0.2 Quality – chỉ tiêu baseline

| ID     | Nhóm               | Chỉ tiêu chính thức P1                                                               |
| ------ | ------------------ | ------------------------------------------------------------------------------------ |
| NFR-01 | Availability       | **99,5%** cho hệ thống P1                                                            |
| NFR-02 | API response       | **p95 ≤ 2 giây**                                                                     |
| NFR-03 | Capacity           | **1.000 Driver online**, **500 Trip đồng thời**, **100 req/s peak**                  |
| NFR-04 | Fault isolation    | Payment/Notification lỗi không làm dừng booking/matching/trip core                   |
| NFR-05 | Scalability        | 7 service scale độc lập theo bounded context; không shared DB                        |
| NFR-06 | Deployment         | Docker Compose P1; service có thể build/deploy độc lập; backward-compatible contract |
| NFR-07 | DR                 | **RPO ≤ 15 phút**, **RTO ≤ 60 phút**                                                 |
| NFR-08 | Performance test   | Kiểm thử các chỉ tiêu NFR trong **tuần 6**                                           |
| NFR-09 | Retention          | Trip/Payment/account locked 5 năm; audit 1 năm; location/notification 90 ngày        |
| NFR-10 | Network resilience | Driver location/heartbeat 10s; Offline sau 30s; offline Trip không auto-cancel       |
| NFR-11 | Client UX/i18n     | UI tiếng Việt; currency VND; round fare 1.000 VND                                    |
| NFR-12 | Client update      | Trip polling 5 giây/lần; push cho event quan trọng; WebSocket không bắt buộc         |

### 16.0.3 Security

| ID     | Yêu cầu baseline                                                                                                                                                                                                                                                      |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEC-01 | Protected API yêu cầu xác thực; public/register/login/health và signed webhook theo contract riêng.                                                                                                                                                                   |
| SEC-02 | RBAC server-side theo Permission Matrix; deny-by-default.                                                                                                                                                                                                             |
| SEC-03 | Password băm bằng bcrypt/argon2 có salt; không lưu/ghi log plaintext.                                                                                                                                                                                                 |
| SEC-04 | HTTPS/TLS cho Client→Gateway và kết nối ngoài; nội bộ bảo vệ theo deployment design.                                                                                                                                                                                  |
| SEC-05 | Rate limit/chống brute-force ở Gateway/account flow.                                                                                                                                                                                                                  |
| SEC-06 | JWT access/refresh; refresh có thu hồi/xoay vòng; TTL cụ thể là security design [TBD], không phải business decision.                                                                                                                                                  |
| SEC-07 | Object-level authorization: Customer chỉ Trip/hồ sơ của mình; Driver chỉ offer/Trip được gán.                                                                                                                                                                         |
| SEC-08 | PII/sensitive data masked khi không cần thiết; Staff xem SĐT masked; Admin sensitive access phải audit.                                                                                                                                                               |
| SEC-09 | Realtime Driver location chỉ Customer của Trip được gán và Staff/Admin phục vụ vận hành; detailed history retention 90 ngày.                                                                                                                                          |
| SEC-10 | Không lưu PAN/CVV; payment webhook verify signature, idempotency/replay và amount/reference.                                                                                                                                                                          |
| SEC-11 | Validate input và chống injection/XSS/CSRF theo bề mặt ứng dụng.                                                                                                                                                                                                      |
| SEC-12 | Secret không commit code; DB credential riêng/tối thiểu cho từng service.                                                                                                                                                                                             |
| SEC-13 | Log/event không chứa password/token/card data hoặc PII không cần thiết.                                                                                                                                                                                               |
| SEC-14 | Audit append-only; chỉ Admin truy vấn; truy vấn/sensitive action được audit.                                                                                                                                                                                          |
| SEC-15 | **Encryption at rest:** password dùng one-way hash bcrypt/Argon2id; reversible sensitive PII/identity-document fields dùng authenticated encryption (AES-256-GCM hoặc tương đương), key nằm ngoài DB, có `keyId`/rotation; direct DB access không đọc được plaintext. |
| SEC-16 | SQL injection: mọi truy vấn user-controlled dùng ORM/prepared statement/parameter binding; cấm nối chuỗi SQL từ input; payload kiểu `' OR 1=1 --` không bypass auth và trả 400/401.                                                                                   |
| SEC-17 | XSS: text input không được render thành executable HTML; field cho comment/name dùng validation/sanitization và output encoding; payload `<script>...</script>` bị reject 400 hoặc trả dạng escaped/plain text.                                                       |
| SEC-18 | JWT tampering: chỉ chấp nhận algorithm allowlist + signature hợp lệ; sửa `sub`/`role`/payload hoặc chữ ký phải trả 401, không được trust claim trước verification.                                                                                                    |
| SEC-19 | Gateway rate limit phải trả `429 Too Many Requests` + `Retry-After`; `POST /bookings` có per-principal burst limit và route-wide protection để traffic >1000 req/s không làm sập hệ thống.                                                                            |
| SEC-20 | Replay/idempotency: payment create/retry/callback và booking create hỗ trợ `Idempotency-Key`/request fingerprint; duplicate request không tạo transaction/booking thành công lần hai và có thể trả lại kết quả đã lưu.                                                |

## 16.1 Configuration

Các giá trị nghiệp vụ baseline phải cấu hình/versioned, không hard-code: fare rule, service type, offer timeout 60s, search radius 5km, max 10 Driver, search 120s, cancellation/no-show policy, notification retry 3, payment retry 3/24h. Secret/provider key tách theo environment. Grading rate-limit baseline: `POST /bookings` tối đa **10 req/s/account, burst 20** và **100 req/s/route**; vượt ngưỡng trả 429 + `Retry-After` (có thể cấu hình theo environment nhưng demo/chấm phải giữ ngưỡng đủ để burst >1000 req/s bị throttle).

## 16.2 API Contract

### 16.2.1 Public API

Client chỉ gọi REST HTTPS/JSON qua API Gateway. Endpoint chi tiết được đặc tả trong OpenAPI/design document theo ISS-07/ISS-08; SRS chỉ giữ contract nghiệp vụ.

### 16.2.2 Internal API

Gateway→service và synchronous service→service dùng **gRPC**. Không dùng REST nội bộ làm baseline P1.

### 16.2.3 Authentication

JWT + RBAC; refresh session/token cache có thể dùng Redis tại Gateway. TTL/key algorithm là chi tiết security design, không phải Q nghiệp vụ.

### 16.2.4 HTTP Status Codes

Public REST dùng status code chuẩn 2xx/4xx/5xx; error body có `code`, `message`, `correlationId`, `details` khi an toàn.

### 16.2.5 Supplemental Contracts

Giữ số mục `16.2.5` theo ISS-02. Pagination/validation/correlation/error envelope được đặc tả chi tiết trong OpenAPI/design; `correlationId` phải xuyên Gateway→gRPC→Kafka để audit/tracing.

### 16.2.6 Grading-aligned Public API Minimum Contract

Các endpoint dưới đây là **minimum public contract P1** để Postman có thể kiểm tra trực tiếp qua Gateway. OpenAPI có thể bổ sung endpoint khác nhưng không được loại bỏ/đổi semantics các endpoint này trong baseline 1.0.1.

| Endpoint                                                             | Auth                                   | Yêu cầu / Expected                                                                                                                                                                |
| -------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /customers/{customerId}`                                        | Bearer JWT                             | Customer chỉ self; Staff/Admin xem theo quyền; Driver bị 403. Trả 200 khi hợp lệ, 403/404 khi không có quyền/không tồn tại.                                                       |
| `GET /drivers/{driverId}`                                            | Bearer JWT                             | Driver chỉ self; Staff/Admin xem theo quyền; Customer chỉ xem dữ liệu tối thiểu của Driver được gán cho active Trip.                                                              |
| `GET /drivers/nearby?lat={lat}&lng={lng}&radiusKm=1&page=0&limit=10` | Bearer JWT Staff/Admin                 | Trả Driver quanh tọa độ trong **1 km** cho grading query; có `page`, `limit`, `total`, `items`; ít nhất hỗ trợ lọc trạng thái. **Không thay thế matching radius 5 km** của FR-23. |
| `GET /customers/{customerId}/bookings?page=0&limit=10`               | Bearer JWT                             | Customer chỉ self; Staff/Admin theo quyền; trả booking liên quan Customer với paging/limit.                                                                                       |
| `POST /auth/register/driver/request-otp`                             | Public + rate limit                    | Gửi OTP cho SĐT Driver self-registration.                                                                                                                                         |
| `POST /auth/register/driver/verify-otp`                              | Public + rate limit                    | Verify OTP và phát registration verification token/ngữ cảnh ngắn hạn.                                                                                                             |
| `POST /auth/register/driver`                                         | Public + verified registration context | Tạo Driver profile `Pending`; nếu self-registration chưa verify OTP → 400/401. Staff-created flow dùng admin/staff endpoint riêng theo FR-36.                                     |
| `POST /bookings`                                                     | Customer JWT + idempotency             | Tạo Booking đúng 1 lần; response state public là `SEARCHING`.                                                                                                                     |
| `POST /trips/{id}/cancel`                                            | Customer/Staff theo quyền              | Response state public dùng enum `CANCELED`; domain nội bộ có thể giữ tên `Cancelled`.                                                                                             |
| `POST /webhooks/payment/{provider}`                                  | Signed webhook                         | Callback thành công làm public payment status = `COMPLETED`; event nội bộ có thể tiếp tục dùng `PaymentSucceeded`.                                                                |

**Pagination chuẩn:** `page` bắt đầu từ 0, `limit` mặc định 10, min 1, max 100; response list có `items`, `page`, `limit`, `totalItems`, `totalPages`. Input sai → 400.

**Availability naming:** public API chấp nhận `ONLINE`/`OFFLINE` cho smoke test; `ONLINE` map vào domain `Available`, `OFFLINE` map vào domain `Offline`; `Busy` là trạng thái hệ thống khi Driver đang có Trip.

**Idempotency:** endpoint tạo booking/payment attempt nhận header `Idempotency-Key`; cùng actor + endpoint + key + request hash trong cửa sổ lưu trữ phải trả cùng business result, không tạo duplicate. Reuse cùng key với payload khác → `409 IDEMPOTENCY_KEY_REUSED`.

## 16.3 Permission Matrix

_Allow(own) = chỉ với dữ liệu của chính mình/được gán. Admin kế thừa quyền của Staff._

| Resource/Action                                   | Customer                     | Driver                | Staff                       | Admin             |
| ------------------------------------------------- | ---------------------------- | --------------------- | --------------------------- | ----------------- |
| Đăng ký / đăng nhập / đăng xuất                   | Allow                        | Allow                 | Allow (đăng nhập)           | Allow (đăng nhập) |
| Xem/sửa hồ sơ cá nhân                             | Allow(own)                   | Allow(own)            | Deny                        | Deny              |
| Tạo yêu cầu đặt xe, ước tính cước                 | Allow                        | Deny                  | Deny                        | Deny              |
| Xem/theo dõi chuyến                               | Allow(own)                   | Allow(own, được gán)  | Allow (tất cả, dữ liệu che) | Allow             |
| Xem vị trí tài xế của chuyến                      | Allow(own, chuyến hoạt động) | Deny                  | Allow                       | Allow             |
| Hủy chuyến                                        | Allow(own, theo BRULE-16)    | Deny trong P1         | Allow (hỗ trợ theo quyền)   | Allow             |
| Đánh giá tài xế                                   | Allow(own)                   | Deny                  | Deny                        | Deny              |
| Cập nhật vị trí / trạng thái hoạt động            | Deny                         | Allow(own)            | Deny                        | Deny              |
| Accept/Reject offer                               | Deny                         | Allow(own)            | Deny                        | Deny              |
| Cập nhật trạng thái thực hiện chuyến              | Deny                         | Allow(own, được gán)  | Deny                        | Deny              |
| Xem/khởi tạo thanh toán chuyến                    | Allow(own)                   | Allow(own, được gán)  | Allow (xem)                 | Allow             |
| Xác nhận thu tiền mặt                             | Deny                         | Allow(own, được gán)  | Deny                        | Deny              |
| Xem lịch sử giao dịch (admin)                     | Deny                         | Deny                  | Allow (che)                 | Allow             |
| Quản lý khách hàng (xem/sửa)                      | Deny                         | Deny                  | Allow                       | Allow             |
| Khóa/mở khóa tài khoản                            | Deny                         | Deny                  | Deny                        | Allow             |
| Tạo tài khoản tài xế, duyệt/từ chối hồ sơ         | Deny                         | Deny                  | Allow                       | Allow             |
| Quản lý phương tiện                               | Deny                         | Allow(own, qua hồ sơ) | Allow                       | Allow             |
| Giám sát chuyến và tài xế                         | Deny                         | Deny                  | Allow                       | Allow             |
| Hủy hỗ trợ / tìm lại tài xế                       | Deny                         | Deny                  | Allow                       | Allow             |
| Đóng chuyến cưỡng bức / điều chỉnh cước-giao dịch | Deny                         | Deny                  | Deny                        | Allow             |
| Quản lý nhân viên, vai trò, quyền                 | Deny                         | Deny                  | Deny                        | Allow             |
| Cấu hình chính sách và loại dịch vụ               | Deny                         | Deny                  | Deny                        | Allow             |
| Xem báo cáo (P2)                                  | Deny                         | Deny                  | Deny                        | Allow             |
| Tra cứu audit log                                 | Deny                         | Deny                  | Deny                        | Allow             |

## 16.4 Key Management và Credential

- **JWT/Token:** ký bất đối xứng (đề xuất RS256/ES256), có `kid` và xoay khóa định kỳ; access token ngắn hạn, refresh token lưu dạng băm, có thể thu hồi (SEC-06). TTL [TBD].
- **Secret:** (API key provider, webhook secret, khóa ký) lưu trong secret manager/biến môi trường được bảo vệ; không commit mã nguồn; tách theo môi trường (dev/sandbox/prod); có quy trình xoay vòng.
- **Password:** băm bcrypt/argon2 có salt; không ghi log; chính sách độ mạnh/khóa tạm theo SEC-03/SEC-05.
- **Database Credential:** mỗi service một tài khoản DB riêng, quyền tối thiểu trên schema của mình, không dùng chung/superuser; xoay vòng định kỳ.
- **Payment:** không giữ khóa/dữ liệu thẻ của khách; chỉ giữ khóa tích hợp provider.
- **Encryption-at-rest key:** key mã hóa PII không lưu trong PostgreSQL hoặc source repo; inject qua secret manager/environment-protected secret. Ciphertext lưu kèm `keyId`, IV/nonce và authentication tag; hỗ trợ decrypt bằng key hiện hành và rotation/re-encrypt theo batch.
- **Queryable sensitive identity:** trường cần lookup/unique (ví dụ SĐT) có thể dùng normalized HMAC/hash index riêng; không dùng deterministic plaintext-like encryption để thay cho access control.

## 16.5 Seed và Testing Data

| Dataset                                | Mục đích                              | Source                | Expected                                                                                                                                    |
| -------------------------------------- | ------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| SD-01 Accounts & Roles                 | Kiểm thử đăng nhập, phân quyền        | Script seed           | 1 Admin, 2 Staff, ≥ 5 Customer (1 Suspended), ≥ 8 Driver ở các trạng thái: Active-Available (≥ 4), Busy, Offline, Pending, Suspended        |
| SD-02 Service Types & Fare Rules       | Kiểm thử tính cước                    | Baseline Q-01/Q-12    | `MOTORBIKE`, `CAR_4_SEATS`; công thức/rounding đúng baseline; BaseFare/PricePerKm/Surcharge cụ thể có thể là **demo data** và phải gắn nhãn |
| SD-03 Matching Policy                  | Kiểm thử tìm Driver/timeout           | Baseline Q-02..Q-04   | 5km, max 10 Driver, 60s/offer, 120s tổng; test timeout rút ngắn chỉ được dùng ở test isolated và phải gắn nhãn test override                |
| SD-04 Cancellation Policy              | Kiểm thử hủy/no-show                  | Baseline Q-05         | Searching free; DriverAssigned ≤30s free; >30s = 20.000 VND; no-show 5 phút = 20.000 VND                                                    |
| SD-05 Driver Locations                 | Kiểm thử ứng viên gần/xa/stale        | Script                | Tài xế ở các khoảng cách khác nhau, 1 vị trí stale, 1 khác loại xe                                                                          |
| SD-06 Payment Provider Sandbox         | Kiểm thử thanh toán điện tử           | Sandbox/mock provider | Kịch bản: thành công, từ chối, timeout, callback trùng, sai chữ ký, sai số tiền                                                             |
| SD-07 Notification Templates & Sandbox | Kiểm thử thông báo                    | Seed + mock provider  | Template cho mọi sự kiện catalog; mock provider có chế độ lỗi                                                                               |
| SD-08 Trips đa trạng thái              | Kiểm thử lịch sử, giám sát, xử lý lỗi | Script                | Trip ở mọi trạng thái, gồm 1 chuyến kẹt quá ngưỡng, 1 chuyến Payment Failed                                                                 |
| SD-09 Permission Matrix                | Kiểm thử RBAC                         | Seed theo 16.3        | Role/permission khớp ma trận                                                                                                                |
| SD-10 Service Area                     | Kiểm thử vùng phục vụ                 | Cấu hình              | Vùng hợp lệ và điểm ngoài vùng                                                                                                              |
| SD-11 Grading Nearby Drivers           | Tiêu chí 13                           | Script seed           | ≥5 Driver quanh một tọa độ: ít nhất 3 trong 1km và các trạng thái Available/Busy/Offline khác nhau; đủ dữ liệu để test paging/limit         |
| SD-12 Customer Bookings                | Tiêu chí 14                           | Script seed           | ≥5 Booking thuộc một Customer, nhiều trạng thái, đủ dữ liệu test paging/limit                                                               |
| SD-13 Security Attack Payloads         | Tiêu chí 24–30                        | Postman data          | plaintext DB inspection, SQLi, XSS, tampered JWT, unauthorized role, burst/rate-limit, replay/idempotency                                   |

## 16.6 Grading Alignment Requirements (GA)

> Nguồn: `phieucham(2).md`. GA là **implementation/test constraints**, không phải thay đổi quyết định khách hàng. Khi GA và business rule cùng đề cập một khái niệm, business rule vẫn là nguồn nghiệp vụ; GA chỉ bổ sung cách expose/test để lấy điểm.

| GA-ID | Requirement                                                                                                                                           | Mapping tiêu chí |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| GA-01 | Source code phải theo cấu trúc mục 14.5 và README mô tả trách nhiệm từng module/service.                                                              | 1                |
| GA-02 | `.gitignore`/`.env.example` theo mục 14.6; không commit secret/.env thật.                                                                             | 2                |
| GA-03 | Gateway expose `/health`, `/ready`, `/health/services` đúng contract 16.0.1.                                                                          | 6                |
| GA-04 | Public request từ client chỉ vào Gateway; direct service ports không được coi là public API/evidence grading.                                         | 8                |
| GA-05 | Có API lấy Customer theo ID và Driver theo ID với JWT/RBAC.                                                                                           | 11, 12           |
| GA-06 | Có API Driver-nearby riêng với radius **1km**, limit, paging; không thay đổi matching radius 5km. Có API list Booking theo Customer với limit/paging. | 13, 14           |
| GA-07 | Driver self-registration phải OTP verify SĐT trước khi tạo hồ sơ Pending; Staff-created path vẫn theo FR-36.                                          | 21               |
| GA-08 | DB inspection không thấy plaintext password/identity sensitive fields; key management nằm ngoài DB/repo.                                              | 24               |
| GA-09 | SQL injection payload không bypass query/auth; 400/401, không lộ DB.                                                                                  | 25               |
| GA-10 | XSS payload không execute; reject hoặc escape/sanitize output.                                                                                        | 26               |
| GA-11 | JWT tampering/sửa role/sub phải 401 do signature verification.                                                                                        | 27               |
| GA-12 | Cross-role unauthorized API phải 403 và không trả dữ liệu.                                                                                            | 28               |
| GA-13 | Spam `POST /bookings` >1000 req/s phải quan sát được 429, service không crash; có `Retry-After`.                                                      | 29               |
| GA-14 | Replay payment/request với cùng idempotency context không double charge; duplicate trả business result cũ/duplicate-safe response.                    | 30               |

# 17. Traceability

## 17.1 Traceability Matrix

| PC    | Nội dung kiểm tra                                                                               | UC/FR                                     | Endpoint/Evidence                                                                         | Service                             | Expected Result                                                                                | Seed                | PASS/FAIL |
| ----- | ----------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------- | --------- |
| PC-01 | Đăng ký Customer hợp lệ                                                                         | UC-01 / FR-04                             | `POST /auth/register/customer`                                                            | identity, customer                  | 201; tài khoản Active; mật khẩu băm                                                            | SD-01               | [ ]       |
| PC-02 | Đăng ký trùng SĐT                                                                               | UC-01 / FR-04                             | `POST /auth/register/customer`                                                            | identity-account                    | 409; không tạo bản ghi mới                                                                     | SD-01               | [ ]       |
| PC-03 | Đăng nhập đúng, nhận token có role                                                              | UC-02 / FR-01                             | `POST /auth/login`                                                                        | identity-account                    | 200; JWT có sub/role/exp                                                                       | SD-01               | [ ]       |
| PC-04 | Đăng nhập sai / tài khoản Suspended                                                             | UC-02 / FR-01                             | `POST /auth/login`                                                                        | identity-account                    | 401 / 403; có audit LoginFailed                                                                | SD-01               | [ ]       |
| PC-05 | Đăng xuất thu hồi refresh token                                                                 | UC-02 / FR-02                             | `POST /auth/logout`, `/auth/refresh`                                                      | identity-account                    | Refresh sau logout bị từ chối                                                                  | SD-01               | [ ]       |
| PC-06 | Cập nhật hồ sơ Customer                                                                         | UC-03 / FR-05                             | `PUT /customers/me`                                                                       | customer                            | 200; chỉ sửa hồ sơ của mình                                                                    | SD-01               | [ ]       |
| PC-07 | Lấy loại xe và ước tính cước                                                                    | UC-04, UC-20 / FR-07, FR-28               | `GET /service-types`, `POST /fares/estimate`                                              | booking, driver                     | Trả danh sách active và ước tính theo rule                                                     | SD-02, SD-10        | [ ]       |
| PC-08 | Tạo Booking hợp lệ → Trip Searching, phát BookingCreated, thông báo tiếp nhận                   | UC-04 / FR-06, FR-08                      | `POST /bookings`; `BookingCreated`                                                        | booking, trip, notification         | tạo đúng 1 lần; Trip Searching; Customer notified                                              | SD-01, SD-02, SD-10 | [ ]       |
| PC-09 | Chỉ cho đặt các service type P1 hợp lệ                                                          | UC-04 / FR-07, FR-08 (BRULE-06)           | Tạo booking                                                                               | booking                             | `MOTORBIKE`/`CAR_4_SEATS` hợp lệ; loại khác 400/422                                            | SD-02               | [ ]       |
| PC-10 | Điểm đón/đến thiếu, trùng, ngoài vùng                                                           | UC-04 / FR-06 (BRULE-04)                  | `POST /bookings`                                                                          | booking                             | 400 kèm details; không tạo Booking/Trip                                                        | SD-10               | [ ]       |
| PC-11 | Matching chọn Driver hợp lệ gần nhất; tie theo Available time                                   | UC-18 / FR-23, FR-24                      | `driver_offers`; `DriverOfferCreated`                                                     | booking, driver                     | Offer Pending cho ứng viên đúng ranking                                                        | SD-03, SD-05        | [ ]       |
| PC-12 | Không offer Driver Offline/Busy/sai loại/location>30s/Suspended/chưa duyệt                      | UC-18 / FR-23 (BRULE-07)                  | `driver_offers`                                                                           | booking, driver                     | Không tạo offer cho nhóm này                                                                   | SD-01, SD-05        | [ ]       |
| PC-13 | Driver Accept trong 60s → DriverAssigned, Driver Busy, Customer notified                        | UC-15 / FR-19                             | accept offer; Kafka events                                                                | booking, trip, driver, notification | exactly-once assignment                                                                        | SD-05               | [ ]       |
| PC-14 | Driver Reject → sequential redispatch, Customer không tạo lại                                   | UC-19 / FR-26                             | reject offer                                                                              | booking                             | Offer Rejected; offer mới nếu còn candidate                                                    | SD-03, SD-05        | [ ]       |
| PC-15 | Hết 60s → OfferExpired, không phạt Driver, chọn Driver kế tiếp                                  | UC-19 / FR-25, FR-26                      | timeout                                                                                   | booking                             | Expired + redispatch                                                                           | SD-03               | [ ]       |
| PC-16 | Hết 10 Driver hoặc 2 phút → NoDriverFound, radius không mở rộng                                 | UC-19 / FR-27                             | `NoDriverFound`                                                                           | booking, trip, notification         | Customer nhận thông báo rõ                                                                     | SD-03, SD-05        | [ ]       |
| PC-17 | Accept sau timeout/đồng thời/booking đã hủy                                                     | UC-15 / FR-19 (BRULE-13)                  | accept offer                                                                              | booking, trip                       | reject conflict; chỉ một Driver được gán                                                       | SD-05               | [ ]       |
| PC-18 | Customer polling 5s xem state/Driver/vehicle/location/ETA của Trip mình                         | UC-05 / FR-09                             | public REST qua Gateway                                                                   | trip, driver                        | đúng quyền và cập nhật theo polling baseline                                                   | SD-05, SD-08        | [ ]       |
| PC-19 | Customer không xem được chuyến/vị trí của người khác                                            | UC-05 / FR-09 (SEC-07)                    | `GET /trips/{id}`                                                                         | trip                                | 403/404                                                                                        | SD-08               | [ ]       |
| PC-20 | Chuỗi trạng thái hợp lệ arrive → pickup → start → complete                                      | UC-16 / FR-20                             | `POST /trips/{id}/arrive\|pickup\|start\|complete`                                        | trip                                | Mỗi bước 200; lịch sử trạng thái đủ; Customer thông báo tại các mốc                            | SD-08               | [ ]       |
| PC-21 | Cập nhật sai thứ tự / sai tài xế / lặp lại                                                      | UC-16 / FR-20 (BRULE-14, 15)              | Như PC-20                                                                                 | trip                                | 409 / 403; lặp lại idempotent                                                                  | SD-08               | [ ]       |
| PC-22 | Completed → final fare theo formula/snapshot, Driver Available                                  | UC-16, UC-20 / FR-20, FR-28               | `TripCompleted`                                                                           | trip, booking, driver               | fare round 1.000 VND; snapshot rule                                                            | SD-02               | [ ]       |
| PC-23 | Đổi fare rule không ảnh hưởng Trip đã snapshot                                                  | UC-20, UC-30 / FR-28, FR-44               | policy update                                                                             | booking, trip                       | Trip cũ giữ ruleVersion/snapshot                                                               | SD-02               | [ ]       |
| PC-24 | Customer cancel đúng window và phí: Searching free; DriverAssigned ≤30s free; >30s 20.000       | UC-06 / FR-10                             | `POST /trips/{id}/cancel`                                                                 | trip, booking, driver               | state/fee đúng; notify; public state `CANCELED`                                                | SD-04, SD-08        | [ ]       |
| PC-25 | Hủy khi PickedUp/InProgress/đã kết thúc                                                         | UC-06 / FR-10 (BRULE-16)                  | `POST /trips/{id}/cancel`                                                                 | trip                                | 409                                                                                            | SD-08               | [ ]       |
| PC-26 | Thanh toán tiền mặt: Driver xác nhận thu                                                        | UC-09 / FR-13, FR-21                      | `POST /payments/{id}/cash-confirm`                                                        | payment                             | Payment Succeeded; thông báo Customer                                                          | SD-08               | [ ]       |
| PC-27 | Thanh toán điện tử thành công qua callback                                                      | UC-21 / FR-29                             | `GET /trips/{id}/payment`; `POST /webhooks/payment/{provider}`                            | payment, notification               | Public Payment `COMPLETED`; internal `PaymentSucceeded`; event + thông báo                     | SD-06               | [ ]       |
| PC-28 | Callback trùng/sai chữ ký/sai số tiền                                                           | UC-21 / FR-31                             | `POST /webhooks/payment/{provider}`                                                       | payment                             | Trùng: không đổi; sai chữ ký: 401 + audit; sai số tiền: từ chối                                | SD-06               | [ ]       |
| PC-29 | Thanh toán điện tử thất bại → thông báo, Trip vẫn Completed                                     | UC-21 / FR-29 (BRULE-25)                  | event `PaymentFailed`                                                                     | payment, trip, notification         | Payment Failed; Customer (và Staff) thông báo; Trip không đổi                                  | SD-06               | [ ]       |
| PC-30 | Không có dữ liệu thẻ trong DB/log/event                                                         | UC-21 / FR-30 (BRULE-22, SEC-10)          | Rà soát schema, log, payload                                                              | payment                             | Không tồn tại trường/giá trị thẻ                                                               | SD-06               | [ ]       |
| PC-31 | Tắt payment-service / notification-service: vẫn đặt xe, tìm tài xế, hoàn thành chuyến           | UC-04, UC-15, UC-16 / NFR-04              | Chaos/fault-injection test                                                                | payment, notification, trip         | Luồng lõi không bị gián đoạn; event được xử lý sau khi service phục hồi                        | SD-01, SD-05        | [ ]       |
| PC-32 | Lịch sử chuyến của Customer, chi tiết cước                                                      | UC-07 / FR-11                             | `GET /trips`, `GET /trips/{id}`                                                           | trip                                | Chỉ chuyến của mình; số tiền khớp snapshot                                                     | SD-08               | [ ]       |
| PC-33 | Đánh giá tài xế (1 lần/chuyến)                                                                  | UC-08 / FR-12                             | `POST /trips/{id}/rating`                                                                 | trip, driver                        | 201; lần 2: 409; avg_rating cập nhật sau event                                                 | SD-08               | [ ]       |
| PC-34 | Driver self-register OTP → Pending → Staff Approve/Reject                                       | UC-11 / FR-15, FR-36 / GA-07              | OTP endpoints + `POST /auth/register/driver`; `POST /admin/drivers/{id}/approve\|reject`  | identity, driver, notification      | OTP bắt buộc self-register; Pending → Active/Rejected; thông báo; audit                        | SD-01               | [ ]       |
| PC-35 | Driver chưa duyệt/Suspended không chuyển Available                                              | UC-13 / FR-17 (BRULE-03)                  | `PUT /drivers/me/availability`                                                            | driver                              | 403                                                                                            | SD-01               | [ ]       |
| PC-36 | Cập nhật hồ sơ/phương tiện Driver                                                               | UC-12 / FR-16                             | Driver profile/vehicle update                                                             | driver                              | 200; không tự suy diễn re-approval ngoài Q-14; biển số trùng 409                               | SD-01               | [ ]       |
| PC-37 | Driver location mỗi 10s; >30s stale không matching                                              | UC-14 / FR-18                             | location update                                                                           | driver                              | current location cập nhật; stale bị loại                                                       | SD-05               | [ ]       |
| PC-38 | Không heartbeat 30s → Offline; Trip đang chạy không auto-cancel                                 | UC-14 / FR-18 (BRULE-34)                  | `DriverStatusChanged`                                                                     | driver, booking, trip               | Offline và loại matching; Trip giữ state                                                       | SD-05               | [ ]       |
| PC-39 | Thông báo theo catalog, retry khi provider lỗi, không trùng                                     | UC-22 / FR-32, FR-33                      | `notifications`; mock provider lỗi                                                        | notification                        | Gửi đủ sự kiện; retry; DeadLetter + NotificationFailed; không trùng theo eventId               | SD-07               | [ ]       |
| PC-40 | Staff giám sát chuyến/tài xế, cờ chuyến kẹt                                                     | UC-26 / FR-39                             | `GET /admin/trips`, `GET /admin/drivers/online`                                           | API Gateway, trip, driver           | Danh sách đúng; chuyến kẹt được gắn cờ                                                         | SD-08               | [ ]       |
| PC-41 | Staff xử lý Trip lỗi/redispatch; Staff bị chặn force-close/fare-adjust                          | UC-27 / FR-40, FR-43B, FR-43C             | admin operations                                                                          | trip, booking                       | Staff permitted normal ops; sensitive ops 403                                                  | SD-08, SD-09        | [ ]       |
| PC-42 | Admin force-close / fare-transaction adjustment                                                 | UC-27 / FR-43B, FR-43C                    | admin sensitive ops                                                                       | trip, payment, identity-account     | reason + actor + before/after + audit                                                          | SD-08               | [ ]       |
| PC-43 | Staff tra cứu giao dịch                                                                         | UC-28 / FR-41                             | `GET /admin/payments`                                                                     | payment, API Gateway                | Lọc đúng; dữ liệu nhạy cảm đã che                                                              | SD-08               | [ ]       |
| PC-44 | Admin quản lý Staff/Admin và RBAC                                                               | UC-29 / FR-42                             | role update                                                                               | identity-account                    | audit RoleChanged; server RBAC đúng                                                            | SD-01, SD-09        | [ ]       |
| PC-45 | Admin config policy versioned; Trip/Booking mới dùng version mới                                | UC-30 / FR-44                             | policy update                                                                             | booking, trip, identity-account     | version mới + audit; không redeploy                                                            | SD-02, SD-03, SD-04 | [ ]       |
| PC-46 | Audit append-only, query theo correlationId; retention 1 năm                                    | UC-32 / FR-34, FR-46                      | audit query                                                                               | identity-account                    | đủ actor/action/reason/before-after; query cũng audit                                          | SD-08               | [ ]       |
| PC-47 | Phân quyền theo ma trận (Customer gọi API admin, Driver gọi API Customer...)                    | FR-35..FR-46 (SEC-02)                     | Các endpoint `/admin/*` với token từng role                                               | api-gateway, mọi service            | 403 theo 16.3; có audit PermissionDenied                                                       | SD-09               | [ ]       |
| PC-48 | Health/readiness của 7 service và Gateway                                                       | 16.0.1 / GA-03                            | `GET /health`, `GET /ready`, `GET /health/services`                                       | Gateway + tất cả service            | healthy/ready; danh sách Gateway + 7 service; dependency lỗi phản ánh đúng                     | —                   | [ ]       |
| PC-49 | Báo cáo (P2) khớp dữ liệu nguồn                                                                 | UC-31 / FR-45                             | `GET /admin/reports/*`                                                                    | reporting                           | Số chuyến, doanh thu, tỷ lệ hoàn thành/hủy khớp                                                | SD-08               | [ ]       |
| PC-50 | Payment retry P1 đúng 3 lần/24h; Driver cancel/password reset vẫn P2                            | UC-10, UC-17, UC-33 / FR-14, FR-22, FR-03 | retry + P2 placeholders                                                                   | payment, trip, identity-account     | P1 retry không auto Cash; P2 không chặn demo                                                   | SD-06, SD-08        | [ ]       |
| PC-51 | Staff tìm/xem/sửa khách hàng; không khóa được tài khoản; dữ liệu nhạy cảm được che              | UC-23 / FR-35 (BRULE-29, 31)              | `GET /admin/customers`, `PUT /admin/customers/{id}`, `POST /admin/customers/{id}/suspend` | customer, API Gateway               | Staff: 200 xem/sửa, 403 khi khóa; Admin: khóa được kèm lý do + audit                           | SD-01, SD-09        | [ ]       |
| PC-52 | Staff tìm/lọc Driver; Admin suspend/activate; Suspended không matching                          | UC-24 / FR-37, FR-43A                     | admin Driver ops                                                                          | driver, booking, API Gateway        | Staff 403 suspend; Admin reason+audit; no new offer                                            | SD-01, SD-05        | [ ]       |
| PC-53 | Quản lý phương tiện: tạo/sửa/vô hiệu, biển số duy nhất, phương tiện vô hiệu không cho Available | UC-25 / FR-38                             | `GET/POST /admin/vehicles`, `PUT /admin/vehicles/{id}`                                    | driver                              | 201/200; biển số trùng 409; phương tiện vô hiệu → không chuyển Available; audit VehicleUpdated | SD-01               | [ ]       |
| PC-54 | Source structure đúng grading baseline                                                          | GA-01                                     | repo tree + README                                                                        | Repository                          | Có Gateway, 7 services, contracts, infra, postman, scripts; mô tả nhiệm vụ                     | —                   | [ ]       |
| PC-55 | `.gitignore` / `.env` / secret hygiene                                                          | GA-02, SEC-12                             | `.gitignore`, `.env.example`, `git ls-files`                                              | Repository/CI                       | `.env`/private key không tracked; placeholder được commit                                      | —                   | [ ]       |
| PC-56 | Lấy Customer theo mã số                                                                         | GA-05                                     | `GET /customers/{customerId}`                                                             | gateway, customer                   | JWT hợp lệ → 200 theo quyền; khác owner/role → 403/404                                         | SD-01               | [ ]       |
| PC-57 | Lấy Driver theo mã số                                                                           | GA-05                                     | `GET /drivers/{driverId}`                                                                 | gateway, driver                     | JWT hợp lệ → 200 theo quyền; unauthorized → 403                                                | SD-01               | [ ]       |
| PC-58 | Driver quanh tọa độ 1km + paging                                                                | GA-06                                     | `GET /drivers/nearby?...radiusKm=1&page=0&limit=...`                                      | gateway, driver                     | Chỉ item trong 1km theo filter; có page/limit/total; không ảnh hưởng matching 5km              | SD-11               | [ ]       |
| PC-59 | Booking list của Customer + paging                                                              | GA-06                                     | `GET /customers/{customerId}/bookings?page=0&limit=...`                                   | gateway, booking                    | Đúng Customer; paging/limit/total; unauthorized → 403                                          | SD-12               | [ ]       |
| PC-60 | Driver OTP self-registration                                                                    | GA-07                                     | request-otp → verify-otp → register                                                       | identity, driver                    | Không verify OTP → không tạo Pending; verify đúng → Pending                                    | SD-01               | [ ]       |
| PC-61 | Encryption at rest / DB direct inspection                                                       | SEC-15, GA-08                             | DB query + secret/config evidence                                                         | identity, customer, driver          | Password/PII không plaintext; key không nằm trong DB/repo; có keyId/rotation design            | SD-13               | [ ]       |
| PC-62 | SQL injection attempt                                                                           | SEC-16, GA-09                             | login/search API với `' OR 1=1 --`                                                        | gateway, identity, data services    | 400/401; không bypass; không lộ DB/stack trace                                                 | SD-13               | [ ]       |
| PC-63 | XSS input test                                                                                  | SEC-17, GA-10                             | profile/comment API với `<script>...`                                                     | gateway, customer/trip              | 400 hoặc escaped/plain text; không executable HTML                                             | SD-13               | [ ]       |
| PC-64 | JWT tampering                                                                                   | SEC-18, GA-11                             | sửa `sub`/`role`/signature rồi gọi protected API                                          | gateway, identity                   | 401; claim không được trust; audit auth failure nếu cấu hình                                   | SD-13               | [ ]       |
| PC-65 | Unauthorized cross-role API                                                                     | SEC-02, GA-12                             | Customer token gọi Driver/Admin endpoint                                                  | gateway                             | 403; response không chứa protected data                                                        | SD-09, SD-13        | [ ]       |
| PC-66 | Rate-limit attack                                                                               | SEC-19, GA-13                             | burst `POST /bookings` >1000 req/s                                                        | gateway, booking                    | Có 429 + Retry-After; hệ thống vẫn healthy/ready                                               | SD-13               | [ ]       |
| PC-67 | Replay/idempotency attack                                                                       | SEC-20, GA-14                             | repeat payment/create request cùng idempotency context                                    | payment, booking                    | Không double charge/duplicate success; trả result cũ hoặc duplicate-safe response              | SD-06, SD-13        | [ ]       |

## 17.2 Coverage

**Business Goal → Workflow → Use Case**

| Business Goal | Workflow      | Use Case                   |
| ------------- | ------------- | -------------------------- |
| BR-01         | 6.1, 6.2, 6.3 | UC-01..UC-05, UC-11..UC-16 |
| BR-02         | 6.2, 6.3      | UC-05, UC-14, UC-16        |
| BR-03         | 6.2           | UC-15, UC-18, UC-19        |
| BR-04         | 6.4, 6.5      | UC-09, UC-10, UC-20, UC-21 |
| BR-05         | 6.9           | UC-22                      |
| BR-06         | 6.6, 6.7, 6.8 | UC-23..UC-28               |
| BR-07         | 6.11          | UC-31                      |
| BR-08         | Toàn bộ       | NFR-01..NFR-07 (PC-31)     |
| BR-09         | 6.1, 6.8      | UC-02, UC-29, UC-32        |
| BR-10         | 6.4, 6.9      | UC-20..UC-22, UC-30        |
| BR-11         | 6.10          | UC-08                      |

**Chuỗi truy vết còn lại**

- Workflow → Use Case: bảng trên và mục 8.1/8.2.
- Use Case → FR: mục 8.1/8.2 và mục 9.
- FR → Business Rule: cột Business Rule ở mục 9; BRULE → UC ở mục 10.
- FR → API/Service: mục 16.2.1 (Public API) và mục 14.2 (Internal API); service sở hữu ở mục 15.1.
- API/Service → Test Criterion: mục 17.1 (PC-01..PC-67).
- Mọi UC P1 có ít nhất một PC; UC P2 được gom ở PC-49, PC-50.

## 17.3 Mapping trực tiếp 30 tiêu chí chấm

| STT | Tiêu chí chấm                           | SRS 1.0.1 Evidence                |
| --: | --------------------------------------- | --------------------------------- |
|   1 | Kiến trúc source code                   | 14.5, GA-01, PC-54                |
|   2 | `.gitignore` / `.env`                   | 14.6, GA-02, PC-55                |
|   3 | Nhiệm vụ Gateway                        | 14.1–14.3, ADR-03                 |
|   4 | IPC microservice                        | 14.2, ADR-04/05                   |
|   5 | Compose / container                     | 14.3, 14.5                        |
|   6 | `/health`, `/ready`, `/health/services` | 16.0.1, GA-03, PC-48              |
|   7 | Kafka/RabbitMQ                          | Kafka baseline 14.2/14.3, ADR-05  |
|   8 | Request qua Gateway                     | 16.2.1, GA-04                     |
|   9 | Register Customer                       | UC-01, FR-04, PC-01               |
|  10 | Login Customer                          | UC-02, FR-01, PC-03               |
|  11 | Customer by ID                          | 16.2.6, GA-05, PC-56              |
|  12 | Driver by ID                            | 16.2.6, GA-05, PC-57              |
|  13 | Nearby Driver 1km + limit/paging        | 16.2.6, GA-06, SD-11, PC-58       |
|  14 | Customer Booking list + limit/paging    | 16.2.6, GA-06, SD-12, PC-59       |
|  15 | Đặt xe                                  | UC-04/18, PC-08/11                |
|  16 | Driver nhận chuyến                      | UC-15, PC-13                      |
|  17 | Cập nhật Trip                           | UC-16, PC-20/21                   |
|  18 | Hủy chuyến                              | UC-06, PC-24 (`CANCELED` public)  |
|  19 | Online payment callback                 | UC-21, PC-27 (`COMPLETED` public) |
|  20 | Rating                                  | UC-08, PC-33                      |
|  21 | Driver register OTP                     | UC-11, GA-07, PC-60               |
|  22 | Driver approval                         | UC-11/24, PC-34                   |
|  23 | Driver Online/Offline                   | FR-17 + mapping 16.2.6, PC-35/38  |
|  24 | Data encryption at rest                 | SEC-15, 16.4, GA-08, PC-61        |
|  25 | SQL injection                           | SEC-16, GA-09, PC-62              |
|  26 | XSS                                     | SEC-17, GA-10, PC-63              |
|  27 | JWT tampering                           | SEC-18, GA-11, PC-64              |
|  28 | Unauthorized API                        | SEC-02, GA-12, PC-47/65           |
|  29 | Rate limit                              | SEC-19, GA-13, PC-66              |
|  30 | Replay/idempotency                      | SEC-20, GA-14, PC-28/67           |

**Điều kiện Definition of Done cho grading:** không đánh dấu tiêu chí “đạt” chỉ vì có requirement; phải có implementation + Postman/command/evidence chạy được. `postman/` nên có 3 collection/folder tương ứng Thực hành 1/2/3 và environment demo không chứa secret thật.

# 18. Quy tắc quyền và dữ liệu

## 18.1 Ownership Rules

- Mỗi service chỉ ghi DB của mình; cross-service qua gRPC/Kafka.
- `identity-account-service`: account/RBAC/audit; `customer-service`: Customer; `driver-service`: Driver/vehicle/location; `booking-service`: booking/matching/fare; `trip-service`: Trip/cancel/rating; `notification-service`: notification; `payment-service`: Payment.

## 18.2 Authorization Rules

- P1 chỉ `Staff`, `Admin` cho vận hành.
- Staff: tra cứu Customer/Driver/Trip, xử lý nghiệp vụ thông thường, duyệt Driver.
- Admin: toàn quyền Staff + RBAC, suspend/activate account, force-close Trip, fare/transaction adjustment, policy config.
- Không role Manager P1; không manual Driver Assignment.

## 18.3 Data Visibility

| Dữ liệu                  | Customer                                | Driver                                             | Staff                    | Admin                              |
| ------------------------ | --------------------------------------- | -------------------------------------------------- | ------------------------ | ---------------------------------- |
| Hồ sơ Customer           | Của mình                                | Chỉ dữ liệu tối thiểu phục vụ Trip; không full SĐT | Cần thiết, SĐT masked    | Theo quyền; sensitive access audit |
| Hồ sơ Driver             | Thông tin cần thiết của Driver được gán | Của mình                                           | Cần thiết cho vận hành   | Theo quyền                         |
| Realtime Driver location | Chỉ Driver được gán cho Trip của mình   | Của mình                                           | Xem phục vụ vận hành     | Xem phục vụ vận hành               |
| Payment                  | Của Trip mình, không card data          | Cash confirmation của Trip mình                    | Tra cứu status/reference | Điều chỉnh theo quyền + audit      |
| Audit log                | N                                       | N                                                  | N                        | Y                                  |

## 18.4 Sensitive Data

- Bảo vệ SĐT, email, identity docs, GPLX, vehicle docs, pickup/destination, location history và payment reference.
- HTTPS/TLS, masking, least privilege, audit sensitive admin access.
- **At rest:** password chỉ lưu one-way hash; CCCD/giấy tờ định danh, GPLX và tài liệu nhạy cảm lưu ciphertext authenticated-encryption; key nằm ngoài DB/repo theo SEC-15 và mục 16.4. Các field cần lookup có thể dùng hash/HMAC index tách khỏi ciphertext.
- Không lưu PAN/CVV.
- Retention: Trip/Payment/account locked 5 năm; audit 1 năm; detailed location/notification 90 ngày; hết retention xóa/anonymize batch.

## 18.5 Cross-service Data Rules

Cross-service chỉ lưu ID; không FK/join xuyên DB. Contract sync bằng gRPC, async bằng Kafka. Event schema versioned/backward-compatible; idempotent consumer.

## 18.6 Customer Decisions / Confirmation Baseline

### 18.6.1 Q-01..Q-31

Toàn bộ Q-01..Q-31 đã được khách hàng trả lời ngày **2026-10-03** theo `CAB_Customer_Decision_Baseline_v2.md` và đã áp dụng vào SRS 1.0. Không còn Q trạng thái Open.

| Nhóm                                                              | Q          | Trạng thái              |
| ----------------------------------------------------------------- | ---------- | ----------------------- |
| Fare/Matching/Cancellation/Network/Retention                      | Q-01..Q-07 | Closed – Applied to SRS |
| Payment/RBAC/Service type/Map/Driver/Identity/Notification/Client | Q-08..Q-18 | Closed – Applied to SRS |
| NFR/Reporting/Scope/Rating/Driver cancel/Trip state/Security      | Q-19..Q-25 | Closed – Applied to SRS |
| Architecture/7-week/Migration/Manual assign/Privacy/Currency      | Q-26..Q-31 | Closed – Applied to SRS |

Chi tiết quyết định và ngày áp dụng được lưu trong `SRS_Issue_Tracker_baseline_1.0.md` để audit traceability.

Các GA-01..GA-14 của bản 1.0.1 đến từ phiếu chấm và **không được diễn giải là quyết định khách hàng mới**; chúng là ràng buộc triển khai/kiểm thử trên baseline đã chốt.

### 18.6.2 Assumptions

Các AS-01..AS-14 và AS-16..AS-20 của bản 0.1 được **retired/superseded** bởi Customer Decision Baseline; không còn là nguồn yêu cầu. `AS-15` (P1 không bắt buộc geofence cho thao tác DriverArrived/Completed) được giữ là **giả định thiết kế**, vì không phải Q của khách hàng; nếu thiết kế chi tiết thay đổi phải cập nhật tracker.

# 19. Lịch sử thay đổi

| Phiên bản | Ngày       | Thay đổi                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1       | 2026-10-03 | Initial draft; ghi nhận Q-01..Q-31 và AS-01..AS-20                                                                                                                                                                                                                                                                                                                                                                  |
| 1.0       | 2026-10-03 | Áp dụng `CAB_Customer_Decision_Baseline_v2.md`: đóng Q-01..Q-31; chốt P1/P2, 7 business service, REST/gRPC/Kafka/PostgreSQL/Redis/Docker Compose/GitHub Actions; cập nhật pricing/matching/cancellation/payment/NFR/security/retention; loại manual assignment; tách FR-43A/B/C; retired các AS gắn Q                                                                                                               |
| 1.0.1     | 2026-10-03 | **Grading Alignment** theo `phieucham(2).md`: thêm source layout/git hygiene; exact health endpoints; Customer/Driver lookup; nearby Driver 1km + paging; Customer booking list + paging; Driver OTP self-registration; public status mapping; encryption-at-rest/key management; SQLi/XSS/JWT tampering/rate limit/replay requirements; seed/evidence và mapping trực tiếp 30 tiêu chí. Không thay đổi Q-01..Q-31. |

# ID Convention

| Prefix   | Meaning                                                                        |
| -------- | ------------------------------------------------------------------------------ |
| BR-XX    | Business Goal                                                                  |
| BRULE-XX | Business Rule                                                                  |
| UC-XX    | Use Case                                                                       |
| FR-XX    | Functional Requirement                                                         |
| NFR-XX   | Non-functional Requirement                                                     |
| SEC-XX   | Security Requirement                                                           |
| INT-XX   | Internal Service Interaction                                                   |
| PC-XX    | Test / Checking Criterion                                                      |
| AC-XX    | Acceptance Criteria                                                            |
| ADR-XX   | Architectural Decision                                                         |
| Q-XX     | Open Question / Confirmation                                                   |
| AS-XX    | Assumption (bổ sung so với template)                                           |
| SD-XX    | Seed Dataset (bổ sung so với template)                                         |
| GA-XX    | Grading Alignment Requirement (nguồn `phieucham(2).md`, không phải Customer Q) |

# Traceability Chain

Business
→ Stakeholder
→ Actor
→ Business Goal
→ Workflow
→ Use Case
→ Functional Requirement
→ Business Rule
→ Data / API / Service
→ NFR / Security
→ Traceability / Test
