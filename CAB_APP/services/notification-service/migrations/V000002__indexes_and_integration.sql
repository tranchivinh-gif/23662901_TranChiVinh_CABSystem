-- Secondary indexes and technical integration storage; no producers/consumers implemented here.
CREATE INDEX notifications_recipient_created_idx ON notifications (recipient_id, created_at DESC);
CREATE INDEX notifications_retry_idx ON notifications (status, next_retry_at) WHERE status IN ('Pending','Failed');
CREATE INDEX notification_attempts_notification_time_idx ON notification_attempts (notification_id, created_at);

CREATE TABLE outbox_events (
  event_id uuid PRIMARY KEY,
  event_type text NOT NULL,
  event_version text NOT NULL DEFAULT '1.0' CHECK (event_version='1.0'),
  aggregate_id uuid NOT NULL,
  correlation_id uuid NOT NULL,
  producer text NOT NULL DEFAULT 'notification-service' CHECK (producer='notification-service'),
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
