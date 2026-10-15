INSERT INTO permissions (permission_code, description) VALUES
  ('booking:types', 'Read active service types'),
  ('booking:estimate', 'Customer fare estimate'),
  ('booking:create', 'Customer create booking'),
  ('booking:list', 'Customer own bookings; Staff/Admin operational read');
INSERT INTO role_permissions (role_code, permission_code) VALUES
  ('CUSTOMER','booking:types'), ('DRIVER','booking:types'), ('STAFF','booking:types'), ('ADMIN','booking:types'),
  ('CUSTOMER','booking:estimate'), ('CUSTOMER','booking:create'),
  ('CUSTOMER','booking:list'), ('STAFF','booking:list'), ('ADMIN','booking:list');
