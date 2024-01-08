import Router from 'koa-router';

import { apiVerifyAuth } from '@/app/verify.middleware';
import { DEFAULT_AUTH_INFO } from '@/constant';
import initController from '@/controller/init.controller';

const initRouter = new Router({ prefix: '/init' });

// 初始化角色
initRouter.post(
  '/role',
  apiVerifyAuth([DEFAULT_AUTH_INFO.ALL_AUTH.auth_value]),
  initController.initRole
);

// 初始化权限
initRouter.post(
  '/auth',
  apiVerifyAuth([DEFAULT_AUTH_INFO.ALL_AUTH.auth_value]),
  initController.initAuth
);

// 初始化角色权限
initRouter.post(
  '/role_auth',
  apiVerifyAuth([DEFAULT_AUTH_INFO.ALL_AUTH.auth_value]),
  initController.initRoleAuth
);

// 初始化商品
initRouter.post(
  '/goods',
  apiVerifyAuth([DEFAULT_AUTH_INFO.ALL_AUTH.auth_value]),
  initController.initGoods
);

// 初始化时间表
initRouter.post(
  '/day_data',
  apiVerifyAuth([DEFAULT_AUTH_INFO.ALL_AUTH.auth_value]),
  initController.initDayData
);

// 初始化时间表
initRouter.post(
  '/hour_data',
  apiVerifyAuth([DEFAULT_AUTH_INFO.ALL_AUTH.auth_value]),
  initController.initHourData
);

// 初始化用户
initRouter.post(
  '/user',
  apiVerifyAuth([DEFAULT_AUTH_INFO.ALL_AUTH.auth_value]),
  initController.initUser
);

// 初始化用户钱包
initRouter.post(
  '/user_wallet',
  apiVerifyAuth([DEFAULT_AUTH_INFO.ALL_AUTH.auth_value]),
  initController.initUserWallet
);

// 重建表
initRouter.post(
  '/force_table',
  apiVerifyAuth([DEFAULT_AUTH_INFO.ALL_AUTH.auth_value]),
  initController.forceTable
);

// 删除某个用户（包括他的所有信息）
initRouter.post(
  '/delete_user',
  apiVerifyAuth([DEFAULT_AUTH_INFO.ALL_AUTH.auth_value]),
  initController.deleteUser
);

export default initRouter;
