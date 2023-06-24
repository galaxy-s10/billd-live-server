import Router from 'koa-router';

import userController from '@/controller/user.controller';

const userRouter = new Router({ prefix: '/user' });

// 用户列表
userRouter.get('/list', userController.list);

// 获取用户信息
userRouter.get('/get_user_info', userController.getUserInfo);

// 查找用户
userRouter.get('/find/:id', userController.find);

export default userRouter;
