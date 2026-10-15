# Kafka event contracts

`event-envelope.schema.json` giữ envelope P1 version `1.0`: eventId, eventType, eventVersion, occurredAt, producer, correlationId, aggregateId, payload. Event IDs sinh UUID v4; timestamps RFC3339; chỉ 7 business services có thể là producer. Payload theo từng event sẽ bổ sung ở checkpoint domain/CP-13.

Topic names giữ theo implementation lock: cab.booking.events.v1, cab.trip.events.v1, cab.driver.events.v1, cab.payment.events.v1, cab.notification.events.v1, cab.audit.events.v1. Partition key aggregateId, outbox cùng domain transaction và consumer dedup eventId thuộc CP-13; CP-02 chỉ kiểm tra schema và chưa publish Kafka.

CP13 đã triển khai producer/consumer trên owning Outbox/Inbox, retry 1/5/15 và DLQ
giữ original envelope. `TripCompleted.payload` chứa tripId/bookingId/customerId/driverId,
paymentMethod, currency VND và amount nguyên từ final snapshot. `NotificationRequested`
chứa templateCode và logical recipient/resource IDs; không chứa rendered content/PII.
`NotificationFailed` chứa notificationId/recipientId/sourceEventId/templateCode/channel/
attemptCount/safeErrorCode, tạo cảnh báo Admin InApp. [Operation và recipient matrix](../../docs/KAFKA_NOTIFICATION.md).
