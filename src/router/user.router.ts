import Router from 'koa-router';

import userController from '@/controller/user.controller';
import { verifyProp } from '@/middleware/user.middleware';

const userRouter = new Router({ prefix: '/user' });

// 用户列表
userRouter.get('/list', userController.list);

// 获取用户信息
userRouter.get('/get_user_info', userController.getUserInfo);

// 查找用户
userRouter.get('/find/:id', userController.find);

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
