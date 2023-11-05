import Router from 'koa-router';

import liveController from '@/controller/live.controller';

const liveRouter = new Router({ prefix: '/live' });

liveRouter.get('/list', liveController.getList);

liveRouter.post('/close_live', liveController.closeLive);

liveRouter.get('/is_live', liveController.isLive);

export default liveRouter;
