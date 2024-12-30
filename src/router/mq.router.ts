import Router from 'koa-router';

import mqController from '@/controller/mq.controller';

const mqRouter = new Router({ prefix: '/mq' });

mqRouter.get('/create', mqController.create);

export default mqRouter;
