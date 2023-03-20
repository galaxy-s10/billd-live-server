import Router from 'koa-router';

import positionController from '@/controller/position.controller';

const positionRouter = new Router({ prefix: '/position' });

positionRouter.get('/get', positionController.get);

export default positionRouter;
