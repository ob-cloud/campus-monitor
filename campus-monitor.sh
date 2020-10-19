#!/bin/bash

# Usage: 
# before using the shell you may execute the under command first
# sed -i "s/\r//" campus-monitor.sh
# chmod a+x campus-monitor.sh

# directory of nginx to serve the projects
PROJ_SERVER_BASE="/home/server"
PROJ_SERVER_DIR="/home/server/html"
PROJ_REMOTE_URL="https://github.com/ob-cloud/campus-monitor/releases/download/v1.0.0/release.tar.gz"
PROJ_FILE="release.tar.gz"
PROJ="campus"

NGINX_SERVER="/etc/init.d/nginx"
NGINX_SIGNING_KEY="http://nginx.org/keys/nginx_signing.key"
NGINX_SIGNING_KEY_NAME="nginx_signing.key"
NGINX_CONFIG_PATH="/etc/nginx/sites-available"

init_env() {
  echo -e "\033[32m initialize directory \033[0m"
  sudo mkdir -p $PROJ_SERVER_DIR/$PROJ
}
fetch_project() {
  echo -e "\033[32m downloading project from remote server \033[0m"

  cd $PROJ_SERVER_DIR/$PROJ
  sudo rm -rf ./*
  sudo wget -c $PROJ_REMOTE_URL
  sudo tar -zxvf $PROJ_FILE
  sudo rm -f $PROJ_FILE
  cd $PROJ_SERVER_DIR
  echo -e "\033[32m project successfully \033[0m"
}

sign_nginx_key() {
  if [ -f $PROJ_SERVER_BASE/$NGINX_SIGNING_KEY_NAME ];then
    echo -e "\033[32m  nginx sing key already exists. \033[0m"
  else
    echo -e "\033[32m creating sign nginx key... \033[0m"
    cd $PROJ_SERVER_DIR
    cd ..
    sudo wget $NGINX_SIGNING_KEY
    sudo apt-key add nginx_signing.key
  fi
}

update_nginx_sources() {
  echo -e "\033[32m updating nginx pakcages sources \033[0m"
  # vim /etc/apt/sources.list
  # deb http://nginx.org/packages/debian/ wheezy nginx
  # deb-src http://nginx.org/packages/debian/ wheezy nginx

  sudo apt-get update
}

# TODO return code
install_nginx() {
  if [ -f $NGINX_SERVER ];then
    echo -e "\033[32m  nginx is already installed. \033[0m"
  else
    echo -e "\033[32m  nginx is installing... \033[0m"
    sudo apt-get install nginx -y
  fi
}

create_nginx_config_file() {
echo -e "\033[32m creating nginx config file \033[0m"
# sudo rm -f $NGINX_CONFIG_PATH/default
sudo chmod a+wrx $NGINX_CONFIG_PATH/default
sudo cat > $NGINX_CONFIG_PATH/default <<EOF
  server {
    listen       80 default_server;
    server_name  localhost;
    charset utf-8;
    location / {
      proxy_pass http://localhost:8201;
      proxy_http_version 1.1;
      proxy_set_header Upgrade \$http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_set_header Host \$host;
      proxy_read_timeout 600s;
    }
    location /campus {
      root $PROJ_SERVER_DIR;
      index index.html index.htm;
    }
  }
EOF
sudo cat $NGINX_CONFIG_PATH/default
}
chk_nginx_config_and_start() {
  echo -e "\033[32m Checking nginx config and restart \033[0m"
  # sudo $NGINX_SERVER configtest
  # if [ $? -eq 0 ];then
  #   echo "\033[32m nginx will start \033[0m"
  #   sudo pkill nginx
  #   sudo $NGINX_SERVER start
  # else
  #   echo -e "\033[32m Please check nginx config file \033[0m"
  #   exit
  # fi
  sudo pkill nginx
  sudo $NGINX_SERVER start
}

chk_nginx_config_and_reload() {
  echo -e "\033[32m Check nginx config file and reload \033[0m"
  # sudo $NGINX_SERVER configtest
  # if [ $? -eq 0 ];then
  #   echo -e "\033[32m nginx will reload \033[0m"
  #   sudo $NGINX_SERVER restart
  # else
  #   echo -e "\033[32m Please check nginx config file \033[0m"
  #   exit
  # fi
  sudo $NGINX_SERVER restart
}

main() {
  init_env
  sleep 1
  sign_nginx_key
  sleep 1
  update_nginx_sources
  sleep 1
  install_nginx
  sleep 1
  if [ $? -eq 0 ];then
    chk_nginx_config_and_start
  else
    echo -e "\033[32m Starting nginx server fail!!! \033[0m"
    exit
  fi

  create_nginx_config_file
  if [ $? -eq 0 ];then
    chk_nginx_config_and_reload
  else
    echo -e "\033[32m The nginx server reload failed, please check \033[0m"
    exit
  fi

  sleep 1
  fetch_project
  sleep 1
  HOST_IP=$(ifconfig |grep inet|grep -v 127.0.0.1|grep -v inet6|awk '{print $2}'|tr -d "addr:")
  echo -e "\033[32m Open browser and visit http://$HOST_IP/$PROJ \033[0m"
}
main