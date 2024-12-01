import { prodDomain } from './spec-config';
import { resolveApp } from './utils';

export enum PROJECT_ENV_ENUM {
  development = 'development',
  prod = 'prod',
  beta = 'beta',
}

export const PROJECT_ALIAS = process.env
  .NODE_APP_RELEASE_PROJECT_ALIAS as string;
export const PROJECT_NAME = process.env.NODE_APP_RELEASE_PROJECT_NAME as string;
export const PROJECT_ENV = process.env
  .NODE_APP_RELEASE_PROJECT_ENV as PROJECT_ENV_ENUM;
export const PROJECT_PORT = process.env.NODE_APP_RELEASE_PROJECT_PORT as string;
export const PROJECT_NODE_ENV = process.env.NODE_ENV as string;
export const PROJECT_INIT_MYSQL = process.env.NODE_APP_INIT_MYSQL as string;

// 七牛云文件上传进度类型
export enum QINIU_UPLOAD_PROGRESS_TYPE {
  fileProgress = 1,
  chunkFileProgress = 2,
}

export const CORS_ALLOW_ORIGIN: string | string[] = [
  `http://www.${prodDomain}`,
  `https://www.${prodDomain}`,
  `http://admin.${prodDomain}`,
  `https://admin.${prodDomain}`,
  `http://live.${prodDomain}`,
  `https://live.${prodDomain}`,
  `http://live-admin.${prodDomain}`,
  `https://live-admin.${prodDomain}`,
  `http://nuxt2.${prodDomain}`,
  `https://nuxt2.${prodDomain}`,
  `http://next.${prodDomain}`,
  `https://next.${prodDomain}`,
  `http://project.${prodDomain}`,
  `https://project.${prodDomain}`,
  `http://desk.${prodDomain}`,
  `https://desk.${prodDomain}`,
];

/** 消息最大长度 */
export const MSG_MAX_LENGTH = 200;
export const MAX_TOKEN_EXP = 24 * 90; // token过期时间：90天

export const VIDEO_DIR =
  PROJECT_ENV === PROJECT_ENV_ENUM.prod
    ? resolveApp(`/dist/video/`)
    : resolveApp(`/video/`); // video文件目录

export const WEBM_DIR =
  PROJECT_ENV === PROJECT_ENV_ENUM.prod
    ? resolveApp(`/dist/webm/`)
    : resolveApp(`/webm/`); // webm文件目录

export const STATIC_DIR =
  PROJECT_ENV === PROJECT_ENV_ENUM.prod
    ? resolveApp('/dist/public/')
    : resolveApp('/public/'); // 静态文件目录

export const UPLOAD_DIR =
  PROJECT_ENV === PROJECT_ENV_ENUM.prod
    ? resolveApp('/dist/upload/')
    : resolveApp('/upload/'); // 上传文件接口接收到的文件存放的目录

export const SECRET_DEV_FILE =
  PROJECT_ENV === PROJECT_ENV_ENUM.prod
    ? resolveApp('/dist/secret/secret-dev.js')
    : resolveApp('/src/secret/secret-dev.ts'); // 秘钥文件

export const SECRET_BETA_FILE =
  PROJECT_ENV === PROJECT_ENV_ENUM.prod
    ? resolveApp('/dist/secret/secret-beta.js')
    : resolveApp('/src/secret/secret-beta.ts'); // 秘钥文件

export const SECRET_PROD_FILE =
  PROJECT_ENV === PROJECT_ENV_ENUM.prod
    ? resolveApp('/dist/secret/secret-prod.js')
    : resolveApp('/src/secret/secret-prod.ts'); // 秘钥文件

export const SECRET_TEMPLATE_FILE =
  PROJECT_ENV === PROJECT_ENV_ENUM.prod
    ? resolveApp('/dist/secret/secret-template.js')
    : resolveApp('/src/secret/secret-template.ts'); // 秘钥文件模板

export const MAX_BITRATE = 1000 * 3; // 最大码率，3m

export const SERVER_VIDEO_DIR = '/node/video/'; // 服务器video目录
export const LOCALHOST_URL = 'localhost'; // 本地地址，一般是localhost或者127.0.0.1，但也可以是其他本地地址，如192.168.x.x
export const DOMAIN_URL = 'localhost'; // 本地地址，一般是localhost或者127.0.0.1，但也可以是其他本地地址，如192.168.x.x

export const COMMON_ERROR_CODE = {
  serverError: 10000, // 服务器错误
  banIp: 1000, // 黑名单禁用了ip
  userStatusIsDisable: 1001, // 你的账号已被禁用，请联系管理员处理！
  notFound: 1002, // 返回了404的http状态码
  errStatusCode: 1003, // 返回了即不是200也不是404的http状态码
  shutdown: 1004, // 停机维护
  idOrPwdError: 1005, // 账号或密码错误！
  usernameOrPwdError: 1006, // 用户名或密码错误！
  todayAlreadySignin: 1007, // 今天已签到过了！
  alreadyGetRedbag: 1008, // 今天已签到过了！
  redbagAlreadySnatched: 1009, // 红包已经被抢完！
  balanceNotEnough: 1010, // 余额不足
  userStatusNoNormal: 1011, // 用户状态非正常
};

