CREATE TABLE notification_delivery_policies (
 version integer PRIMARY KEY CHECK(version>0),
 policy jsonb NOT NULL,
 effective_from timestamptz NOT NULL DEFAULT now()
);
INSERT INTO notification_delivery_policies(version,policy) VALUES(1,'{"retryMax":3,"backoffSeconds":[1,5,15]}');
ALTER TABLE notifications ADD COLUMN delivery_policy jsonb NOT NULL DEFAULT '{"retryMax":3,"backoffSeconds":[1,5,15]}';
ALTER TABLE notifications ADD COLUMN attempt_count integer NOT NULL DEFAULT 0 CHECK(attempt_count BETWEEN 0 AND 4);
CREATE TABLE mock_push_deliveries (
 notification_id uuid PRIMARY KEY,
 provider_reference text NOT NULL UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE mock_push_controls (
 recipient_id uuid PRIMARY KEY,
 failures_left integer NOT NULL DEFAULT 0 CHECK(failures_left>=0),
 always_fail boolean NOT NULL DEFAULT false
);
INSERT INTO notification_templates(template_code,version,title_template,body_template) VALUES
 ('BookingCreated',1,'Đã tiếp nhận đặt xe','Yêu cầu đặt xe của bạn đã được tiếp nhận.'),
 ('DriverOfferCreated',1,'Yêu cầu chuyến đi mới','Có yêu cầu chuyến đi mới. Hãy phản hồi trước khi hết hạn.'),
 ('DriverAssigned',1,'Đã ghép chuyến','Tài xế đã được ghép với chuyến đi.'),
 ('NoDriverFound',1,'Chưa tìm được tài xế','Không tìm thấy tài xế phù hợp. Bạn có thể đặt lại.'),
 ('DriverArrived',1,'Tài xế đã đến','Tài xế đã đến điểm đón.'),
 ('TripPickedUp',1,'Đã đón khách','Chuyến đi đã đón khách.'),
 ('TripInProgress',1,'Chuyến đi đang diễn ra','Chuyến đi đã bắt đầu.'),
 ('TripCompleted',1,'Chuyến đi hoàn thành','Chuyến đi đã hoàn thành.'),
 ('TripCancelled',1,'Chuyến đi đã hủy','Chuyến đi đã được hủy.'),
 ('TripFailed',1,'Chuyến đi thất bại','Chuyến đi chưa thể tiếp tục.'),
 ('PaymentSucceeded',1,'Thanh toán thành công','Thanh toán đã hoàn tất.'),
 ('PaymentFailed',1,'Thanh toán thất bại','Thanh toán thất bại. Vui lòng kiểm tra hoặc liên hệ hỗ trợ.'),
 ('PaymentStaffHandlingRequested',1,'Cần hỗ trợ thanh toán','Thanh toán đã hết giới hạn thử lại và cần hỗ trợ.'),
 ('DriverApproved',1,'Hồ sơ được duyệt','Hồ sơ tài xế đã được duyệt.'),
 ('DriverRejected',1,'Hồ sơ chưa được duyệt','Hồ sơ tài xế chưa được duyệt. Vui lòng liên hệ hỗ trợ.'),
 ('DriverSuspended',1,'Tài khoản tạm dừng','Tài khoản tài xế đã tạm dừng.'),
 ('NotificationDeadLetter',1,'Cảnh báo gửi thông báo','Một thông báo Push đã hết số lần thử lại. Cần kiểm tra vận hành.');
