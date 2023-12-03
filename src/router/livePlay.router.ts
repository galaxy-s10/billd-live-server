import Router from 'koa-router';

import livePlayController from '@/controller/livePlay.controller';

const liveRouter = new Router({ prefix: '/live_play' });

liveRouter.get('/list', livePlayController.getList);

export default liveRouter;
