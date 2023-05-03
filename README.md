# 简介

billd 直播间后端，主要根据[https://github.com/galaxy-s10/vue3-blog-server](https://github.com/galaxy-s10/vue3-blog-server)进行修改的

## 安装依赖

```bash
pnpm install
```

## billd 依赖

```bash
pnpm i billd-utils@latest billd-scss@latest billd-html-webpack-plugin@latest billd-deploy@latest
```

## 启动项目

> 本地需要有 mysql、redis、docker 环境！
>
> 项目启动后，会在项目的 src/config/目录下生成 secret.ts 文件，请填写里面的信息，MYSQL_CONFIG、REDIS_CONFIG 必填！
>
> 项目会使用到两个数据库，一个用于生产环境，另一个用于开发环境，配置好 MYSQL_CONFIG 后，记得新建对应的数据库（数据库名看：src/config/mysql/index.ts 里面的 dbName）。新建完数据库后，在项目的 src 目录下的 index.ts 搜`initDb(3);`，改成`initDb(1);`这会给你初始化数据库表。初始化完成后，再将`initDb(1);`，改回`initDb(3);`即可。

```bash
# pnpm run dev，运行在4300端口
pnpm run dev
# 或者pnpm run dev:beta，运行在4300端口
pnpm run dev:beta
# 或者pnpm run dev:prod，运行在4200端口
pnpm run dev:prod
```

# 本地环境

- 操作系统：mac os 13.3.1（macbookpro 2020 m1）
- node 版本：16.16.0

# 服务器环境

- 操作系统：CentOS Linux release 8.2.2004
- nginx 版本：1.21.4
- node 版本：14.19.0
- redis 版本：5.0.3
- mysql 版本：8.0.26
- pm2 版本：5.1.2
