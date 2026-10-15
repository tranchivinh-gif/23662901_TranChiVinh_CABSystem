ALTER TABLE trips ADD COLUMN payment_method varchar(64) NOT NULL DEFAULT 'UNKNOWN'
  CHECK(payment_method IN ('Cash','Electronic','UNKNOWN'));
