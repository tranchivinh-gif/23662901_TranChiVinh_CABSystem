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

## xác định Quy tắc nghiệp vụ Bussiness Rule, exception 

| ID        | Business Rule                                                                                                                  | Áp dụng cho     |
| --------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------- |
| **BR-01** | Khách hàng phải đăng ký và đăng nhập trước khi sử dụng các chức năng yêu cầu tài khoản.                                        | Customer        |
| **BR-02** | Tài xế phải có tài khoản hợp lệ và thông tin phương tiện hợp lệ trước khi nhận chuyến.                                         | Driver          |
| **BR-03** | Tài xế chỉ được nhận chuyến khi đang ở trạng thái **sẵn sàng nhận chuyến**.                                                    | Driver          |
| **BR-04** | Một chuyến xe chỉ được phân công cho một tài xế tại một thời điểm.                                                             | Trip            |
| **BR-05** | Hệ thống chỉ tìm tài xế trong nhóm tài xế đáp ứng điều kiện khả dụng và phù hợp với chuyến.                                    | Driver Matching |
| **BR-06** | Khi tài xế từ chối hoặc không nhận chuyến, hệ thống phải tiếp tục tìm tài xế khác mà không yêu cầu khách hàng tạo lại yêu cầu. | Driver Matching |
| **BR-07** | Khi không còn tài xế phù hợp, hệ thống phải thông báo cho khách hàng rằng chuyến không thể được phân công.                     | Trip            |
| **BR-08** | Trạng thái chuyến phải được cập nhật theo trình tự nghiệp vụ hợp lệ.                                                           | Trip            |
| **BR-09** | Tài xế chỉ được cập nhật các trạng thái thuộc chuyến mà mình đang được phân công.                                              | Driver          |
| **BR-10** | Chuyến chỉ được tính cước sau khi chuyến được hoàn thành.                                                                      | Fare            |
| **BR-11** | Số tiền thanh toán phải được xác định trước khi thực hiện thanh toán.                                                          | Payment         |
| **BR-12** | Hệ thống hỗ trợ ít nhất hai phương thức thanh toán: tiền mặt và điện tử.                                                       | Payment         |
| **BR-13** | Thanh toán điện tử phải được xử lý thông qua Payment Provider bên ngoài.                                                       | Payment         |
| **BR-14** | Hệ thống CAB không được lưu trực tiếp thông tin nhạy cảm của thẻ hoặc tài khoản thanh toán.                                    | Payment         |
| **BR-15** | Mỗi giao dịch thanh toán phải được liên kết với chuyến xe tương ứng.                                                           | Transaction     |
| **BR-16** | Khi thanh toán điện tử thất bại, giao dịch phải được cập nhật trạng thái thất bại và khách hàng phải được thông báo.           | Payment         |
| **BR-17** | Khách hàng chỉ có thể đánh giá tài xế sau khi chuyến xe hoàn thành.                                                            | Rating          |
| **BR-18** | Các thao tác quản trị phải được kiểm tra quyền trước khi thực hiện.                                                            | Admin           |
| **BR-19** | Nhân viên không có quyền phù hợp không được thực hiện thao tác quản trị nhạy cảm.                                              | Authorization   |
| **BR-20** | Các thay đổi quan trọng về chuyến xe và giao dịch phải tạo thông báo cho các bên liên quan.                                    | Notification    |
| **BR-21** | Hệ thống phải lưu vết các thao tác quan trọng để phục vụ kiểm tra và xử lý sự cố.                                              | Audit           |
| **BR-22** | Dữ liệu cá nhân, phương tiện, vị trí và giao dịch phải được bảo vệ khỏi truy cập trái phép.                                    | Security        |
| **BR-23** | Notification Provider và Payment Provider phải được thiết kế theo hướng có thể thay thế/mở rộng.                               | Integration     |
| **BR-24** | Các thành phần của hệ thống phải có khả năng mở rộng độc lập khi tải tăng.                                                     | Scalability     |

