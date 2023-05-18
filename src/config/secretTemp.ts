export const JWT_SECRET = '**********'; // jwt秘钥

export const LIVE_QQ_CLIENT_ID = '**********'; // qq登录APP ID
export const LIVE_QQ_CLIENT_SECRET = '**********'; // qq登录APP Key
export const LIVE_QQ_REDIRECT_URI = '**********'; // qq登录回调地址

export const QQ_EMAIL_USER = '**********'; // qq邮箱auth的用户
export const QQ_EMAIL_PASS = '**********'; // qq邮箱auth的秘钥

export const IP_WHITE_LIST = ['127.0.0.1']; // ip白名单

export const MYSQL_CONFIG = {
  database: '**********',
  username: '**********',
  password: '**********',
  host: '**********',
  port: 666,
}; // mysql配置

export const REDIS_CONFIG = {
  database: 666,
  socket: {
    port: 666,
    host: '**********',
  },
  password: '**********',
}; // redis配置

export const SRS_CONFIG = {
  // CANDIDATE填你的本机ip地址
  CANDIDATE:
    process.env.NODE_ENV === 'development'
      ? `$(ifconfig en0 inet | grep 'inet ' | awk '{print $2}')`
      : '42.193.157.44',
  // dockerContainerName填启动srs-docker时的容器名字（可随便填）
  dockerContainerName: 'billd-live-server-srs',
}; // srs配置

export const ALIPAY_LIVE_CONFIG = {
  appId: '**********',
  privateKey:
    '**********************************************************************************************************************************************************************************************************************',
  alipayPublicKey:
    '**********************************************************************************************************************************************************************************************************************',
  gateway: '**********',
}; // 支付宝当面付-自然博客直播

export const ALIPAY_BLOG_CONFIG = {
  appId: '**********',
  privateKey:
    '**********************************************************************************************************************************************************************************************************************',
  alipayPublicKey:
    '**********************************************************************************************************************************************************************************************************************',
  gateway: '**********',
}; // 支付宝当面付-自然博客前台
