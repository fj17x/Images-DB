--\i api/scripts/populate_db.sql
DROP DATABASE IF EXISTS imagesdb;
CREATE DATABASE imagesdb;
\i api/scripts/populate_users_only.sql
\i api/scripts/populate_images_only.sql