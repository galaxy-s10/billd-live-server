import Router from 'koa-router';

import roleAuthController from '@/controller/roleAuth.controller';

const roleAuthRouter = new Router({ prefix: '/role_auth' });

roleAuthRouter.get('/list', roleAuthController.getList);

export default roleAuthRouter;
