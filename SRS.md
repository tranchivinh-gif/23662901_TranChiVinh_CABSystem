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


## Sơ đồ quy trình nghiệp vụ

BP-01 — Đặt và quản lý chuyến xe
flowchart TD
    A[Customer] --> B[Nhập thông tin chuyến]
    B --> C[Gửi yêu cầu đặt xe]
    C --> D{Thông tin hợp lệ?}
    D -- Không --> E[Thông báo lỗi]
    E --> B
    D -- Có --> F[Tạo yêu cầu chuyến]
    F --> G[Chờ tìm tài xế]
BP-02 — Tìm và phân công tài xế
flowchart TD
    A[Yêu cầu chuyến] --> B[Tìm tài xế khả dụng]
    B --> C[Lọc tài xế phù hợp]
    C --> D[Chọn tài xế]
    D --> E[Gửi yêu cầu nhận chuyến]
    E --> F{Tài xế nhận?}
    F -- Có --> G[Phân công tài xế]
    F -- Không --> H[Tìm tài xế khác]
    H --> B
BP-03 — Xử lý tài xế từ chối chuyến
flowchart TD
    A[Driver nhận yêu cầu] --> B{Driver nhận chuyến?}
    B -- Có --> C[Phân công Driver]
    B -- Không --> D[Cập nhật trạng thái từ chối]
    D --> E[Tìm Driver khác]
    E --> F{Còn Driver phù hợp?}
    F -- Có --> G[Gửi yêu cầu Driver mới]
    G --> B
    F -- Không --> H[Thông báo không tìm được Driver]
    H --> I[Xử lý chuyến không được phân công]
BP-04 — Theo dõi trạng thái chuyến
flowchart TD
    A[Trip Created] --> B[Searching Driver]
    B --> C[Driver Assigned]
    C --> D[Driver Arriving]
    D --> E[Driver Arrived]
    E --> F[Trip In Progress]
    F --> G[Trip Completed]


    A --> H[Customer theo dõi trạng thái]
    B --> H
    C --> H
    D --> H
    E --> H
    F --> H
    G --> H
BP-05 — Cập nhật trạng thái chuyến
flowchart TD
    A[Driver] --> B[Cập nhật trạng thái]
    B --> C[Hệ thống kiểm tra trạng thái]
    C --> D{Trạng thái hợp lệ?}
    D -- Không --> E[Thông báo lỗi]
    D -- Có --> F[Cập nhật trạng thái Trip]
    F --> G[Gửi thông báo Customer]
    G --> H[Tiếp tục thực hiện chuyến]
BP-06 — Tính cước chuyến xe
flowchart TD
    A[Trip Completed] --> B[Lấy thông tin chuyến]
    B --> C[Tính cước]
    C --> D[Xác định tổng tiền]
    D --> E[Lưu thông tin cước]
    E --> F[Hiển thị cước cho Customer]

Công thức tính cước hiện chưa xác định nên chỉ dừng ở mức này.

BP-07 — Thanh toán chuyến xe
flowchart TD
    A[Trip Completed] --> B[Xác định số tiền]
    B --> C[Customer chọn phương thức thanh toán]
    C --> D{Phương thức?}


    D -- Tiền mặt --> E[Xác nhận thanh toán tiền mặt]
    E --> F[Cập nhật Payment = Paid]


    D -- Điện tử --> G[Khởi tạo thanh toán điện tử]
    G --> H[Xử lý Payment Provider]
    H --> I[Cập nhật kết quả thanh toán]
BP-08 — Xử lý thanh toán điện tử
flowchart TD
    A[Customer chọn thanh toán điện tử] --> B[Tạo Payment Request]
    B --> C[Gửi Payment Provider]
    C --> D[Payment Provider xử lý]
    D --> E{Kết quả giao dịch?}


    E -- Success --> F[Cập nhật Payment = Paid]
    F --> G[Thông báo thanh toán thành công]


    E -- Failed --> H[Cập nhật Payment = Failed]
    H --> I[Chuyển BP-09]
BP-09 — Xử lý giao dịch thất bại
flowchart TD
    A[Payment Failed] --> B[Cập nhật trạng thái giao dịch]
    B --> C[Thông báo Customer]
    C --> D{Customer thanh toán lại?}


    D -- Có --> E[Tạo giao dịch thanh toán mới]
    E --> F[Xử lý thanh toán]
    F --> G{Thành công?}
    G -- Có --> H[Cập nhật Paid]
    G -- Không --> B


    D -- Không --> I[Chờ xử lý]
BP-10 — Xử lý thông tin thanh toán an toàn
flowchart TD
    A[Customer thực hiện thanh toán] --> B[Gửi thông tin đến Payment Provider]
    B --> C[Payment Provider xử lý]
    C --> D[Gửi kết quả giao dịch]
    D --> E[Hệ thống nhận kết quả]
    E --> F[Lưu Transaction Reference]
    F --> G[Cập nhật trạng thái Payment]
    G --> H[Không lưu thông tin thẻ/tài khoản nhạy cảm]
BP-11 — Quản lý đối tượng vận hành
flowchart TD
    A[Admin / Operation] --> B[Chọn đối tượng quản lý]
    B --> C{Đối tượng?}


    C -- Customer --> D[Quản lý Customer]
    C -- Driver --> E[Quản lý Driver]
    C -- Vehicle --> F[Quản lý Vehicle]


    D --> G[Xem / Thêm / Sửa / Khóa]
    E --> G
    F --> G


    G --> H[Cập nhật dữ liệu]
