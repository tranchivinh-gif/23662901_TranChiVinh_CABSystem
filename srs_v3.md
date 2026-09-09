# Software Requirements Specification (SRS)

# CAB System - Nền tảng đặt xe

## Thông tin tài liệu

| Thuộc tính                   | Nội dung                                                 |
| ---------------------------- | -------------------------------------------------------- |
| Tên hệ thống                 | CAB System                                               |
| Tổ chức                      | Công ty ABC                                              |
| Phiên bản                    | 3.0                                                      |
| Thời gian triển khai dự kiến | 7 tuần                                                   |
| Trạng thái                   | Bản đặc tả yêu cầu nghiệp vụ và hệ thống                 |
| Đối tượng đọc                | BA, Development, QA/Tester, Operation, Admin, Management |

## Quy ước

- **Phải**: yêu cầu bắt buộc trong phạm vi đã xác định.
- **Đề xuất**: định hướng từ phản hồi khách hàng, cần phê duyệt trước khi nghiệm thu bắt buộc.
- **Cần xác nhận**: chưa đủ thông tin để triển khai hoặc nghiệm thu.
- `BR`, `BP`, `FR`, `NFR`, `UC`, `AC` lần lượt là Business Rule, Business Process, Functional Requirement, Non-functional Requirement, Use Case và Acceptance Criteria.

---

# 1. Tổng quan

## 1.1. Mục đích

CAB System là nền tảng đặt xe của Công ty ABC. Hệ thống hỗ trợ quy trình từ khi khách hàng tạo yêu cầu, tìm và phân công tài xế, thực hiện chuyến, tính cước, thanh toán, thông báo, đánh giá cho đến lưu lịch sử và lập báo cáo.

Tài liệu mô tả hành vi và yêu cầu cần có của hệ thống ở góc độ nghiệp vụ; không quy định công nghệ, kiến trúc triển khai hoặc thiết kế giao diện cụ thể.

## 1.2. Mục tiêu nghiệp vụ

1. Giảm phân công tài xế thủ công bằng cơ chế tìm và phân công tự động.
2. Cho phép khách hàng theo dõi rõ tiến trình chuyến xe.
3. Tập trung việc tính cước, thanh toán và tra cứu giao dịch.
4. Cung cấp công cụ vận hành để theo dõi chuyến, tài xế, phương tiện và sự cố.
5. Cung cấp báo cáo về chuyến, doanh thu và hiệu quả tài xế.
6. Bảo vệ dữ liệu và tạo nền tảng có thể mở rộng thêm dịch vụ, phương thức thanh toán và provider.

## 1.3. Actor và stakeholder

| Đối tượng                | Loại              | Vai trò                                                                   |
| ------------------------ | ----------------- | ------------------------------------------------------------------------- |
| Khách hàng               | Actor chính       | Đăng ký, đặt xe, theo dõi, thanh toán, xem lịch sử, đánh giá              |
| Tài xế                   | Actor chính       | Quản lý hồ sơ/phương tiện, nhận chuyến, thực hiện chuyến, cập nhật vị trí |
| Nhân viên vận hành       | Actor chính       | Theo dõi, quản lý nghiệp vụ và xử lý sự cố                                |
| Quản trị viên            | Actor quản trị    | Quản lý tài khoản, phân quyền và cấu hình quản trị                        |
| Ban lãnh đạo             | Actor báo cáo     | Xem báo cáo tổng hợp và chỉ số hoạt động                                  |
| Payment Provider         | Hệ thống ngoài    | Xử lý thanh toán điện tử                                                  |
| Notification Provider    | Hệ thống ngoài    | Gửi thông báo qua kênh được cấu hình                                      |
| Tài chính/kế toán        | Stakeholder       | Theo dõi cước, giao dịch, doanh thu, đối soát                             |
| BA/Development/QA/DevOps | Stakeholder dự án | Phân tích, xây dựng, kiểm thử, vận hành; không phải actor nghiệp vụ chính |

## 1.4. Giả định và phụ thuộc

1. Payment Provider và Notification Provider cung cấp giao diện tích hợp.
2. Người dùng có kết nối mạng khi dùng chức năng trực tuyến.
3. Bảng giá, loại xe, loại dịch vụ và quyền được cấu hình trước khi sử dụng.
4. ETA trong MVP dựa trên vị trí hiện tại và khoảng cách đến điểm đón, chưa tích hợp giao thông thời gian thực.
5. Nội dung ghi là đề xuất hoặc cần xác nhận không tự động trở thành cam kết nghiệm thu.

