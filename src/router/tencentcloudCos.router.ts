import Router from 'koa-router';

import tencentcloudCosController from '@/controller/tencentcloudCos.controller';

const tencentcloudCosRouter = new Router({ prefix: '/tencentcloud_cos' });

tencentcloudCosRouter.get(
  '/policy_by_res',
  tencentcloudCosController.getPolicyByRes
);

export default tencentcloudCosRouter;
