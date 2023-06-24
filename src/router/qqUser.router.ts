import Router from 'koa-router';

import qqUserController from '@/controller/qqUser.controller';

const qqUserRouter = new Router({ prefix: '/qq_user' });

/**
 * WARN:中间件接收两个参数，ctx和next，如果这个中间件是异步的（即加了async）
 * 则这个中间件必须调用next时必须加上await，如果是直接next，就会直接返回404给前端！不会继续触发下一个中间件！！！
 */

// 用户列表
qqUserRouter.get('/list', qqUserController.list);

// 用户qq登录
qqUserRouter.post('/login', qqUserController.login);

// 查找用户
qqUserRouter.get('/find/:id', qqUserController.find);

export default qqUserRouter;
