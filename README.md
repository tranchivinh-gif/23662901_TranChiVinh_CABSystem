# CAB — bản ứng dụng chạy độc lập bằng Docker Compose

Thư mục này là gói ứng dụng để **trình diễn thủ công**. Có API Gateway, bảy microservice, mã nguồn, hợp đồng OpenAPI/gRPC, migration và dữ liệu mẫu. Không cần sao chép thư mục khác của repository, không cần cài Node.js hoặc chạy `npm` trên máy chủ. Không có bộ kiểm thử tự động hay thư mục bằng chứng trong gói này.

## Khởi động từ thư mục này

1. Cài Docker Desktop, bật Linux containers và chờ Docker Engine chạy. Máy cần có mạng ở lần đầu để tải image/dependency, khoảng 8 GB RAM trống và cổng `8080` chưa bị chiếm.
2. Mở PowerShell hoặc terminal **tại thư mục `CAB_APP`**. Nếu chỉ chép riêng thư mục này sang máy khác, cũng đứng tại thư mục gốc của bản chép.
3. Chạy:

   ```powershell
   docker compose up
   ```

   Compose sẽ build các image ứng dụng nếu chưa có. Chờ log `CAB demo data ready`; để cửa sổ này chạy. Mở terminal thứ hai cũng tại `CAB_APP` rồi chạy:

   ```powershell
   docker compose ps
   docker compose logs demo-seed
   ```

   Nếu muốn trả lại prompt sau khi khởi động, dùng `docker compose up -d`. Các lệnh này không cần `npm` trên máy.

4. Mở `http://localhost:8080/api/v1/health`, `http://localhost:8080/api/v1/ready`, `http://localhost:8080/api/v1/health/services`. Chờ `/api/v1/ready` trả ready và `demo-seed` hoàn thành trước khi thử dữ liệu mẫu.

`docker compose` tự khởi tạo khóa trong Docker volume, bảy database và role riêng, migration, Kafka topics, dữ liệu mẫu. Các job `secret-bootstrap`, `migrate`, `topic-init`, `demo-seed` kết thúc với mã 0 là bình thường. Có **18 container chạy liên tục**: 8 ứng dụng, 7 PostgreSQL/PostGIS, Redis, Kafka và pgAdmin. Gateway (`127.0.0.1:8080`) và pgAdmin (`127.0.0.1:5050`) được mở trên máy; các cổng database không được mở trực tiếp. Mỗi ứng dụng có Dockerfile riêng trong `api-gateway/` hoặc `services/<tên-service>/`.

## Xem database bằng giao diện pgAdmin

Mở `http://localhost:5050` sau khi các database đã khởi động. Đăng nhập bằng email `admin@cab.local` và mật khẩu demo `123` (chỉ dùng cho bản demo chạy local). pgAdmin bắt buộc tên đăng nhập có định dạng email nên không thể dùng riêng chuỗi `admin`.

Trong pgAdmin, chọn **Add New Server**:

- Tab **General**: đặt tên, ví dụ `Booking DB`.
- Tab **Connection**: Host `booking-db`, Port `5432`, Maintenance database `booking_db`, Username `postgres`.
- Lấy password admin được tạo tự động cho database đó bằng PowerShell tại thư mục `CAB_APP`:

  ```powershell
  docker compose exec booking-db sh -c '. /run/cab-secrets/config.env; printf "%s" "$BOOKING_DB_ADMIN_PASSWORD"'
  ```

  Dán giá trị vừa hiện ra vào trường **Password**, bật **Save password**, rồi chọn **Save**. Mỗi database có password riêng.

Đổi `booking-db` / `booking_db` trong các trường trên nếu muốn kết nối database khác:

| Database | Host | Maintenance database | Tên biến password |
|---|---|---|---|
| Tài khoản | `identity-account-db` | `identity_account_db` | `IDENTITY_ACCOUNT_DB_ADMIN_PASSWORD` |
| Khách hàng | `customer-db` | `customer_db` | `CUSTOMER_DB_ADMIN_PASSWORD` |
| Tài xế | `driver-db` | `driver_db` | `DRIVER_DB_ADMIN_PASSWORD` |
| Đặt chuyến | `booking-db` | `booking_db` | `BOOKING_DB_ADMIN_PASSWORD` |
| Chuyến đi | `trip-db` | `trip_db` | `TRIP_DB_ADMIN_PASSWORD` |
| Thanh toán | `payment-db` | `payment_db` | `PAYMENT_DB_ADMIN_PASSWORD` |
| Thông báo | `notification-db` | `notification_db` | `NOTIFICATION_DB_ADMIN_PASSWORD` |

Trong cây bên trái, mở **Servers → tên kết nối → Databases → database → Schemas → public → Tables** để xem bảng. Nhấp phải bảng và chọn **View/Edit Data → All Rows** để xem dữ liệu; chọn **Tools → Query Tool** để chạy SQL.

pgAdmin chỉ bind vào `127.0.0.1`, không mở giao diện ra mạng bên ngoài. `docker compose down` giữ cấu hình pgAdmin trong volume; không dùng `docker compose down -v` nếu muốn giữ cấu hình và dữ liệu.

Để dừng: `docker compose down`. Lệnh này giữ dữ liệu trong named volumes, nên lần sau `up` vẫn còn dữ liệu. Muốn xây lại sau khi sửa mã: `docker compose up --build -d`. Không dùng `down -v` nếu muốn giữ tài khoản, chuyến xe và khóa đã tạo.

## Tài khoản và dữ liệu trình diễn

Tất cả tài khoản mẫu dùng mật khẩu `123`. Customer và Admin đăng nhập bằng email; Driver và Staff đăng nhập bằng số điện thoại dạng `090...` hoặc `+84...`.

| Vai trò | Số điện thoại | Ghi chú |
|---|---|---|
| Customer 1 | `khach1@gmail.com` | Có 9 booking lịch sử, 1 chuyến Completed để đánh giá/thanh toán |
| Admin | `admin@gmail.com` | Duyệt tài xế, xem dashboard |
| Staff | `0900000011` | Xem danh sách, duyệt tài xế |
| Driver 1–7 | `0900000101` đến `0900000107` | Active, Available, ở gần `10,10` |
| Driver 8 | `0900000108` | Active, Busy, gắn với chuyến Completed mẫu |
| Driver 9 | `0900000109` | Pending, có đủ hồ sơ để Admin duyệt |
| Driver 10 | `0900000110` | Suspended |

Mười tài xế đều ở gần `10,10`: bảy tài xế Active/Available, một Active/Busy, một Pending/Offline và một Suspended/Offline. Định vị mẫu được làm mới trong container Driver để bảy tài xế Available luôn hiện trong truy vấn gần đó. Trạng thái do bạn đổi thủ công vẫn được tôn trọng. Mã OTP của nhà cung cấp **giả lập** trong bản demo là `123456`. Cổng thanh toán là provider **giả lập**, không giao dịch tiền thật. Không dùng mật khẩu mẫu này cho hệ thống thực.

Driver **mới tự đăng ký** qua API cũng được cấp mật khẩu demo `123`.

## Bắt đầu thao tác bằng Postman

- Base URL: `http://localhost:8080/api/v1`.
- Customer đăng nhập `POST /auth/login` với JSON `{"email":"khach1@gmail.com","password":"123"}`; Admin dùng `{"email":"admin@gmail.com","password":"123"}`. Customer mới đăng ký bằng `POST /auth/register/customer` với `fullName`, `phoneNumber`, `email`, `password`; số điện thoại dùng làm thông tin liên hệ, còn đăng nhập dùng email. Driver/Staff đăng nhập bằng `phoneNumber`. Lưu `accessToken` vào biến Postman phù hợp; API cần xác thực gửi header `Authorization: Bearer <token>`.
- Customer gọi `GET /customers/me` với `customerToken` để xem hồ sơ của chính mình, không cần nhập `customerId`. `GET /customers/{customerId}` vẫn dùng để lấy theo mã số và kiểm tra phân quyền.
- Driver gọi `GET /drivers/me` với token Driver để xem hồ sơ của chính mình, không cần nhập `driverId`. `GET /drivers/{driverId}` vẫn dùng để lấy theo mã số.
- Toàn bộ đường dẫn, trường dữ liệu và response nằm trong [`contracts/openapi/openapi-all.yaml`](contracts/openapi/openapi-all.yaml). Đọc file này trực tiếp hoặc import vào Postman để tạo request **thủ công**; gói không kèm collection hay script test. Mọi đường dẫn API đều có tiền tố `/api/v1`, ví dụ `/api/v1/bookings`.
- Với `POST /bookings` và các thao tác chuyển trạng thái/thanh toán, gửi header `Idempotency-Key` là chuỗi mới, ví dụ `demo-booking-001`. Gửi lại **cùng khóa và cùng nội dung** để trình diễn chống xử lý trùng.

