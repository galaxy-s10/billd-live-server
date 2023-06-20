import { PROJECT_ENV, PROJECT_ENV_ENUM } from '@/constant';

export const JWT_SECRET = '**********'; // jwt秘钥

export const IP_WHITE_LIST = ['127.0.0.1']; // ip白名单

export const QQ_CLIENT_ID = '**********'; // qq登录APP ID
export const QQ_CLIENT_SECRET = '**********'; // qq登录APP Key
export const QQ_REDIRECT_URI = '**********'; // qq登录回调地址

// WARN 七牛云属实拉胯，不用它了，QINIU_LIVE里面的值可以随便填（但一定要有值），反正用不到。
export const QINIU_ACCESSKEY = '**********'; // 七牛云秘钥
export const QINIU_SECRETKEY = '**********'; // 七牛云秘钥
export const QINIU_LIVE = {
  // 推流鉴权方式：静态鉴权(static)，https://developer.qiniu.com/pili/6678/push-the-current-authentication
  // 推流地址格式：rtmp://<RTMPPublishDomain>/<Hub>/<streamTitle>?key=<PublishKey>
  RTMPPublishDomain: '**********', // 推流域名
  Hub: '**********', // 直播空间名称
  PublishKey: '**********', // 推流密钥
};

// https://console.cloud.tencent.com/cam/capi
export const TENCENTCLOUD_APPID = 666; // 腾讯云APPID
export const TENCENTCLOUD_SECRETID = '**********'; // 腾讯云SecretId
export const TENCENTCLOUD_SECRETKEY = '**********'; // 腾讯云SecretKey
export const TENCENTCLOUD_LIVE = {
  PushDomain: '**********', // 推流域名，可使用腾讯云直播提供的默认推流域名，也可以用自有已备案且 CNAME 配置成功的推流域名。
  PullDomain: '**********', // 拉流域名
  AppName: '**********', // 直播的应用名称，默认为 live，可自定义。
  Key: '**********', // 鉴权Key，https://console.cloud.tencent.com/live/domainmanage/detail/185429.push.tlivecloud.com?tab=pushConfig
};

export const SERVER_LIVE = {
  PushDomain:
    PROJECT_ENV === PROJECT_ENV_ENUM.development
      ? 'rtmp://localhost'
      : '**********', // 推流域名
  PullDomain:
    PROJECT_ENV === PROJECT_ENV_ENUM.development
      ? 'http://localhost:5001'
      : '**********', // 拉流域名
  AppName: 'livestream',
};

export const MYSQL_CONFIG = {
  docker: {
    container: 'billd-live-mysql',
    image: 'mysql:8.0',
    port: { 3306: 3306 },
    MYSQL_ROOT_PASSWORD:
      PROJECT_ENV === PROJECT_ENV_ENUM.development
        ? 'mysql123.'
        : '********************',
    volume:
      PROJECT_ENV === PROJECT_ENV_ENUM.development
        ? '/Users/huangshuisheng/Desktop/docker/mysql'
        : '********************',
  },
  database:
    PROJECT_ENV === PROJECT_ENV_ENUM.development
      ? 'billd_live_test'
      : '*************',
  host:
    PROJECT_ENV === PROJECT_ENV_ENUM.development
      ? '127.0.0.1'
      : '********************',
  port: 3306,
  username: 'root',
  password:
    PROJECT_ENV === PROJECT_ENV_ENUM.development
      ? 'mysql123.'
      : '********************',
}; // Mysql配置

export const REDIS_CONFIG = {
  docker: {
    container: 'billd-live-redis',
    image: 'redis:7.0',
    port: { 6379: 6379 },
    volume:
      PROJECT_ENV === PROJECT_ENV_ENUM.development
        ? '/Users/huangshuisheng/Desktop/docker/redis'
        : '*************',
  },
  database: 0,
  socket: {
    port: 6379,
    host:
      PROJECT_ENV === PROJECT_ENV_ENUM.development ? '127.0.0.1' : '**********',
  },
  username:
    PROJECT_ENV === PROJECT_ENV_ENUM.development
      ? 'billd_live_redis_test'
      : '*************',
  password:
    PROJECT_ENV === PROJECT_ENV_ENUM.development ? 'redis123.' : '**********',
}; // Redis配置

export const SRS_CONFIG = {
  docker: {
    // docker启动srs时的容器名字（可随便填）
    container: 'billd-live-srs',
    // docker镜像名，https://ossrs.net/lts/zh-cn/docs/v5/doc/getting-started
    image: 'registry.cn-hangzhou.aliyuncs.com/ossrs/srs:5',
    port: {
      1935: 1935,
      8080: 5001,
      1985: 1985,
      8000: 8000,
    },
    volume:
      PROJECT_ENV === PROJECT_ENV_ENUM.development
        ? '/Users/huangshuisheng/Desktop/docker/srs'
        : '*************',
  },
  // CANDIDATE填你的本机ip地址
  CANDIDATE:
    PROJECT_ENV === PROJECT_ENV_ENUM.development
      ? `$(ifconfig en0 inet | grep 'inet ' | awk '{print $2}')` // WARN mac可以这样获取本机ip，但是win不行，自己找本地ip
      : '*************',
}; // SRS配置

export const RABBITMQ_CONFIG = {
  docker: {
    // docker启动rabbitmq时的容器名字（可随便填）
    container: 'billd-live-rabbitmq',
    // docker镜像名，https://www.rabbitmq.com/download.html
    image: 'rabbitmq:3.11-management',
    port: { 5672: 5672, 15672: 15672 },
  },
}; // RabbitMQ配置

export const ALIPAY_LIVE_CONFIG = {
  appId: '**********',
  privateKey:
    '**********************************************************************************************************************************************************************************************************************',
  alipayPublicKey:
    '**********************************************************************************************************************************************************************************************************************',
  gateway: '**********',
}; // 支付宝当面付-自然博客直播
