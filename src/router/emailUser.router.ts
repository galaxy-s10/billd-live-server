import Router from 'koa-router';

import emailController from '@/controller/emailUser.controller';
import { verifyProp } from '@/middleware/emailUser.middleware';

const emailRouter = new Router({ prefix: '/email_user' });

// 查找邮箱
emailRouter.get('/find', emailController.find); // verifyProp其实只会对body参数做校验，这里是get请求，因此就不判断了

// 发送邮箱登录验证码
emailRouter.post('/send_login_code', verifyProp, emailController.sendLoginCode);

// 邮箱登录
emailRouter.post('/login', verifyProp, emailController.login);

// 发送邮箱注册验证码
emailRouter.post(
  '/send_register_code',
  verifyProp,
  emailController.sendRegisterCode
);

// 邮箱注册
emailRouter.post('/register', verifyProp, emailController.register);

// 发送绑定邮箱验证码
emailRouter.post(
  '/send_bind_code',
  verifyProp,
  emailController.sendBindEmailCode
);

// 发送取消绑定邮箱验证码
emailRouter.post(
  '/send_cancel_bind_code',
  emailController.sendCancelBindEmailCode
);

// 邮箱列表
emailRouter.get('/list', emailController.getList);

// 用户绑定邮箱
emailRouter.post('/bind_email', verifyProp, emailController.bindEmail);

// 用户解绑邮箱
emailRouter.post(
  '/cancel_bind_email',
  verifyProp,
  emailController.cancelBindEmail
);

export default emailRouter;