Ví dụ tạo booking từ tài khoản Customer 1:

```http
POST http://localhost:8080/api/v1/bookings
Authorization: Bearer <customerToken>
Content-Type: application/json
Idempotency-Key: demo-booking-001

{"p":{"lat":10,"lng":10},"des":{"lat":10.01,"lng":10.01},"svc":"MOTORBIKE","pay":"Electronic"}
```

Lưu `bookingId` và `tripId` từ response. Mỗi Driver có tối đa 2 phút để phản hồi offer; hệ thống tìm tuần tự tối đa 10 Driver nên một booking mới có thể tìm tài xế tối đa 20 phút. Đăng nhập Driver 1–7 rồi gọi `GET /driver-offers` để xem lời mời đang chờ; `GET /notifications` để xem thông báo trong ứng dụng. Thông báo qua Kafka có thể đến trễ vài giây. Nếu cần đối chiếu trực tiếp bảng offer trong DB của Booking, chạy:

```powershell
docker compose exec booking-db psql -U postgres -d booking_db -c "SELECT offer_id,driver_id,status,expires_at FROM driver_offers ORDER BY created_at DESC LIMIT 10;"
```

Đăng nhập đúng Driver của một offer `Pending` rồi gọi `POST /driver-offers/{offerId}/accept` với `Idempotency-Key` mới và body JSON `{}`. Có thể tạo booking mới với khóa mới nếu offer đã hết hạn. `GET /driver-offers` và `GET /notifications` là hai đường dẫn bổ sung của bản trình diễn; các nghiệp vụ còn lại theo OpenAPI đi kèm.

Để tự đăng ký Driver mới trong Postman: gửi `POST /auth/register/driver/request-otp` với `{"phoneNumber":"0900000201"}`, rồi `POST /auth/register/driver/verify-otp` với cùng số và `"otp":"123456"`. Lấy `registrationContext` trong phản hồi. Với `POST /auth/register/driver`, chọn **Body → form-data**: trường text `registrationContext`, trường text `profile` chứa JSON như dưới, và **ba dòng file cùng tên `documents`** (mỗi file không quá 1 MB, tổng không quá 2 MB). Driver này đăng nhập bằng `123`.

```json
{"fullName":"Tài xế mới","phoneNumber":"0900000201","identityDocument":"012345678901","driverLicense":"GPLX-001","vehicle":{"licensePlate":"59A1-12345","serviceType":"MOTORBIKE","seatCount":1}}
```

## Đối chiếu 30 mục trong phiếu chấm

