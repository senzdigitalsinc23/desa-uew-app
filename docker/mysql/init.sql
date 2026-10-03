-- DESA UEW initial database setup
-- This runs automatically on first container start via MySQL init scripts

CREATE DATABASE IF NOT EXISTS `desa_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the DB_USER and DB_PASS from environment (set by docker-compose)
-- MySQL entrypoint already creates this user, but we grant privileges here
GRANT ALL PRIVILEGES ON `desa_db`.* TO '${DB_USER}'@'%';
FLUSH PRIVILEGES;
