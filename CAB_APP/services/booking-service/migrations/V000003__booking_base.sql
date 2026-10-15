-- Trip remains authoritative for lifecycle. This UUID is the acknowledgement of CreateTrip.
ALTER TABLE bookings ADD COLUMN trip_id uuid;
ALTER TABLE bookings ADD COLUMN provisioning_status varchar(16) NOT NULL DEFAULT 'Pending'
  CHECK (provisioning_status IN ('Pending','Completed'));
ALTER TABLE bookings ADD CONSTRAINT completed_booking_has_trip CHECK (provisioning_status <> 'Completed' OR trip_id IS NOT NULL);
CREATE UNIQUE INDEX bookings_trip_ref_uq ON bookings(trip_id) WHERE trip_id IS NOT NULL;
CREATE UNIQUE INDEX fare_calculations_one_estimate_uq ON fare_calculations(booking_id) WHERE estimated;
CREATE INDEX bookings_customer_page_idx ON bookings(customer_id, created_at DESC, booking_id DESC) WHERE provisioning_status='Completed';
