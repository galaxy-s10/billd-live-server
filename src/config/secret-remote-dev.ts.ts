import { PROJECT_ENV, PROJECT_ENV_ENUM } from '@/constant';

export const JWT_SECRET = '2274751790abcdefg'; // jwt秘钥

// 服务器ip地址，腾讯云：42.193.157.44；阿里云：8.218.5.78
export const IP_URL = {
  tencent: {
    localIp: 'localhost',
    serverIp: '42.193.157.44',
  },
  ali: {
    localIp: 'localhost',
    serverIp: '8.218.5.78',
  },
};

export const IP_WHITE_LIST = [IP_URL.tencent.serverIp, IP_URL.ali.serverIp]; // ip白名单

export const QQ_CLIENT_ID = '101958191'; // qq登录APP ID
export const QQ_CLIENT_SECRET = '8bcf8ef311f3990a40d89eb6d628c611'; // qq登录APP Key
export const QQ_REDIRECT_URI = 'https://live.hsslive.cn/oauth/qq_login'; // qq登录回调地址

export const WECHAT_APPID = 'wxbd243c01ac5ad1b7'; // wechat登录APP ID
export const WECHAT_SECRET = 'eccdbf72af518ac74e9f1b1eed8e5d21'; // wechat登录APP Key
export const WECHAT_REDIRECT_URI = 'https://live.hsslive.cn/oauth/qq_login'; // wechat登录回调地址

// WARN 七牛云属实拉胯，不用它了，QINIU_PILI_LIVE里面的值可以随便填（但一定要有值），反正用不到。
export const QINIU_ACCESSKEY = 'OrbhOMlQ43QrpltV2uWhPdT1AkiCJgyCDBgRvuaR'; // 七牛云秘钥
export const QINIU_SECRETKEY = '9n8zy5GZaKq6NZ2F6wgvpkHejs6Or40S869X0v2Q'; // 七牛云秘钥
export const QINIU_PILI_LIVE = {
  // 推流鉴权方式：静态鉴权(static)，https://developer.qiniu.com/pili/6678/push-the-current-authentication
  // 推流地址格式：rtmp://<RTMPPublishDomain>/<Hub>/<streamTitle>?key=<PublishKey>
  RTMPPublishDomain: 'pili-publish.hsslive.cn', // 推流域名
  Hub: 'livestream', // 直播空间名称
  PublishKey: '6ba33c1773677d27', // 推流密钥
};

// https://console.cloud.tencent.com/cam/capi
export const TENCENTCLOUD_APPID = 1305322458; // 腾讯云APPID
export const TENCENTCLOUD_SECRETID = 'AKIDkdXO5Y5f28zav0qTr0A5C3dBe2GExUr4'; // 腾讯云SecretId
export const TENCENTCLOUD_SECRETKEY = '4wiFWQJkXAiANM7duwiIg6Wmz1oOmEZe'; // 腾讯云SecretKey
export const TENCENTCLOUD_LIVE = {
  PushDomain: 'push.hsslive.cn', // 推流域名，可使用腾讯云直播提供的默认推流域名，也可以用自有已备案且 CNAME 配置成功的推流域名。
  PullDomain: 'pull.hsslive.cn', // 拉流域名
  AppName: 'livestream', // 直播的应用名称，默认为 live，可自定义。
  Key: '4ac9014beef53f98ced5907f52a64c38', // 鉴权Key，https://console.cloud.tencent.com/live/domainmanage/detail/185429.push.tlivecloud.com?tab=pushConfig
};

