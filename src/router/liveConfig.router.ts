import Router from 'koa-router';

import { apiVerifyAuth } from '@/app/verify.middleware';
import { DEFAULT_AUTH_INFO } from '@/constant';
import liveConfigController from '@/controller/liveConfig.controller';

const liveConfigRouter = new Router({ prefix: '/live_config' });

liveConfigRouter.get('/list', liveConfigController.getList);

liveConfigRouter.get('/detail', liveConfigController.getDetail);

liveConfigRouter.get('/find/:id', liveConfigController.find);

liveConfigRouter.get('/find_by_key/:key', liveConfigController.findByKey);

liveConfigRouter.post(
  '/create',
  apiVerifyAuth([DEFAULT_AUTH_INFO.LIVE_MANAGE.auth_value]),
  liveConfigController.create
);

liveConfigRouter.put(
  '/update/:id',
  apiVerifyAuth([DEFAULT_AUTH_INFO.LIVE_MANAGE.auth_value]),
  liveConfigController.update
);

liveConfigRouter.delete(
  '/delete/:id',
  apiVerifyAuth([DEFAULT_AUTH_INFO.LIVE_MANAGE.auth_value]),
  liveConfigController.delete
);

export default liveConfigRouter;
