import Router from 'koa-router';

import successHandler from '@/app/handler/success-handle';
import DBController from '@/config/websocket/mysql.controller';

const liveRouter = new Router({ prefix: '/live' });

// 黑名单列表
liveRouter.get('/list', async (ctx, next) => {
  const result = await DBController.getAllLiveRoom();
  successHandler({ ctx, data: result });
  await next();
});

export default liveRouter;
