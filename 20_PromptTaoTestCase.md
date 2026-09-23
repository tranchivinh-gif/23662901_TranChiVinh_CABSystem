# TEST CASE GENERATION & EXCEL PROMPT

Tôi đang thực hiện thiết kế Test Case cho một hệ thống phần mềm.

Tôi sẽ cung cấp các tài liệu:

1. srs.md
2. folder API Document
3. Test Case Template của giảng viên CAB_Test_Cases.xlsx
4. **Test Scenario Discovery TXT**

---

# 1. MỤC TIÊU

Tôi đã xác định **Test Scenario** ở bước trước và lưu danh sách Scenario trong file:

```text
Test_Scenario_Discovery.txt
```

Nhiệm vụ của bạn là:

> Đọc file `Test_Scenario_Discovery.txt` để xác định các Test Scenario cần thực hiện.

Sau đó, đối với **từng Test Scenario**:

1. Đọc và đối chiếu SRS.
2. Đọc và đối chiếu API Document.
3. Xác định các trường hợp kiểm thử phù hợp.
4. Tạo khoảng **10–20 Test Case cho mỗi Scenario**.
5. Review Test Case.
6. Ghi Test Case vào **đúng Sheet tương ứng trong file Excel Template**.
7. Tất cả Scenario phải nằm trong **một file Excel duy nhất**.
8. Xuất file Excel hoàn chỉnh để tôi sử dụng.

---

# 2. VAI TRÒ

Bạn đóng vai trò:

> **Software Tester / Test Analyst**

Tôi chịu trách nhiệm:

> Xác định Test Scenario.

Bạn chịu trách nhiệm:

> Phân tích Scenario → SRS → API → tạo Test Case → review → ghi vào Excel.

Tôi **không cần cung cấp Test Case trước**.

---

# 3. NGUỒN DỮ LIỆU

Chỉ sử dụng thông tin từ:

- `Test_Scenario_Discovery.txt`
- SRS
- API Document
- Excel Template

Không tự ý tạo hoặc suy đoán:

- Requirement
- Business Rule
- Validation Rule
- Boundary
- HTTP Status Code
- Error Message
- Expected Result
- Permission
- Authentication Rule
- Authorization Rule

nếu tài liệu không có cơ sở.

Nếu thông tin không đủ:

> **Cần xác nhận**

Nếu SRS và API Document mâu thuẫn:

> **Phải chỉ ra mâu thuẫn và ghi "Cần xác nhận".**

Không tự chọn một bên để giải quyết mâu thuẫn.

---

# 4. ĐỌC FILE TEST SCENARIO TXT

File:

```text
Test_Scenario_Discovery.txt
```

là nguồn xác định **Scenario cần tạo Test Case**.

Bắt buộc phải đọc toàn bộ file trước khi tạo Test Case.

Ví dụ file có:

```text
SC-001 – Đăng nhập
SC-002 – Đặt xe
SC-003 – Thanh toán
SC-004 – Hủy chuyến
```

thì phải tạo Test Case cho các Scenario trên.

Không tự ý thêm Scenario mới.

Nếu phát hiện Scenario trong TXT:

- Không tìm thấy trong SRS
- Không tìm thấy trong API Document
- Không xác định được phạm vi
- Có khả năng trùng với Scenario khác

thì ghi:

> **Cần xác nhận**

---

# 5. ĐỊNH NGHĨA TEST SCENARIO

Test Scenario ở đây là **chức năng/nghiệp vụ tổng quát**.

Ví dụ:

```text
Đăng nhập
Đăng ký tài khoản
Đặt xe
Hủy chuyến
Thanh toán
Quản lý tài khoản
Quản lý đơn hàng
```

Không coi các trường hợp sau là Scenario riêng:

```text
Đăng nhập thành công
Đăng nhập sai mật khẩu
Đăng nhập thiếu email
Đặt xe thành công
Đặt xe thiếu điểm đón
Đặt xe không có xe
```

