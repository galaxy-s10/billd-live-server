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

[apifox](https://apifox.com/apidoc/shared-c7556b54-17b2-494e-a039-572d83f103ed/)

## F&Q

### 数据库建库建表？

项目会使用到两个数据库，一个用于生产环境，另一个用于开发环境，只需要配置好 MYSQL_CONFIG 即可，因为项目启动时会自动判断是否存在 MYSQL_CONFIG.database，如果不存在，则会根据当前项目环境自动新建数据库。

### 初始化数据（必须！）

项目启动成功后，要做的第一件事情是调用所有初始化接口：[https://apifox.com/apidoc/shared-c7556b54-17b2-494e-a039-572d83f103ed/api-80688503](https://apifox.com/apidoc/shared-c7556b54-17b2-494e-a039-572d83f103ed/api-80688503)

目前的初始化接口有：

- 初始化角色
- 初始化权限
- 初始化角色权限
- 初始化用户
- 初始化用户钱包
- 初始化商品
- 初始化时间表

## 安装和使用

- 安装依赖

```bash
pnpm i
```

> 更新 billd 相关依赖：

```bash
pnpm i billd-utils@latest billd-html-webpack-plugin@latest billd-deploy@latest
```

- 运行

> 本地需要有 mysql、redis、docker、ffmpeg 环境！
>
> 项目启动后，会在项目的 src/config/目录下生成 secret.ts 文件，请填写里面的信息，MYSQL_CONFIG、REDIS_CONFIG、RABBITMQ_CONFIG、SRS_CONFIG 必填！

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

## 环境配置

### 本地开发环境

> 配置：macbookpro 2020 m1，8 核 CPU，16G 内存

- 操作系统：mac os 13.3.1
- node 版本：16.16.0
- pnpm 版本：8.6.3
- docker 版本：20.10.24, build 297e128
- mysql 版本：基于 docker，镜像：mysql:8.0
- srs 版本：基于 docker，镜像：registry.cn-hangzhou.aliyuncs.com/ossrs/srs:5
- ffmpeg 版本：5.1.2

### 构建/托管服务器环境

> 配置：4 核 CPU，4G 内存，8M 带宽（广州）

- 操作系统：CentOS Linux release 8.2.2004
- nginx 版本：1.22.1
- node 版本：v16.19.1
- pnpm 版本：8.6.3
- docker 版本：23.0.1, build a5ee5b1
- redis 版本：基于 docker，镜像：redis:7.0
- mysql 版本：基于 docker，镜像：mysql:8.0

### 流媒体服务器环境

> 配置：2 核 CPU，2G 内存，带宽 30M（香港）

- 操作系统：Alibaba Cloud Linux release 3 (Soaring Falcon)
- node 版本：v16.20.0
- pnpm 版本：8.6.3
- pm2 版本：5.3.0
- docker 版本：24.0.2, build cb74dfc
- srs 版本：基于 docker，镜像：registry.cn-hangzhou.aliyuncs.com/ossrs/srs:5
- ffmpeg 版本：6.0
