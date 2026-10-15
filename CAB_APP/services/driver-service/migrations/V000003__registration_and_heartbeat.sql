ALTER TABLE drivers ADD COLUMN registration_fingerprint bytea
  CHECK (registration_fingerprint IS NULL OR octet_length(registration_fingerprint)=32);
ALTER TABLE vehicles ADD COLUMN seat_count integer CHECK (seat_count IS NULL OR seat_count>=1);
CREATE UNIQUE INDEX driver_location_history_observation_uq ON driver_location_history (driver_id,observed_at);
