#!/usr/bin/env bash
###
# Author: shuisheng
# Date: 2022-04-26 01:54:48
# Description: https://github.com/galaxy-s10/sh/blob/master/pm2.sh
# Email: 2274751790@qq.com
# FilePath: /billd-live-server/ffmpeg.sh
# Github: https://github.com/galaxy-s10
# LastEditTime: 2023-03-23 15:54:19
# LastEditors: shuisheng
###

# ffmpeg后台运行
# https://www.jianshu.com/p/6ea70e6d8547
# 1 代表标准输出
# 2 代表标准错误
# 1>/dev/null 把标准输出导入到null设备,也就是消失不见，如果要重定向到某个文件，可以1>1.txt
# 2>&1 把标准错误也导入到标准输出同样的地方
ffmpeg -stream_loop -1 -re -i https://resource.hsslive.cn/media/fddm_2.mp4 -c copy -f flv rtmp://localhost/live/fddm_2 1>/dev/null 2>&1 &
