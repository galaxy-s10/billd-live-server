import Router from 'koa-router';

import wechatUserController from '@/controller/wechatUser.controller';

const wechatUserRouter = new Router({ prefix: '/wechat_user' });

// 用户列表
wechatUserRouter.get('/list', wechatUserController.list);

// 用户wechat登录
wechatUserRouter.post('/login', wechatUserController.login);

// 查找用户
wechatUserRouter.get('/find/:id', wechatUserController.find);

export default wechatUserRouter;
