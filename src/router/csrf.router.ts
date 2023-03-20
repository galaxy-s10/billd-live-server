import { ParameterizedContext } from 'koa';
import Router from 'koa-router';

import successHandler from '@/app/handler/success-handle';

const csrfRouter = new Router({ prefix: '/csrf' });

csrfRouter.get('/get', (ctx: ParameterizedContext, next) => {
  successHandler({ ctx, data: 'ok' });
  return next();
});

export default csrfRouter;
