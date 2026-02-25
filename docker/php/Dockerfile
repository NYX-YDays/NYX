FROM php:8.2-fpm-alpine

RUN apk add --no-cache \ 
    postgresql-dev \
    icu-dev \
    libzip-dev \
    curl-dev \
    libsodium-dev

RUN docker-php-ext-install \
    pdo_pgsql \
    intl \
    opcache \
    zip \
    curl \
    fileinfo \
    sodium

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app


