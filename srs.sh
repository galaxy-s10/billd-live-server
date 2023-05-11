#!/usr/bin/env bash
###
# Author: shuisheng
# Date: 2023-04-29 22:33:50
# Description:
# Email: 2274751790@qq.com
# FilePath: /billd-live-server/srs.sh
# Github: https://github.com/galaxy-s10
# LastEditors: shuisheng
# LastEditTime: 2023-05-11 10:34:45
###

# 生成头部文件快捷键：ctrl+cmd+i

# For macOS
CANDIDATE=$(ifconfig en0 inet | grep 'inet ' | awk '{print $2}')

JOBNAME=billd-live-server-srs

echo 停掉旧的容器$JOBNAME:
docker stop $JOBNAME

echo 删掉旧的容器$JOBNAME:
docker rm $JOBNAME

echo 启动新的容器$JOBNAME:

# -d, 后台运行
# -p :80:8080, 将容器的8080端口映射到主机的80端口

# RTC to RTMP
docker run -d --name $JOBNAME --rm --env CANDIDATE=$CANDIDATE \
  -p 1935:1935 -p 5001:8080 -p 1985:1985 -p 8000:8000/udp \
  registry.cn-hangzhou.aliyuncs.com/ossrs/srs:4 \
  objs/srs -c conf/rtc2rtmp.conf

# RTC to RTC
# docker run -d --name $JOBNAME --rm --env CANDIDATE=$CANDIDATE \
#   -p 1935:1935 -p 5001:8080 -p 1985:1985 -p 8000:8000/udp \
#   registry.cn-hangzhou.aliyuncs.com/ossrs/srs:4 \
#   objs/srs -c conf/rtc.conf
