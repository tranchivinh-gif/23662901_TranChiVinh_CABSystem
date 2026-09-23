# TEST SCENARIO DISCOVERY PROMPT

Tôi đang thực hiện thiết kế Test Case cho một hệ thống phần mềm.

Tôi sẽ cung cấp cho bạn:

1. srs.md
2. folder API Document
3. Test Case Template của giảng viên CAB_Test_Cases.xlsx

## Mục tiêu

Hãy đọc và phân tích toàn bộ SRS và API Document để **gợi ý danh sách Test Scenario ở cấp chức năng / Use Case / nghiệp vụ**.

**Quan trọng:** Test Scenario ở bước này phải thể hiện **chức năng hoặc phạm vi kiểm thử tổng quát**, ví dụ:

- Đăng nhập
- Đăng ký tài khoản
- Đặt xe
- Hủy chuyến
- Quản lý hồ sơ
- Thanh toán
- Quản lý đơn hàng
- Quản lý sản phẩm

**Không phân rã Test Scenario thành các trường hợp kiểm thử chi tiết.**

Ví dụ:

**Đúng:**

- Đăng nhập
- Đặt xe
- Hủy chuyến
- Thanh toán
- Quản lý tài khoản

**Không đúng:**

- Đăng nhập thành công
- Đăng nhập với sai mật khẩu
- Đăng nhập khi bỏ trống email
- Đặt xe thành công
- Đặt xe khi thiếu điểm đón
- Đặt xe khi không có xe khả dụng

Các trường hợp như "thành công", "thất bại", "thiếu dữ liệu", "sai dữ liệu", "boundary", "authentication", "authorization"... sẽ được sử dụng ở **bước thiết kế Test Case**, không phải để tạo thêm Test Scenario ở bước này.

---

# 1. Định nghĩa Test Scenario

Trong tài liệu này:

> **Test Scenario = một chức năng, Use Case hoặc nghiệp vụ lớn cần được kiểm thử.**

Test Scenario phải trả lời câu hỏi:

> **"Hệ thống cần kiểm thử chức năng/nghiệp vụ nào?"**

Không trả lời:

> "Chức năng đó kiểm thử với dữ liệu nào?"

Ví dụ:

| Test Scenario     | Không phải Test Scenario       |
| ----------------- | ------------------------------ |
| Đăng nhập         | Đăng nhập thành công           |
| Đăng ký tài khoản | Đăng ký với email không hợp lệ |
| Đặt xe            | Đặt xe khi thiếu điểm đón      |
| Hủy chuyến        | Hủy chuyến thành công          |
| Thanh toán        | Thanh toán khi số dư không đủ  |
| Quản lý sản phẩm  | Thêm sản phẩm với giá âm       |

---

# 2. Phân tích SRS

Đầu tiên xác định:

- Module
- Function
- Use Case
- Requirement
- Business Rule
- Validation
- Exception Flow
- Actor
- Permission/Role
- Data Entity

Sau đó xác định **các chức năng/nghiệp vụ lớn cần kiểm thử**.

Mỗi chức năng/nghiệp vụ phù hợp có thể trở thành **một Test Scenario**.

Ví dụ:

SRS có:

> UC01 – Đăng nhập

→ Test Scenario:

> **SC-001 – Đăng nhập**

SRS có:

> UC02 – Đặt xe

→ Test Scenario:

> **SC-002 – Đặt xe**

SRS có:

> UC03 – Hủy chuyến

→ Test Scenario:

> **SC-003 – Hủy chuyến**

---

# 3. Phân tích API Document

Đối với mỗi API, xem xét:

- HTTP Method
- Endpoint
- Authentication
- Authorization
- Path Parameter
- Query Parameter
- Header
- Request Body
- Required fields
- Optional fields
- Data Type
- Format
- Enum
- Min/Max
- Validation
- Response
- HTTP Status Code
- Business Rule
- Error handling

Tuy nhiên, **không tạo một Test Scenario riêng cho từng trường hợp API thành công/thất bại**.

Hãy sử dụng API Document để xác định API thuộc **chức năng/nghiệp vụ nào**.

