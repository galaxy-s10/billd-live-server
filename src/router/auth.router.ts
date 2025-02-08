import Router from 'koa-router';

import { apiVerifyAuth } from '@/app/verify.middleware';
import { DEFAULT_AUTH_INFO } from '@/constant';
import authController from '@/controller/auth.controller';
import { verifyProp } from '@/middleware/auth.middleware';

const authRouter = new Router({ prefix: '/auth' });

// DONE 获取我的权限（递归查找所有）
authRouter.get('/get_my_auth', authController.getMyAuth);

// DONE 获取某个用户的权限（递归查找所有）
authRouter.get('/get_user_auth/:id', authController.getUserAuth);

// DONE 权限列表（分页）
authRouter.get('/list', authController.getList);

// DONE 权限列表（不分页）
authRouter.get('/all_list', authController.getAllList);

// 获取所有权限（树型）
authRouter.get('/get_tree_auth', authController.getTreeAuth);

// 查找权限
authRouter.get('/find/:id', authController.find);

// 获取该权限的子权限（只找一层）
authRouter.get('/get_child_auth/:id', authController.getChildAuth);

// 获取该权限的子权限（递归查找所有）
authRouter.get('/get_all_child_auth/:id', authController.getAllChildAuth);

// 创建权限
authRouter.post(
  '/create',
  verifyProp,
  apiVerifyAuth([DEFAULT_AUTH_INFO.AUTH_MANAGE.auth_value]),
  authController.create
);

// 更新权限
authRouter.put(
  '/update/:id',
  verifyProp,
  apiVerifyAuth([DEFAULT_AUTH_INFO.AUTH_MANAGE.auth_value]),
  authController.update
);

// 删除权限
authRouter.delete(
  '/delete/:id',
  apiVerifyAuth([DEFAULT_AUTH_INFO.AUTH_MANAGE.auth_value]),
  authController.delete
);

// 批量新增子权限
authRouter.put(
  '/batch_add_child_auths',
  verifyProp,
  apiVerifyAuth([DEFAULT_AUTH_INFO.AUTH_MANAGE.auth_value]),
  authController.batchAddChildAuths
);

// 批量删除子权限
authRouter.delete(
  '/batch_delete_child_auths',
  verifyProp,
  apiVerifyAuth([DEFAULT_AUTH_INFO.AUTH_MANAGE.auth_value]),
  authController.batchDeleteChildAuths
);

export default authRouter;
