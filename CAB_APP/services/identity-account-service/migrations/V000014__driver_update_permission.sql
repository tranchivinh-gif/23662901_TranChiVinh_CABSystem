INSERT INTO permissions(permission_code, description)
VALUES ('driver:update', 'Update own Driver profile and vehicle');
INSERT INTO role_permissions(role_code, permission_code)
VALUES ('DRIVER', 'driver:update');
