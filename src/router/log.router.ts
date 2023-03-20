import Router from 'koa-router';

import logController from '@/controller/log.controller';

const logRouter = new Router({ prefix: '/log' });

// 标签列表
logRouter.get('/list', logController.getList);

export default logRouter;
