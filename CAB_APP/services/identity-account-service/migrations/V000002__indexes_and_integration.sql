-- Secondary indexes and technical integration storage; no producers/consumers implemented here.
CREATE INDEX refresh_sessions_account_expiry_idx ON refresh_sessions (account_id, expires_at);
CREATE INDEX refresh_sessions_family_idx ON refresh_sessions (family_id);
CREATE INDEX otp_verifications_phone_purpose_idx ON otp_verifications (phone_hash, purpose, created_at DESC);
CREATE INDEX audit_events_time_actor_type_idx ON audit_events (occurred_at, actor_id, event_type);
REVOKE UPDATE, DELETE, TRUNCATE ON audit_events FROM cab_identity;

CREATE TABLE outbox_events (
  event_id uuid PRIMARY KEY,
  event_type text NOT NULL,
  event_version text NOT NULL DEFAULT '1.0' CHECK (event_version='1.0'),
  aggregate_id uuid NOT NULL,
  correlation_id uuid NOT NULL,
  producer text NOT NULL DEFAULT 'identity-account-service' CHECK (producer='identity-account-service'),
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