| ID        | Exception                            | Điều kiện xảy ra                                            | Hệ thống xử lý                                                                           |
| --------- | ------------------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **EX-01** | Thông tin đặt xe không hợp lệ        | Thiếu/sai thông tin điểm đón, điểm đến hoặc loại xe         | Từ chối yêu cầu và thông báo lỗi                                                         |
| **EX-02** | Không tìm thấy tài xế                | Không có tài xế phù hợp/khả dụng                            | Thông báo khách hàng không tìm được tài xế                                               |
| **EX-03** | Tài xế từ chối chuyến                | Driver chọn từ chối                                         | Cập nhật trạng thái và tìm tài xế khác                                                   |
| **EX-04** | Tài xế không phản hồi                | Driver không phản hồi yêu cầu                               | Chuyển sang cơ chế tìm tài xế khác theo chính sách                                       |
| **EX-05** | Tài xế không còn khả dụng            | Driver chuyển trạng thái không sẵn sàng trong quá trình tìm | Loại tài xế khỏi danh sách tìm kiếm                                                      |
| **EX-06** | Không thể cập nhật trạng thái chuyến | Trạng thái mới không hợp lệ hoặc không đúng trình tự        | Từ chối cập nhật và thông báo lỗi                                                        |
| **EX-07** | Thanh toán điện tử thất bại          | Payment Provider trả kết quả thất bại                       | Cập nhật giao dịch thất bại, thông báo khách hàng và cho phép xử lý lại theo chính sách  |
| **EX-08** | Payment Provider không phản hồi      | Không nhận được kết quả giao dịch                           | Ghi nhận trạng thái phù hợp và xử lý theo cơ chế retry/đối soát                          |
| **EX-09** | Dữ liệu thanh toán không hợp lệ      | Payment Provider từ chối payment request                    | Thông báo lỗi và không xác nhận thanh toán thành công                                    |
| **EX-10** | Không gửi được thông báo             | Notification Provider lỗi                                   | Ghi nhận lỗi gửi và xử lý theo cơ chế dự phòng/retry                                     |
| **EX-11** | Người dùng không có quyền            | User truy cập chức năng không thuộc quyền                   | Từ chối truy cập                                                                         |
| **EX-12** | Tài khoản không hợp lệ/bị khóa       | User sử dụng tài khoản không hợp lệ                         | Không cho phép sử dụng chức năng yêu cầu tài khoản                                       |
| **EX-13** | Phương tiện không hợp lệ             | Driver sử dụng phương tiện chưa được xác nhận               | Không cho phép tài xế nhận/thực hiện chuyến                                              |
| **EX-14** | Chuyến xảy ra sự cố                  | Operation phát hiện chuyến lỗi/bất thường                   | Tạo/ghi nhận sự cố để nhân viên vận hành xử lý                                           |
| **EX-15** | Mất kết nối mạng                     | User/Driver mất kết nối trong quá trình sử dụng             | **Chưa chốt**, cần BA xác nhận chính sách xử lý                                          |
| **EX-16** | Lỗi hệ thống thành phần              | Payment/Notification gặp lỗi                                | Không để lỗi của thành phần làm dừng toàn bộ chức năng đặt xe                            |
| **EX-17** | Dữ liệu vị trí không khả dụng        | Không nhận được vị trí Driver                               | Không sử dụng vị trí hiện tại cho việc xác định khoảng cách/ETA và xử lý theo chính sách |
| **EX-18** | Lỗi khi mở rộng hệ thống             | Thành phần sau khi scale hoạt động không ổn định            | Kiểm tra, rollback hoặc xử lý theo quy trình vận hành                                    |

## mô hình hóa dữ liệu

### 1. UserAccount

| Thuộc tính | Ý nghĩa | Khóa |
|---|---|---|
| `UserID` | Mã người dùng | PK |
| `Username` | Tên đăng nhập | |
| `Password` | Mật khẩu đã mã hóa | |
| `Email` | Email | |
| `Phone` | Số điện thoại | |
| `FullName` | Họ tên | |
| `Status` | Trạng thái tài khoản | |
| `CreatedAt` | Ngày tạo | |
| `UpdatedAt` | Ngày cập nhật | |

---

### 2. Role

| Thuộc tính | Ý nghĩa | Khóa |
|---|---|---|
| `RoleID` | Mã vai trò | PK |
| `RoleName` | Tên vai trò | |
| `Description` | Mô tả vai trò | |
| `Status` | Trạng thái | |

Ví dụ: `Customer`, `Driver`, `Operation Staff`, `Admin`, `Management`, `Finance`.

---

## 3. Permission

