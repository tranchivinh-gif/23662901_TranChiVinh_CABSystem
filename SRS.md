<img width="813" height="1024" alt="image" src="https://github.com/user-attachments/assets/e0fc30c4-7b09-43d3-8203-19a34e1fcc08" />Vấn đề 1 — Phân công tài xế thủ công

Hiện tại việc phân công tài xế chủ yếu thủ công.
Hậu quả:
Mất thời gian.
Khó tìm tài xế phù hợp.
Khó xử lý khi tài xế từ chối.
Không phù hợp khi số lượng chuyến tăng.
→ Cần cơ chế tự động tìm và phân công tài xế.

Vấn đề 2 — Khách hàng không theo dõi được chuyến

Khách hàng khó biết:
Hệ thống đã nhận yêu cầu chưa?
Đang tìm tài xế?
Tài xế nào nhận?
Tài xế đã đến chưa?
Chuyến đang ở trạng thái nào?
→ Cần quản lý và cập nhật trạng thái chuyến theo từng bước.

Vấn đề 3 — Thanh toán chưa tập trung

Thông tin thanh toán hiện chưa được quản lý tập trung.

→ Cần:
Tính cước.
Hỗ trợ tiền mặt.
Hỗ trợ thanh toán điện tử.
Tích hợp Payment Provider.
Xử lý thanh toán thất bại.
Đặc biệt:
CAB không lưu thông tin nhạy cảm của thẻ/tài khoản thanh toán.

Vấn đề 4 — Khó mở rộng hệ thống

Doanh nghiệp muốn phục vụ số lượng lớn khách hàng và tài xế.

Hệ thống phải có khả năng:
Scale khi lượng người dùng tăng.
Scale từng thành phần độc lập.
Thêm chức năng mới từng phần.
Thêm phương thức thanh toán.
Thêm nhà cung cấp notification.
Thêm loại dịch vụ mới.
→ Đây là vấn đề về Scalability + Extensibility.

Vấn đề 5 — Quản lý vận hành chưa hiệu quả

Nhân viên cần theo dõi:
Chuyến đang diễn ra.
Trạng thái tài xế.
Khách hàng.
Phương tiện.
Giao dịch.
Các chuyến bị lỗi.
→ Cần Operation/Admin System.

Vấn đề 6 — Thiếu dữ liệu để quản lý doanh nghiệp

Ban lãnh đạo cần biết:
Có bao nhiêu chuyến?
Doanh thu bao nhiêu?
Bao nhiêu chuyến hoàn thành?
Bao nhiêu chuyến bị hủy?
Tài xế nào hoạt động hiệu quả?
→ Cần Reporting/Analytics.


| STT | Nhóm chức năng          | Chức năng                    |
| --- | ----------------------- | ---------------------------- |
| 1   | **Authentication**      | Đăng ký, đăng nhập, xác thực |
| 2   | **Customer Management** | Quản lý thông tin khách hàng |
| 3   | **Booking/Trip**        | Đặt xe, quản lý chuyến       |
| 4   | **Driver Management**   | Quản lý tài xế, trạng thái   |
| 5   | **Driver Matching**     | Tìm và phân công tài xế      |
| 6   | **Payment & Fare**      | Tính cước, thanh toán        |
| 7   | **Notification**        | Gửi thông báo                |
| 8   | **Operation/Admin**     | Quản lý và giám sát hệ thống |
| 9   | **Reporting**           | Báo cáo hoạt động            |


