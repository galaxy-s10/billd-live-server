import Router from 'koa-router';

import goodsController from '@/controller/goods.controller';

const goodsRouter = new Router({ prefix: '/goods' });

goodsRouter.get('/list', goodsController.getList);

export default goodsRouter;
