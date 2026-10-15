-- Secondary indexes and technical integration storage; no producers/consumers implemented here.
CREATE INDEX customers_status_created_idx ON customers (status, created_at DESC);
CREATE INDEX customer_profile_history_customer_time_idx ON customer_profile_history (customer_id, changed_at DESC);
