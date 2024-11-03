import { REDIS_DATABASE } from '../spec-config';

export const JWT_SECRET = '**********'; // jwt秘钥

// 服务器ip地址，腾讯云：**********；阿里云：**********
export const IP_URL = {
  tencent: {
    localIp: '**********',
    serverIp: '**********',
  },
  ali: {
    localIp: '**********',
    serverIp: '**********',
  },
};

export const IP_WHITE_LIST = [IP_URL.tencent.serverIp, IP_URL.ali.serverIp]; // ip白名单

export const QQ_CLIENT_SECRET = '**********'; // qq登录APP Key
export const QQ_REDIRECT_URI = `**********`; // qq登录回调地址

export const WECHAT_SECRET = '**********'; // wechat登录APP Key
export const WECHAT_REDIRECT_URI = '**********'; // wechat登录回调地址

export const QINIU_ACCESSKEY = '**********'; // 七牛云秘钥
export const QINIU_SECRETKEY = '**********'; // 七牛云秘钥

// https://console.cloud.tencent.com/cam/capi
export const TENCENTCLOUD_SECRETID = '**********'; // 腾讯云SecretId
export const TENCENTCLOUD_SECRETKEY = '**********'; // 腾讯云SecretKey
export const TENCENTCLOUD_CSS = {
  PushDomain: `**********`, // 推流域名，可使用腾讯云直播提供的默认推流域名，也可以用自有已备案且 CNAME 配置成功的推流域名。
  PullDomain: `**********`, // 拉流域名
  AppName: '**********', // 直播的应用名称，默认为 live，可自定义。
  Key: '**********', // 鉴权Key，https://console.cloud.tencent.com/live/domainmanage/detail/185429.push.tlivecloud.com?tab=pushConfig
  CbKey: '**********', // 直播回调密钥，https://console.cloud.tencent.com/live/config/callback
};

export const MYSQL_CONFIG = {
  docker: {
    container: '**********',
    image: 'mysql:8.0',
    port: { 3306: 666 },
    MYSQL_ROOT_PASSWORD: '**********',
    volume: '**********',
  },
  database: '**********',
  host: '**********',
  port: 666,
  username: '**********',
  password: '**********',
}; // Mysql配置

export const REDIS_CONFIG = {
  docker: {
    container: '**********',
    image: 'redis:7.0',
    port: { 6379: 666 },
    volume: '**********',
  },
  database: REDIS_DATABASE.live,
  socket: {
    port: 666,
    host: '**********',
  },
  username: '**********',
  password: '**********',
}; // Redis配置

export const SRS_CONFIG = {
  docker: {
    // docker启动srs时的容器名字（可随便填）
    container: '**********',
    // docker镜像名，https://ossrs.net/lts/zh-cn/docs/v5/doc/getting-started
    image: 'registry.cn-hangzhou.aliyuncs.com/ossrs/srs:5.0.200',
    port: {
      1935: 666,
      8080: 666,
      1985: 666,
      8000: 666,
    },
    volume: '**********',
  },
  // CANDIDATE填你的本机ip地址
  CANDIDATE: `$(ifconfig en0 inet | grep 'inet ' | awk '{print $2}')`, // WARN mac可以这样获取本机ip，但是win不行，自己找本地ip
}; // SRS配置

export const RABBITMQ_CONFIG = {
  docker: {
    // docker启动rabbitmq时的容器名字（可随便填）
    container: '**********',
    // docker镜像名，https://www.rabbitmq.com/download.html
    image: 'rabbitmq:3.11-management',
    port: { 5672: 666, 15672: 666 },
  },
}; // RabbitMQ配置

export const ALIPAY_LIVE_CONFIG = {
  appId: '**********',
  privateKey:
    '**************************************************************************************************************************************************************************',
  alipayPublicKey:
    '**************************************************************************************************************************************************************************',
  gateway: '**********',
}; // 支付宝当面付-自然博客直播

export const SRS_LIVE = {
  PushDomain: `**********`,
  PullDomain: `**********`,
  AppName: '**********',
};

export const BILIBILI_LIVE_PUSH_KEY = '';

export const DOUYU_LIVE_PUSH_KEY = '';

export const HUYA_LIVE_PUSH_KEY = '';