| Thuộc tính | Ý nghĩa | Khóa |
|---|---|---|
| `PermissionID` | Mã quyền | PK |
| `PermissionName` | Tên quyền | |
| `Description` | Mô tả quyền | |
| `Resource` | Đối tượng/chức năng được phép truy cập | |
| `Action` | Hành động được phép | |

Ví dụ: `Trip.View`, `Trip.Update`, `User.Lock`.

---

## 4. Customer

| Thuộc tính | Ý nghĩa | Khóa |
|---|---|---|
| `CustomerID` | Mã khách hàng | PK |
| `UserID` | Tài khoản người dùng | FK |
| `Address` | Địa chỉ | |
| `DateOfBirth` | Ngày sinh | |
| `CreatedAt` | Ngày tạo hồ sơ | |

`Customer` nên liên kết với `UserAccount` thay vì lưu lại `Username`, `Password`, `Email`,...

---

### 5. Driver

| Thuộc tính | Ý nghĩa | Khóa |
|---|---|---|
| `DriverID` | Mã tài xế | PK |
| `UserID` | Tài khoản tài xế | FK |
| `LicenseNumber` | Số giấy phép lái xe | |
| `DriverStatus` | Trạng thái tài xế | |
| `AvailabilityStatus` | Trạng thái sẵn sàng nhận chuyến | |
| `RatingAverage` | Điểm đánh giá trung bình | |
| `CreatedAt` | Ngày tạo | |
| `UpdatedAt` | Ngày cập nhật | |

Ví dụ `AvailabilityStatus`: `Available`, `Busy`, `Offline`.

---

### 6. Vehicle

| Thuộc tính | Ý nghĩa | Khóa |
|---|---|---|
| `VehicleID` | Mã phương tiện | PK |
| `DriverID` | Tài xế sở hữu/sử dụng | FK |
| `VehicleType` | Loại xe | |
| `LicensePlate` | Biển số xe | |
| `Brand` | Hãng xe | |
| `Model` | Model xe | |
| `Color` | Màu xe | |
| `Status` | Trạng thái phương tiện | |
| `CreatedAt` | Ngày tạo | |

---

### 7. ServiceType

Thực thể này dùng để hỗ trợ **nhiều loại dịch vụ trong tương lai**.

| Thuộc tính | Ý nghĩa | Khóa |
|---|---|---|
| `ServiceTypeID` | Mã loại dịch vụ | PK |
| `ServiceName` | Tên dịch vụ | |
| `Description` | Mô tả | |
| `VehicleType` | Loại xe phù hợp | |
| `Status` | Trạng thái | |
| `CreatedAt` | Ngày tạo | |

Ví dụ: `Taxi 4 chỗ`, `Taxi 7 chỗ`.

---

### 8. Trip

Đây là **thực thể trung tâm** của hệ thống.

| Thuộc tính | Ý nghĩa | Khóa |
|---|---|---|
| `TripID` | Mã chuyến | PK |
| `CustomerID` | Khách hàng đặt | FK |
| `DriverID` | Tài xế được phân công | FK |
| `VehicleID` | Phương tiện thực hiện | FK |
| `ServiceTypeID` | Loại dịch vụ | FK |
| `PickupLocation` | Điểm đón | |
| `Destination` | Điểm đến | |
| `PickupLatitude` | Vĩ độ điểm đón | |
| `PickupLongitude` | Kinh độ điểm đón | |
| `DestinationLatitude` | Vĩ độ điểm đến | |
| `DestinationLongitude` | Kinh độ điểm đến | |
| `RequestedAt` | Thời điểm đặt | |
| `AcceptedAt` | Thời điểm tài xế nhận | |
| `StartedAt` | Thời điểm bắt đầu | |
| `CompletedAt` | Thời điểm hoàn thành | |
| `Status` | Trạng thái chuyến | |
| `Note` | Ghi chú | |

---

### 9. TripStatus

Nếu muốn quản lý lịch sử trạng thái thì nên tách thành thực thể riêng.

| Thuộc tính | Ý nghĩa | Khóa |
|---|---|---|
| `TripStatusID` | Mã trạng thái | PK |
| `TripID` | Mã chuyến | FK |
| `Status` | Trạng thái | |
| `UpdatedBy` | Người cập nhật | FK |
| `UpdatedAt` | Thời điểm cập nhật | |
| `Note` | Ghi chú | |

## 10. DriverLocation

Dùng để lưu vị trí tài xế.

