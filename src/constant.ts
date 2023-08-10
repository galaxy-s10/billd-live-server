import path from 'path';

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

export const STATIC_DIR = path.join(__dirname, './public/'); // 静态文件目录
export const UPLOAD_DIR = path.join(__dirname, './upload/'); // 上传文件接口接收到的文件存放的目录
export const SECRET_FILE = path.join(
  __dirname,
  PROJECT_ENV === PROJECT_ENV_ENUM.prod
    ? './config/secret.js'
    : './config/secret.ts'
); // 秘钥文件
export const SECRETTEMP_FILE = path.join(
  __dirname,
  PROJECT_ENV === PROJECT_ENV_ENUM.prod
    ? './config/secretTemp.js'
    : './config/secretTemp.ts'
); // 秘钥文件模板
export const QQ_MAIL_CONFIG = {
  from: '2274751790@qq.com', // sender address
  to: '2274751790@qq.com', // list of receivers
};

export const ERROR_HTTP_CODE = {
  serverError: 10000, // 服务器错误
  banIp: 1000,
  adminDisableUser: 1001,
  notFound: 1002, // 返回了404的http状态码
  errStatusCode: 1003, // 返回了即不是200也不是404的http状态码
  shutdown: 1004, // 停机维护
};

export const ALLOW_HTTP_CODE = {
  ok: 200, // 成功
  apiCache: 304, // 接口缓存
  paramsError: 400, // 参数错误
  unauthorized: 401, // 未授权
  forbidden: 403, // 权限不足
  notFound: 404, // 未找到
  serverError: 500, // 服务器错误
};

export const HTTP_ERROE_MSG = {
  paramsError: '参数错误！',
  unauthorized: '未授权！',
  forbidden: '权限不足！',
  notFound: '未找到！',
  serverError: '服务器错误！',
};

export const HTTP_SUCCESS_MSG = {
  GET: '获取成功！',
  POST: '新增成功！',
  PUT: '修改成功！',
  DELETE: '删除成功！',
};

export const BLACKLIST_TYPE = {
  banIp: 1, // 频繁操作
  adminDisableUser: 2, // 被管理员禁用
};

export const SCHEDULE_TYPE = {
  roomIsLiveing: 'roomIsLiveing',
};

export const COMMON_ERR_MSG = {
  banIp: '此ip已被禁用，请联系管理员处理！',
  jwtExpired: '登录信息过期！',
  invalidToken: '非法token！',
  adminDisableUser: '你的账号已被管理员禁用，请联系管理员处理！',
  shutdown: '停机维护中~',
};

// redis前缀
export const REDIS_PREFIX = {
  emailLogin: `${PROJECT_NAME}-${PROJECT_ENV}-emailLogin___`, // 登录不区分前后台
  emailRegister: `${PROJECT_NAME}-${PROJECT_ENV}-emailRegister___`, // 注册不区分前后台
  userBindEmail: `${PROJECT_NAME}-${PROJECT_ENV}-userBindEmail___`, // 用户绑定邮箱
  userCancelBindEmail: `${PROJECT_NAME}-${PROJECT_ENV}-userCancelBindEmail___`, // 用户取消绑定邮箱
  joined: `${PROJECT_NAME}-${PROJECT_ENV}-joined___`, // 游客加入了房间
  roomIsLiveing: `${PROJECT_NAME}-${PROJECT_ENV}-roomIsLiveing___`, // 用户正在直播
  order: `${PROJECT_NAME}-${PROJECT_ENV}-order___`, // 订单
};

// 平台类型
export const THIRD_PLATFORM = {
  website: 1, // 站内（user表里面的用户就是这个类型，但是不记录在third_user表里）
  qq: 2, // qq
};
