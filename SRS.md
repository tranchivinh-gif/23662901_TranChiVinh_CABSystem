## Vấn đề

### Vấn đề 1 — Phân công tài xế thủ công

Hiện tại việc phân công tài xế chủ yếu được thực hiện thủ công.

**Hậu quả:**
- Mất thời gian.
- Khó tìm tài xế phù hợp.
- Khó xử lý khi tài xế từ chối.
- Không phù hợp khi số lượng chuyến tăng.

→ **Cần:** Cơ chế tự động tìm và phân công tài xế.

### Vấn đề 2 — Khách hàng không theo dõi được chuyến

Khách hàng khó biết:
- Hệ thống đã nhận yêu cầu chưa?
- Đang tìm tài xế?
- Tài xế nào đã nhận?
- Tài xế đã đến chưa?
- Chuyến đang ở trạng thái nào?

→ **Cần:** Quản lý và cập nhật trạng thái chuyến theo từng bước.

### Vấn đề 3 — Thanh toán chưa tập trung

Thông tin thanh toán hiện chưa được quản lý tập trung.

→ **Cần:**
- Tính cước.
- Hỗ trợ thanh toán tiền mặt.
- Hỗ trợ thanh toán điện tử.
- Tích hợp Payment Provider.
- Xử lý thanh toán thất bại.
- Không lưu thông tin nhạy cảm của thẻ/tài khoản thanh toán.

### Vấn đề 4 — Khó mở rộng hệ thống

Doanh nghiệp muốn phục vụ số lượng lớn khách hàng và tài xế.

**Hệ thống cần có khả năng:**
- Scale khi lượng người dùng tăng.
- Scale từng thành phần độc lập.
- Thêm chức năng mới từng phần.
- Thêm phương thức thanh toán.
- Thêm nhà cung cấp Notification.
- Thêm loại dịch vụ mới.

→ **Đây là vấn đề về Scalability và Extensibility.**

### Vấn đề 5 — Quản lý vận hành chưa hiệu quả

Nhân viên cần theo dõi:
- Chuyến đang diễn ra.
- Trạng thái tài xế.
- Khách hàng.
- Phương tiện.
- Giao dịch.
- Các chuyến bị lỗi.

→ **Cần:** Operation/Admin System.

### Vấn đề 6 — Thiếu dữ liệu để quản lý doanh nghiệp

Ban lãnh đạo cần biết:
- Có bao nhiêu chuyến?
- Doanh thu bao nhiêu?
- Bao nhiêu chuyến hoàn thành?
- Bao nhiêu chuyến bị hủy?
- Tài xế nào hoạt động hiệu quả?

→ **Cần:** Reporting/Analytics.

## Stakeholder

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

## Bussiness Role

| Business Role          | Vai trò nghiệp vụ  | Chức năng/Trách nhiệm chính                                             |
| ---------------------- | ------------------ | ----------------------------------------------------------------------- |
| **Customer**           | Khách hàng         | Đặt xe, theo dõi chuyến, thanh toán, đánh giá tài xế                    |
| **Driver**             | Tài xế             | Nhận chuyến, thực hiện chuyến, cập nhật trạng thái, quản lý phương tiện |
| **Operation Staff**    | Nhân viên vận hành | Theo dõi chuyến, tài xế, xử lý sự cố và hỗ trợ vận hành                 |
| **Admin**              | Quản trị hệ thống  | Quản lý tài khoản, phân quyền, cấu hình hệ thống                        |
| **Management**         | Ban giám đốc       | Theo dõi KPI, doanh thu, số chuyến, hiệu quả tài xế                     |
| **Finance/Accounting** | Tài chính/Kế toán  | Quản lý cước, giao dịch, doanh thu và đối soát                          |


<img width="524" height="619" alt="image" src="https://github.com/user-attachments/assets/c67df35a-9e25-4aba-86ca-3ebeb652cfef" />

## Phạm Vi

### Trong phạm vi

- Quản lý khách hàng.
- Quản lý tài xế và phương tiện.
- Đặt và quản lý chuyến xe.
- Tìm và phân công tài xế.
- Theo dõi trạng thái chuyến.
- Tính cước và thanh toán.
- Gửi thông báo.
- Quản lý vận hành.
- Báo cáo.

### Ngoài phạm vi / Chưa xác định

- Chi tiết cách tính cước.
- Chính sách hủy chuyến.
- Tiêu chí ưu tiên tài xế.
- Thời gian phản hồi của tài xế.
- Cách xử lý mất kết nối.
- Chính sách lưu trữ dữ liệu.