---

# 2. Phạm vi

## 2.1. Trong phạm vi

- Tài khoản khách hàng, tài xế, nhân viên vận hành, quản trị viên và quyền truy cập.
- Hồ sơ tài xế và phương tiện.
- Tạo, theo dõi, hủy và xem lịch sử yêu cầu/chuyến xe.
- Tự động tìm và phân công tài xế.
- Trạng thái chuyến và vị trí tài xế.
- Tính cước từ thông tin chuyến và bảng giá cấu hình.
- Thanh toán tiền mặt và điện tử.
- Thông báo trong hệ thống và email ở MVP.
- Quản lý vận hành, sự cố và giao dịch.
- Đánh giá tài xế sau chuyến.
- Báo cáo chuyến, doanh thu, hoàn thành, hủy và hiệu quả tài xế.
- Xác thực, phân quyền, bảo vệ dữ liệu và audit log.
- Định hướng mở rộng provider, phương thức thanh toán và loại dịch vụ.

## 2.2. Ngoài phạm vi hoặc chưa cam kết

- Xử lý nội bộ của Payment Provider và Notification Provider.
- AI/ML, Big Data và phân tích nâng cao.
- Dữ liệu giao thông thời gian thực trong MVP.
- Công thức cước chi tiết, chính sách hủy chi tiết và chính sách vận hành chưa xác nhận.
- Module doanh nghiệp nâng cao ngoài đặt xe và vận hành.

## 2.3. Quy trình nghiệp vụ

| Mã    | Quy trình                    | Kết quả                              |
| ----- | ---------------------------- | ------------------------------------ |
| BP-01 | Tài khoản và đặt xe          | Tạo yêu cầu hợp lệ                   |
| BP-02 | Tìm và phân công tài xế      | Gửi chuyến cho tài xế phù hợp        |
| BP-03 | Từ chối hoặc timeout         | Tìm tài xế kế tiếp                   |
| BP-04 | Theo dõi và thực hiện chuyến | Cập nhật đúng trạng thái             |
| BP-05 | Vị trí và ETA                | Hỗ trợ tìm gần và ước tính thời gian |
| BP-06 | Tính cước                    | Xác định số tiền phải trả            |
| BP-07 | Thanh toán                   | Ghi nhận tiền mặt hoặc điện tử       |
| BP-08 | Thông báo                    | Gửi sự kiện đến bên liên quan        |
| BP-09 | Vận hành và sự cố            | Theo dõi và xử lý chuyến             |
| BP-10 | Báo cáo                      | Tổng hợp dữ liệu hoạt động           |
| BP-11 | Phân quyền và audit          | Kiểm soát và lưu vết thao tác        |
| BP-12 | Mở rộng                      | Thêm provider/dịch vụ theo từng phần |

Luồng tổng quát:

```text
Đăng nhập -> Nhập điểm đón/đến, loại xe -> Kiểm tra -> Tạo yêu cầu
-> Tìm tài xế -> Chấp nhận hoặc từ chối/timeout 30 giây -> Phân công
-> Tài xế đến -> Đón khách -> Di chuyển -> Hoàn thành
-> Tính cước -> Tiền mặt hoặc điện tử -> Thông báo -> Đánh giá -> Lịch sử/báo cáo
```

---

# 3. Trạng thái và Business Rule

## 3.1. Trạng thái chuyến

| Thứ tự | Mã                    | Ý nghĩa                                        |
| ------ | --------------------- | ---------------------------------------------- |
| 1      | `REQUESTED`           | Đã tiếp nhận yêu cầu hợp lệ                    |
| 2      | `SEARCHING_DRIVER`    | Đang tìm và gửi yêu cầu cho tài xế             |
| 3      | `DRIVER_ASSIGNED`     | Tài xế đã chấp nhận                            |
| 4      | `DRIVER_ARRIVING`     | Tài xế đang đến điểm đón                       |
| 5      | `PASSENGER_PICKED_UP` | Tài xế đã đón khách                            |
| 6      | `IN_PROGRESS`         | Chuyến đang được thực hiện                     |
| 7      | `COMPLETED`           | Chuyến hoàn thành, chuyển sang cước/thanh toán |

Trạng thái kết thúc hoặc bổ sung gồm `CANCELLED` và `INCIDENT_RESOLVED`. Việc chuyển sang các trạng thái này phải theo chính sách vận hành và được lưu vết. Không được tự ý bỏ qua hoặc quay lui trạng thái.

## 3.2. Quy tắc nghiệp vụ

