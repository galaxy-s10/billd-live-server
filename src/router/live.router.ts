import Router from 'koa-router';

import liveController from '@/controller/live.controller';

const liveRouter = new Router({ prefix: '/live' });

liveRouter.get('/list', liveController.getList);

export default liveRouter;
