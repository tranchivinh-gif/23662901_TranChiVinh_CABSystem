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

## Gặp khách hàng 

## Bắt đầu chuyển đổi BR

| ID        | Business Requirement                                                                                                | Xuất phát từ vấn đề | Stakeholder chính           |
| --------- | ------------------------------------------------------------------------------------------------------------------- | ------------------- | --------------------------- |
| **BR-01** | Hệ thống phải cho phép khách hàng tạo và quản lý yêu cầu đặt xe.                                                    | Vấn đề 2            | Customer                    |
| **BR-02** | Hệ thống phải tự động tìm và phân công tài xế phù hợp cho chuyến xe.                                                | Vấn đề 1            | Customer, Driver, Operation |
| **BR-03** | Hệ thống phải hỗ trợ xử lý trường hợp tài xế từ chối hoặc không nhận chuyến.                                        | Vấn đề 1            | Driver, Operation           |
| **BR-04** | Hệ thống phải cho phép khách hàng theo dõi trạng thái chuyến xe theo từng giai đoạn.                                | Vấn đề 2            | Customer                    |
| **BR-05** | Hệ thống phải cho phép tài xế cập nhật trạng thái chuyến trong quá trình thực hiện.                                 | Vấn đề 2            | Driver, Customer            |
| **BR-06** | Hệ thống phải tính và quản lý cước phí của từng chuyến xe.                                                          | Vấn đề 3            | Customer, Finance           |
| **BR-07** | Hệ thống phải hỗ trợ thanh toán tiền mặt và thanh toán điện tử.                                                     | Vấn đề 3            | Customer, Finance           |
| **BR-08** | Hệ thống phải tích hợp với Payment Provider và xử lý kết quả giao dịch.                                             | Vấn đề 3            | Finance, Payment Provider   |
| **BR-09** | Hệ thống phải xử lý các trường hợp thanh toán thất bại và cập nhật trạng thái giao dịch tương ứng.                  | Vấn đề 3            | Customer, Finance           |
| **BR-10** | Hệ thống không được lưu trữ trực tiếp thông tin nhạy cảm của thẻ hoặc tài khoản thanh toán.                         | Vấn đề 3            | Finance, Payment Provider   |
| **BR-11** | Hệ thống phải hỗ trợ quản lý khách hàng, tài xế và phương tiện.                                                     | Vấn đề 5            | Admin, Operation            |
| **BR-12** | Hệ thống phải cung cấp chức năng theo dõi và quản lý các chuyến xe đang diễn ra.                                    | Vấn đề 5            | Operation                   |
| **BR-13** | Hệ thống phải hỗ trợ nhân viên vận hành xử lý các chuyến xe gặp lỗi hoặc sự cố.                                     | Vấn đề 5            | Operation                   |
| **BR-14** | Hệ thống phải hỗ trợ quản lý tài khoản và phân quyền người dùng.                                                    | Vấn đề 5            | Admin                       |
| **BR-15** | Hệ thống phải gửi thông báo cho các bên liên quan khi có thay đổi quan trọng về chuyến xe hoặc giao dịch.           | Vấn đề 2, 3         | Customer, Driver, Operation |
| **BR-16** | Hệ thống phải cung cấp báo cáo về số chuyến, doanh thu, trạng thái chuyến và hiệu quả tài xế.                       | Vấn đề 6            | Management, Finance         |
| **BR-17** | Hệ thống phải cho phép doanh nghiệp mở rộng thêm phương thức thanh toán, Notification Provider và loại dịch vụ mới. | Vấn đề 4            | Management, Development     |
| **BR-18** | Hệ thống phải có khả năng mở rộng để đáp ứng số lượng khách hàng, tài xế và chuyến xe tăng lên.                     | Vấn đề 4            | Management, IT/DevOps       |


## Quy trình nghiệp vụ BProsessing