| Mã    | Quy tắc                                                                                                                                |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------- |
| BR-01 | Người dùng phải xác thực trước chức năng cần tài khoản.                                                                                |
| BR-02 | Chỉ tài xế có hồ sơ, phương tiện và trạng thái phù hợp mới được phân công.                                                             |
| BR-03 | Lọc theo trạng thái, vị trí, loại xe và khả năng đáp ứng; mặc định ưu tiên khoảng cách/ETA thấp nhất.                                  |
| BR-04 | Không phản hồi trong 30 giây được xem như không nhận chuyến.                                                                           |
| BR-05 | Từ chối/timeout thì tìm tài xế khác, không yêu cầu khách tạo lại yêu cầu.                                                              |
| BR-06 | Vị trí được cập nhật khoảng 10 giây/lần khi tài xế hoạt động hoặc chạy chuyến; độ chính xác mục tiêu khoảng 50 m khi tín hiệu phù hợp. |
| BR-07 | ETA MVP dựa trên vị trí và khoảng cách, chưa dùng dữ liệu giao thông thời gian thực.                                                   |
| BR-08 | Khách hàng được hủy khi chuyến chưa hoàn thành và chưa vào trạng thái không cho phép hủy.                                              |
| BR-09 | Sau khi nhận chuyến, tài xế chỉ yêu cầu hủy hoặc báo sự cố theo chính sách vận hành.                                                   |
| BR-10 | MVP đề xuất chưa áp dụng phí hủy; chính sách cuối cùng cần xác nhận.                                                                   |
| BR-11 | Cước tính sau hoàn thành từ thông tin chuyến và bảng giá cấu hình.                                                                     |
| BR-12 | Phải xác định số tiền trước khi ghi nhận thanh toán.                                                                                   |
| BR-13 | Thanh toán điện tử qua Payment Provider; không lưu dữ liệu thẻ/tài khoản nhạy cảm.                                                     |
| BR-14 | Tiền mặt hoàn tất khi tài xế xác nhận đã thu đủ.                                                                                       |
| BR-15 | Điện tử retry tối đa 3 lần trong 30 phút từ lần thất bại đầu tiên.                                                                     |
| BR-16 | Sự kiện quan trọng tạo thông báo; thông báo lỗi retry tối đa 3 lần.                                                                    |
| BR-17 | Chỉ Admin cấp hoặc thay đổi quyền người dùng.                                                                                          |
| BR-18 | Đăng nhập, đổi quyền, đổi dữ liệu quan trọng, xử lý sự cố và thao tác quản trị phải audit.                                             |
| BR-19 | Payment, Fare, Notification và Rating phải liên kết với chuyến tương ứng.                                                              |

---

# 4. Functional Requirements

## 4.1. Tài khoản và phân quyền

| Mã    | Yêu cầu                                                               | Actor         |
| ----- | --------------------------------------------------------------------- | ------------- |
| FR-01 | Cho phép khách hàng đăng ký tài khoản.                                | Customer      |
| FR-02 | Cho phép đăng nhập, đăng xuất và cập nhật hồ sơ.                      | User          |
| FR-03 | Xác thực trước chức năng cần tài khoản.                               | Hệ thống      |
| FR-04 | Quản lý hồ sơ tài xế, phương tiện và trạng thái hoạt động.            | Driver, Staff |
| FR-05 | Áp dụng vai trò Customer, Driver, Operation Staff, Admin, Management. | Hệ thống      |
| FR-06 | Admin quản lý tài khoản, gán và thay đổi quyền.                       | Admin         |
| FR-07 | Từ chối thao tác không có quyền và thông báo nguyên nhân.             | Hệ thống      |

## 4.2. Đặt và quản lý chuyến

| Mã    | Yêu cầu                                                    | Actor                   |
| ----- | ---------------------------------------------------------- | ----------------------- |
| FR-08 | Nhập điểm đón, điểm đến, loại xe/dịch vụ.                  | Customer                |
| FR-09 | Kiểm tra dữ liệu bắt buộc và hợp lệ trước khi tạo.         | Hệ thống                |
| FR-10 | Tạo mã duy nhất và lưu thời điểm yêu cầu.                  | Hệ thống                |
| FR-11 | Hiển thị thông tin và trạng thái hiện tại.                 | Customer                |
| FR-12 | Xem lịch sử, số tiền phải trả và kết quả thanh toán.       | Customer                |
| FR-13 | Hủy theo trạng thái được phép, lưu lý do/thời điểm nếu có. | Customer, Driver, Staff |