export const MYSQL_CONFIG = {
  docker: {
    container: 'billd-live-mysql',
    image: 'mysql:8.0',
    port: { 3306: 3306 },
    MYSQL_ROOT_PASSWORD:
      PROJECT_ENV === PROJECT_ENV_ENUM.development
        ? 'mysql123.'
        : 'mysql1990507a..',
    volume:
      PROJECT_ENV === PROJECT_ENV_ENUM.development
        ? '/Users/huangshuisheng/Desktop/docker/mysql'
        : '/node/docker/mysql',
  },
  database:
    PROJECT_ENV === PROJECT_ENV_ENUM.development
      ? 'billd_live_test2'
      : 'billd_live',
  host:
    PROJECT_ENV === PROJECT_ENV_ENUM.development
      ? '127.0.0.1'
      : IP_URL.tencent.serverIp, // 腾讯云：42.193.157.44；阿里云：8.218.5.78
  port: 3306,
  username: 'root',
  password:
    PROJECT_ENV === PROJECT_ENV_ENUM.development
      ? 'mysql123.'
      : 'mysql1990507a..',
}; // Mysql配置

export enum REDIS_DATABASE {
  blog,
  live,
}

export const REDIS_CONFIG = {
  docker: {
    container: 'billd-live-redis',
    image: 'redis:7.0',
    port: { 6379: 6379 },
    volume:
      PROJECT_ENV === PROJECT_ENV_ENUM.development
        ? '/Users/huangshuisheng/Desktop/docker/redis'
        : '/node/docker/redis',
  },
  database: REDIS_DATABASE.live,
  socket: {
    port: 6379,
    host:
      PROJECT_ENV === PROJECT_ENV_ENUM.development
        ? '127.0.0.1'
        : IP_URL.tencent.serverIp, // 42.193.157.44、8.218.5.78
  },
  username:
    PROJECT_ENV === PROJECT_ENV_ENUM.development
      ? 'billd_live_redis_test'
      : 'billd_live_redis',
  password:
    PROJECT_ENV === PROJECT_ENV_ENUM.development ? 'redis123.' : '19990507a.',
}; // Redis配置