| Thuộc tính   | Ý nghĩa            | Khóa |
| ------------ | ------------------ | ---- |
| `LocationID` | Mã vị trí          | PK   |
| `DriverID`   | Mã tài xế          | FK   |
| `Latitude`   | Vĩ độ              |      |
| `Longitude`  | Kinh độ            |      |
| `RecordedAt` | Thời điểm ghi nhận |      |

Quan hệ:

```text
Driver 1 ───── N DriverLocation
```

---

## 11. Fare

| Thuộc tính     | Ý nghĩa             | Khóa |
| -------------- | ------------------- | ---- |
| `FareID`       | Mã cước             | PK   |
| `TripID`       | Mã chuyến           | FK   |
| `BaseFare`     | Giá cơ bản          |      |
| `Distance`     | Quãng đường         |      |
| `Duration`     | Thời gian           |      |
| `ServiceFee`   | Phí dịch vụ         |      |
| `Discount`     | Giảm giá            |      |
| `TotalAmount`  | Tổng tiền           |      |
| `CalculatedAt` | Thời điểm tính cước |      |

**Lưu ý:** Các thành phần cụ thể của công thức tính cước chưa được khách hàng chốt, nên các thuộc tính trên hiện là mức mô hình hóa đề xuất.

---

## 12. Payment

| Thuộc tính        | Ý nghĩa                | Khóa |
| ----------------- | ---------------------- | ---- |
| `PaymentID`       | Mã thanh toán          | PK   |
| `TripID`          | Mã chuyến              | FK   |
| `Amount`          | Số tiền thanh toán     |      |
| `PaymentMethodID` | Phương thức thanh toán | FK   |
| `PaymentStatus`   | Trạng thái thanh toán  |      |
| `PaidAt`          | Thời điểm thanh toán   |      |
| `CreatedAt`       | Ngày tạo               |      |

---

## 13. Transaction

| Thuộc tính              | Ý nghĩa                  | Khóa |
| ----------------------- | ------------------------ | ---- |
| `TransactionID`         | Mã giao dịch             | PK   |
| `PaymentID`             | Mã thanh toán            | FK   |
| `ProviderID`            | Nhà cung cấp thanh toán  | FK   |
| `ProviderTransactionID` | Mã giao dịch từ Provider |      |
| `TransactionReference`  | Mã tham chiếu giao dịch  |      |
| `Amount`                | Số tiền                  |      |
| `Status`                | Trạng thái giao dịch     |      |
| `CreatedAt`             | Thời điểm tạo            |      |
| `CompletedAt`           | Thời điểm hoàn thành     |      |

Không lưu số thẻ, CVV hoặc thông tin thanh toán nhạy cảm trực tiếp trong CAB.

---

## 14. PaymentMethod

| Thuộc tính        | Ý nghĩa            | Khóa |
| ----------------- | ------------------ | ---- |
| `PaymentMethodID` | Mã phương thức     | PK   |
| `MethodName`      | Tên phương thức    |      |
| `MethodType`      | Loại phương thức   |      |
| `ProviderID`      | Provider tương ứng | FK   |
| `Status`          | Trạng thái         |      |

Ví dụ:

```text
Cash
Electronic Payment
```

---

## 15. Rating

| Thuộc tính   | Ý nghĩa              | Khóa |
| ------------ | -------------------- | ---- |
| `RatingID`   | Mã đánh giá          | PK   |
| `TripID`     | Mã chuyến            | FK   |
| `CustomerID` | Người đánh giá       | FK   |
| `DriverID`   | Tài xế được đánh giá | FK   |
| `Score`      | Điểm đánh giá        |      |
| `Comment`    | Nội dung đánh giá    |      |
| `CreatedAt`  | Thời điểm đánh giá   |      |

---

## 16. Notification

| Thuộc tính         | Ý nghĩa          | Khóa |
| ------------------ | ---------------- | ---- |
| `NotificationID`   | Mã thông báo     | PK   |
| `UserID`           | Người nhận       | FK   |
| `TripID`           | Chuyến liên quan | FK   |
| `NotificationType` | Loại thông báo   |      |
| `Title`            | Tiêu đề          |      |
| `Content`          | Nội dung         |      |
| `Channel`          | Kênh gửi         |      |
| `Status`           | Trạng thái gửi   |      |
| `SentAt`           | Thời điểm gửi    |      |

---

## 17. NotificationProvider