BP-12 — Giám sát vận hành chuyến xe
flowchart TD
    A[Operation Staff] --> B[Mở màn hình vận hành]
    B --> C[Xem chuyến đang diễn ra]
    C --> D[Xem thông tin Driver]
    D --> E[Xem trạng thái chuyến]
    E --> F{Có bất thường?}


    F -- Không --> G[Tiếp tục theo dõi]
    G --> C


    F -- Có --> H[Chuyển xử lý sự cố]
    H --> I[BP-13]
BP-13 — Xử lý sự cố vận hành
flowchart TD
    A[Phát hiện sự cố] --> B[Operation tiếp nhận]
    B --> C[Xác định nguyên nhân]
    C --> D[Xác định phương án xử lý]
    D --> E[Thực hiện xử lý]
    E --> F[Cập nhật trạng thái]
    F --> G[Thông báo bên liên quan]
    G --> H[Đóng sự cố]
BP-14 — Quản lý người dùng và quyền truy cập
flowchart TD
    A[Admin] --> B[Quản lý tài khoản]
    B --> C[Gán Role]
    C --> D[Thiết lập quyền]


    E[User đăng nhập] --> F[Kiểm tra Role và Permission]
    D --> F


    F --> G{Có quyền truy cập?}
    G -- Có --> H[Cho phép truy cập]
    G -- Không --> I[Từ chối truy cập]
BP-15 — Gửi và quản lý thông báo
flowchart TD
    A[Business Event] --> B[Xác định người nhận]
    B --> C[Xác định loại thông báo]
    C --> D[Chọn Notification Provider]
    D --> E[Gửi Notification]
    E --> F{Gửi thành công?}


    F -- Có --> G[Ghi nhận kết quả]
    F -- Không --> H[Xử lý lỗi / Retry]
    H --> I{Retry thành công?}
    I -- Có --> G
    I -- Không --> J[Ghi nhận thất bại]
BP-16 — Báo cáo và phân tích
flowchart TD
    A[Dữ liệu hệ thống] --> B[Thu thập dữ liệu]
    B --> C[Tổng hợp dữ liệu]
    C --> D[Tính KPI]
    D --> E[Tạo báo cáo]
    E --> F[Management / Finance]
    F --> G[Phân tích kết quả]
    G --> H[Hỗ trợ ra quyết định]
BP-17 — Quản lý tích hợp và mở rộng dịch vụ
flowchart TD
    A[Có nhu cầu thêm dịch vụ] --> B[Xác định loại dịch vụ]
    B --> C{Loại dịch vụ?}


    C -- Payment --> D[Chọn Payment Provider]
    C -- Notification --> E[Chọn Notification Provider]
    C -- Service --> F[Chọn Service Provider]


    D --> G[Cấu hình Integration]
    E --> G
    F --> G


    G --> H[Kết nối Provider]
    H --> I[Kiểm tra Integration]
    I --> J{Hoạt động tốt?}


    J -- Có --> K[Kích hoạt]
    J -- Không --> L[Điều chỉnh cấu hình]
    L --> H
BP-18 — Quản lý khả năng mở rộng hệ thống
flowchart TD
    A[Lượng người dùng / chuyến tăng] --> B[Phát hiện nhu cầu mở rộng]
    B --> C[Đánh giá tải hệ thống]
    C --> D[Xác định thành phần cần mở rộng]
    D --> E[Thực hiện mở rộng]
    E --> F[Kiểm tra hiệu năng]
    F --> G{Đáp ứng yêu cầu?}


    G -- Có --> H[Tiếp tục vận hành]
    G -- Không --> I[Điều chỉnh / mở rộng thêm]
    I --> E
Tổng thể Business Process
flowchart TD
    A[Customer] --> B[BP-01<br/>Đặt chuyến]


    B --> C[BP-02<br/>Tìm & phân công Driver]
    C --> D{Driver nhận?}


    D -- Không --> E[BP-03<br/>Xử lý từ chối]
    E --> C


    D -- Có --> F[BP-04<br/>Theo dõi trạng thái]
    F --> G[BP-05<br/>Driver cập nhật trạng thái]


    G --> H{Trip Completed?}
    H -- Không --> F
    H -- Có --> I[BP-06<br/>Tính cước]


    I --> J[BP-07<br/>Thanh toán]
    J --> K{Phương thức?}


    K -- Tiền mặt --> L[Hoàn tất thanh toán]
    K -- Điện tử --> M[BP-08<br/>Payment Provider]


    M --> N{Payment Success?}
    N -- Có --> L
    N -- Không --> O[BP-09<br/>Xử lý thanh toán thất bại]


    L --> P[BP-15<br/>Notification]
    P --> Q[Customer đánh giá]


    R[Operation] --> S[BP-12<br/>Giám sát vận hành]
    S --> T{Có sự cố?}
    T -- Có --> U[BP-13<br/>Xử lý sự cố]
    T -- Không --> S


    V[Admin] --> W[BP-11<br/>Quản lý đối tượng]
    V --> X[BP-14<br/>Quản lý tài khoản & quyền]


    Y[Management / Finance] --> Z[BP-16<br/>Báo cáo & Analytics]


    AA[Management / IT] --> AB[BP-17<br/>Mở rộng Integration]
    AA --> AC[BP-18<br/>Scalability]
    