| Mục | Cách trình diễn thủ công |
|---|---|
| 1–4 | Cho xem cây `api-gateway/`, `services/`, `contracts/proto/`; Gateway nhận HTTP, service nói gRPC; sự kiện đi Kafka. Cho xem `.gitignore` và việc khóa nằm trong Docker volume. |
| 5–8 | `docker compose ps`; gọi `/api/v1/health`, `/api/v1/ready`, `/api/v1/health/services`; xem `docker compose logs kafka topic-init notification-service`; cho xem `compose.yaml` chỉ map cổng Gateway. |
| 9–10 | `POST /auth/register/customer` với `fullName`, `phoneNumber`, `email`, `password`; Customer đăng nhập qua `/auth/login` bằng `email` và `password`. Không cần OTP. |
| 11–12 | Lấy `customerId`, `driverId` từ các response/danh sách; gọi `GET /customers/{customerId}` và `GET /drivers/{driverId}` bằng token phù hợp. |
| 13 | Admin/Staff gọi `GET /drivers/nearby?lat=10&lng=10&rad=1&page=0&limit=10`, đổi `page` nếu cần. Có 7 Available gần tâm và tài xế Busy/Pending/Suspended để so sánh. |
| 14 | Customer 1 gọi `GET /customers/me/bookings?page=0&limit=2`, đổi `page`; có mười booking mẫu. |
| 15–16 | Customer tạo `POST /bookings`; Driver được mời xem `GET /notifications` và `GET /driver-offers`, sau đó nhận `POST /driver-offers/{offerId}/accept`; kiểm tra `GET /trips/{tripId}`. |
| 17–18 | Driver gọi lần lượt `POST /trips/{id}/arrive`, `/pickup`, `/start`, `/complete`; gửi `Idempotency-Key` riêng cho mỗi bước. Giữa các bước có thể gửi `PUT /drivers/me/location` với `lat`, `lng`, `timestamp` ISO 8601 để cập nhật vị trí. Với chuyến mới khác, Customer gọi `POST /trips/{id}/cancel` với `{"reason":"Đổi kế hoạch"}`. |
| 19 | Với chuyến Completed và paymentMethod Electronic: Customer gọi `POST /trips/{id}/payment/electronic` với `Idempotency-Key`. Mock tự hoàn tất thanh toán; kiểm tra `payment.status=COMPLETED` trong response, `GET /trips/{id}/payment` và `paymentStatus=COMPLETED` trong `GET /trips/{id}`. |
| 20 | Customer 1 gọi `POST /trips/{id}/rating` trên chuyến Completed của mình với `{"stars":5,"comment":"Chuyến đi tốt"}`. |
| 21–23 | Đăng ký Driver mới qua ba endpoint `/auth/register/driver/...` (bước cuối là multipart với hồ sơ và 3 tài liệu). Admin gọi `GET /admin/drivers?approvalStatus=PENDING&page=0&limit=20` để mở danh sách hồ sơ, xem `GET /drivers/{id}`, rồi `POST /admin/drivers/{id}/approve` hoặc `/reject`; đăng nhập Driver đã Active rồi gọi `PUT /drivers/me/availability` với `{"availability":"OFFLINE"}` hoặc `{"availability":"ONLINE"}`. |
| 24 | Xem cột `password_hash`, `phone_ciphertext`, `profile_ciphertext`, `document_ciphertext` bằng `docker compose exec identity-account-db psql -U postgres -d identity_account_db` hoặc DB tương ứng; dữ liệu không lưu plaintext. Khóa nằm trong named volume, không trong repository. |
| 25–28 | Gửi input SQLi vào login, XSS vào trường nhận text, JWT sửa payload, Customer gọi API chỉ Admin/Driver được phép. Quan sát lỗi 400/401/403 và nội dung trả về không chạy script. |
| 29–30 | Dùng Postman Runner tự gửi nhiều request lên Gateway để thấy `429` và `Retry-After`; gửi lại booking/payment với cùng `Idempotency-Key` để thấy cùng kết quả, không thêm giao dịch. |

Lưu ý: `psql -U postgres` trong container có thể dùng local socket khi bạn chỉ xem dữ liệu mẫu; không có cổng DB mở từ máy. Để biết cú pháp body/multipart và phản hồi chính xác của từng API, dùng OpenAPI ở trên.

### Thanh toán online giả lập

`POST /trips/{id}/payment/electronic` tự hoàn tất giao dịch mock. Không cần gửi callback thủ công. `GET /trips/{id}/payment` trả `status=COMPLETED`, còn `GET /trips/{id}` trả `paymentStatus=COMPLETED` cho chuyến đã thanh toán.

## Khi gặp lỗi khởi động

Chạy `docker compose ps -a`, `docker compose logs --tail=100 migrate demo-seed api-gateway`, `docker compose config --quiet`. Nếu cổng 8080 bận, giải phóng cổng trước khi chạy lại. Nếu Docker báo không kết nối được daemon, hãy bật Docker Desktop rồi thử lại. Không xóa volume chỉ để xử lý lỗi thoáng qua.
