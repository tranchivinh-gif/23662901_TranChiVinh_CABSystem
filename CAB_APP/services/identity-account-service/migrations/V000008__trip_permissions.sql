INSERT INTO permissions(permission_code,description) VALUES
  ('trip:read','Read own trip or operational trip'),
  ('trip:transition','Assigned Driver lifecycle'),
  ('trip:cancel','Customer or operator cancellation; assigned Driver no-show only'),
  ('trip:rate','Customer rate own completed trip');
INSERT INTO role_permissions(role_code,permission_code) VALUES
  ('CUSTOMER','trip:read'),('DRIVER','trip:read'),('STAFF','trip:read'),('ADMIN','trip:read'),
  ('DRIVER','trip:transition'),
  ('CUSTOMER','trip:cancel'),('DRIVER','trip:cancel'),('STAFF','trip:cancel'),('ADMIN','trip:cancel'),
  ('CUSTOMER','trip:rate');
