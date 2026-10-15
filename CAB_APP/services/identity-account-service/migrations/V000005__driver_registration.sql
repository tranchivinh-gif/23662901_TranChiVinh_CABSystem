CREATE TABLE driver_registrations (
  account_id uuid PRIMARY KEY REFERENCES accounts(account_id),
  verification_id uuid NOT NULL UNIQUE REFERENCES otp_verifications(verification_id),
  request_fingerprint bytea NOT NULL CHECK (octet_length(request_fingerprint)=32),
  driver_id uuid UNIQUE, -- Driver REF, no cross-database FK
  status varchar(64) NOT NULL CHECK (status IN ('PendingProfile','Completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  CHECK ((status='Completed') = (completed_at IS NOT NULL AND driver_id IS NOT NULL))
);
INSERT INTO permissions (permission_code,description) VALUES
  ('driver:availability','Driver self availability; Active profile required'),
  ('driver:location','Driver self heartbeat/location; Active profile required'),
  ('driver:nearby','Staff/Admin nearby grading read'),
  ('driver:approve','Staff/Admin approve/reject Driver profile');
INSERT INTO role_permissions (role_code,permission_code) VALUES
  ('DRIVER','driver:availability'),('DRIVER','driver:location'),
  ('STAFF','driver:nearby'),('ADMIN','driver:nearby'),
  ('STAFF','driver:approve'),('ADMIN','driver:approve');
