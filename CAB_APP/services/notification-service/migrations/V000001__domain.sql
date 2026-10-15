CREATE TABLE notification_templates (
  template_code text NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  title_template text NOT NULL,
  body_template text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  PRIMARY KEY (template_code, version)
);
CREATE TABLE notifications (
  notification_id uuid PRIMARY KEY,
  recipient_id uuid NOT NULL, -- Identity recipient REF
  event_id uuid NOT NULL,
  template_code text NOT NULL,
  template_version integer NOT NULL,
  channel varchar(64) NOT NULL CHECK (channel IN ('Push','InApp')),
  status varchar(64) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Sent','Failed','DeadLetter')),
  content_ciphertext text NOT NULL, -- rendered content may include PII
  content_key_id varchar(64) NOT NULL,
  content_iv bytea NOT NULL CHECK (octet_length(content_iv)=12),
  content_tag bytea NOT NULL CHECK (octet_length(content_tag)=16),
  correlation_id uuid NOT NULL,
  retry_count integer NOT NULL DEFAULT 0 CHECK (retry_count BETWEEN 0 AND 3),
  next_retry_at timestamptz,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (template_code, template_version) REFERENCES notification_templates(template_code, version),
  UNIQUE (event_id, recipient_id, channel, template_code)
);
CREATE TABLE notification_attempts (
  attempt_id uuid PRIMARY KEY,
  notification_id uuid NOT NULL REFERENCES notifications(notification_id),
  attempt_no integer NOT NULL CHECK (attempt_no > 0),
  status varchar(64) NOT NULL CHECK (status IN ('Sent','Failed')),
  provider_reference text,
  safe_error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (notification_id, attempt_no)
);