Những trường hợp trên là **Test Case thuộc Scenario tương ứng**.

---

# 6. PHÂN TÍCH SRS

Với từng Test Scenario, xác định thông tin liên quan trong SRS:

- Module
- Function
- Use Case
- Requirement
- Actor
- Business Rule
- Validation
- Exception Flow
- Permission / Role
- Data Entity
- Preconditions
- Postconditions
- Expected behavior

Chỉ sử dụng những nội dung thực sự có trong SRS.

---

# 7. PHÂN TÍCH API DOCUMENT

Nếu Scenario liên quan đến API, phân tích:

### API

- HTTP Method
- Endpoint

### Authentication

- Authentication
- Token
- Session

Chỉ kiểm tra nếu API Document quy định.

### Authorization

- Role
- Permission

Chỉ kiểm tra nếu tài liệu quy định.

### Parameters

- Path Parameter
- Query Parameter
- Header

### Request

- Request Body
- Required fields
- Optional fields
- Data Type
- Format
- Enum
- Min
- Max
- Null
- Empty

### Response

- HTTP Status Code
- Response Body
- Response Message
- Response Schema

### Error

- Validation Error
- Resource Not Found
- Duplicate
- Business Rule Violation
- Error Handling

Chỉ tạo Test Case cho những nội dung có cơ sở trong API Document.

---

# 8. CÁC NHÓM TEST CASE CẦN XEM XÉT

Đối với mỗi Scenario, xem xét các nhóm sau.

## 8.1. Positive

Kiểm tra:

- Dữ liệu hợp lệ
- Điều kiện hợp lệ
- Flow chính
- Flow thành công

---

## 8.2. Negative

Kiểm tra:

- Dữ liệu không hợp lệ
- Điều kiện không hợp lệ
- Hành động không được phép

Chỉ tạo nếu có cơ sở trong tài liệu.

---

## 8.3. Boundary Value

Nếu tài liệu có giới hạn:

- Minimum
- Maximum
- Dưới Minimum
- Trên Maximum
- Giá trị tại Boundary

Không tự tạo Boundary nếu tài liệu không quy định giới hạn.

---

## 8.4. Missing Data

Nếu có Required Field hoặc Required Parameter, xem xét:

- Missing field
- Empty
- Null
- Missing parameter
- Missing request body

---

## 8.5. Error Data

Nếu tài liệu có quy định validation, xem xét:

- Sai Data Type
- Sai Format
- Sai Enum
- Sai Value
- Resource không tồn tại
- Duplicate
- Validation Error

---

## 8.6. Authentication

Nếu tài liệu có Authentication:

- Chưa đăng nhập
- Token hợp lệ
- Token không hợp lệ
- Token hết hạn

Chỉ tạo Test Case khi có cơ sở trong tài liệu.

---

## 8.7. Authorization

Nếu tài liệu có Authorization:

- Role có quyền
- Role không có quyền
- Permission phù hợp

Chỉ tạo Test Case khi có cơ sở.

---

## 8.8. Business Rule

Kiểm tra các Business Rule được quy định trong SRS/API.

Không tự tạo Business Rule mới.

---

## 8.9. Data State

Nếu tài liệu có quy định trạng thái dữ liệu, xem xét:

- Data tồn tại
- Data không tồn tại
- Data đã được sử dụng
- Data đã bị xóa
- Data ở trạng thái khác
- Duplicate

Chỉ áp dụng khi có cơ sở.

---

# 9. SỐ LƯỢNG TEST CASE

Mỗi Test Scenario tạo khoảng:

> **10–20 Test Case**

Không bắt buộc phải đủ 20.

Nếu tài liệu chỉ hỗ trợ 10 trường hợp hợp lý:

> Tạo 10 Test Case.

Không tạo Test Case giả chỉ để đạt số lượng.

Ưu tiên:

