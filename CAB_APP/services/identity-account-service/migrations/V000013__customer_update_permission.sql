INSERT INTO permissions(permission_code, description)
VALUES ('customer:update', 'Update own Customer profile');
INSERT INTO role_permissions(role_code, permission_code)
VALUES ('CUSTOMER', 'customer:update');
