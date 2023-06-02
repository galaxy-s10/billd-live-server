<p align="center">
  <a href="https://live.hsslive.cn" target="_blank">
    <img
      width="200"
      src="https://resource.hsslive.cn/image/1613141138717Billd.webp"
      alt="Billd-Live logo"
    />
  </a>
</p>

<h1 align="center">
  Billd-Live
</h1>

<p align="center">
  基于Vue3 + WebRtc + Node + SRS + FFmpeg搭建的直播间
</p>

## 简介

billd 直播间后端，主要根据[https://github.com/galaxy-s10/vue3-blog-server](https://github.com/galaxy-s10/vue3-blog-server)进行修改的

> 前端：[https://github.com/galaxy-s10/billd-live](https://github.com/galaxy-s10/billd-live)

## 预览

[https://live.hsslive.cn](https://live.hsslive.cn)

## 接口文档

[apifox](https://www.apifox.cn/apidoc/shared-46443f95-e389-4453-9da7-a98ea8c72177)

## 安装和使用

- 安装依赖

```bash
pnpm i
```

> 更新 billd 相关依赖：

```bash
pnpm i billd-utils@latest billd-scss@latest billd-html-webpack-plugin@latest billd-deploy@latest
```

- 运行

> 本地需要有 mysql、redis、docker、ffmpeg 环境！
>
> 项目启动后，会在项目的 src/config/目录下生成 secret.ts 文件，请填写里面的信息，MYSQL_CONFIG、REDIS_CONFIG、DOCKER_RABBITMQ_CONFIG、DOCKER_SRS_CONFIG 必填！
>
> 项目会使用到两个数据库，一个用于生产环境，另一个用于开发环境，配置好 MYSQL_CONFIG 后，记得新建对应的数据库（数据库名看：src/config/mysql/index.ts 里面的 dbName）。新建完数据库后，在项目的 src 目录下的 index.ts 搜`initDb('load');`，改成`initDb('force');`这会给你初始化数据库表。初始化完成后，再将`initDb('force');`，改回`initDb('load');`即可。

```bash
# pnpm run dev，运行在4300端口
pnpm run dev
# 或者pnpm run dev:beta，运行在4300端口
pnpm run dev:beta
# 或者pnpm run dev:prod，运行在4200端口
pnpm run dev:prod
```

## 赞助

[https://live.hsslive.cn/sponsors](https://live.hsslive.cn/sponsors)

## F&Q

todo

## 交流

如果你对该项目感兴趣或有想法，欢迎进群或添加我的微信：

<div>
  <img
    src="https://resource.hsslive.cn/image/1443d854f04cd03980343ef3d003a427.webp" 
    style="height:300px"
    />
  <img
    src="https://resource.hsslive.cn/image/57c5b5598736e6e4f7e406ae503120f8.webp" 
    style="height:300px"
    />
</div>

## 本地环境

- 操作系统：mac os 13.3.1（macbookpro 2020 m1）
- node 版本：16.16.0

## 服务器环境

- 操作系统：CentOS Linux release 8.2.2004
- nginx 版本：1.21.4
- node 版本：14.19.0
- redis 版本：5.0.3
- mysql 版本：8.0.26
- pm2 版本：5.1.2
