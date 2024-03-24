import Router from 'koa-router';

import liveController from '@/controller/live.controller';

const liveRouter = new Router({ prefix: '/live' });

liveRouter.get('/list', liveController.getList);

liveRouter.post('/close_live', liveController.closeLive);

liveRouter.get('/is_live', liveController.isLive);

liveRouter.get('/forward_list', liveController.getForwardList);

liveRouter.post('/kill_forward/:pid', liveController.killForward);

export default liveRouter;