| BR ID     | Business Requirement                                      | Business Process ID | Business Process                     | Quy trình nghiệp vụ chính                                                                             | Stakeholder chính                   |
| --------- | --------------------------------------------------------- | ------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------- | ----------------------------------- |
| **BR-01** | Khách hàng tạo và quản lý yêu cầu đặt xe                  | **BP-01**           | Đặt và quản lý chuyến xe             | Nhập thông tin → Gửi yêu cầu → Kiểm tra → Tạo chuyến → Chờ tìm tài xế                                 | Customer                            |
| **BR-02** | Tự động tìm và phân công tài xế phù hợp                   | **BP-02**           | Tìm và phân công tài xế              | Nhận yêu cầu → Tìm tài xế khả dụng → Lọc tài xế → Gửi yêu cầu → Phân công                             | Customer, Driver, Operation         |
| **BR-03** | Xử lý trường hợp tài xế từ chối hoặc không nhận chuyến    | **BP-03**           | Xử lý tài xế từ chối chuyến          | Driver từ chối → Cập nhật trạng thái → Tìm tài xế khác → Gửi yêu cầu mới → Xử lý khi không còn tài xế | Driver, Operation                   |
| **BR-04** | Khách hàng theo dõi trạng thái chuyến theo từng giai đoạn | **BP-04**           | Theo dõi trạng thái chuyến           | Tạo chuyến → Tìm tài xế → Phân công → Tài xế đến → Bắt đầu chuyến → Hoàn thành                        | Customer                            |
| **BR-05** | Tài xế cập nhật trạng thái chuyến                         | **BP-05**           | Cập nhật trạng thái chuyến           | Driver cập nhật → Kiểm tra → Cập nhật trạng thái → Thông báo Customer                                 | Driver, Customer                    |
| **BR-06** | Tính và quản lý cước chuyến xe                            | **BP-06**           | Tính cước chuyến xe                  | Chuyến hoàn thành → Lấy thông tin chuyến → Tính cước → Lưu cước → Hiển thị tổng tiền                  | Customer, Finance                   |
| **BR-07** | Hỗ trợ thanh toán tiền mặt và điện tử                     | **BP-07**           | Thanh toán chuyến xe                 | Xác định số tiền → Chọn phương thức → Tiền mặt/Điện tử → Xác nhận kết quả                             | Customer, Finance                   |
| **BR-08** | Tích hợp Payment Provider                                 | **BP-08**           | Xử lý thanh toán điện tử             | Tạo payment request → Gửi Payment Provider → Xử lý giao dịch → Nhận kết quả → Cập nhật giao dịch      | Customer, Payment Provider, Finance |
| **BR-09** | Xử lý thanh toán thất bại                                 | **BP-09**           | Xử lý giao dịch thất bại             | Nhận kết quả thất bại → Cập nhật trạng thái → Thông báo Customer → Cho phép thanh toán lại            | Customer, Finance                   |
| **BR-10** | Không lưu thông tin nhạy cảm của thẻ/tài khoản            | **BP-10**           | Xử lý thông tin thanh toán an toàn   | Customer thanh toán → Payment Provider xử lý → Hệ thống nhận kết quả → Lưu Transaction Reference      | Customer, Finance, Payment Provider |
| **BR-11** | Quản lý khách hàng, tài xế và phương tiện                 | **BP-11**           | Quản lý đối tượng vận hành           | Chọn đối tượng → Xem/Thêm/Sửa/Khóa → Cập nhật dữ liệu                                                 | Admin, Operation                    |
| **BR-12** | Theo dõi các chuyến xe đang diễn ra                       | **BP-12**           | Giám sát vận hành chuyến xe          | Mở màn hình vận hành → Xem chuyến → Xem Driver → Theo dõi trạng thái → Phát hiện bất thường           | Operation                           |
| **BR-13** | Xử lý các chuyến gặp lỗi hoặc sự cố                       | **BP-13**           | Xử lý sự cố vận hành                 | Phát hiện sự cố → Tiếp nhận → Xác định nguyên nhân → Xử lý → Cập nhật → Thông báo                     | Operation                           |
| **BR-14** | Quản lý tài khoản và phân quyền                           | **BP-14**           | Quản lý người dùng và quyền truy cập | Quản lý tài khoản → Gán Role → Thiết lập quyền → Đăng nhập → Kiểm tra quyền → Cho phép/Từ chối        | Admin                               |
| **BR-15** | Gửi thông báo khi có sự kiện quan trọng                   | **BP-15**           | Gửi và quản lý thông báo             | Phát sinh sự kiện → Xác định người nhận → Chọn loại thông báo → Gửi → Xử lý kết quả                   | Customer, Driver, Operation         |
| **BR-16** | Cung cấp báo cáo về chuyến, doanh thu và hiệu quả tài xế  | **BP-16**           | Báo cáo và phân tích                 | Thu thập dữ liệu → Tổng hợp → Tính KPI → Tạo báo cáo → Phân tích                                      | Management, Finance                 |
| **BR-17** | Cho phép mở rộng Payment, Notification và Service         | **BP-17**           | Quản lý tích hợp và mở rộng dịch vụ  | Xác định nhu cầu → Chọn Provider → Cấu hình Integration → Kết nối → Kiểm tra → Kích hoạt              | Management, Development, IT/DevOps  |
| **BR-18** | Hệ thống có khả năng mở rộng khi lượng người dùng tăng    | **BP-18**           | Quản lý khả năng mở rộng hệ thống    | Phát hiện nhu cầu → Đánh giá tải → Xác định thành phần cần mở rộng → Mở rộng → Kiểm tra → Vận hành    | Management, IT/DevOps               |


