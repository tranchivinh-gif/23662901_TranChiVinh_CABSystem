CREATE TABLE service_types (
  service_type varchar(32) PRIMARY KEY CHECK (service_type IN ('MOTORBIKE','CAR_4_SEATS')),
  active boolean NOT NULL DEFAULT true
);
CREATE TABLE fare_rules (
  fare_rule_id uuid PRIMARY KEY,
  service_type varchar(32) NOT NULL REFERENCES service_types(service_type),
  version integer NOT NULL CHECK (version > 0),
  base_fare numeric(19,2) NOT NULL CHECK (base_fare >= 0),
  price_per_km numeric(19,2) NOT NULL CHECK (price_per_km >= 0),
  surcharge numeric(19,2) NOT NULL CHECK (surcharge >= 0),
  effective_from timestamptz NOT NULL,
  effective_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (service_type, version),
  UNIQUE (fare_rule_id, version),
  CHECK (effective_until IS NULL OR effective_until > effective_from)
);
CREATE TABLE booking_policies (
  policy_id uuid PRIMARY KEY,
  policy_key text NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  policy jsonb NOT NULL CHECK (jsonb_typeof(policy)='object'),
  effective_from timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (policy_key, version)
);
CREATE TABLE bookings (
  booking_id uuid PRIMARY KEY,
  customer_id uuid NOT NULL, -- Customer REF
  driver_id uuid, -- Driver REF; Trip.booking_id is the canonical cross-context direction
  service_type varchar(32) NOT NULL REFERENCES service_types(service_type),
  status varchar(64) NOT NULL DEFAULT 'Searching' CHECK (status IN ('Searching','Assigned','NoDriverFound','Cancelled','Failed')),
  payment_method varchar(64) NOT NULL CHECK (payment_method IN ('Cash','Electronic')),
  pickup_lat numeric(10,7) NOT NULL CHECK (pickup_lat BETWEEN -90 AND 90),
  pickup_lng numeric(10,7) NOT NULL CHECK (pickup_lng BETWEEN -180 AND 180),
  destination_lat numeric(10,7) NOT NULL CHECK (destination_lat BETWEEN -90 AND 90),
  destination_lng numeric(10,7) NOT NULL CHECK (destination_lng BETWEEN -180 AND 180),
  route_ciphertext text,
  route_key_id varchar(64),
  route_iv bytea,
  route_tag bytea,
  search_started_at timestamptz NOT NULL DEFAULT now(),
  search_deadline_at timestamptz NOT NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (search_deadline_at > search_started_at),
  CHECK (status <> 'Assigned' OR driver_id IS NOT NULL),
  CHECK ((route_ciphertext IS NULL AND route_key_id IS NULL AND route_iv IS NULL AND route_tag IS NULL)
    OR (route_ciphertext IS NOT NULL AND route_key_id IS NOT NULL AND route_iv IS NOT NULL AND route_tag IS NOT NULL AND octet_length(route_iv)=12 AND octet_length(route_tag)=16))
);
CREATE TABLE driver_offers (
  offer_id uuid PRIMARY KEY,
  booking_id uuid NOT NULL REFERENCES bookings(booking_id),
  driver_id uuid NOT NULL, -- Driver REF
  search_round integer NOT NULL DEFAULT 1 CHECK (search_round > 0),
  candidate_rank integer NOT NULL CHECK (candidate_rank BETWEEN 1 AND 10),
  status varchar(64) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Accepted','Rejected','Expired','Cancelled')),
  expires_at timestamptz NOT NULL,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (booking_id, search_round, driver_id),
  UNIQUE (offer_id, booking_id, driver_id),
  CHECK (expires_at > created_at)
);
CREATE TABLE driver_reservations (
  reservation_id uuid PRIMARY KEY,
  booking_id uuid NOT NULL REFERENCES bookings(booking_id),
  driver_id uuid NOT NULL, -- Driver REF
  offer_id uuid NOT NULL,
  status varchar(64) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Released','Expired')),
  expires_at timestamptz,
  released_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (offer_id, booking_id, driver_id) REFERENCES driver_offers(offer_id, booking_id, driver_id)
);
CREATE TABLE fare_calculations (
  fare_calculation_id uuid PRIMARY KEY,
  booking_id uuid NOT NULL REFERENCES bookings(booking_id),
  fare_rule_id uuid NOT NULL,
  rule_version integer NOT NULL CHECK (rule_version > 0),
  distance_km numeric(12,6) NOT NULL CHECK (distance_km >= 0),
  base_fare numeric(19,2) NOT NULL CHECK (base_fare >= 0),
  price_per_km numeric(19,2) NOT NULL CHECK (price_per_km >= 0),
  surcharge numeric(19,2) NOT NULL CHECK (surcharge >= 0),
  final_fare numeric(19,2) NOT NULL CHECK (final_fare >= 0),
  estimated boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (fare_rule_id, rule_version) REFERENCES fare_rules(fare_rule_id, version)
);
