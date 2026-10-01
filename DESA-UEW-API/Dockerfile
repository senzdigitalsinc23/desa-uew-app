# â”€â”€ Base: PHP 8.3 FPM with all extensions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
FROM php:8.4-fpm-alpine AS base

# Update packages first
RUN apk update && apk add --no-cache \
    bash \
    curl \
    freetype-dev \
    icu-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    libzip-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    autoconf

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_mysql \
    mbstring \
    intl \
    bcmath \
    gd \
    zip \
    opcache \
    xml \
    soap

# Redis build dependencies
RUN apk add --no-cache \
    $PHPIZE_DEPS \
    linux-headers \
    autoconf \
    gcc \
    g++ \
    make \
    pkgconf

# Install Redis extension (requires autoconf)
RUN pecl install redis && docker-php-ext-enable redis

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# â”€â”€ Production â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
FROM base AS production

WORKDIR /var/www

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts \
    && composer dump-autoload --optimize

COPY . .

# Copy nginx config into container (for reference, not used by PHP)
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf.bak

# Create symlinks for CLI tools
RUN ln -sf /var/www/vendor /var/www/tools/vendor \
    && ln -sf /var/www/Database /var/www/tools/Database \
    && mkdir -p storage/logs storage/uploads storage/cache \
    && chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage

RUN chmod +x docker/php/entrypoint.sh

COPY docker/php/php.ini /usr/local/etc/php/conf.d/app.ini
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

EXPOSE 9000

ENTRYPOINT ["docker/php/entrypoint.sh"]
