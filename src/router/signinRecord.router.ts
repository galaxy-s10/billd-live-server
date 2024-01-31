import Router from 'koa-router';

import signinRecordController from '@/controller/signinRecord.controller';

const signinRecordRouter = new Router({ prefix: '/signin_record' });

signinRecordRouter.get('/list', signinRecordController.getList);

signinRecordRouter.post('/create', signinRecordController.create);

signinRecordRouter.get(
  '/today_is_signin',
  signinRecordController.todayIsSignin
);

export default signinRecordRouter;
