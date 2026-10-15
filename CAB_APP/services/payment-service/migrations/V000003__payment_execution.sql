ALTER TABLE payments ADD COLUMN customer_id uuid;
ALTER TABLE payments ADD COLUMN driver_id uuid;
ALTER TABLE payment_attempts ADD COLUMN checkout_token text;
ALTER TABLE payment_attempts ADD CONSTRAINT payment_attempt_limit CHECK (attempt_no BETWEEN 1 AND 3);
CREATE UNIQUE INDEX payment_attempt_number ON payment_attempts(payment_id,attempt_no);
CREATE UNIQUE INDEX payment_one_success ON payment_attempts(payment_id) WHERE status='Succeeded';
CREATE TABLE payment_audit_events (
  audit_id uuid PRIMARY KEY,
  payment_id uuid,
  actor_id uuid,
  event_type text NOT NULL,
  correlation_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Local sandbox provider ledger, separate from CAB domain state. No card data.
-- Provider request identity survives app restarts and uncertain timeout responses.
CREATE TABLE mock_provider_transactions (
  provider_reference text PRIMARY KEY,
  amount numeric(19,2) NOT NULL CHECK(amount>=0),
  checkout_token text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
