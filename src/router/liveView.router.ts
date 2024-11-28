import Router from 'koa-router';

import liveViewController from '@/controller/liveView.controller';

const liveViewRouter = new Router({ prefix: '/live_view' });

liveViewRouter.get('/list', liveViewController.getList);

export default liveViewRouter;
