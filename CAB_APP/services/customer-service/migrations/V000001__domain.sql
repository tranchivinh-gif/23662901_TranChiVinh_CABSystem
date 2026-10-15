CREATE TABLE customers (
  customer_id uuid PRIMARY KEY,
  account_id uuid NOT NULL UNIQUE, -- Identity REF, never a cross-service FK
  phone_hash bytea NOT NULL CHECK (octet_length(phone_hash)=32),
  profile_ciphertext text NOT NULL, -- encrypted JSON: fullName/phone/email/address
  profile_key_id varchar(64) NOT NULL,
  profile_iv bytea NOT NULL CHECK (octet_length(profile_iv)=12),
  profile_tag bytea NOT NULL CHECK (octet_length(profile_tag)=16),
  status varchar(64) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Suspended','Disabled')),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE customer_profile_history (
  history_id uuid PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES customers(customer_id),
  version integer NOT NULL CHECK (version > 0),
  profile_ciphertext text NOT NULL,
  profile_key_id varchar(64) NOT NULL,
  profile_iv bytea NOT NULL CHECK (octet_length(profile_iv)=12),
  profile_tag bytea NOT NULL CHECK (octet_length(profile_tag)=16),
  changed_by uuid, -- actor REF to Identity
  changed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (customer_id, version)
);