## 4.3. Tìm và phân công tài xế

| Mã    | Yêu cầu                                                   | Actor    |
| ----- | --------------------------------------------------------- | -------- |
| FR-14 | Tự động xác định tài xế sẵn sàng và phù hợp.              | Hệ thống |
| FR-15 | Lọc theo trạng thái, vị trí, loại xe và khả năng đáp ứng. | Hệ thống |
| FR-16 | Ưu tiên tài xế theo khoảng cách hoặc ETA thấp nhất.       | Hệ thống |
| FR-17 | Gửi yêu cầu và ghi thời điểm gửi.                         | Hệ thống |
| FR-18 | Chờ phản hồi tối đa 30 giây mỗi lần phân công.            | Hệ thống |
| FR-19 | Ghi nhận chấp nhận, từ chối hoặc timeout.                 | Hệ thống |
| FR-20 | Tìm tài xế khác khi lần trước thất bại.                   | Hệ thống |
| FR-21 | Thông báo kết quả phân công hoặc không tìm thấy tài xế.   | Hệ thống |

## 4.4. Thực hiện chuyến và vị trí

| Mã    | Yêu cầu                                                            | Actor    |
| ----- | ------------------------------------------------------------------ | -------- |
| FR-22 | Tài xế cập nhật trạng thái theo bước được phép.                    | Driver   |
| FR-23 | Kiểm tra tính hợp lệ của mọi chuyển trạng thái.                    | Hệ thống |
| FR-24 | Lưu trạng thái cũ/mới, thời điểm và người thực hiện.               | Hệ thống |
| FR-25 | Thu thập vị trí khoảng 10 giây/lần khi hoạt động hoặc chạy chuyến. | Hệ thống |
| FR-26 | Hiển thị vị trí và ETA trong phạm vi được phép.                    | Customer |
| FR-27 | Nhân viên vận hành xem chuyến, tài xế và trạng thái đang diễn ra.  | Staff    |

## 4.5. Cước và thanh toán

| Mã    | Yêu cầu                                                   | Actor            |
| ----- | --------------------------------------------------------- | ---------------- |
| FR-28 | Tự động tính cước sau `COMPLETED`.                        | Hệ thống         |
| FR-29 | Dùng loại dịch vụ, loại xe và dữ liệu chuyến làm đầu vào. | Hệ thống         |
| FR-30 | Quản lý bảng giá bằng chức năng cấu hình có phân quyền.   | Staff, Admin     |
| FR-31 | Hiển thị số tiền trước khi ghi nhận thanh toán.           | Customer, Driver |
| FR-32 | Hỗ trợ tiền mặt và điện tử.                               | Customer         |
| FR-33 | Gửi yêu cầu đến Payment Provider và nhận mã/trạng thái.   | Hệ thống         |
| FR-34 | Tài xế xác nhận đã thu đủ tiền mặt.                       | Driver           |
| FR-35 | Retry điện tử tối đa 3 lần trong 30 phút.                 | Customer         |
| FR-36 | Sau giới hạn, ghi thất bại/chưa hoàn tất và thông báo.    | Hệ thống         |
| FR-37 | Liên kết Fare, Payment và mã giao dịch với chuyến.        | Hệ thống         |

## 4.6. Thông báo

| Mã    | Yêu cầu                                                                                     | Actor              |
| ----- | ------------------------------------------------------------------------------------------- | ------------------ |
| FR-38 | Thông báo khi tiếp nhận, phân công, tài xế đến, hoàn thành, thanh toán thành công/thất bại. | Hệ thống           |
| FR-39 | Thông báo tài xế khi có chuyến mới hoặc thay đổi chuyến.                                    | Hệ thống           |
| FR-40 | MVP hỗ trợ thông báo trong hệ thống và email.                                               | Hệ thống           |
| FR-41 | Retry gửi tối đa 3 lần khi provider lỗi.                                                    | Hệ thống           |
| FR-42 | Lưu người nhận, kênh, nội dung, thời điểm, số lần và kết quả gửi.                           | Hệ thống           |
| FR-43 | Có thể thay/bổ sung provider hoặc kênh mà không xây lại toàn bộ nghiệp vụ.                  | Admin, Development |

## 4.7. Vận hành, sự cố và báo cáo

