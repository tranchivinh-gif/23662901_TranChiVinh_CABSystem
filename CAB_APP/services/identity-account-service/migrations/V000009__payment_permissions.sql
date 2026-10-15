INSERT INTO permissions(permission_code,description) VALUES
 ('payment:read','Read own or operational payment'),
 ('payment:initiate','Customer initiate electronic payment'),
 ('payment:retry','Customer retry electronic payment'),
 ('payment:cash','Assigned Driver confirms Cash');
INSERT INTO role_permissions(role_code,permission_code) VALUES
 ('CUSTOMER','payment:read'),('DRIVER','payment:read'),('STAFF','payment:read'),('ADMIN','payment:read'),
 ('CUSTOMER','payment:initiate'),('CUSTOMER','payment:retry'),('DRIVER','payment:cash');
