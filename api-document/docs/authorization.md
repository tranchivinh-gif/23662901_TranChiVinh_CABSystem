# Phân quyền

API dùng JWT Bearer. 401 nghĩa là thiếu/không hợp lệ JWT; 403 nghĩa là đã xác thực nhưng không có quyền. Quyền chi tiết là cấu hình cần phê duyệt; bảng dưới đây chỉ ghi baseline được SRS v2 hỗ trợ.

| Tài nguyên / thao tác | Customer | Driver | Operator | Admin |
|---|---|---|---|---|
| Đăng ký, đăng nhập | Có | Có (đăng nhập) | Có (đăng nhập) | Có (đăng nhập) |
| Hồ sơ cá nhân | Chỉ của mình | Chỉ của mình | — | Theo quyền quản trị |
| Tạo / xem chuyến | Tạo, xem chuyến của mình, hủy theo policy | Xem chuyến được phân công | Xem/hỗ trợ theo quyền | Theo quyền quản trị |
| Phản hồi / tiến trình chuyến | — | Chỉ đề xuất/chuyến được phân công | Hỗ trợ sự cố, không tự phân công | Theo quyền quản trị |
| Phân công tự động | Không | Không | Không khởi tạo; chỉ hỗ trợ sự cố | Không phải API public |
| Vị trí, availability | — | Chỉ của mình | Xem theo quyền | Theo quyền quản trị |
| Cước / thanh toán | Chuyến của mình | Xác nhận tiền mặt của chuyến được phân công | Tra cứu/xử lý theo quyền | Theo quyền quản trị |
| Đánh giá | Chỉ chuyến COMPLETED của mình | — | — | — |
| Thông báo | Chỉ của mình | Chỉ của mình | Theo quyền | Theo quyền quản trị |
| Dữ liệu vận hành, sự cố, audit | — | Báo sự cố liên quan | Xem/cập nhật theo quyền | Theo quyền quản trị |
| Báo cáo | Không xác định là actor trực tiếp | Không | Lập/xem theo quyền | Xem theo quyền |
| Cấp hoặc thay đổi quyền | Không | Không | Không | Chỉ ADMIN |

Mọi thay đổi quyền, thao tác quản trị, xử lý sự cố, thay đổi dữ liệu quan trọng và đăng nhập phải được audit. Ma trận CRUD chi tiết, danh mục thao tác nhạy cảm và chính sách retention ngoài baseline SRS vẫn cần xác nhận.
