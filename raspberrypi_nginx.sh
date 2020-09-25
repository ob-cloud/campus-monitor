#!/bin/bash

wget http://nginx.org/keys/nginx_signing.key
sudo apt-key add nginx_signing.key

# update sources
# vim /etc/apt/sources.list
# deb http://nginx.org/packages/debian/ wheezy nginx
# deb-src http://nginx.org/packages/debian/ wheezy nginx

sudo apt-get update

# install nginx
sudo apt-get install nginx

# uninstall nginx
# sudo apt-get remove purge nginx
# sudo apt-get remove purge nginx-common

# list files about nginx
# dpkg --get-selections|grep nginx

# start nginx
sudo /etc/init.d/nginx start

# set nginx config
sudo nano /etc/nginx/sites-available/default

# 配置
# ctrl+o 保存 → 回车 确认 → ctrl+x 退出

#  #root /var/www/html;
#  #root /home/pi/html;

#  # Add index.php to the list if you are using PHP
#  #index index.html index.htm index.nginx-debian.html;
#  server_name localhost;

#  location /campus {
#    root /home/pi/html;
#    index index.html index.htm;
#  }

#  location / {
#    proxy_pass http://localhost:8201;
#    proxy_http_version 1.1;
#    proxy_set_header Upgrade $http_upgrade;
#    proxy_set_header Connection "upgrade";
#    proxy_set_header Host $host;
#    proxy_read_timeout 600s;
#  }

# reload nginx
sudo /etc/init.d/nginx restart

# stop nginx
# sudo /etc/init.d/nginx stop