| Thuộc tính      | Ý nghĩa            | Khóa |
| --------------- | ------------------ | ---- |
| `ProviderID`    | Mã Provider        | PK   |
| `ProviderName`  | Tên Provider       |      |
| `ProviderType`  | SMS/Email/Push     |      |
| `Configuration` | Thông tin cấu hình |      |
| `Status`        | Trạng thái         |      |
| `CreatedAt`     | Ngày tạo           |      |

---

## 18. PaymentProvider

| Thuộc tính      | Ý nghĩa           | Khóa |
| --------------- | ----------------- | ---- |
| `ProviderID`    | Mã Provider       | PK   |
| `ProviderName`  | Tên nhà cung cấp  |      |
| `ProviderType`  | Loại Provider     |      |
| `Configuration` | Cấu hình tích hợp |      |
| `Status`        | Trạng thái        |      |
| `CreatedAt`     | Ngày tạo          |      |

---

## 19. Incident

| Thuộc tính     | Ý nghĩa              | Khóa |
| -------------- | -------------------- | ---- |
| `IncidentID`   | Mã sự cố             | PK   |
| `TripID`       | Chuyến xảy ra sự cố  | FK   |
| `ReportedBy`   | Người báo cáo        | FK   |
| `IncidentType` | Loại sự cố           |      |
| `Description`  | Mô tả                |      |
| `Status`       | Trạng thái xử lý     |      |
| `Resolution`   | Cách xử lý           |      |
| `CreatedAt`    | Thời điểm tạo        |      |
| `ResolvedAt`   | Thời điểm xử lý xong |      |

---

## 20. AuditLog

| Thuộc tính   | Ý nghĩa                    | Khóa |
| ------------ | -------------------------- | ---- |
| `AuditLogID` | Mã log                     | PK   |
| `UserID`     | Người thực hiện            | FK   |
| `Action`     | Hành động                  |      |
| `EntityType` | Loại đối tượng bị tác động |      |
| `EntityID`   | ID đối tượng               |      |
| `OldValue`   | Giá trị trước thay đổi     |      |
| `NewValue`   | Giá trị sau thay đổi       |      |
| `IPAddress`  | Địa chỉ IP                 |      |
| `CreatedAt`  | Thời điểm thao tác         |      |

---


## xác định yêu cầu phi chức năng

| ID         | Non-Functional Requirement                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| **NFR-01** | Hệ thống phải phản hồi nhanh đối với các thao tác thông thường của người dùng.                               |
| **NFR-02** | Hệ thống phải có khả năng xử lý đồng thời nhiều yêu cầu đặt xe.                                              |
| **NFR-03** | Chức năng tìm và phân công tài xế phải xử lý đủ nhanh để không ảnh hưởng đáng kể đến trải nghiệm khách hàng. |
| **NFR-04** | Việc cập nhật trạng thái chuyến và vị trí tài xế phải được xử lý kịp thời.                                   |
| **NFR-05** | Các chức năng báo cáo không được làm ảnh hưởng đáng kể đến hoạt động đặt xe đang diễn ra.                    |

| ID         | Non-Functional Requirement                                                                    |
| ---------- | --------------------------------------------------------------------------------------------- |
| **NFR-11** | Hệ thống phải có khả năng mở rộng khi số lượng khách hàng tăng.                               |
| **NFR-12** | Hệ thống phải có khả năng mở rộng khi số lượng tài xế tăng.                                   |
| **NFR-13** | Hệ thống phải có khả năng mở rộng khi số lượng chuyến xe tăng.                                |
| **NFR-14** | Các thành phần của hệ thống phải có khả năng scale độc lập.                                   |
| **NFR-15** | Việc mở rộng một thành phần không được gây ảnh hưởng không cần thiết đến các thành phần khác. |

| ID         | Non-Functional Requirement                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------- |
| **NFR-16** | Hệ thống phải cho phép bổ sung loại dịch vụ mới mà không phải xây dựng lại toàn bộ hệ thống.      |
| **NFR-17** | Hệ thống phải cho phép bổ sung phương thức thanh toán mới.                                        |
| **NFR-18** | Hệ thống phải cho phép tích hợp thêm Payment Provider.                                            |
| **NFR-19** | Hệ thống phải cho phép tích hợp thêm Notification Provider.                                       |
| **NFR-20** | Chức năng mới có thể được triển khai từng phần và hạn chế ảnh hưởng đến chức năng đang hoạt động. |

