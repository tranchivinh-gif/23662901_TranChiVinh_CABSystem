CREATE TABLE roles (
  role_code varchar(32) PRIMARY KEY CHECK (role_code IN ('CUSTOMER','DRIVER','STAFF','ADMIN')),
  description text NOT NULL
);
CREATE TABLE permissions (
  permission_code varchar(128) PRIMARY KEY,
  description text NOT NULL
);
CREATE TABLE role_permissions (
  role_code varchar(32) NOT NULL REFERENCES roles(role_code),
  permission_code varchar(128) NOT NULL REFERENCES permissions(permission_code),
  PRIMARY KEY (role_code, permission_code)
);
CREATE TABLE accounts (
  account_id uuid PRIMARY KEY,
  role_code varchar(32) NOT NULL REFERENCES roles(role_code),
  phone_hash bytea NOT NULL UNIQUE CHECK (octet_length(phone_hash)=32),
  phone_ciphertext text NOT NULL,
  phone_key_id varchar(64) NOT NULL,
  phone_iv bytea NOT NULL CHECK (octet_length(phone_iv)=12),
  phone_tag bytea NOT NULL CHECK (octet_length(phone_tag)=16),
  password_hash text NOT NULL CHECK (password_hash LIKE '$argon2id$%'),
  status varchar(64) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Pending','Rejected','Suspended','Disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE refresh_sessions (
  session_id uuid PRIMARY KEY,
  account_id uuid NOT NULL REFERENCES accounts(account_id),
  token_hash bytea NOT NULL UNIQUE CHECK (octet_length(token_hash)=32),
  family_id uuid NOT NULL,
  rotated_from uuid REFERENCES refresh_sessions(session_id),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at > created_at)
);
CREATE TABLE otp_verifications (
  verification_id uuid PRIMARY KEY,
  phone_hash bytea NOT NULL CHECK (octet_length(phone_hash)=32),
  purpose varchar(64) NOT NULL,
  otp_hash bytea NOT NULL CHECK (octet_length(otp_hash)=32),
  registration_context_hash bytea UNIQUE CHECK (registration_context_hash IS NULL OR octet_length(registration_context_hash)=32),
  wrong_attempts integer NOT NULL DEFAULT 0 CHECK (wrong_attempts BETWEEN 0 AND 5),
  expires_at timestamptz NOT NULL,
  verified_at timestamptz,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at > created_at)
);
CREATE TABLE audit_events (
  audit_id uuid PRIMARY KEY,
  actor_id uuid, -- logical actor REF: anonymous/system/retained deleted identities are valid
  event_type text NOT NULL,
  aggregate_id uuid,
  correlation_id uuid NOT NULL,
  safe_metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(safe_metadata)='object'),
  occurred_at timestamptz NOT NULL DEFAULT now()
);
