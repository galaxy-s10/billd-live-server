import Router from 'koa-router';

import tencentcloudCssController from '@/controller/tencentcloudCss.controller';

const tencentcloudCssRouter = new Router({ prefix: '/tencentcloud_css' });

tencentcloudCssRouter.post('/push', tencentcloudCssController.push);

export default tencentcloudCssRouter;
