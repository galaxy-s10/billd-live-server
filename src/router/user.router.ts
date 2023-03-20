import Router from 'koa-router';

import userController from '@/controller/user.controller';
import { verifyProp } from '@/middleware/user.middleware';

const userRouter = new Router({ prefix: '/user' });

/**
 * WARN:中间件接收两个参数，ctx和next，如果这个中间件是异步的（即加了async）
 * 则这个中间件必须调用next时必须加上await，如果是直接next，就会直接返回404给前端！不会继续触发下一个中间件！！！
 */

// 用户列表
userRouter.get('/list', userController.list);

// 账号密码登录
userRouter.post('/login', verifyProp, userController.login);

// 获取用户信息
userRouter.get('/get_user_info', userController.getUserInfo);

// 用户注册
userRouter.post('/register', verifyProp, userController.register);

// 创建用户（废弃）
// userRouter.post('/create', userController.create);

// 查找用户
userRouter.get('/find/:id', userController.find);

// 获取密码
userRouter.get('/get_pwd', userController.getPwd);

// 更新用户
userRouter.put('/update/:id', verifyProp, userController.update);

// 修改密码
userRouter.put('/update_pwd', userController.updatePwd);

// 更新用户角色
userRouter.put(
  '/update_user_role/:id',
  verifyProp,
  userController.updateUserRole
);

// 删除用户
userRouter.delete('/delete/:id', userController.delete);

export default userRouter;
