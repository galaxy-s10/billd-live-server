import Router from 'koa-router';

import { apiVerifyAuth, apiVerifyEnv } from '@/app/verify.middleware';
import { DEFAULT_AUTH_INFO, PROJECT_ENV_ENUM } from '@/constant';
import initController from '@/controller/init.controller';

const initRouter = new Router({ prefix: '/init' });

// 初始化角色
initRouter.post(
  '/role',
  apiVerifyEnv([PROJECT_ENV_ENUM.development]),
  apiVerifyAuth([DEFAULT_AUTH_INFO.ALL_AUTH.auth_value]),
  initController.initRole
);

// 初始化权限
initRouter.post(
  '/auth',
  apiVerifyEnv([PROJECT_ENV_ENUM.development]),
  // apiVerifyAuth([DEFAULT_AUTH_INFO.ALL_AUTH.auth_value]),
  initController.initAuth
);

// 初始化角色权限
initRouter.post(
  '/role_auth',
  apiVerifyEnv([PROJECT_ENV_ENUM.development]),
  // apiVerifyAuth([DEFAULT_AUTH_INFO.ALL_AUTH.auth_value]),
  initController.initRoleAuth
);

// 初始化角色、权限、角色权限
initRouter.post(
  '/rbac',
  apiVerifyEnv([PROJECT_ENV_ENUM.development]),
  // apiVerifyAuth([DEFAULT_AUTH_INFO.ALL_AUTH.auth_value]),
  initController.rbacMode
);

// 初始化商品
initRouter.post(
  '/goods',
  apiVerifyEnv([PROJECT_ENV_ENUM.development]),
  apiVerifyAuth([DEFAULT_AUTH_INFO.ALL_AUTH.auth_value]),
  initController.initGoods
);

// 初始化时间表
initRouter.post(
  '/day_data',
  apiVerifyEnv([PROJECT_ENV_ENUM.development]),
  apiVerifyAuth([DEFAULT_AUTH_INFO.ALL_AUTH.auth_value]),
  initController.initDayData
);

// 初始化时间表
initRouter.post(
  '/hour_data',
  apiVerifyEnv([PROJECT_ENV_ENUM.development]),
  apiVerifyAuth([DEFAULT_AUTH_INFO.ALL_AUTH.auth_value]),
  initController.initHourData
);

// 初始化时间表
initRouter.post(
  '/minute_ten_data',
  apiVerifyEnv([PROJECT_ENV_ENUM.development]),
  apiVerifyAuth([DEFAULT_AUTH_INFO.ALL_AUTH.auth_value]),
  initController.initMinuteTenData
);
// 初始化时间表
initRouter.post(
  '/minute_thirty_data',
  apiVerifyEnv([PROJECT_ENV_ENUM.development]),
  apiVerifyAuth([DEFAULT_AUTH_INFO.ALL_AUTH.auth_value]),
  initController.initMinuteThirtyData
);

// 初始化用户
initRouter.post(
  '/user',
  apiVerifyEnv([PROJECT_ENV_ENUM.development]),
  apiVerifyAuth([DEFAULT_AUTH_INFO.ALL_AUTH.auth_value]),
  initController.initUser
);

// 初始化用户钱包
initRouter.post(
  '/user_wallet',
  apiVerifyEnv([PROJECT_ENV_ENUM.development]),
  apiVerifyAuth([DEFAULT_AUTH_INFO.ALL_AUTH.auth_value]),
  initController.initUserWallet
);

// 重建表
initRouter.post(
  '/force_table',
  apiVerifyEnv([PROJECT_ENV_ENUM.development]),
  apiVerifyAuth([DEFAULT_AUTH_INFO.ALL_AUTH.auth_value]),
  initController.forceTable
);

// 删除某个用户（包括他的所有信息）
initRouter.post(
  '/delete_user',
  apiVerifyEnv([PROJECT_ENV_ENUM.development]),
  apiVerifyAuth([DEFAULT_AUTH_INFO.ALL_AUTH.auth_value]),
  initController.deleteUser
);

initRouter.post('/resetLiveRoomUrl', initController.resetLiveRoomUrl);

export default initRouter;
