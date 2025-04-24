import Router from 'koa-router';

import { apiVerifyAuth } from '@/app/verify.middleware';
import { DEFAULT_AUTH_INFO } from '@/constant';
import msgController from '@/controller/msg.controller';

const msgRouter = new Router({ prefix: '/msg' });

msgRouter.get('/find/:id', msgController.find);

msgRouter.get('/list', msgController.getList);

msgRouter.post('/send', msgController.send);

msgRouter.post(
  '/update',
  apiVerifyAuth([DEFAULT_AUTH_INFO.LIVE_MANAGE.auth_value]),
  msgController.update
);

export default msgRouter;
