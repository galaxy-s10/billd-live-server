import Router from 'koa-router';

import otherController from '@/controller/other.controller';

const otherRouter = new Router({ prefix: '/other' });

// 获取运行信息
otherRouter.get('/server_info', otherController.getServerInfo);

// 获取客户端ip
otherRouter.get('/get_client_ip', otherController.getClientIp);

otherRouter.get('/get_policy_by_res', otherController.getPolicyByRes);

export default otherRouter;
