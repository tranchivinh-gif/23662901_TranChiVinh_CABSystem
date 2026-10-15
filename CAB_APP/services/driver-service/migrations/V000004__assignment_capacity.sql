ALTER TABLE driver_availability ADD COLUMN assigned_booking_id uuid; -- Booking logical REF; no foreign DB access.
CREATE UNIQUE INDEX driver_assignment_booking_uq ON driver_availability(assigned_booking_id) WHERE assigned_booking_id IS NOT NULL;
