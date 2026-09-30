-- DESA UEW initial database setup
-- This runs automatically on first container start via MySQL init scripts

CREATE DATABASE IF NOT EXISTS `desa_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'desa_user'@'%' IDENTIFIED WITH mysql_native_password BY 'change_me_desa_pass';
GRANT ALL PRIVILEGES ON `desa_db`.* TO 'desa_user'@'%';
FLUSH PRIVILEGES;
