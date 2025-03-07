#!/usr/bin/env bash
###
# Author: shuisheng
# Date: 2024-12-16 23:22:50
# Description:
# Email: 2274751790@qq.com
# FilePath: /billd-live-server-pro/deploy/node-pm2.sh
# Github: https://github.com/galaxy-s10
# LastEditors: shuisheng
# LastEditTime: 2025-03-07 10:12:34
###

# 云效读取不了node，会报错：node: command not found，加上这个环境变量。
export NODE_HOME=/root/.nvm/versions/node/v18.19.0
export PATH=$PATH:$NODE_HOME/bin

pnpm i

npm run build

pm2 start ./deploy/ecosystem.config.js
