import Router from 'koa-router';

import otherController from '@/controller/other.controller';

const otherRouter = new Router({ prefix: '/other' });

// 获取运行信息
otherRouter.get('/server_info', otherController.getServerInfo);

// 获取客户端ip
otherRouter.get('/get_client_ip', otherController.getClientIp);

otherRouter.get('/health_check_flv', otherController.healthCheckByFlv);

otherRouter.get('/health_check_hls', otherController.healthCheckByHls);

export default otherRouter;
