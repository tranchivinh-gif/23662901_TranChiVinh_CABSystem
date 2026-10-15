CREATE TABLE payments (
  payment_id uuid PRIMARY KEY,
  trip_id uuid NOT NULL UNIQUE, -- Trip REF; payment eligibility is checked through service boundary
  method varchar(64) NOT NULL CHECK (method IN ('Cash','Electronic')),
  status varchar(64) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Succeeded','Failed')),
  amount numeric(19,2) NOT NULL CHECK (amount >= 0),
  currency varchar(32) NOT NULL DEFAULT 'VND' CHECK (currency='VND'),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE payment_attempts (
  attempt_id uuid PRIMARY KEY,
  payment_id uuid NOT NULL REFERENCES payments(payment_id),
  attempt_no integer NOT NULL CHECK (attempt_no > 0),
  retry_window_start timestamptz NOT NULL,
  provider text NOT NULL,
  provider_reference text,
  status varchar(64) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Succeeded','Failed','TimedOut')),
  safe_error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (payment_id, retry_window_start, attempt_no),
  UNIQUE (provider, provider_reference)
);
CREATE TABLE provider_callbacks (
  callback_id uuid PRIMARY KEY,
  payment_id uuid NOT NULL REFERENCES payments(payment_id),
  provider text NOT NULL,
  provider_event_id text NOT NULL,
  provider_reference text NOT NULL,
  amount numeric(19,2) NOT NULL CHECK (amount >= 0),
  status varchar(64) NOT NULL CHECK (status IN ('Succeeded','Failed')),
  signature_hash bytea NOT NULL CHECK (octet_length(signature_hash)=32),
  provider_timestamp timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  UNIQUE (provider, provider_event_id)
);
