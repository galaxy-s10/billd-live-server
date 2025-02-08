import Router from 'koa-router';

import { apiVerifyAuth } from '@/app/verify.middleware';
import { DEFAULT_AUTH_INFO } from '@/constant';
import globalMsgController from '@/controller/globalMsg.controller';

const globalMsgRouter = new Router({ prefix: '/global_msg' });

globalMsgRouter.get(
  '/list',
  apiVerifyAuth([DEFAULT_AUTH_INFO.USER_MANAGE.auth_value]),
  globalMsgController.getList
);

globalMsgRouter.post(
  '/create',
  apiVerifyAuth([DEFAULT_AUTH_INFO.USER_MANAGE.auth_value]),
  globalMsgController.create
);

globalMsgRouter.get('/global', globalMsgController.getGlobal);

globalMsgRouter.get('/find/:id', globalMsgController.find);

globalMsgRouter.post('/update/:id', globalMsgController.update);

export default globalMsgRouter;