| Mã    | Yêu cầu                                                                           | Actor             |
| ----- | --------------------------------------------------------------------------------- | ----------------- |
| FR-44 | Quản lý khách hàng, tài xế, phương tiện và chuyến theo quyền.                     | Staff             |
| FR-45 | Xem, cập nhật và ghi nhận kết quả xử lý sự cố.                                    | Staff             |
| FR-46 | Hỗ trợ sự cố mất kết nối, trạng thái bất thường, lỗi thanh toán/hệ thống.         | Hệ thống          |
| FR-47 | Đưa chuyến về trạng thái phù hợp hoặc `CANCELLED`/`INCIDENT_RESOLVED`; lưu audit. | Staff             |
| FR-48 | Tra cứu lịch sử giao dịch và đối soát trạng thái.                                 | Staff             |
| FR-49 | Báo cáo chuyến, doanh thu, hoàn thành, hủy và hiệu quả tài xế.                    | Staff, Management |
| FR-50 | Báo cáo theo ngày, tuần, tháng hoặc khoảng thời gian.                             | Staff, Management |
| FR-51 | Lọc theo thời gian, tài xế, loại xe và trạng thái.                                | Staff, Management |
| FR-52 | Tỷ lệ hoàn thành = chuyến hoàn thành / tổng chuyến tạo x 100%.                    | Hệ thống          |
| FR-53 | Tỷ lệ hủy = chuyến hủy / tổng chuyến tạo x 100%.                                  | Hệ thống          |
| FR-54 | Hiệu quả tài xế gồm chuyến nhận, hoàn thành, từ chối/hủy và đánh giá.             | Hệ thống          |
| FR-55 | Ghi và cho phép người có quyền tra cứu audit log.                                 | Hệ thống, Admin   |

---

# 5. Non-functional Requirements

| Mã     | Nhóm       | Yêu cầu                                                                                        |
| ------ | ---------- | ---------------------------------------------------------------------------------------------- |
| NFR-01 | Hiệu năng  | MVP đề xuất hỗ trợ khoảng 500 người dùng đồng thời.                                            |
| NFR-02 | Hiệu năng  | Phản hồi thao tác thông thường mục tiêu không quá 3 giây; provider có thể khác.                |
| NFR-03 | Khả dụng   | Mục tiêu đề xuất 99,5% trong thời gian vận hành.                                               |
| NFR-04 | Sao lưu    | Sao lưu tự động hằng ngày.                                                                     |
| NFR-05 | Phục hồi   | RTO đề xuất không quá 4 giờ, RPO không quá 24 giờ.                                             |
| NFR-06 | Bảo mật    | Xác thực và kiểm tra quyền theo vai trò.                                                       |
| NFR-07 | Dữ liệu    | Bảo vệ dữ liệu cá nhân, phương tiện, vị trí, giao dịch; không lưu dữ liệu thanh toán nhạy cảm. |
| NFR-08 | Audit      | Audit log đề xuất lưu 12 tháng.                                                                |
| NFR-09 | Lưu trữ    | Chuyến/giao dịch đề xuất 24 tháng; vị trí chi tiết 30 ngày.                                    |
| NFR-10 | Usability  | Hiển thị rõ trạng thái, tài xế, cước, thanh toán và lỗi.                                       |
| NFR-11 | Mở rộng    | Bổ sung loại dịch vụ, phương thức thanh toán, provider/kênh theo từng phần.                    |
| NFR-12 | Triển khai | Chức năng mới triển khai từng phần, hạn chế ảnh hưởng chức năng đang chạy.                     |

---

# 6. Use Case

| Mã    | Tên                              | Actor chính                     | FR                            |
| ----- | -------------------------------- | ------------------------------- | ----------------------------- |
| UC-01 | Đăng ký tài khoản                | Customer                        | FR-01                         |
| UC-02 | Đăng nhập/quản lý hồ sơ          | User                            | FR-02, FR-03                  |
| UC-03 | Quản lý hồ sơ tài xế/phương tiện | Driver, Staff                   | FR-04                         |
| UC-04 | Tạo yêu cầu đặt xe               | Customer                        | FR-08 đến FR-10               |
| UC-05 | Hủy yêu cầu/chuyến               | Customer, Driver, Staff         | FR-13                         |
| UC-06 | Tự động tìm tài xế               | Hệ thống                        | FR-14 đến FR-21               |
| UC-07 | Nhận/từ chối chuyến              | Driver                          | FR-17 đến FR-20               |
| UC-08 | Theo dõi trạng thái chuyến       | Customer                        | FR-11, FR-22 đến FR-27        |
| UC-09 | Cập nhật trạng thái chuyến       | Driver                          | FR-22 đến FR-24               |
| UC-10 | Cập nhật vị trí và ETA           | Hệ thống, Driver                | FR-25, FR-26                  |
| UC-11 | Hoàn thành và tính cước          | Driver, Hệ thống                | FR-28 đến FR-31               |
| UC-12 | Thanh toán tiền mặt              | Customer, Driver                | FR-32, FR-34                  |
| UC-13 | Thanh toán điện tử               | Customer, Payment Provider      | FR-32, FR-33, FR-35 đến FR-37 |
| UC-14 | Gửi/tra cứu thông báo            | Hệ thống, Notification Provider | FR-38 đến FR-43               |
| UC-15 | Quản lý vận hành                 | Staff                           | FR-27, FR-44, FR-48           |
| UC-16 | Xử lý sự cố                      | Staff                           | FR-45 đến FR-47               |
| UC-17 | Lập/xem báo cáo                  | Staff, Management               | FR-49 đến FR-54               |
| UC-18 | Quản lý quyền và audit           | Admin                           | FR-05 đến FR-07, FR-55        |
| UC-19 | Cấu hình và mở rộng              | Admin, Development              | FR-30, FR-43, NFR-11, NFR-12  |

