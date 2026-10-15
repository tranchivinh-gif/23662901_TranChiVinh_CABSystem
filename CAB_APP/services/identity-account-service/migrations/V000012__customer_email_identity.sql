ALTER TABLE accounts ALTER COLUMN phone_hash DROP NOT NULL;
ALTER TABLE accounts ALTER COLUMN phone_ciphertext DROP NOT NULL;
ALTER TABLE accounts ALTER COLUMN phone_key_id DROP NOT NULL;
ALTER TABLE accounts ALTER COLUMN phone_iv DROP NOT NULL;
ALTER TABLE accounts ALTER COLUMN phone_tag DROP NOT NULL;

ALTER TABLE accounts ADD COLUMN email_hash bytea UNIQUE CHECK (email_hash IS NULL OR octet_length(email_hash)=32);
ALTER TABLE accounts ADD COLUMN email_ciphertext text;
ALTER TABLE accounts ADD COLUMN email_key_id varchar(64);
ALTER TABLE accounts ADD COLUMN email_iv bytea CHECK (email_iv IS NULL OR octet_length(email_iv)=12);
ALTER TABLE accounts ADD COLUMN email_tag bytea CHECK (email_tag IS NULL OR octet_length(email_tag)=16);
ALTER TABLE accounts ADD CONSTRAINT account_login_identity CHECK (
  (role_code='CUSTOMER' AND email_hash IS NOT NULL AND email_ciphertext IS NOT NULL AND email_key_id IS NOT NULL AND email_iv IS NOT NULL AND email_tag IS NOT NULL)
  OR
  (role_code<>'CUSTOMER' AND phone_hash IS NOT NULL AND phone_ciphertext IS NOT NULL AND phone_key_id IS NOT NULL AND phone_iv IS NOT NULL AND phone_tag IS NOT NULL)
) NOT VALID;
