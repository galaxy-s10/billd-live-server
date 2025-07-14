import { ParameterizedContext } from 'koa';

import { ALLOW_HTTP_CODE } from '@/constant';
import roleService from '@/service/role.service';

import { authJwt } from './authJwt';

export const verifyUserAuth = async (ctx: ParameterizedContext) => {
  const { code, userInfo, message } = await authJwt(ctx);
  if (code !== ALLOW_HTTP_CODE.ok) {
    console.log(message);
    return false;
  }
  const result: any = await roleService.getMyRole(userInfo!.id!);
  const roles = result.map((v) => v.role_value);
  if (roles.includes('SUPER_ADMIN')) {
    return true;
  }
  return false;
};
