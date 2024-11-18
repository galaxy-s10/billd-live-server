import Router from 'koa-router';

import { apiVerifyAuth } from '@/app/verify.middleware';
import { DEFAULT_AUTH_INFO } from '@/constant';
import userController from '@/controller/user.controller';
import { verifyProp } from '@/middleware/user.middleware';

const userRouter = new Router({ prefix: '/user' });

userRouter.post('/create', userController.create);

userRouter.post('/register', verifyProp, userController.register);

// 二维码登录
userRouter.post('/qrcode_login', userController.qrCodeLogin);

// 二维码登录状态
userRouter.get('/qrcode_login_status', userController.qrCodeLoginStatus);

// 账号密码登录
userRouter.post('/login', verifyProp, userController.login);

// 用户名密码登录
userRouter.post('/username_login', verifyProp, userController.usernameLogin);

// 用户列表
userRouter.get('/list', userController.list);

// 获取用户信息
userRouter.get('/get_user_info', userController.getUserInfo);

// 查找用户
userRouter.get('/find/:id', userController.find);

// 更新用户
userRouter.put(
  '/update/:id',
  verifyProp,
  apiVerifyAuth([DEFAULT_AUTH_INFO.USER_MANAGE.auth_value]),
  userController.update
);

// 修改密码
userRouter.put('/update_pwd', userController.updatePwd);

// 更新用户角色
userRouter.put(
  '/update_user_role/:id',
  verifyProp,
  apiVerifyAuth([DEFAULT_AUTH_INFO.USER_MANAGE.auth_value]),
  userController.updateUserRole
);

export default userRouter;
