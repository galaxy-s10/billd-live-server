import Router from 'koa-router';

import { apiVerifyAuth } from '@/app/verify.middleware';
import { DEFAULT_AUTH_INFO } from '@/constant';
import blacklistController from '@/controller/blacklist.controller';

const blacklistRouter = new Router({ prefix: '/blacklist' });

// 黑名单列表
blacklistRouter.get('/list', blacklistController.getList);

// 创建黑名单
blacklistRouter.post('/create', blacklistController.create);

blacklistRouter.post(
  '/add_admin_disable',
  apiVerifyAuth([DEFAULT_AUTH_INFO.USER_MANAGE.auth_value]),
  blacklistController.addAdminDisable
);

blacklistRouter.post(
  '/del_admin_disable',
  apiVerifyAuth([DEFAULT_AUTH_INFO.USER_MANAGE.auth_value]),
  blacklistController.delAdminDisable
);

blacklistRouter.post(
  '/add_disable_msg',
  apiVerifyAuth([DEFAULT_AUTH_INFO.USER_MANAGE.auth_value]),
  blacklistController.addDisableMsg
);

blacklistRouter.post(
  '/del_disable_msg',
  apiVerifyAuth([DEFAULT_AUTH_INFO.USER_MANAGE.auth_value]),
  blacklistController.delDisableMsg
);

// 查找黑名单
blacklistRouter.get('/find/:id', blacklistController.find);

// 更新黑名单
blacklistRouter.put('/update/:id', blacklistController.update);

// 删除黑名单
blacklistRouter.delete('/delete/:id', blacklistController.delete);

export default blacklistRouter;