> **Đúng tài liệu + Coverage + Không trùng lặp > Số lượng**

---

# 10. NGUYÊN TẮC KHÔNG TRÙNG LẶP

Không tạo nhiều Test Case có cùng mục tiêu kiểm thử.

Ví dụ không tạo đồng thời nhiều Test Case chỉ khác cách diễn đạt nhưng thực chất kiểm tra cùng một điều kiện.

Nếu hai trường hợp có cùng mục tiêu:

> Gộp thành một Test Case.

---

# 11. TEST CASE FIELDS

Dựa trên Excel Template được cung cấp.

Không tự ý tạo thêm hoặc đổi tên cột.

Các trường có thể bao gồm:

- Test Case ID
- Test Case Description
- Preconditions
- Test Data
- Test Steps
- Expected Result
- Test Type
- Category

Nhưng:

> **Template của giảng viên là nguồn quyết định cuối cùng về cấu trúc cột.**

Nếu Template có cột nào thì phải sử dụng đúng cột đó.

---

# 12. TEST CASE ID

Nếu Template có quy tắc ID:

> Tuân thủ đúng Template.

Nếu Template không quy định:

Có thể sử dụng:

```text
TC-LOGIN-001
TC-LOGIN-002
TC-LOGIN-003
```

Ví dụ:

```text
Scenario: Đặt xe

TC-BOOK-001
TC-BOOK-002
TC-BOOK-003
...
```

ID phải:

- Không trùng
- Dễ truy xuất
- Phân biệt được Scenario

---

# 13. EXPECTED RESULT

Expected Result phải:

- Cụ thể
- Có thể kiểm chứng
- Có căn cứ từ SRS/API

Ví dụ nếu API Document quy định:

```text
HTTP 400
```

thì Expected Result có thể ghi:

> API trả về HTTP 400.

Nếu tài liệu quy định Response Body:

> Response Body chứa thông tin tương ứng.

Nếu tài liệu không xác định Expected Result:

> **Cần xác nhận**

Không tự tạo Error Message hoặc Status Code.

---

# 14. API TEST CASE

Nếu Scenario liên quan API, Test Case có thể bao phủ:

```text
HTTP Method
Endpoint
Authentication
Authorization
Header
Path Parameter
Query Parameter
Request Body
Required Field
Optional Field
Data Type
Format
Enum
Min
Max
Null
Empty
Missing Field
Invalid Data
Resource Not Found
Duplicate
Business Rule
HTTP Status Code
Response Body
Response Schema
```

Chỉ tạo những trường hợp có cơ sở trong tài liệu.

---

# 15. EXCEL TEMPLATE

Tôi sẽ cung cấp một file:

```text
TestCase_Template.xlsx
```

Đây là **Template bắt buộc**.

Phải sử dụng file này làm cơ sở tạo file kết quả.

Không tự thiết kế một Template khác.

Phải giữ nguyên:

- Sheet
- Header
- Tên cột
- Thứ tự cột
- Font
- Border
- Alignment
- Merge Cells
- Column Width
- Row Height
- Number Format
- Dropdown
- Data Validation
- Formula
- Formatting

Chỉ bổ sung dữ liệu Test Case cần thiết.

---

# 16. QUY TẮC SHEET

## Nguyên tắc:

> **1 Test Scenario = 1 Sheet**

Ví dụ file TXT có:

```text
SC-001 – Đăng nhập
SC-002 – Đặt xe
SC-003 – Thanh toán
```

Excel phải có:

```text
Đăng nhập
Đặt xe
Thanh toán
```

Mỗi Sheet chỉ chứa Test Case của Scenario tương ứng.

Không trộn Test Case giữa các Scenario.

---

# 17. NẾU TEMPLATE ĐÃ CÓ SHEET

Nếu Excel Template đã có Sheet tương ứng với Scenario:

> Sử dụng chính Sheet đó.