## 6.1. Mẫu đặc tả Use Case chi tiết

### UC-04 - Tạo yêu cầu đặt xe

- **Tiền điều kiện:** Customer đã đăng nhập; loại xe/dịch vụ đã được cấu hình.
- **Luồng chính:** nhập điểm đón, điểm đến và loại xe/dịch vụ -> hệ thống kiểm tra -> Customer xác nhận -> tạo mã yêu cầu -> lưu `REQUESTED` -> chuyển `SEARCHING_DRIVER`.
- **Luồng thay thế:** dữ liệu thiếu/không hợp lệ thì hiển thị lỗi, không tạo yêu cầu.
- **Hậu điều kiện:** yêu cầu được lưu và bắt đầu tìm tài xế.

### UC-06 - Tự động tìm tài xế

- **Tiền điều kiện:** yêu cầu ở `SEARCHING_DRIVER`, có tiêu chí cấu hình.
- **Luồng chính:** lọc tài xế phù hợp -> sắp xếp theo khoảng cách/ETA -> gửi yêu cầu -> chờ tối đa 30 giây -> chấp nhận thì chuyển `DRIVER_ASSIGNED` và báo Customer.
- **Luồng thay thế:** từ chối/timeout thì ghi nhận và chọn tài xế tiếp theo.
- **Ngoại lệ:** hết tài xế thì thông báo Customer và ghi nhận kết quả vận hành.

### UC-09 - Cập nhật trạng thái chuyến

- **Tiền điều kiện:** Driver được phân công và có quyền.
- **Luồng chính:** Driver chọn trạng thái kế tiếp -> hệ thống kiểm tra -> lưu trạng thái, thời điểm, người thực hiện -> gửi thông báo cần thiết.
- **Ngoại lệ:** sai thứ tự hoặc không có quyền thì từ chối và giữ trạng thái cũ.

### UC-11 - Hoàn thành chuyến và tính cước

- **Tiền điều kiện:** chuyến ở `IN_PROGRESS`.
- **Luồng chính:** Driver xác nhận hoàn thành -> chuyển `COMPLETED` -> lấy bảng giá, loại xe/dịch vụ và dữ liệu chuyến -> tính/lưu/hiển thị Fare -> yêu cầu phương thức thanh toán.
- **Ngoại lệ:** thiếu bảng giá hoặc dữ liệu thì ghi lỗi để vận hành xử lý, không tạo số tiền không xác định.

### UC-13 - Thanh toán điện tử

- **Tiền điều kiện:** chuyến hoàn thành và số tiền đã xác định.
- **Luồng chính:** Customer chọn điện tử -> gửi yêu cầu Payment Provider -> nhận mã/trạng thái -> lưu kết quả, không lưu dữ liệu nhạy cảm -> thông báo.
- **Luồng thay thế:** thất bại thì retry tối đa 3 lần trong 30 phút.
- **Ngoại lệ:** provider lỗi/không phản hồi thì ghi chưa hoàn tất và thông báo.

### UC-16 - Xử lý sự cố

- **Tiền điều kiện:** có sự cố trên chuyến hoặc giao dịch.
- **Luồng chính:** Staff xem sự cố -> kiểm tra dữ liệu -> ghi nguyên nhân/kết quả -> cập nhật trạng thái phù hợp -> audit -> thông báo bên ảnh hưởng.
- **Hậu điều kiện:** chuyến tiếp tục được hoặc chuyển `CANCELLED`/`INCIDENT_RESOLVED`.

