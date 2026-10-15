-- Role prerequisites for authentication; permission matrix/Staff/Admin seed belong to later checkpoints.
INSERT INTO roles (role_code, description) VALUES
  ('CUSTOMER','Customer'),('DRIVER','Driver'),('STAFF','Staff'),('ADMIN','Admin')
ON CONFLICT (role_code) DO NOTHING;

-- Durable registration progress: a pending account survives uncertain cross-service outcomes.
-- Payload is bound by HMAC; plaintext password/PII/registration context are never stored here.
CREATE TABLE customer_registrations (
  account_id uuid PRIMARY KEY REFERENCES accounts(account_id),
  verification_id uuid NOT NULL UNIQUE REFERENCES otp_verifications(verification_id),
  request_fingerprint bytea NOT NULL CHECK (octet_length(request_fingerprint)=32),
  status varchar(64) NOT NULL CHECK (status IN ('PendingProfile','Completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  CHECK ((status='Completed') = (completed_at IS NOT NULL))
);
CREATE INDEX otp_active_phone_purpose_idx ON otp_verifications (phone_hash,purpose,created_at DESC)
WHERE consumed_at IS NULL;