Không tạo Sheet trùng tên.

Ví dụ Template có:

```text
Đăng nhập
Đặt xe
```

thì ghi Test Case trực tiếp vào:

```text
Đăng nhập
Đặt xe
```

---

# 18. NẾU TEMPLATE CHƯA CÓ SHEET

Nếu Scenario trong TXT chưa có Sheet tương ứng:

> Tạo Sheet mới dựa trên cấu trúc và formatting của Sheet Template phù hợp.

Không tự thiết kế format khác.

Tên Sheet phải dựa trên tên Scenario.

Ví dụ:

```text
Scenario: Đặt xe

→ Sheet: Đặt xe
```

---

# 19. GIỚI HẠN TÊN SHEET

Nếu tên Scenario:

- Quá dài
- Có ký tự Excel không cho phép
- Trùng tên Sheet

thì rút gọn tên nhưng vẫn phải giữ đúng ý nghĩa.

Ví dụ:

```text
Quản lý thông tin tài khoản người dùng

→ QL tài khoản
```

Không đặt tên tùy tiện.

---

# 20. QUY TRÌNH THỰC HIỆN

Khi tôi cung cấp:

```text
1. SRS
2. API Document
3. Test_Scenario_Discovery.txt
4. TestCase_Template.xlsx
```

thực hiện theo thứ tự:

### Bước 1 – Đọc TXT

Đọc toàn bộ:

```text
Test_Scenario_Discovery.txt
```

Xác định danh sách Scenario.

### Bước 2 – Đọc SRS

Tìm Requirement / Use Case / Business Rule liên quan.

### Bước 3 – Đọc API

Tìm API liên quan đến Scenario.

### Bước 4 – Phân tích Coverage

Xác định các Test Case phù hợp.

### Bước 5 – Tạo Test Case

Tạo khoảng 10–20 Test Case / Scenario.

### Bước 6 – Review

Kiểm tra:

- Đúng Scenario
- Đúng Requirement
- Đúng API
- Không trùng
- Không ngoài phạm vi
- Expected Result có căn cứ
- Không tự suy đoán

### Bước 7 – Mở Excel Template

Sử dụng chính file Excel tôi cung cấp.

### Bước 8 – Tạo / sử dụng Sheet

```text
1 Scenario = 1 Sheet
```

### Bước 9 – Ghi Test Case

Đưa Test Case vào đúng Sheet.

### Bước 10 – Kiểm tra Excel

Kiểm tra:

- Sheet
- ID
- Cột
- Formatting
- Test Case
- Expected Result
- Không trùng
- Không thiếu dữ liệu

### Bước 11 – Xuất Excel

Xuất một file Excel hoàn chỉnh.

---

# 21. TRACEABILITY

Mỗi Test Case phải có thể truy xuất theo:

```text
Test Case
    ↓
Test Scenario
    ↓
Requirement / Use Case / API
    ↓
SRS / API Document
```

Nếu không xác định được cơ sở:

> **Cần xác nhận**

---

# 22. MÂU THUẪN TÀI LIỆU

Nếu SRS và API Document có thông tin khác nhau:

Ví dụ:

```text
SRS:
HTTP 200

API:
HTTP 201
```

Không tự chọn 200 hoặc 201.

Ghi:

> **Mâu thuẫn giữa SRS và API Document – Cần xác nhận.**

Tương tự với:

- Validation
- Required Field
- Permission
- Business Rule
- Expected Result
- Response
- Status Code

---

# 23. REVIEW CHECKLIST

Trước khi xuất Excel, bắt buộc kiểm tra:

### Scenario

- Test Case đúng Scenario?
- Có Test Case ngoài phạm vi không?
- Có Scenario bị trộn không?

### Coverage