| ID   | Nhóm chức năng      | Chức năng chính                               | Actor                   |
| ---- | ------------------- | --------------------------------------------- | ----------------------- |
| FR01 | Authentication      | Đăng ký tài khoản                             | Customer, Driver        |
| FR02 | Authentication      | Đăng nhập                                     | Customer, Driver, Staff |
| FR03 | Authentication      | Xác thực người dùng                           | Customer, Driver, Staff |
| FR04 | Authentication      | Phân quyền người dùng                         | Staff, Admin            |
| FR05 | Authentication      | Kiểm soát quyền truy cập chức năng quản trị   | Staff, Admin            |
| FR06 | Customer Management | Cập nhật thông tin cá nhân                    | Customer                |
| FR07 | Customer Management | Quản lý tài khoản                             | Customer                |
| FR08 | Customer Management | Xem lịch sử chuyến đi                         | Customer                |
| FR09 | Customer Management | Xem số tiền phải trả                          | Customer                |
| FR10 | Customer Management | Đánh giá tài xế                               | Customer                |
| FR11 | Booking             | Nhập điểm đón và điểm đến                     | Customer                |
| FR12 | Booking             | Lựa chọn loại xe                              | Customer                |
| FR13 | Booking             | Gửi yêu cầu đặt xe                            | Customer                |
| FR14 | Booking             | Tạo và quản lý booking                        | System                  |
| FR15 | Trip Management     | Theo dõi trạng thái chuyến đi                 | Customer, Driver, Staff |
| FR16 | Trip Management     | Cập nhật trạng thái chuyến đi                 | Driver                  |
| FR17 | Driver Management   | Đăng ký/tạo tài khoản tài xế                  | Driver, Staff           |
| FR18 | Driver Management   | Cập nhật hồ sơ tài xế                         | Driver                  |
| FR19 | Driver Management   | Quản lý thông tin phương tiện                 | Driver, Staff           |
| FR20 | Driver Management   | Cập nhật trạng thái hoạt động                 | Driver                  |
| FR21 | Driver Management   | Cập nhật vị trí tài xế                        | Driver/System           |
| FR22 | Driver Matching     | Tìm tài xế phù hợp                            | System                  |
| FR23 | Driver Matching     | Ưu tiên tài xế gần khách hàng                 | System                  |
| FR24 | Driver Matching     | Gửi yêu cầu đến tài xế                        | System                  |
| FR25 | Driver Matching     | Tài xế chấp nhận/từ chối chuyến               | Driver                  |
| FR26 | Driver Matching     | Tìm tài xế khác khi bị từ chối/không phản hồi | System                  |
| FR27 | Driver Matching     | Thông báo khi không tìm được tài xế           | System                  |
| FR28 | Fare & Payment      | Tính cước chuyến đi                           | System                  |
| FR29 | Fare & Payment      | Thanh toán tiền mặt                           | Customer                |
| FR30 | Fare & Payment      | Thanh toán điện tử                            | Customer                |
| FR31 | Fare & Payment      | Tích hợp Payment Provider                     | System                  |
| FR32 | Fare & Payment      | Xử lý kết quả thanh toán                      | System                  |
| FR33 | Fare & Payment      | Xử lý thanh toán thất bại                     | Customer, System        |
| FR34 | Notification        | Thông báo trạng thái booking/chuyến đi        | Customer                |
| FR35 | Notification        | Thông báo chuyến mới                          | Driver                  |
| FR36 | Notification        | Thông báo thay đổi chuyến                     | Customer, Driver        |
| FR37 | Operation           | Quản lý khách hàng                            | Staff                   |
| FR38 | Operation           | Quản lý tài xế                                | Staff                   |
| FR39 | Operation           | Quản lý phương tiện                           | Staff                   |
| FR40 | Operation           | Theo dõi chuyến đang diễn ra                  | Staff                   |
| FR41 | Operation           | Theo dõi trạng thái tài xế                    | Staff                   |
| FR42 | Operation           | Xử lý chuyến bị lỗi                           | Staff                   |
| FR43 | Operation           | Tra cứu giao dịch                             | Staff                   |
| FR44 | Reporting           | Báo cáo số lượng chuyến                       | Management              |
| FR45 | Reporting           | Báo cáo doanh thu                             | Management              |
| FR46 | Reporting           | Báo cáo tỷ lệ hoàn thành/hủy                  | Management              |
| FR47 | Reporting           | Báo cáo hiệu quả tài xế                       | Management              |

