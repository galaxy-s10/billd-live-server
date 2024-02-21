import Router from 'koa-router';

import { apiVerifyAuth } from '@/app/verify.middleware';
import { DEFAULT_AUTH_INFO } from '@/constant';
import tencentcloudCssController from '@/controller/tencentcloudCss.controller';

const tencentcloudCssRouter = new Router({ prefix: '/tencentcloud_css' });

tencentcloudCssRouter.post(
  '/push',
  apiVerifyAuth([DEFAULT_AUTH_INFO.LIVE_PULL_SVIP.auth_value]),
  tencentcloudCssController.push
);

export default tencentcloudCssRouter;