- Có Positive nếu tài liệu hỗ trợ?
- Có Negative nếu tài liệu hỗ trợ?
- Có Boundary nếu tài liệu hỗ trợ?
- Có Missing Data nếu tài liệu hỗ trợ?
- Có Error Data nếu tài liệu hỗ trợ?
- Có Authentication nếu tài liệu hỗ trợ?
- Có Authorization nếu tài liệu hỗ trợ?
- Có Business Rule nếu tài liệu hỗ trợ?

### Quality

- Có Test Case trùng không?
- Có tự tạo Requirement không?
- Có tự tạo Business Rule không?
- Có tự tạo Validation không?
- Có tự tạo Status Code không?
- Có tự tạo Error Message không?
- Expected Result có căn cứ không?

### Excel

- Đúng Template?
- Đúng Sheet?
- 1 Scenario = 1 Sheet?
- ID không trùng?
- Header không bị thay đổi?
- Formatting không bị phá?
- Dữ liệu đầy đủ?

Nếu phát hiện lỗi:

> **Sửa trước khi xuất file.**

---

# 24. OUTPUT

Sau khi hoàn thành, cung cấp:

## A. Tóm tắt

Ví dụ:

```text
TEST CASE GENERATION SUMMARY

Scenario: Đăng nhập
Số Test Case: 12
Sheet: Đăng nhập

Scenario: Đặt xe
Số Test Case: 16
Sheet: Đặt xe

Scenario: Thanh toán
Số Test Case: 13
Sheet: Thanh toán

Tổng số Test Case: 41
```

## B. Những điểm cần xác nhận

Nếu có:

```text
Cần xác nhận:

1. API /login không xác định HTTP Status Code.
2. SRS và API có mâu thuẫn về ...
3. Boundary của trường ... chưa được xác định.
```

Nếu không có:

```text
Không phát hiện điểm cần xác nhận.
```

## C. File Excel

Xuất **một file `.xlsx` duy nhất**.

Tên file:

```text
TestCase_Generated.xlsx
```

File phải chứa:

```text
TestCase_Generated.xlsx

├── Sheet: Đăng nhập
├── Sheet: Đặt xe
├── Sheet: Thanh toán
└── ...
```

Mỗi Sheet chứa Test Case của đúng Scenario tương ứng.

---

# 25. QUY TẮC CUỐI CÙNG

Luôn tuân thủ workflow:

```text
Test_Scenario_Discovery.txt
            ↓
     Xác định Scenario
            ↓
          SRS
            +
      API Document
            ↓
    Phân tích Test Case
            ↓
   10–20 Test Case / Scenario
            ↓
        Review
            ↓
 Excel Template được cung cấp
            ↓
   1 Scenario = 1 Sheet
            ↓
   Tất cả Sheet trong 1 file
            ↓
 TestCase_Generated.xlsx
```

### Các nguyên tắc bắt buộc:

1. **Phải đọc Test Scenario TXT trước khi tạo Test Case.**
2. **Không tự thêm Scenario ngoài TXT nếu không có căn cứ.**
3. **Chỉ sử dụng thông tin có trong SRS và API Document.**
4. **Không tự suy đoán Requirement hoặc Business Rule.**
5. **Không tự tạo Validation hoặc Boundary.**
6. **Không tự tạo HTTP Status Code hoặc Error Message.**
7. **Nếu thiếu thông tin → "Cần xác nhận".**
8. **Nếu SRS và API mâu thuẫn → chỉ ra mâu thuẫn.**
9. **Khoảng 10–20 Test Case cho mỗi Scenario.**
10. **Ưu tiên chất lượng và coverage hơn số lượng.**
11. **1 Scenario = 1 Sheet.**
12. **Tất cả Scenario phải nằm trong một file Excel.**
13. **Phải sử dụng Excel Template tôi cung cấp.**
14. **Không tạo một Template khác.**
15. **Không trộn Test Case giữa các Scenario.**
16. **Không xuất Test Case dưới dạng Markdown thay cho file Excel.**
17. **Phải review Excel trước khi xuất.**
