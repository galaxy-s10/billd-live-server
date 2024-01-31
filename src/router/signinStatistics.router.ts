import Router from 'koa-router';

import signinStatisticsController from '@/controller/signinStatistics.controller';

const signinStatisticsRouter = new Router({ prefix: '/signin_statistics' });

signinStatisticsRouter.get('/list', signinStatisticsController.getList);

export default signinStatisticsRouter;
