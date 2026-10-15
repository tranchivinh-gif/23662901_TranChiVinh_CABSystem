ALTER TABLE trips ADD COLUMN service_type varchar(32) NOT NULL DEFAULT 'UNKNOWN';
ALTER TABLE trips ADD COLUMN assigned_at timestamptz;
ALTER TABLE trips ADD COLUMN arrived_at timestamptz;
UPDATE trips t SET assigned_at=(SELECT min(occurred_at) FROM trip_status_history h WHERE h.trip_id=t.trip_id AND to_state='DriverAssigned');
CREATE TABLE trip_policies (
  policy_key text NOT NULL,
  version integer NOT NULL CHECK(version>0),
  policy jsonb NOT NULL CHECK(jsonb_typeof(policy)='object'),
  effective_from timestamptz NOT NULL,
  PRIMARY KEY(policy_key,version)
);
INSERT INTO trip_policies VALUES ('lifecycle',1,'{"freeCancelSeconds":30,"cancellationFeeVnd":20000,"noShowWaitSeconds":300,"ratingWindowDays":7}',now());
CREATE TABLE trip_commands (
  actor_id uuid NOT NULL,
  trip_id uuid NOT NULL REFERENCES trips(trip_id),
  command text NOT NULL,
  idempotency_key text NOT NULL,
  request_hash bytea NOT NULL CHECK(octet_length(request_hash)=32),
  response jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  PRIMARY KEY(actor_id,trip_id,command,idempotency_key)
);
CREATE TABLE trip_terminal_jobs (
  trip_id uuid PRIMARY KEY REFERENCES trips(trip_id),
  correlation_id uuid NOT NULL,
  done boolean NOT NULL DEFAULT false,
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  safe_error_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX trip_terminal_jobs_pending ON trip_terminal_jobs(next_attempt_at) WHERE NOT done;
CREATE TABLE trip_audit_events (
  audit_id uuid PRIMARY KEY,
  trip_id uuid NOT NULL REFERENCES trips(trip_id),
  actor_id uuid NOT NULL,
  command text NOT NULL,
  before_state text NOT NULL,
  after_state text NOT NULL,
  correlation_id uuid NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
