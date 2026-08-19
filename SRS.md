Vấn đề 1 — Phân công tài xế thủ công

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
