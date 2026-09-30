#!/bin/sh

echo "==> Waiting for MySQL to be ready..."
for i in $(seq 1 30); do
    php -r "new PDO('mysql:host=' . getenv('DB_HOST') . ';port=' . (getenv('DB_PORT') ?: '3306'), getenv('DB_USER'), getenv('DB_PASS'));" 2>/dev/null && break
    echo "  MySQL not ready yet (attempt $i/30), waiting..."
    sleep 2
done

echo "==> Running database migrations..."
php /var/www/cli.php migrate 2>&1
if [ $? -ne 0 ]; then
    echo "WARNING: Migrations failed. Check logs. Continuing anyway..."
fi

echo "==> Seeding default admin user..."
php /var/www/cli.php db:seed 2>&1 || true

echo "==> Starting PHP-FPM..."
exec php-fpm -F

