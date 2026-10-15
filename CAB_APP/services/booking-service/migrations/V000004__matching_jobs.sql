INSERT INTO booking_policies(policy_id,policy_key,version,policy,effective_from)
VALUES ('d79358e1-b7a9-45c1-8cb9-1d540a62c2d0','matching',1,
  '{"radiusKm":5,"maxCandidates":10,"offerTimeoutSeconds":60,"searchTimeoutSeconds":120,"strategy":"sequential","radiusExpansion":false}', '2026-01-01T00:00:00Z');
CREATE TABLE matching_jobs (
  booking_id uuid PRIMARY KEY REFERENCES bookings(booking_id),
  correlation_id uuid NOT NULL,
  policy_version integer NOT NULL CHECK(policy_version>0),
  policy jsonb NOT NULL,
  stage varchar(16) NOT NULL DEFAULT 'Searching' CHECK(stage IN ('Searching','Assigning','Finishing','Done')),
  candidates_loaded boolean NOT NULL DEFAULT false,
  candidates jsonb NOT NULL DEFAULT '[]' CHECK(jsonb_typeof(candidates)='array'),
  candidate_cursor integer NOT NULL DEFAULT 0 CHECK(candidate_cursor BETWEEN 0 AND 10),
  accepted_offer_id uuid REFERENCES driver_offers(offer_id),
  accept_actor_id uuid,
  accept_route text,
  accept_key text,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  attempts integer NOT NULL DEFAULT 0,
  safe_error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK(stage<>'Assigning' OR (accepted_offer_id IS NOT NULL AND accept_actor_id IS NOT NULL AND accept_key IS NOT NULL))
);
CREATE INDEX matching_jobs_due_idx ON matching_jobs(next_attempt_at,created_at) WHERE stage<>'Done';
ALTER TABLE driver_offers ADD COLUMN rejection_reason_ciphertext text;
ALTER TABLE driver_offers ADD COLUMN rejection_reason_key_id text;
ALTER TABLE driver_offers ADD COLUMN rejection_reason_iv bytea;
ALTER TABLE driver_offers ADD COLUMN rejection_reason_tag bytea;
-- Recover historical CP09 Searching rows through the same matcher; past deadlines become NoDriverFound.
INSERT INTO matching_jobs(booking_id,correlation_id,policy_version,policy)
SELECT b.booking_id,b.booking_id,p.version,p.policy FROM bookings b
JOIN booking_policies p ON p.policy_key='matching' AND p.version=1
WHERE b.provisioning_status='Completed' AND b.status='Searching';
