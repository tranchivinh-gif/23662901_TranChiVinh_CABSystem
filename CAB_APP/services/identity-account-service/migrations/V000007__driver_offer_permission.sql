INSERT INTO permissions(permission_code,description) VALUES ('driver:offer','Driver own offers; active account and ownership required');
INSERT INTO role_permissions(role_code,permission_code) VALUES ('DRIVER','driver:offer');
