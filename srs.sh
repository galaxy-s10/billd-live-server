#!/usr/bin/env bash
###
# Author: shuisheng
# Date: 2023-04-29 22:33:50
# Description:
# Email: 2274751790@qq.com
# FilePath: /billd-live-server/srs.sh
# Github: https://github.com/galaxy-s10
# LastEditors: shuisheng
# LastEditTime: 2023-04-29 22:36:54
###

# 生成头部文件快捷键：ctrl+cmd+i

# For macOS
CANDIDATE=$(ifconfig en0 inet | grep 'inet ' | awk '{print $2}')

docker run --rm --env CANDIDATE=$CANDIDATE \
  -p 1935:1935 -p 8080:8080 -p 1985:1985 -p 8000:8000/udp \
  registry.cn-hangzhou.aliyuncs.com/ossrs/srs:4 \
  objs/srs -c conf/rtc.conf
