<p align="center">
  <a href="https://live.hsslive.cn" target="_blank">
    <img
      width="200"
      src="https://github.com/galaxy-s10/billd-live/blob/master/src/assets/img/logo-txt.svg"
      alt="Billd-Live logo"
    />
  </a>
</p>

<h1 align="center">
  Billd-Live-Server
</h1>

<p align="center">
  基于Vue3 + WebRtc + Node + SRS + FFmpeg搭建的直播间。
</p>

## 简介

billd 直播间后端，主要根据[https://github.com/galaxy-s10/vue3-blog-server](https://github.com/galaxy-s10/vue3-blog-server)进行修改的

> 前端：[https://github.com/galaxy-s10/billd-live](https://github.com/galaxy-s10/billd-live)

## 预览

[https://live.hsslive.cn](https://live.hsslive.cn)

## 接口文档

[apifox](https://apifox.com/apidoc/shared-c7556b54-17b2-494e-a039-572d83f103ed/)

## b 站视频

- [从零搭建迷你版 b 站 web 直播间（Vue3+WebRTC+Node+SRS），公开课一：项目功能介绍 1](https://www.bilibili.com/video/BV1vW4y1Q7gP)
- [从零搭建迷你版 b 站 web 直播间（Vue3+WebRTC+Node+SRS），公开课一：项目功能介绍 2](https://www.bilibili.com/video/BV1tP411q7qw)
- [从零搭建迷你版 b 站 web 直播间（Vue3+WebRTC+Node+SRS），公开课二：本地运行项目 1](https://www.bilibili.com/video/BV1KW4y1D7Z6)
- [从零搭建迷你版 b 站 web 直播间（Vue3+WebRTC+Node+SRS），公开课二：本地运行项目 2](https://www.bilibili.com/video/BV1jc411u7K9)

## TODO

~~项目里使用到了一些 linux 命令，如`ps`命令，如果你是 windows 系统，会不兼容~~，不需要用到 ps 命令了。

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
# 运行在4300端口
pnpm run dev
```

```bash
pnpm run build
#运行在4200端口
pnpm run dev:prod
```

## 团队

[https://live.hsslive.cn/about/team](https://live.hsslive.cn/about/team)

## 赞助

[https://live.hsslive.cn/sponsors](https://live.hsslive.cn/sponsors)

## 交流

如果你对该项目感兴趣或有想法，欢迎进群或添加我的微信：

<div>
  <img
    src="https://resource.hsslive.cn/image/c582d500f460939a97882ce503f8b6b3.png" 
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
