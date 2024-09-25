import Router from 'koa-router';

import { apiVerifyAuth } from '@/app/verify.middleware';
import { DEFAULT_AUTH_INFO } from '@/constant';
import loginRecordController from '@/controller/loginRecord.controller';

const loginRecordRouter = new Router({ prefix: '/login_record' });

loginRecordRouter.get(
  '/list',
  apiVerifyAuth([DEFAULT_AUTH_INFO.USER_MANAGE.auth_value]),
  loginRecordController.getList
);

loginRecordRouter.get('/my_list', loginRecordController.getMyList);

export default loginRecordRouter;
