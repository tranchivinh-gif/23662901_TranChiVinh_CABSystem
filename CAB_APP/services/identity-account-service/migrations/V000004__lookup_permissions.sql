-- CP-07 read permissions. Database state is authoritative; JWT role is never sufficient.
INSERT INTO permissions (permission_code, description) VALUES
  ('customer:read', 'Read Customer profile; Customer ownership enforced by Customer service'),
  ('driver:read', 'Read Driver profile; Driver ownership enforced by Driver service'),
  ('profile:sensitive:read', 'Admin full profile PII access with mandatory audit');
INSERT INTO role_permissions (role_code, permission_code) VALUES
  ('CUSTOMER','customer:read'),
  ('DRIVER','driver:read'),
  ('STAFF','customer:read'), ('STAFF','driver:read'),
  ('ADMIN','customer:read'), ('ADMIN','driver:read'), ('ADMIN','profile:sensitive:read');