export const COMMON_HTTP_CODE = {
  success: 200, // 成功
  apiCache: 304, // 接口缓存
  paramsError: 400, // 参数错误
  unauthorized: 401, // 未授权
  forbidden: 403, // 权限不足
  notFound: 404, // 未找到
  methodNotAllowed: 405, // 方法不允许，如：服务端提供了一个get的/api/list接口，但客户端却post了/api/list接口
  serverError: 500, // 服务器错误
};

export const COMMON_ERROE_MSG = {
  banIp: '此ip已被禁用，请联系管理员处理！', // 此ip已被禁用，请联系管理员处理！
  jwtExpired: '登录信息过期！', // 登录信息过期！
  invalidToken: '非法token！', // 非法token！
  userStatusIsDisable: '你的账号已被禁用，请联系管理员处理！', // 你的账号已被禁用，请联系管理员处理！
  userStatusNoNormal: '用户状态非正常', // 你的账号已被管理员禁用，请联系管理员处理！
  shutdown: '停机维护中', // 停机维护中

  noLogin: '未登录', // 未登录
  paramsError: '参数错误！', // 参数错误！
  unauthorized: '未授权！', // 未授权！
  forbidden: '权限不足！', // 权限不足！
  notFound: '未找到！', // 未找到！
  serverError: '服务器错误！', // 服务器错误！
  idOrPwdError: '账号或密码错误！', // 账号或密码错误！
  usernameOrPwdError: '用户名或密码错误！', // 用户名或密码错误！
  todayAlreadySignin: '今天已签到过了！', // 今天已签到过了！
  alreadyGetRedbag: '你已经领取过红包', // 你已经领取过红包
  redbagAlreadySnatched: '红包已经被抢完！', // 红包已经被抢完！
};

export const COMMON_SUCCESS_MSG = {
  GET: '获取成功！',
  POST: '新增成功！',
  PUT: '修改成功！',
  DELETE: '删除成功！',

  loginSuccess: '登录成功！',
};

export const BLACKLIST_TYPE = {
  banIp: 1, // 频繁操作
  adminDisableUser: 2, // 被管理员禁用
};

export const SCHEDULE_TYPE = {
  verifyStream: 'handleVerifyStream',
  blobIsExist: 'blobIsExist',
  liveRoomIsLive: 'liveRoomIsLive',
};

export const REDIS_PREFIX_ENV = `${PROJECT_NAME}-${PROJECT_ENV}-`;

// redis前缀
export const REDIS_PREFIX = {
  emailLogin: `${REDIS_PREFIX_ENV}emailLogin___`, // 邮箱登录
  emailRegister: `${REDIS_PREFIX_ENV}emailRegister___`, // 邮箱注册
  userBindEmail: `${REDIS_PREFIX_ENV}userBindEmail___`, // 用户绑定邮箱
  userCancelBindEmail: `${REDIS_PREFIX_ENV}userCancelBindEmail___`, // 用户取消绑定邮箱
  joined: `${REDIS_PREFIX_ENV}joined___`, // 用户加入了房间
  roomIsLiveing: `${REDIS_PREFIX_ENV}roomIsLiveing___`, // 主播正在直播
  order: `${REDIS_PREFIX_ENV}order___`, // 订单
  fileProgress: `${REDIS_PREFIX_ENV}fileProgress___`, // 文件上传进度
  qrCodeLogin: `${REDIS_PREFIX_ENV}qrCodeLogin___`, // 二维码登录
  disableSpeaking: `${REDIS_PREFIX_ENV}disableSpeaking___`, // 禁言用户
  kick: `${REDIS_PREFIX_ENV}kick___`, // 踢掉用户
  liveRoomOnlineUser: `${REDIS_PREFIX_ENV}liveRoomOnlineUser___`, // 直播间在线用户
  socketIdJoinLiveRoom: `${REDIS_PREFIX_ENV}socketIdJoinLiveRoom___`,
  livePkKey: `${REDIS_PREFIX_ENV}livePkKey___`, // 直播间打pk秘钥
  dbLiveList: `${REDIS_PREFIX_ENV}dbLiveList___`, // 直播间在线列表
  dbLiveRoomHistoryMsgList: `${REDIS_PREFIX_ENV}dbLiveRoomHistoryMsgList___`, // 直播间历史消息
  deskUserUuid: `${REDIS_PREFIX_ENV}deskUserUuid___`,
  deskUserSocketId: `${REDIS_PREFIX_ENV}deskUserSocketId___`,
  tencentcloudCssPublishing: `${REDIS_PREFIX_ENV}tencentcloudCssPublishing___`,
  srsPublishing: `${REDIS_PREFIX_ENV}srsPublishing___`,
  rtcLiving: `${REDIS_PREFIX_ENV}rtcLiving___`,
  keepJoined: `${REDIS_PREFIX_ENV}keepJoined___`, // 用户加入了房间
};