export const SRS_CONFIG = {
  docker: {
    // docker启动srs时的容器名字（可随便填）
    container: 'billd-live-srs',
    // docker镜像名，https://ossrs.net/lts/zh-cn/docs/v5/doc/getting-started
    image: 'registry.cn-hangzhou.aliyuncs.com/ossrs/srs:5.0.200',
    port: {
      1935: 1935,
      8080: 5001,
      1985: 1985,
      8000: 8000,
    },
    volume:
      PROJECT_ENV === PROJECT_ENV_ENUM.development
        ? '/Users/huangshuisheng/Desktop/docker/srs'
        : '/node/docker/srs',
  },
  // CANDIDATE填你的本机ip地址
  CANDIDATE:
    PROJECT_ENV === PROJECT_ENV_ENUM.development
      ? `$(ifconfig en0 inet | grep 'inet ' | awk '{print $2}')` // WARN mac可以这样获取本机ip，但是win不行，自己找本地ip
      : IP_URL.ali.serverIp,
}; // docker的SRS配置

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
  appId: '2021003193626441',
  privateKey:
    'MIIEogIBAAKCAQEAwg6vmpUysjZ2cPUBRmzQ7DJoFYr3Ir1D1+JfaKhWO1kpqhGQzYdGrbrJXqPAK3j4SqZgcfuU1L9GHMthrShWresMuBJPD13Hn7uVWY9SGuMEIdg8npTwKdAfJb3K1gMUYLlFZJYBPNjrlV9vGiLgdQlnM8rz5q36K798f3eZl2WTdED1vvq86iio61laNZUYwVTRxp7vvEhYnlO6Fp/pm1rvrEQWP7x8HLRUVmZjZsApynxQCcmToRXgEQilY7TaaYkTb9Pu/fxwQDwrceW6cGUplqRjqBUqrlEUf81c/aj6dxE6ckfwW87Jm/XrZMbTF/3whl2WeWYAav5kFquvewIDAQABAoIBAHDzn164rPNyI+qHkSBuwgRZKqAvbL25sD1+M850/Qw6T7f/1Wrr7EW+zOrbIUWsecjpooV1zCEw3BxyfP4O1rUQdSzG62GkUkc1Ji8k7sNbk9InTNF5G3ka/KY5HFEJJdlOvYdYkIvcLvOYwtBRsJguyvUokmKYrV69bDe9Y5bssmcn16rx9vRE8/2/SG659XHkgIUV5/rrQWsinveZGIuaPcu6xeMYcgjNZgZievkmLHeiYCyTpDGu46EVvNAk8yxp7HZTLANhQDuy73soVNuFKmcS0AASr/jXQ9LePk6Iqp7p4ng4nnll4OlUsCw8uFpPx5P1bnLgEa7BvnXtwiECgYEA8VWIetEPCr3DOFMaSKrc1j4kZ5RpcjpCjodphHQqrtLKT/Q96rMxFPz2zzoHMaGgH49nyqrnsMszzRxMaCCKBDydC+7Y6WlsqKUZZteZLmFvDrDTlKQPPmpYjPf5PAh3Bx6J7ex9UyAZa9mN9WtF6Jzynz2iZ8mZGNhQpDY1x2MCgYEAzdmphb4IddN2QYg2ON5dH1xmSdaSxE3UQnFoEWgm3s942A05T5oIEsHzS/zd49tszbmlIdNqFqmtQzxK+IPdD18StLpc0CSnKePIKSkckBzoIhciPzEaeMxYOYHGWYpLfC/leP1H/7l/hy9zNj82SPck6gr/AGe7zRJ5ecMJrwkCgYARJiPRnmN0PvHNYdJfUYzpyHaryZcIn+001ZiA6gRScfYgYlm4AM2/EQ60wQnb1AFd3MHiW+yk2nuu2pDvYUiNboU2YN2XEH/BKCI69Z0T96Z9o8EVMedHZyUttz1Fr9BNeDUS7BgnvQMxb78vrlTEZ8qx2B5fQ6sWYeCxGo0NwwKBgAYpoAOa/tHYNNAdbdIiBhOsRnuratVppxMeJglvXsqI14tQSgjyCY/WMpxxw4rQxN8b0a/DjoeDKOa8ZVovSGzvYbX7Zk/s6Pw+D3379xjxZJmwq5vMsogvReziz7dahov/OxV2L7OeMA0yBHb5SXzBuV8wWRYABQVMqkpU5nNRAoGAa0XYWl1Ipv0cnh2oxxmg6d7Dg6a5Yietp27+cWgGugSc+kXyxZYLqKbjypYw+SwcJEwd36Q0UnQ+CB32hcx8P+5o1UIaUjtYGsFMkNGstkTROiJWUZP/FaajH46hk0RCkIFa1iVbqFXNEtvRASiOvBpK/eo0pgECZojEcGewVks=',
  alipayPublicKey:
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqMIRrBP83x0XrVbLecjQ2nUnKAKLaEVJtlkL9fIp9lff0m6nI9jEZh4N1RjrMbL4N6vLHiewpHrL1cnYkmUql8GCuXmYSl2ZItm2rdF90GZ1LrVzOoZVLprcjK8wYyO+eYF5qOnhQglLkKagqrv4bfIn5tZ2/5sg6AdMSco97/mZARPdiCd7KzabHbQRz/RfdUmJYtEs7mUkn4jz/GGzWKB1xTX8l84H4S2k86FfwfgfuGzpmdjxZ+a5YZlQFOTKCAwdVRmoSmIyhIL3YVnd51kMM7Lu6iyHPSjnKgNSwiQqicaYWteOw+HuK5X7q6lJuO6P9sVfPTXYZk0+N/iEfQIDAQAB',
  gateway: 'https://openapi.alipay.com/gateway.do',
}; // 支付宝当面付-自然博客直播

export const SERVER_LIVE = {
  PushDomain:
    PROJECT_ENV === PROJECT_ENV_ENUM.development
      ? `rtmp://${IP_URL.ali.localIp}`
      : 'rtmp://srs-push.hsslive.cn', // 推流域名
  PullDomain:
    PROJECT_ENV === PROJECT_ENV_ENUM.development
      ? `http://${IP_URL.ali.localIp}:${SRS_CONFIG.docker.port['8080']}`
      : 'https://srs-pull.hsslive.cn', // 拉流域名
  AppName: 'livestream',
};
