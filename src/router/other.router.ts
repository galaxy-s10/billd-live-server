import Router from 'koa-router';

import otherController from '@/controller/other.controller';

const otherRouter = new Router({ prefix: '/other' });

// 发送验证码
otherRouter.post('/send_email', otherController.sendCode);

export default otherRouter;
