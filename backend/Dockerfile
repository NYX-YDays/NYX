FROM php:8.3-fpm
 
 ARG WWW_USER=www-data
 
# Set working directory
WORKDIR /var/www/html/backend

# Copy project    
COPY  .  ./

# Install system dependencies
RUN apt-get update && apt-get install -y \
    sudo \
    git \
    curl \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    libzip-dev \
    libcurl4-openssl-dev \
    zip \
    unzip \
    default-mysql-client
 
# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip curl intl

# Set permissions for project file
RUN chown -R www-data:www-data  /var/www/html \
# give permissions to storage folder and cache folder
&& chmod -R 775 /var/www/html

# Get latest Composer
RUN php -r "readfile('http://getcomposer.org/installer');" | php -- --install-dir=/usr/bin/ --filename=composer
# compose install
RUN composer install --no-scripts --no-dev --no-interaction --no-ansi 
# Clean cache
RUN apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* 
RUN apt-get update \
    && apt-get install -y sudo 
    
 # Installation de Symfony CLI
RUN curl -sS https://get.symfony.com/cli/installer | bash
RUN mv /root/.symfony*/bin/symfony /usr/local/bin/symfony

# Créer les répertoires nécessaires et ajuster les permissions
RUN mkdir -p /var/www/.symfony5 && chown -R www-data:www-data /var/www


# Set user
USER ${WWW_USER}
# Exposer le port 8000 pour le serveur Symfony
EXPOSE 8000

# Commande pour démarrer Symfony (en utilisant `symfony server:start`)
CMD ["symfony", "server:start", "--no-tls",  "--dir=public", "--allow-http", "--listen-ip=0.0.0.0",  "--port=8000"]




