FROM node:20


WORKDIR /var/www/html/frontend

RUN npm install -g @angular/cli 
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
    default-mysql-client \
    apache2

 
# COPY .   ./

COPY /package*.json ./

RUN npm install

CMD [ "npm", "start" ]

