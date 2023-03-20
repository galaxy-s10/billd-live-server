# 简介

基于 Typescript + Node 搭建的博客后端，并主要使用了以下插件：

- koa
- sequelize
- mysql2
- redis
- node-schedule
- nodemailer
- jsonwebtoken
- socket.io

# apifox 接口文档

[https://www.apifox.cn/apidoc/shared-e73bb55d-ccdd-40a2-ab41-961e1ffcfa10/doc-543592](https://www.apifox.cn/apidoc/shared-e73bb55d-ccdd-40a2-ab41-961e1ffcfa10/doc-543592)，绝大部分接口都写了，可能还有一些接口没写~

# 运行

## 安装依赖

```bash
pnpm install
```

## 本地启动项目

```bash
# pnpm run dev，运行在3300端口
pnpm run dev
# 或者pnpm run dev:beta，运行在3300端口
pnpm run dev:beta
# 或者pnpm run dev:prod，运行在3200端口
pnpm run dev:prod
```

# 服务器环境

- 操作系统：CentOS Linux release 8.2.2004
- nginx 版本：1.21.4
- node 版本：14.19.0
- redis 版本：5.0.3
- mysql 版本：8.0.26
- pm2 版本：5.1.2

# 注意

`pnpm start` 启动后，会默认在 src/config/secret.ts 生成秘钥文件，请在该文件里面填写本项目所需的秘钥信息~