| ID         | Non-Functional Requirement                                                              |
| ---------- | --------------------------------------------------------------------------------------- |
| **NFR-21** | Người dùng phải được xác thực trước khi sử dụng các chức năng yêu cầu tài khoản.        |
| **NFR-22** | Hệ thống phải kiểm soát quyền truy cập đối với các chức năng quản trị.                  |
| **NFR-23** | Người dùng không có quyền không được phép truy cập hoặc thực hiện thao tác trái quyền.  |
| **NFR-24** | Thông tin cá nhân của khách hàng và tài xế phải được bảo vệ.                            |
| **NFR-25** | Thông tin phương tiện phải được bảo vệ khỏi truy cập trái phép.                         |
| **NFR-26** | Dữ liệu vị trí tài xế phải được bảo vệ.                                                 |
| **NFR-27** | Dữ liệu giao dịch thanh toán phải được bảo vệ.                                          |
| **NFR-28** | Hệ thống không được lưu trực tiếp thông tin nhạy cảm của thẻ hoặc tài khoản thanh toán. |
| **NFR-29** | Các thao tác quan trọng phải được ghi nhận để phục vụ kiểm tra và điều tra sự cố.       |

| ID         | Non-Functional Requirement                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| **NFR-30** | Hệ thống phải đảm bảo dữ liệu chuyến xe được cập nhật nhất quán.                                       |
| **NFR-31** | Kết quả thanh toán phải được ghi nhận chính xác.                                                       |
| **NFR-32** | Hệ thống phải xử lý được lỗi của các hệ thống bên ngoài mà không làm mất dữ liệu nghiệp vụ quan trọng. |
| **NFR-33** | Hệ thống phải đảm bảo trạng thái chuyến không bị chuyển sang trạng thái không hợp lệ.                  |
| **NFR-34** | Hệ thống phải có khả năng phục hồi phù hợp khi xảy ra lỗi thành phần.                                  |

| ID         | Non-Functional Requirement                                                      |
| ---------- | ------------------------------------------------------------------------------- |
| **NFR-35** | Các thành phần hệ thống phải được thiết kế độc lập để thuận tiện bảo trì.       |
| **NFR-36** | Việc thay đổi một thành phần không nên yêu cầu thay đổi toàn bộ hệ thống.       |
| **NFR-37** | Hệ thống phải hỗ trợ triển khai chức năng mới từng phần.                        |
| **NFR-38** | Các tích hợp bên ngoài phải được tách biệt để có thể thay đổi Provider khi cần. |
| **NFR-39** | Hệ thống phải có cơ chế logging và monitoring để hỗ trợ phát hiện và xử lý lỗi. |

| ID         | Non-Functional Requirement                              |
| ---------- | ------------------------------------------------------- |
| **NFR-40** | Hệ thống phải lưu vết các thao tác quản trị quan trọng. |
| **NFR-41** | Log phải xác định được người thực hiện thao tác.        |
| **NFR-42** | Log phải ghi nhận thời điểm thực hiện thao tác.         |
| **NFR-43** | Log phải cho phép truy vết đối tượng bị thay đổi.       |
| **NFR-44** | Dữ liệu log phải hỗ trợ điều tra khi xảy ra sự cố.      |

| Nhóm            | ID              | Yêu cầu                                                 |
| --------------- | --------------- | ------------------------------------------------------- |
| Performance     | NFR-01 → NFR-05 | Đáp ứng nhanh và xử lý được nhiều yêu cầu đồng thời     |
| Availability    | NFR-06 → NFR-10 | Duy trì hoạt động khi thành phần phụ trợ gặp lỗi        |
| Scalability     | NFR-11 → NFR-15 | Scale theo người dùng, tài xế, chuyến và từng component |
| Extensibility   | NFR-16 → NFR-20 | Dễ bổ sung Service, Payment, Notification               |
| Security        | NFR-21 → NFR-29 | Authentication, Authorization, bảo vệ dữ liệu           |
| Reliability     | NFR-30 → NFR-34 | Đảm bảo tính chính xác, nhất quán và phục hồi           |
| Maintainability | NFR-35 → NFR-39 | Dễ bảo trì, thay thế component và Provider              |
| Auditability    | NFR-40 → NFR-44 | Có khả năng truy vết thao tác và sự cố                  |

## Vẽ UseCase UC

## Đặc tả UseCase


