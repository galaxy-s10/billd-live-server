import Router from 'koa-router';

import frontendController from '@/controller/frontend.controller';

const statisRouter = new Router({ prefix: '/statis' });

statisRouter.get('/detail', frontendController.getStatis);

export default statisRouter;
