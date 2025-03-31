import Router from 'koa-router';

import mqController from '@/controller/mq.controller';

const mqRouter = new Router({ prefix: '/mq' });

mqRouter.get('/create', mqController.create);

mqRouter.get('/publish', mqController.publish);

export default mqRouter;
