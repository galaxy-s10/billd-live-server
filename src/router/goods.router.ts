import Router from 'koa-router';

import goodsController from '@/controller/goods.controller';

const goodsRouter = new Router({ prefix: '/goods' });

goodsRouter.get('/list', goodsController.getList);

goodsRouter.get('/find_by_type', goodsController.findByType);

export default goodsRouter;
