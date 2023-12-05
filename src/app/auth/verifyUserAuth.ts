import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import { ALLOW_HTTP_CODE, DEFAULT_ROLE_INFO } from '@/constant';
import roleService from '@/service/role.service';

export const verifyUserAuth = async (ctx: ParameterizedContext) => {
  const { code, userInfo } = await authJwt(ctx);
  if (code !== ALLOW_HTTP_CODE.ok) {
    return false;
  }
  const result = await roleService.getUserRole(userInfo!.id!);
  const roles = result.map((v) => v.role_value);
  if (roles.includes(DEFAULT_ROLE_INFO.SUPER_ADMIN.role_value)) {
    return userInfo!;
  }
  return false;
};