export const IS_UPLOAD_SERVER = !(PROJECT_ENV === PROJECT_ENV_ENUM.prod); // 是否上传到服务器

// 平台类型
export const THIRD_PLATFORM = {
  website: 1, // 站内（user表里面的用户就是这个类型，但是不记录在third_user表里）
  qq: 2, // qq
  wechat: 3, // wechat
};

export const DEFAULT_AUTH_INFO = {
  ALL_AUTH: {
    id: 1,
    auth_value: 'ALL_AUTH',
  },
  USER_MANAGE: {
    id: 2,
    auth_value: 'USER_MANAGE',
  },
  ROLE_MANAGE: {
    id: 3,
    auth_value: 'ROLE_MANAGE',
  },
  AUTH_MANAGE: {
    id: 4,
    auth_value: 'AUTH_MANAGE',
  },
  MESSAGE_MANAGE: {
    id: 5,
    auth_value: 'MESSAGE_MANAGE',
  },
  MESSAGE_SEND: {
    id: 6,
    auth_value: 'MESSAGE_SEND',
  },
  MESSAGE_DISABLE: {
    id: 7,
    auth_value: 'MESSAGE_DISABLE',
  },
  LOG_MANAGE: {
    id: 8,
    auth_value: 'LOG_MANAGE',
  },
  LIVE_MANAGE: {
    id: 9,
    auth_value: 'LIVE_MANAGE',
  },
  LIVE_PUSH: {
    id: 10,
    auth_value: 'LIVE_PUSH',
  },
  LIVE_PULL: {
    id: 11,
    auth_value: 'LIVE_PULL',
  },
  LIVE_PULL_SVIP: {
    id: 12,
    auth_value: 'LIVE_PULL_SVIP',
  },
  LIVE_PUSH_CDN: {
    id: 13,
    auth_value: 'LIVE_PUSH_CDN',
  },
  LIVE_PUSH_FORWARD_BILIBILI: {
    id: 14,
    auth_value: 'LIVE_PUSH_FORWARD_BILIBILI',
  },
  LIVE_PUSH_FORWARD_HUYA: {
    id: 15,
    auth_value: 'LIVE_PUSH_FORWARD_HUYA',
  },
  LIVE_PUSH_FORWARD_DOUYU: {
    id: 16,
    auth_value: 'LIVE_PUSH_FORWARD_DOUYU',
  },
  LIVE_PUSH_FORWARD_DOUYIN: {
    id: 17,
    auth_value: 'LIVE_PUSH_FORWARD_DOUYIN',
  },
  LIVE_PUSH_FORWARD_KUAISHOU: {
    id: 18,
    auth_value: 'LIVE_PUSH_FORWARD_KUAISHOU',
  },
  LIVE_PUSH_FORWARD_XIAOHONGSHU: {
    id: 19,
    auth_value: 'LIVE_PUSH_FORWARD_XIAOHONGSHU',
  },
};

export const DEFAULT_ROLE_INFO = {
  ALL_ROLE: {
    id: 1,
    role_value: 'ALL_ROLE',
  },
  ADMIN: {
    id: 2,
    role_value: 'ADMIN',
  },
  SUPER_ADMIN: {
    id: 3,
    role_value: 'SUPER_ADMIN',
  },
  LIVE_ADMIN: {
    id: 4,
    role_value: 'LIVE_ADMIN',
  },
  USER: {
    id: 5,
    role_value: 'USER',
  },
  VIP_USER: {
    id: 6,
    role_value: 'VIP_USER',
  },
  SVIP_USER: {
    id: 7,
    role_value: 'SVIP_USER',
  },
  TOURIST_USER: {
    id: 8,
    role_value: 'TOURIST_USER',
  },
};

export const SRS_CB_URL_QUERY = {
  publishKey: 'pushkey',
  publishType: 'pushtype',
  userToken: 'usertoken',
  userId: 'userid',
  randomId: 'randomid',
  roomId: 'roomid',
  isdev: 'isdev',
};

export const LIVE_ROOM_MODEL_EXCLUDE = [
  'push_rtmp_url',
  'push_obs_server',
  'push_obs_stream_key',
  'push_webrtc_url',
  'push_srt_url',
  'push_cdn_rtmp_url',
  'push_cdn_obs_server',
  'push_cdn_obs_stream_key',
  'push_cdn_webrtc_url',
  'push_cdn_srt_url',
  'forward_bilibili_url',
  'forward_huya_url',
  'forward_douyu_url',
  'forward_douyin_url',
  'forward_kuaishou_url',
  'forward_xiaohongshu_url',
];
