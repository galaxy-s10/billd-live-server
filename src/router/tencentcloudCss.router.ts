import Router from 'koa-router';

import tencentcloudCssController from '@/controller/tencentcloudCss.controller';

const tencentcloudCssRouter = new Router({ prefix: '/tencentcloud_css' });

tencentcloudCssRouter.post('/push', tencentcloudCssController.push);

tencentcloudCssRouter.get('/remote_auth', tencentcloudCssController.remoteAuth);

tencentcloudCssRouter.post('/on_publish', tencentcloudCssController.onPublish);

tencentcloudCssRouter.post(
  '/on_unpublish',
  tencentcloudCssController.onUnpublish
);

export default tencentcloudCssRouter;
