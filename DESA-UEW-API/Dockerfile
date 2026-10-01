# ── Base: PHP 8.3 FPM with all extensions ──────────────────────────
FROM php:8.3-fpm-alpine AS base

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
    git

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

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# ── Production ─────────────────────────────────────────────────────
FROM base AS production

WORKDIR /var/www

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts \
    && composer dump-autoload --optimize

COPY . .

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
