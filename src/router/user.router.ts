import Router from 'koa-router';

import userController from '@/controller/user.controller';
import { verifyProp } from '@/middleware/user.middleware';

const userRouter = new Router({ prefix: '/user' });

// 账号密码登录
userRouter.post('/login', verifyProp, userController.login);

// 用户列表
userRouter.get('/list', userController.list);

// 获取用户信息
userRouter.get('/get_user_info', userController.getUserInfo);

// 查找用户
userRouter.get('/find/:id', userController.find);

// 修改密码
userRouter.put('/update_pwd', userController.updatePwd);

// 更新用户角色
userRouter.put(
  '/update_user_role/:id',
  verifyProp,
  userController.updateUserRole
);

export default userRouter;