Ví dụ:

```text
POST /api/login
```

→ Test Scenario:

> **Đăng nhập**

Không tạo:

> Đăng nhập thành công
> Đăng nhập sai mật khẩu
> Đăng nhập thiếu password

---

Ví dụ:

```text
POST /api/bookings
GET /api/bookings/{id}
DELETE /api/bookings/{id}
```

Nếu các API này cùng phục vụ chức năng đặt xe thì có thể gộp thành:

> **Đặt xe**

Không tạo thành:

> Tạo booking thành công
> Lấy booking thành công
> Xóa booking thành công

---

# 4. Nguyên tắc xác định Test Scenario

## A. Ưu tiên Use Case

Nếu SRS đã có Use Case rõ ràng, ưu tiên sử dụng **tên Use Case** làm Test Scenario.

Ví dụ:

```text
UC01 – Đăng nhập
UC02 – Đăng ký
UC03 – Đặt xe
UC04 – Hủy chuyến
```

→ Scenario:

```text
SC-001 – Đăng nhập
SC-002 – Đăng ký
SC-003 – Đặt xe
SC-004 – Hủy chuyến
```

---

## B. Nếu không có Use Case

Có thể dựa trên:

- Function
- Requirement
- Business Process
- Nhóm API có cùng mục đích nghiệp vụ

để xác định Test Scenario.

---

## C. Gộp các trường hợp thuộc cùng một chức năng

Nếu nhiều API hoặc Requirement cùng phục vụ một chức năng thì **gộp thành một Test Scenario**.

Ví dụ:

```text
POST /users
GET /users/{id}
PUT /users/{id}
DELETE /users/{id}
```

Nếu tất cả thuộc chức năng quản lý người dùng:

→

> **Quản lý người dùng**

Không tạo:

> Thêm người dùng
> Xem người dùng
> Sửa người dùng
> Xóa người dùng

**Trừ khi SRS định nghĩa chúng là các Use Case/chức năng độc lập và cần được quản lý riêng.**

---

# 5. Không phân rã Scenario thành các trường hợp kiểm thử

Không tạo Scenario dựa trên:

- Thành công
- Thất bại
- Dữ liệu hợp lệ
- Dữ liệu không hợp lệ
- Thiếu required field
- Null
- Empty
- Sai data type
- Sai format
- Sai enum
- Min
- Max
- Dưới min
- Trên max
- Resource không tồn tại
- Duplicate
- Token hết hạn
- Không có quyền

Các nội dung trên chỉ được dùng để **phân tích phạm vi kiểm thử của Test Scenario** và sẽ được triển khai thành **Test Case ở bước sau**.

Ví dụ:

### Scenario

> **Đặt xe**

Phạm vi Test Case sau này có thể bao gồm:

- Đặt xe thành công
- Thiếu điểm đón
- Thiếu điểm đến
- Không có xe
- Dữ liệu không hợp lệ
- Không đăng nhập
- Không có quyền

Nhưng **tất cả vẫn thuộc Scenario "Đặt xe"**.

---

# 6. Functional Scenario

Test Scenario nên tập trung vào các chức năng/nghiệp vụ chính được xác định từ tài liệu.

Có thể bao gồm:

- Đăng nhập
- Đăng ký
- Quản lý tài khoản
- Đặt xe
- Hủy chuyến
- Thanh toán
- Quản lý đơn hàng
- Quản lý sản phẩm
- Quản lý người dùng

**Không cần tạo Scenario riêng cho Positive/Negative/Boundary/Missing Data/Error.**

Các loại này sẽ được phân tích ở cấp Test Case.

---

# 7. Authentication / Authorization

Nếu hệ thống có Authentication hoặc Authorization, không tự động tạo:

> Đăng nhập thành công
> Đăng nhập thất bại
> Token hết hạn

Thay vào đó, xác định **chức năng liên quan**.

Ví dụ:

> **Đăng nhập**

hoặc:

> **Quản lý quyền truy cập**

Sau đó các trường hợp:

- Chưa đăng nhập
- Token không hợp lệ
- Token hết hạn
- Không có quyền

sẽ được đưa vào **Test Case của chức năng tương ứng**.

---

# 8. Business Rule

Business Rule được sử dụng để xác định **chức năng/nghiệp vụ nào cần kiểm thử**, nhưng không tạo Scenario riêng cho từng rule.

Ví dụ:

> Người dùng chỉ được hủy chuyến trước khi tài xế bắt đầu chuyến.

→ Test Scenario:

> **Hủy chuyến**

Không tạo:

> Hủy chuyến trước khi bắt đầu
> Hủy chuyến sau khi bắt đầu

Hai trường hợp trên sẽ trở thành Test Case.

---

# 9. Không tạo Scenario trùng lặp

Nếu hai Scenario có cùng chức năng/nghiệp vụ thì gộp lại.

Ví dụ:

```text
Đặt xe
Tạo chuyến xe
Booking xe
```

Nếu SRS/API cho thấy chúng thực chất cùng một chức năng:

→ Gộp thành:

> **Đặt xe**

Không tạo nhiều Scenario chỉ khác cách gọi.

Nếu chưa xác định được chúng có phải cùng chức năng hay không:

> **Cần xác nhận**

---

# 10. Output

Tạo danh sách Scenario theo cấu trúc:

| ID     | Module         | Requirement/UC/API | Test Scenario | Cơ sở từ tài liệu               | Priority     |
| ------ | -------------- | ------------------ | ------------- | ------------------------------- | ------------ |
| SC-001 | Authentication | UC01 / API Login   | Đăng nhập     | UC01, POST /api/login           | Cần xác nhận |
| SC-002 | Booking        | UC02 / API Booking | Đặt xe        | UC02, POST /api/bookings        | Cần xác nhận |
| SC-003 | Booking        | UC03 / API Cancel  | Hủy chuyến    | UC03, DELETE /api/bookings/{id} | Cần xác nhận |

### Quy tắc cho cột Test Scenario

Tên Scenario phải:

- Ngắn gọn
- Cấp chức năng/nghiệp vụ
- Dễ hiểu
- Không chứa kết quả kiểm thử
- Không chứa dữ liệu kiểm thử
- Không mô tả điều kiện cụ thể

**Ưu tiên dùng tên Use Case hoặc tên Function trong SRS.**

---

# 11. Priority

Chỉ sử dụng:

- High
- Medium
- Low

Priority phải dựa trên thông tin thể hiện trong SRS/API Document.

Nếu tài liệu không cung cấp đủ cơ sở:

> **Cần xác nhận**

Không tự đánh giá Priority.

---

# 12. Coverage Summary

Sau danh sách Scenario, tạo bảng:

| Module          | Số Scenario |
| --------------- | ----------: |
| Authentication  |           2 |
| Booking         |           4 |
| Payment         |           2 |
| User Management |           3 |
| **Tổng**        |      **11** |

Mục đích là cho biết hệ thống đã được bao phủ bởi bao nhiêu **chức năng/nghiệp vụ cần kiểm thử**.

**Không cần thống kê Positive / Negative / Boundary / Missing / Error ở bước này**, vì đây chưa phải Test Case.

---

# 13. Những điểm cần xác nhận

Cuối cùng liệt kê:

- Requirement chưa rõ
- Use Case chưa rõ
- Chức năng chưa rõ
- API chưa xác định thuộc chức năng nào
- Hai API có khả năng thuộc cùng một chức năng nhưng chưa đủ thông tin để gộp
- Business Rule chưa rõ
- Validation chưa rõ
- SRS và API Document mâu thuẫn
- Không xác định được phạm vi của một Scenario
- Priority chưa được xác định

Không tự giải quyết bằng cách suy đoán.

---

# 14. Quy tắc quan trọng nhất

Hãy phân biệt rõ:

**Test Scenario = WHAT TO TEST**

**Test Case = HOW TO TEST**

Ví dụ:

```text
Test Scenario:
Đăng nhập
```

Sau này mới tạo Test Case:

```text
TC01 – Đăng nhập với thông tin hợp lệ
TC02 – Đăng nhập với mật khẩu không hợp lệ
TC03 – Đăng nhập khi bỏ trống mật khẩu
TC04 – Đăng nhập với tài khoản không tồn tại
```

Tất cả các Test Case trên đều thuộc:

> **SC-001 – Đăng nhập**

---

## Yêu cầu cuối cùng

Chỉ tạo **danh sách Test Scenario ở cấp chức năng/nghiệp vụ** để tôi xem xét và lựa chọn.

**Không tạo Test Case.**

**Không phân rã Scenario thành Positive / Negative / Boundary / Missing Data / Error.**

**Không tạo Excel.**

**Không tự thêm Requirement hoặc Business Rule.**

**Không tự xem tất cả Scenario được đề xuất là bắt buộc phải test.**

Nếu thông tin không đủ, ghi:

> **Cần xác nhận.**

# 15. XUẤT KẾT QUẢ RA FILE TXT

Sau khi hoàn thành việc phân tích SRS và API Document, **xuất toàn bộ danh sách Test Scenario đã đề xuất ra một file `.txt`**.

## Yêu cầu file TXT

Tên file:

```text
Test_Scenario_Discovery.txt
```

File TXT phải chứa đầy đủ:

1. Danh sách Test Scenario
2. ID của Scenario
3. Module
4. Requirement / Use Case / API liên quan
5. Tên Test Scenario
6. Cơ sở từ tài liệu
7. Priority
8. Coverage Summary
9. Những điểm cần xác nhận

## Định dạng trong file TXT

Sử dụng định dạng text đơn giản, dễ đọc và dễ copy sang Excel/Word.

Ví dụ:

```text
TEST SCENARIO DISCOVERY
=======================

SC-001
Module: Authentication
Requirement/UC/API: UC01 / POST /api/login
Test Scenario: Đăng nhập
Cơ sở từ tài liệu: UC01, POST /api/login
Priority: Cần xác nhận

SC-002
Module: Booking
Requirement/UC/API: UC02 / POST /api/bookings
Test Scenario: Đặt xe
Cơ sở từ tài liệu: UC02, POST /api/bookings
Priority: Cần xác nhận

SC-003
Module: Booking
Requirement/UC/API: UC03 / DELETE /api/bookings/{id}
Test Scenario: Hủy chuyến
Cơ sở từ tài liệu: UC03, DELETE /api/bookings/{id}
Priority: Cần xác nhận


COVERAGE SUMMARY
================

Module: Authentication
Số Scenario: 1

Module: Booking
Số Scenario: 2

Tổng số Scenario: 3


NHỮNG ĐIỂM CẦN XÁC NHẬN
=======================

- Requirement chưa rõ
- API chưa xác định thuộc chức năng nào
- Business Rule chưa rõ
- Validation chưa rõ
- SRS và API Document mâu thuẫn
- Priority chưa xác định
```

## Quy tắc quan trọng

File TXT phải **giữ nguyên nguyên tắc Test Scenario ở cấp chức năng/nghiệp vụ**.

Ví dụ:

```text
ĐÚNG:
Đăng nhập
Đặt xe
Hủy chuyến
Thanh toán
Quản lý tài khoản

KHÔNG ĐÚNG:
Đăng nhập thành công
Đăng nhập sai mật khẩu
Đăng nhập thiếu email
Đặt xe thành công
Đặt xe khi thiếu điểm đón
Đặt xe khi không có xe
```

Không đưa các Test Case chi tiết vào file TXT.

Không tạo Excel.

Không tạo Test Case.

Không tự thêm Requirement hoặc Business Rule.

Nếu không đủ thông tin để xác định Scenario hoặc Priority, ghi:

```text
Cần xác nhận
```

## Yêu cầu đầu ra

Khi hoàn thành:

**1. Hiển thị danh sách Test Scenario trong câu trả lời.**

**2. Tạo file:**

```text
Test_Scenario_Discovery.txt
```

**3. Cung cấp file TXT để tôi tải xuống.**
