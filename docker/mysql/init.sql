-- DESA UEW initial database setup
-- MySQL entrypoint creates the database and user automatically.
-- This script ensures the app user has correct privileges.

-- Grant privileges to the application user (created by MySQL entrypoint via MYSQL_USER/MYSQL_PASSWORD)
GRANT ALL PRIVILEGES ON *.* TO '${MYSQL_USER}'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