# Sơ đồ quy trình nghiệp vụ

## Phân rã yêu cầu chức năng FR

| BR        | BP                                       | Functional Requirement (FR)                                         |
| --------- | ---------------------------------------- | ------------------------------------------------------------------- |
| **BR-01** | BP-01 Đặt và quản lý chuyến xe           | **FR-01.1** Nhập thông tin chuyến xe                                |
|           |                                          | **FR-01.2** Kiểm tra tính hợp lệ thông tin đặt xe                   |
|           |                                          | **FR-01.3** Tạo yêu cầu đặt xe                                      |
|           |                                          | **FR-01.4** Xem thông tin chuyến xe                                 |
|           |                                          | **FR-01.5** Hủy yêu cầu/chuyến xe                                   |
| **BR-02** | BP-02 Tìm và phân công tài xế            | **FR-02.1** Xác định tài xế khả dụng                                |
|           |                                          | **FR-02.2** Lọc tài xế phù hợp                                      |
|           |                                          | **FR-02.3** Gửi yêu cầu nhận chuyến cho tài xế                      |
|           |                                          | **FR-02.4** Phân công tài xế cho chuyến                             |
| **BR-03** | BP-03 Xử lý tài xế từ chối               | **FR-03.1** Ghi nhận tài xế từ chối                                 |
|           |                                          | **FR-03.2** Cập nhật trạng thái yêu cầu                             |
|           |                                          | **FR-03.3** Tìm tài xế thay thế                                     |
|           |                                          | **FR-03.4** Gửi yêu cầu cho tài xế tiếp theo                        |
|           |                                          | **FR-03.5** Xử lý trường hợp không tìm được tài xế                  |
| **BR-04** | BP-04 Theo dõi trạng thái chuyến         | **FR-04.1** Hiển thị trạng thái chuyến                              |
|           |                                          | **FR-04.2** Cập nhật trạng thái theo từng giai đoạn                 |
|           |                                          | **FR-04.3** Hiển thị thông tin tài xế                               |
|           |                                          | **FR-04.4** Hiển thị tiến trình chuyến                              |
| **BR-05** | BP-05 Cập nhật trạng thái chuyến         | **FR-05.1** Cho phép tài xế cập nhật trạng thái                     |
|           |                                          | **FR-05.2** Kiểm tra trạng thái hợp lệ                              |
|           |                                          | **FR-05.3** Lưu trạng thái chuyến                                   |
|           |                                          | **FR-05.4** Thông báo trạng thái mới cho khách hàng                 |
| **BR-06** | BP-06 Tính cước                          | **FR-06.1** Thu thập thông tin tính cước                            |
|           |                                          | **FR-06.2** Tính cước chuyến xe                                     |
|           |                                          | **FR-06.3** Lưu thông tin cước                                      |
|           |                                          | **FR-06.4** Hiển thị tổng tiền                                      |
| **BR-07** | BP-07 Thanh toán chuyến xe               | **FR-07.1** Hiển thị số tiền cần thanh toán                         |
|           |                                          | **FR-07.2** Cho phép chọn phương thức thanh toán                    |
|           |                                          | **FR-07.3** Xử lý thanh toán tiền mặt                               |
|           |                                          | **FR-07.4** Khởi tạo thanh toán điện tử                             |
|           |                                          | **FR-07.5** Cập nhật kết quả thanh toán                             |
| **BR-08** | BP-08 Thanh toán điện tử                 | **FR-08.1** Tạo payment request                                     |
|           |                                          | **FR-08.2** Gửi yêu cầu đến Payment Provider                        |
|           |                                          | **FR-08.3** Nhận kết quả giao dịch                                  |
|           |                                          | **FR-08.4** Cập nhật trạng thái giao dịch                           |
| **BR-09** | BP-09 Thanh toán thất bại                | **FR-09.1** Phát hiện giao dịch thất bại                            |
|           |                                          | **FR-09.2** Cập nhật trạng thái thất bại                            |
|           |                                          | **FR-09.3** Thông báo thanh toán thất bại                           |
|           |                                          | **FR-09.4** Cho phép khách hàng thanh toán lại                      |
| **BR-10** | BP-10 Xử lý thông tin thanh toán an toàn | **FR-10.1** Không lưu thông tin nhạy cảm của phương thức thanh toán |
|           |                                          | **FR-10.2** Lưu Transaction Reference                               |
|           |                                          | **FR-10.3** Liên kết giao dịch với chuyến xe                        |
| **BR-11** | BP-11 Quản lý đối tượng vận hành         | **FR-11.1** Quản lý khách hàng                                      |
|           |                                          | **FR-11.2** Quản lý tài xế                                          |
|           |                                          | **FR-11.3** Quản lý phương tiện                                     |
|           |                                          | **FR-11.4** Xem thông tin đối tượng                                 |
|           |                                          | **FR-11.5** Thêm/Sửa/Khóa đối tượng                                 |
| **BR-12** | BP-12 Giám sát vận hành                  | **FR-12.1** Hiển thị danh sách chuyến đang diễn ra                  |
|           |                                          | **FR-12.2** Xem thông tin tài xế                                    |
|           |                                          | **FR-12.3** Theo dõi trạng thái chuyến                              |
|           |                                          | **FR-12.4** Phát hiện chuyến có dấu hiệu bất thường                 |
| **BR-13** | BP-13 Xử lý sự cố                        | **FR-13.1** Ghi nhận sự cố                                          |
|           |                                          | **FR-13.2** Phân loại/xác định nguyên nhân                          |
|           |                                          | **FR-13.3** Cập nhật quá trình xử lý                                |
|           |                                          | **FR-13.4** Hoàn tất xử lý sự cố                                    |
|           |                                          | **FR-13.5** Thông báo kết quả xử lý                                 |
| **BR-14** | BP-14 Quản lý người dùng và quyền        | **FR-14.1** Tạo và quản lý tài khoản                                |
|           |                                          | **FR-14.2** Gán Role cho người dùng                                 |
|           |                                          | **FR-14.3** Thiết lập quyền truy cập                                |
|           |                                          | **FR-14.4** Xác thực đăng nhập                                      |
|           |                                          | **FR-14.5** Kiểm tra quyền truy cập                                 |
| **BR-15** | BP-15 Gửi thông báo                      | **FR-15.1** Xác định sự kiện cần thông báo                          |
|           |                                          | **FR-15.2** Xác định người nhận                                     |
|           |                                          | **FR-15.3** Chọn kênh thông báo                                     |
|           |                                          | **FR-15.4** Gửi thông báo                                           |
|           |                                          | **FR-15.5** Ghi nhận kết quả gửi                                    |
| **BR-16** | BP-16 Báo cáo và phân tích               | **FR-16.1** Thu thập dữ liệu báo cáo                                |
|           |                                          | **FR-16.2** Tổng hợp số chuyến                                      |
|           |                                          | **FR-16.3** Tổng hợp doanh thu                                      |
|           |                                          | **FR-16.4** Thống kê trạng thái chuyến                              |
|           |                                          | **FR-16.5** Đánh giá hiệu quả tài xế                                |
|           |                                          | **FR-16.6** Hiển thị báo cáo/KPI                                    |
| **BR-17** | BP-17 Quản lý tích hợp và mở rộng        | **FR-17.1** Quản lý Payment Provider                                |
|           |                                          | **FR-17.2** Quản lý Notification Provider                           |
|           |                                          | **FR-17.3** Cấu hình Service mới                                    |
|           |                                          | **FR-17.4** Kiểm tra kết nối Integration                            |
|           |                                          | **FR-17.5** Kích hoạt/tắt Integration                               |
| **BR-18** | BP-18 Quản lý khả năng mở rộng           | **FR-18.1** Theo dõi tải hệ thống                                   |
|           |                                          | **FR-18.2** Phát hiện nhu cầu mở rộng                               |
|           |                                          | **FR-18.3** Xác định thành phần cần scale                           |
|           |                                          | **FR-18.4** Thực hiện mở rộng hệ thống                              |
|           |                                          | **FR-18.5** Kiểm tra hệ thống sau khi scale                         |

