CREATE TABLE trips (
  trip_id uuid PRIMARY KEY,
  booking_id uuid NOT NULL UNIQUE, -- Booking REF; no FK to Booking database
  customer_id uuid NOT NULL, -- Customer REF
  driver_id uuid, -- Driver REF
  state varchar(64) NOT NULL DEFAULT 'Searching' CHECK (state IN ('Searching','DriverAssigned','DriverArrived','PickedUp','InProgress','Completed','NoDriverFound','Cancelled','Failed')),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (state NOT IN ('DriverAssigned','DriverArrived','PickedUp','InProgress','Completed') OR driver_id IS NOT NULL)
);
CREATE TABLE trip_status_history (
  history_id uuid PRIMARY KEY,
  trip_id uuid NOT NULL REFERENCES trips(trip_id),
  from_state varchar(64),
  to_state varchar(64) NOT NULL CHECK (to_state IN ('Searching','DriverAssigned','DriverArrived','PickedUp','InProgress','Completed','NoDriverFound','Cancelled','Failed')),
  actor_id uuid,
  correlation_id uuid NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE trip_cancellations (
  cancellation_id uuid PRIMARY KEY,
  trip_id uuid NOT NULL UNIQUE REFERENCES trips(trip_id),
  actor_id uuid NOT NULL,
  reason text NOT NULL CHECK (length(btrim(reason)) > 0),
  policy_version integer NOT NULL CHECK (policy_version > 0),
  cancellation_fee numeric(19,2) NOT NULL DEFAULT 0 CHECK (cancellation_fee >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE ratings (
  rating_id uuid PRIMARY KEY,
  trip_id uuid NOT NULL UNIQUE REFERENCES trips(trip_id),
  customer_id uuid NOT NULL, -- Customer REF
  driver_id uuid NOT NULL, -- Driver REF
  stars integer NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE trip_fare_snapshot (
  trip_id uuid PRIMARY KEY REFERENCES trips(trip_id),
  fare_rule_id uuid NOT NULL, -- Booking fare rule REF
  rule_version integer NOT NULL CHECK (rule_version > 0),
  base_fare numeric(19,2) NOT NULL CHECK (base_fare >= 0),
  price_per_km numeric(19,2) NOT NULL CHECK (price_per_km >= 0),
  surcharge numeric(19,2) NOT NULL CHECK (surcharge >= 0),
  distance_km numeric(12,6) CHECK (distance_km >= 0),
  final_fare numeric(19,2) CHECK (final_fare >= 0),
  estimated boolean NOT NULL DEFAULT false,
  rule_snapshot jsonb NOT NULL CHECK (jsonb_typeof(rule_snapshot)='object'),
  created_at timestamptz NOT NULL DEFAULT now()
);
