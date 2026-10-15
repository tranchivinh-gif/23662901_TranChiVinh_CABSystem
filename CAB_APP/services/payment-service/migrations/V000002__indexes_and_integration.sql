-- Secondary indexes and technical integration storage; no producers/consumers implemented here.
CREATE INDEX payments_trip_status_idx ON payments (trip_id, status);
CREATE INDEX payment_attempts_payment_time_idx ON payment_attempts (payment_id, created_at DESC);
CREATE INDEX provider_callbacks_reference_idx ON provider_callbacks (provider, provider_reference);

CREATE TABLE outbox_events (
  event_id uuid PRIMARY KEY,
  event_type text NOT NULL,
  event_version text NOT NULL DEFAULT '1.0' CHECK (event_version='1.0'),
  aggregate_id uuid NOT NULL,
  correlation_id uuid NOT NULL,
  producer text NOT NULL DEFAULT 'payment-service' CHECK (producer='payment-service'),
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

CREATE TABLE idempotency_keys (
  actor_id uuid NOT NULL,
  route text NOT NULL,
  idempotency_key text NOT NULL CHECK (length(idempotency_key) > 0),
  request_hash bytea NOT NULL CHECK (octet_length(request_hash)=32),
  response_status integer CHECK (response_status BETWEEN 100 AND 599),
  response_body jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  PRIMARY KEY (actor_id, route, idempotency_key),
  CHECK (expires_at > created_at)
);
CREATE INDEX idempotency_keys_expiry_idx ON idempotency_keys (expires_at);
