import Router from 'koa-router';

import { apiVerifyAuth } from '@/app/verify.middleware';
import { DEFAULT_AUTH_INFO } from '@/constant';
import wsMessageController from '@/controller/wsMessage.controller';

const wsMessageRouter = new Router({ prefix: '/ws_message' });

wsMessageRouter.get('/find/:id', wsMessageController.find);

wsMessageRouter.get('/list', wsMessageController.getList);

wsMessageRouter.post(
  '/update',
  apiVerifyAuth([DEFAULT_AUTH_INFO.LIVE_MANAGE.auth_value]),
  wsMessageController.update
);

export default wsMessageRouter;
