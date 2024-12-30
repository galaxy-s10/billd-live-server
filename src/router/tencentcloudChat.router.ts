import Router from 'koa-router';

import tencentcloudChatController from '@/controller/tencentcloudChat.controller';

const tencentcloudChatRouter = new Router({ prefix: '/tencentcloud_chat' });

tencentcloudChatRouter.post(
  '/gen_user_sig',
  tencentcloudChatController.genUserSigRoute
);

export default tencentcloudChatRouter;