Các UC còn lại sử dụng cùng cấu trúc: Actor, tiền điều kiện, luồng chính, luồng thay thế, ngoại lệ, hậu điều kiện, FR và BR liên quan.

---

# 7. Mô hình dữ liệu nghiệp vụ

| Thực thể            | Dữ liệu chính                                     | Quan hệ                        |
| ------------------- | ------------------------------------------------- | ------------------------------ |
| User                | ID, tên, liên hệ, trạng thái, vai trò             | Customer, Driver, Staff, Admin |
| Vehicle             | Biển số, loại, trạng thái                         | Gắn với Driver/đơn vị quản lý  |
| Booking/Ride        | Mã, điểm đón/đến, thời gian, trạng thái           | Gắn Customer, Driver, Vehicle  |
| Location            | Vĩ độ, kinh độ, độ chính xác, thời điểm           | Gắn Driver/Ride                |
| Fare                | Bảng giá, thành phần, tổng tiền                   | Gắn Ride                       |
| Payment/Transaction | Phương thức, mã tham chiếu, trạng thái            | Gắn Fare/Ride                  |
| Notification        | Người nhận, kênh, nội dung, retry, kết quả        | Gắn sự kiện/Ride/Payment       |
| Rating              | Điểm, nhận xét, thời điểm                         | Customer đánh giá Driver       |
| Incident            | Loại, mô tả, người xử lý, kết quả                 | Gắn Ride/Payment               |
| Report              | Kỳ, bộ lọc, chỉ số                                | Tổng hợp từ dữ liệu hệ thống   |
| AuditLog            | Người, hành động, đối tượng, trước/sau, thời điểm | Ghi thao tác quan trọng        |

```text
Customer 1 --- n Booking/Ride n --- 1 Driver --- 1 Vehicle
                         |
                         +--- n Location
                         +--- 1 Fare --- n Payment/Transaction
                         +--- n Notification
                         +--- 0..1 Rating
                         +--- n Incident
```

---

# 8. Exception và xử lý lỗi

| Mã    | Tình huống                      | Xử lý                                                           |
| ----- | ------------------------------- | --------------------------------------------------------------- |
| EX-01 | Dữ liệu đặt xe sai              | Từ chối, chỉ rõ lỗi, cho nhập lại                               |
| EX-02 | Không có tài xế                 | Thông báo Customer và ghi nhận kết quả                          |
| EX-03 | Từ chối/timeout                 | Ghi nhận và tìm tài xế kế tiếp                                  |
| EX-04 | Trạng thái sai                  | Từ chối, giữ trạng thái cũ, ghi log                             |
| EX-05 | Mất kết nối                     | Không tạo bản ghi trùng; đồng bộ lại theo khả năng và ghi sự cố |
| EX-06 | Payment Provider lỗi            | Retry theo chính sách; hết giới hạn ghi thất bại/chưa hoàn tất  |
| EX-07 | Thanh toán thất bại             | Tối đa 3 lần trong 30 phút, báo kết quả cuối                    |
| EX-08 | Gửi thông báo lỗi               | Retry tối đa 3 lần; MVP chưa chuyển kênh tự động                |
| EX-09 | Không có quyền                  | Từ chối và thông báo lỗi quyền                                  |
| EX-10 | Thiếu dữ liệu báo cáo           | Đánh dấu thiếu, không tự suy diễn                               |
| EX-11 | Sự cố chuyến                    | Staff xử lý, cập nhật trạng thái, audit và thông báo            |
| EX-12 | Thay đổi gây ảnh hưởng hệ thống | Đánh giá ảnh hưởng, triển khai từng phần                        |

---

# 9. Acceptance Criteria