| ID    | Nhóm NFR             | Yêu cầu                                                                                                      |
| ----- | -------------------- | ------------------------------------------------------------------------------------------------------------ |
| NFR01 | **Security**         | Người dùng phải được xác thực trước khi sử dụng các chức năng yêu cầu tài khoản.                             |
| NFR02 | **Security**         | Các chức năng quản trị phải được kiểm soát bằng cơ chế phân quyền.                                           |
| NFR03 | **Security**         | Thông tin cá nhân của Customer và Driver phải được bảo vệ.                                                   |
| NFR04 | **Security**         | Dữ liệu vị trí tài xế phải được bảo vệ khỏi truy cập trái phép.                                              |
| NFR05 | **Security**         | Dữ liệu giao dịch và thanh toán phải được bảo vệ.                                                            |
| NFR06 | **Security**         | Hệ thống phải lưu audit log đối với các thao tác quan trọng.                                                 |
| NFR07 | **Scalability**      | Hệ thống phải có khả năng phục vụ số lượng lớn Customer, Driver và Trip.                                     |
| NFR08 | **Scalability**      | Các thành phần của hệ thống có khả năng mở rộng độc lập khi tải tăng.                                        |
| NFR09 | **Availability**     | Hệ thống phải hoạt động ổn định trong thời điểm nhu cầu đặt xe tăng cao.                                     |
| NFR10 | **Reliability**      | Lỗi của Payment hoặc Notification không được làm toàn bộ hệ thống CAB ngừng hoạt động.                       |
| NFR11 | **Fault Tolerance**  | Hệ thống phải có khả năng xử lý lỗi và tiếp tục hoạt động đối với các thành phần không bị lỗi.               |
| NFR12 | **Extensibility**    | Có thể bổ sung loại dịch vụ mới mà hạn chế ảnh hưởng đến hệ thống hiện tại.                                  |
| NFR13 | **Extensibility**    | Có thể tích hợp thêm Payment Provider trong tương lai.                                                       |
| NFR14 | **Extensibility**    | Có thể tích hợp thêm Notification Provider/kênh thông báo mới.                                               |
| NFR15 | **Maintainability**  | Chức năng mới có thể được triển khai từng phần và hạn chế ảnh hưởng đến chức năng đang hoạt động.            |
| NFR16 | **Data Privacy**     | CAB không được lưu trực tiếp thông tin nhạy cảm của thẻ hoặc tài khoản thanh toán.                           |
| NFR17 | **Auditability**     | Các thao tác quan trọng phải có khả năng truy vết để phục vụ kiểm tra sự cố.                                 |
| NFR18 | **Performance**      | Hệ thống phải đáp ứng nhanh các thao tác đặt xe, tìm tài xế và cập nhật trạng thái.                          |
| NFR19 | **Interoperability** | Hệ thống phải có khả năng tích hợp với các hệ thống bên ngoài như Payment Provider và Notification Provider. |
| NFR20 | **Data Retention**   | Hệ thống phải có chính sách lưu trữ dữ liệu phù hợp với quy định của doanh nghiệp.                           |



| Stakeholder                                    | Vai trò                  | Quan tâm chính                                          |
| ---------------------------------------------- | ------------------------ | ------------------------------------------------------- |
| **Ban giám đốc (Management)**                  | Chủ đầu tư/quyết định    | Doanh thu, hiệu quả vận hành, báo cáo, khả năng mở rộng |
| **Khách hàng (Customer)**                      | Người đặt xe             | Đặt xe nhanh, theo dõi chuyến, thanh toán, đánh giá     |
| **Tài xế (Driver)**                            | Người thực hiện chuyến   | Nhận chuyến, cập nhật trạng thái, quản lý phương tiện   |
| **Nhân viên vận hành (Operation Staff)**       | Quản lý hoạt động        | Theo dõi chuyến, tài xế, xử lý sự cố                    |
| **Nhân viên quản trị (Admin)**                 | Quản trị hệ thống        | Tài khoản, phân quyền, cấu hình, dữ liệu                |
| **Bộ phận tài chính/kế toán**                  | Quản lý tài chính        | Cước, giao dịch, doanh thu, đối soát                    |
| **Nhà cung cấp thanh toán (Payment Provider)** | Xử lý thanh toán điện tử | Giao dịch, kết quả thanh toán                           |
| **Nhà cung cấp Notification**                  | Gửi thông báo            | SMS, Email, Push Notification                           |
| **Business Analyst (BA)**                      | Phân tích nghiệp vụ      | Làm rõ yêu cầu, business rules, scope                   |
| **Development Team**                           | Xây dựng hệ thống        | Kiến trúc, chức năng, tích hợp                          |
| **QA/Tester**                                  | Kiểm thử                 | Đảm bảo hệ thống đáp ứng yêu cầu                        |
| **IT/DevOps**                                  | Vận hành hệ thống        | Deployment, monitoring, scalability, availability       |


<img width="813" height="1024" alt="image" src="https://github.com/user-attachments/assets/17f2684a-f550-477e-9419-d52c313dbae3" />



  | Nhóm               | Mức ảnh hưởng | Mức quan tâm | Cách quản lý                                                 |
| ------------------ | ------------- | ------------ | ------------------------------------------------------------ |
| **Manage Closely** | Cao           | Cao          | Làm việc thường xuyên, lấy ý kiến và phối hợp chặt chẽ       |
| **Keep Satisfied** | Cao           | Thấp         | Đảm bảo nhu cầu quan trọng được đáp ứng, duy trì sự hài lòng |
| **Keep Informed**  | Thấp          | Cao          | Cập nhật thông tin thường xuyên, thu thập phản hồi           |
| **Monitor**        | Thấp          | Thấp         | Theo dõi và chỉ phối hợp khi cần thiết                       |
