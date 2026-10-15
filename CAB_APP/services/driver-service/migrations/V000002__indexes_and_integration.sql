-- Secondary indexes and technical integration storage; no producers/consumers implemented here.
CREATE UNIQUE INDEX vehicles_active_plate_uq ON vehicles (plate_hash) WHERE active;
CREATE INDEX vehicles_driver_service_active_idx ON vehicles (driver_id, service_type) WHERE active;
CREATE INDEX drivers_approval_idx ON drivers (approval_status);
CREATE INDEX driver_availability_status_since_idx ON driver_availability (availability_status, available_since);
CREATE INDEX driver_current_location_gist_idx ON driver_current_location USING gist (current_location);
CREATE INDEX driver_current_location_observed_idx ON driver_current_location (observed_at);
CREATE INDEX driver_location_history_driver_time_idx ON driver_location_history (driver_id, observed_at DESC);
CREATE INDEX driver_location_history_retention_idx ON driver_location_history (observed_at);

CREATE TABLE outbox_events (
  event_id uuid PRIMARY KEY,
  event_type text NOT NULL,
  event_version text NOT NULL DEFAULT '1.0' CHECK (event_version='1.0'),
  aggregate_id uuid NOT NULL,
  correlation_id uuid NOT NULL,
  producer text NOT NULL DEFAULT 'driver-service' CHECK (producer='driver-service'),
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload)='object'),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  status varchar(64) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Published','Failed')),
  retry_count integer NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
  next_attempt_at timestamptz,
  published_at timestamptz,
  safe_error_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX outbox_events_pending_idx ON outbox_events (status, next_attempt_at, created_at) WHERE status <> 'Published';
CREATE TABLE processed_events (
  event_id uuid PRIMARY KEY,
  consumer_group text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);
