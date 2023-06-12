import Router from 'koa-router';

import otherController from '@/controller/other.controller';

const otherRouter = new Router({ prefix: '/other' });

// 获取运行信息
otherRouter.get('/server_info', otherController.getServerInfo);

export default otherRouter;
