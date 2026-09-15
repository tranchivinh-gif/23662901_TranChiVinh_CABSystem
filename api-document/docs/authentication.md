# Xác thực

Đăng ký và đăng nhập là các thao tác công khai. Các thao tác được bảo vệ khác sử dụng JWT Bearer:

`Authorization: Bearer <accessToken>`

SRS xác nhận có xác thực và phân quyền nhưng chưa định nghĩa refresh token, đăng xuất,
xác minh email/số điện thoại, đặt lại mật khẩu, thời hạn token hoặc cơ chế xoay vòng khóa.
Các nội dung này được đánh dấu `[NEED CLARIFICATION]` và chưa được thêm thành endpoint.
