import Router from 'koa-router';

import bilibiliController from '@/controller/bilibili.controller';

const bilibiliRouter = new Router({ prefix: '/bilibili' });

bilibiliRouter.get(
  '/api_live_bilibili_com_getUserRecommend',
  bilibiliController.getUserRecommend
);

bilibiliRouter.get('/api_live_bilibili_com_get', bilibiliController.get);

bilibiliRouter.post('/api_live_bilibili_com_post', bilibiliController.post);

export default bilibiliRouter;
