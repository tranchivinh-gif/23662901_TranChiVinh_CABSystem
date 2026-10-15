-- PostGIS is bootstrapped by the pinned Driver image; do not install it as runtime.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname='postgis') THEN
    RAISE EXCEPTION 'Driver database requires PostGIS';
  END IF;
END $$;
CREATE TABLE drivers (
  driver_id uuid PRIMARY KEY,
  account_id uuid NOT NULL UNIQUE, -- Identity REF
  phone_hash bytea NOT NULL UNIQUE CHECK (octet_length(phone_hash)=32),
  profile_ciphertext text NOT NULL,
  profile_key_id varchar(64) NOT NULL,
  profile_iv bytea NOT NULL CHECK (octet_length(profile_iv)=12),
  profile_tag bytea NOT NULL CHECK (octet_length(profile_tag)=16),
  approval_status varchar(64) NOT NULL DEFAULT 'Pending' CHECK (approval_status IN ('Pending','Active','Rejected','Suspended')),
  approved_by uuid,
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE vehicles (
  vehicle_id uuid PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES drivers(driver_id),
  service_type varchar(32) NOT NULL CHECK (service_type IN ('MOTORBIKE','CAR_4_SEATS')),
  plate_hash bytea NOT NULL CHECK (octet_length(plate_hash)=32),
  plate_ciphertext text NOT NULL,
  plate_key_id varchar(64) NOT NULL,
  plate_iv bytea NOT NULL CHECK (octet_length(plate_iv)=12),
  plate_tag bytea NOT NULL CHECK (octet_length(plate_tag)=16),
  make text,
  model text,
  color text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE driver_documents (
  document_id uuid PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES drivers(driver_id),
  document_type varchar(64) NOT NULL,
  document_ciphertext text NOT NULL, -- encrypted identifier/storage reference JSON
  document_key_id varchar(64) NOT NULL,
  document_iv bytea NOT NULL CHECK (octet_length(document_iv)=12),
  document_tag bytea NOT NULL CHECK (octet_length(document_tag)=16),
  status varchar(64) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE driver_availability (
  driver_id uuid PRIMARY KEY REFERENCES drivers(driver_id),
  availability_status varchar(64) NOT NULL DEFAULT 'Offline' CHECK (availability_status IN ('Offline','Available','Busy')),
  available_since timestamptz,
  last_heartbeat_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE driver_current_location (
  driver_id uuid PRIMARY KEY REFERENCES drivers(driver_id),
  current_location geography(Point,4326) NOT NULL,
  heading numeric(6,2) CHECK (heading >= 0 AND heading < 360),
  speed numeric(12,6) CHECK (speed >= 0),
  accuracy numeric(12,6) CHECK (accuracy >= 0),
  observed_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE driver_location_history (
  location_id uuid PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES drivers(driver_id),
  current_location geography(Point,4326) NOT NULL,
  observed_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);
