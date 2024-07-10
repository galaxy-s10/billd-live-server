import Router from 'koa-router';

import { apiVerifyAuth } from '@/app/verify.middleware';
import { DEFAULT_AUTH_INFO } from '@/constant';
import settingsController from '@/controller/settings.controller';

const settingsRouter = new Router({ prefix: '/settings' });

settingsRouter.get('/list', settingsController.getList);

settingsRouter.get('/find/:id', settingsController.find);

settingsRouter.post('/create', settingsController.create);

settingsRouter.put(
  '/update/:id',
  apiVerifyAuth([DEFAULT_AUTH_INFO.AUTH_MANAGE.auth_value]),
  settingsController.update
);

settingsRouter.delete(
  '/delete/:id',
  apiVerifyAuth([DEFAULT_AUTH_INFO.AUTH_MANAGE.auth_value]),
  settingsController.delete
);

export default settingsRouter;
