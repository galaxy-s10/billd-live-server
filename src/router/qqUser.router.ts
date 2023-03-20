import Router from 'koa-router';

import qqUserController from '@/controller/qqUser.controller';
import { verifyProp } from '@/middleware/qqUser.middleware';

const qqUserRouter = new Router({ prefix: '/qq_user' });

/**
 * WARN:中间件接收两个参数，ctx和next，如果这个中间件是异步的（即加了async）
 * 则这个中间件必须调用next时必须加上await，如果是直接next，就会直接返回404给前端！不会继续触发下一个中间件！！！
 */

// 用户列表
qqUserRouter.get('/list', qqUserController.list);

// 用户qq登录
qqUserRouter.post('/login', verifyProp, qqUserController.login);

// 绑定qq
qqUserRouter.post('/bind_qq', verifyProp, qqUserController.bindQQ);

// 取消绑定qq
qqUserRouter.post('/cancel_bind_qq', verifyProp, qqUserController.cancelBindQQ);

// 查找用户
qqUserRouter.get('/find/:id', qqUserController.find);

// 更新用户
qqUserRouter.put('/update/:id', qqUserController.update);

// 删除用户
qqUserRouter.delete('/delete/:id', qqUserController.delete);

export default qqUserRouter;
