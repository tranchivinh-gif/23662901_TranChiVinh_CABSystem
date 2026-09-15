# Vấn đề cần xác nhận

| ID | Nội dung | Tác động |
|---|---|---|
| OPEN-01 | Công thức, làm tròn, phụ phí và version bảng giá. | Fare/payment |
| OPEN-02 | Trạng thái khóa hủy và quy trình hủy sau khi tài xế nhận. | Trip cancellation |
| OPEN-03 | Quy trình/refund status do Payment Provider cung cấp. | Payment |
| OPEN-04 | Danh mục và quy tắc đóng sự cố chi tiết. | Incident |
| OPEN-05 | Idempotency, local queue và đồng bộ khi mất kết nối. | Booking/status |
| OPEN-06 | Ma trận quyền CRUD chi tiết và cấu hình quản trị. | RBAC |
| OPEN-07 | Thang điểm/rule đánh giá và định nghĩa KPI hiệu quả tài xế. | Rating/report |
| OPEN-08 | Ngưỡng NFR nghiệm thu và môi trường triển khai. | NFR |
| OPEN-09 | Chính sách lịch sử chuyến/đánh giá ngoài contract baseline. | History/rating |
| OPEN-10 | Actor, dữ liệu và scope cho UC-17 đến UC-19. | Future extension |

UC-17, UC-18, UC-19 không có endpoint MVP. Endpoint rating chỉ là contract tối thiểu vì SRS v2 yêu cầu một đánh giá sau chuyến hoàn thành; thang điểm và quy tắc chống gửi lặp vẫn TBD.
