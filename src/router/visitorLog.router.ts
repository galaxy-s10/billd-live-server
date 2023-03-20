import Router from 'koa-router';

import visitorLogController from '@/controller/visitorLog.controller';
import { verifyProp } from '@/middleware/visitorLog.middleware';

const visitorLogRouter = new Router({ prefix: '/visitor_log' });

// 获取历史访问数据
visitorLogRouter.get('/history', visitorLogController.getHistoryVisitTotal);

// 获取当天访问数据
visitorLogRouter.get('/day', visitorLogController.getDayVisitTotal);

// 获取ip访问总数
visitorLogRouter.get('/ip_total', visitorLogController.getIpVisitTotal);

// 访客日志列表（只带用户id，不带用户信息）
visitorLogRouter.get('/list', visitorLogController.getList);

// 访客日志列表（带用户信息）
visitorLogRouter.get('/list2', visitorLogController.getList2);

// 创建访客日志
visitorLogRouter.post('/create', verifyProp, visitorLogController.create);

// 删除访客日志
visitorLogRouter.delete('/delete/:id', visitorLogController.delete);

export default visitorLogRouter;
