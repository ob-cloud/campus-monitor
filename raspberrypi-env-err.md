# 树莓派环境问题

## 1. 执行sudo apt update 出现以下问题

```shell
Err:3 http://packages.ros.org/ros/ubuntu buster InRelease
  The following signatures couldn't be verified because the public key is not available: NO_PUBKEY F42ED6FBAB17C654
Reading package lists... Done
```

```shell
pi@raspberrypi:/home/server $ sudo apt-key del 421C365BD9FF1F717815A3895523BAEEB01FA11
OK
pi@raspberrypi:/home/server $ sudo apt-key del B01FA116
OK
pi@raspberrypi:/home/server $ sudo -E apt-key adv --keyserver 'hkp://keyserver.ubuntu.com:80' --recv-key C1CF6E31E6BADE8868B172B4F42ED6FBAB17C654Executing: /tmp/apt-key-gpghome.x2IvBjMvwc/gpg.1.sh --keyserver hkp://keyserver.ubuntu.com:80 --recv-key C1CF6E31E6BADE8868B172B4F42ED6FBAB17C654
gpg: key F42ED6FBAB17C654: public key "Open Robotics <info@osrfoundation.org>" imported
gpg: Total number processed: 1
gpg:               imported: 1

pi@raspberrypi:/home/server $ sudo apt clean && sudo apt update

```

## 2. xftp 上传文件失败 （permission not allow）

修改服务器文件夹权限 `chmod 777 [文件夹]`

```shell
pi@raspberrypi:/home/server/html $ sudo chmod 777 campus
```