| Mã    | Given                                   | When                                   | Then                                                         |
| ----- | --------------------------------------- | -------------------------------------- | ------------------------------------------------------------ |
| AC-01 | Customer đăng nhập và nhập đúng dữ liệu | Gửi yêu cầu                            | Tạo mã, lưu `REQUESTED`, bắt đầu tìm tài xế                  |
| AC-02 | Đang tìm tài xế                         | Driver phù hợp chấp nhận trong 30 giây | Gán Driver, chuyển `DRIVER_ASSIGNED`, báo Customer           |
| AC-03 | Đã gửi yêu cầu cho Driver               | Driver từ chối/không phản hồi 30 giây  | Ghi nhận và tìm Driver tiếp theo                             |
| AC-04 | Chuyến đang thực hiện                   | Driver chọn trạng thái kế tiếp hợp lệ  | Lưu trạng thái, thời điểm, người thực hiện, thông báo        |
| AC-05 | Có yêu cầu chuyển sai bước              | Người dùng thực hiện                   | Từ chối và giữ trạng thái cũ                                 |
| AC-06 | Driver hoạt động/chạy chuyến            | Đến chu kỳ vị trí                      | Nhận vị trí khoảng 10 giây/lần và lưu thời điểm/độ chính xác |
| AC-07 | Chuyến `COMPLETED`                      | Hệ thống tính cước                     | Fare được tính từ bảng giá và dữ liệu chuyến                 |
| AC-08 | Fare đã xác định                        | Driver xác nhận thu đủ tiền mặt        | Payment hoàn tất                                             |
| AC-09 | Thanh toán điện tử thất bại             | Customer thử lại                       | Tối đa 3 lần/30 phút, lưu mã và trạng thái                   |
| AC-10 | Có sự kiện quan trọng                   | Hệ thống phát sinh sự kiện             | Bên liên quan nhận thông báo; lỗi retry tối đa 3 lần         |
| AC-11 | Staff có quyền                          | Có sự cố                               | Xem, xử lý, audit và báo bên ảnh hưởng                       |
| AC-12 | Người dùng không có quyền               | Thực hiện thao tác quản trị            | Từ chối, không đổi dữ liệu                                   |
| AC-13 | Có dữ liệu báo cáo                      | Mở báo cáo với bộ lọc                  | Hiển thị đúng chuyến, doanh thu, tỷ lệ và KPI                |

AC là điều kiện xác nhận yêu cầu, không thay thế Test Case chi tiết.

---

# 10. Ma trận truy xuất (RTM)

| Nhu cầu                | BP/BR                         | FR                               | UC                         | AC                                 |
| ---------------------- | ----------------------------- | -------------------------------- | -------------------------- | ---------------------------------- |
| Đặt và theo dõi chuyến | BP-01, BP-04; BR-01           | FR-08 đến FR-13, FR-22 đến FR-27 | UC-04, UC-05, UC-08, UC-09 | AC-01, AC-04, AC-05                |
| Phân công tự động      | BP-02, BP-03; BR-02 đến BR-05 | FR-14 đến FR-21                  | UC-06, UC-07               | AC-02, AC-03                       |
| Vị trí/ETA             | BP-05; BR-06, BR-07           | FR-25, FR-26                     | UC-10                      | AC-06                              |
| Cước                   | BP-06; BR-11, BR-12           | FR-28 đến FR-31                  | UC-11                      | AC-07                              |
| Thanh toán             | BP-07; BR-13 đến BR-15        | FR-32 đến FR-37                  | UC-12, UC-13               | AC-08, AC-09                       |
| Thông báo              | BP-08; BR-16                  | FR-38 đến FR-43                  | UC-14                      | AC-10                              |
| Vận hành/sự cố         | BP-09; BR-18                  | FR-44 đến FR-48, FR-55           | UC-15, UC-16               | AC-11                              |
| Báo cáo                | BP-10                         | FR-49 đến FR-54                  | UC-17                      | AC-13                              |
| Quyền/audit            | BP-11; BR-17, BR-18           | FR-05 đến FR-07, FR-55           | UC-18                      | AC-12                              |
| Mở rộng                | BP-12                         | FR-43, NFR-11, NFR-12            | UC-19                      | Kiểm tra trong kế hoạch triển khai |

---

# 11. Các điểm cần xác nhận trước khi code

1. Công thức cước chi tiết, giá tối thiểu và phụ phí.
2. Danh sách loại xe/dịch vụ ban đầu.
3. Chính sách hủy và việc áp dụng phí hủy.
4. Cách tính ETA chi tiết ngoài khoảng cách hiện tại.
5. Payment Provider và Notification Provider cụ thể.
6. Chính sách thanh toán lại ngoài giới hạn retry đã nêu.
7. Ma trận quyền chi tiết của Staff và Admin.
8. Danh sách đầy đủ thao tác audit và xử lý sau hạn lưu trữ.
9. Cách đồng bộ khi mất kết nối.
10. Định nghĩa KPI chi tiết ngoài tỷ lệ hoàn thành và tỷ lệ hủy.
11. Mức bắt buộc của mục tiêu 500 người dùng, 3 giây, 99,5%, RTO/RPO.
12. Phạm vi chức năng triển khai thực tế trong 7 tuần.

Các điểm chưa xác nhận không làm thay đổi quy trình cốt lõi đã đặc tả trong tài liệu này.
