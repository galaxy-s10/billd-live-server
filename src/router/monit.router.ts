import Router from 'koa-router';

import monitController from '@/controller/monit.controller';

const monitRouter = new Router({ prefix: '/monit' });

// 监控列表
monitRouter.get('/list', monitController.getList);

export default monitRouter;
