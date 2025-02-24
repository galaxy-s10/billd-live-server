import { getArrayDifference } from 'billd-utils';
import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import { COMMON_HTTP_CODE, PROJECT_ENV, PROJECT_ENV_ENUM } from '@/constant';
import authController from '@/controller/auth.controller';
import { CustomError } from '@/model/customError.model';

export async function handleVerifyAuth({ ctx, shouldAuthArr }) {
  const { code, errorCode, userInfo, msg } = await authJwt(ctx);
  if (code !== COMMON_HTTP_CODE.success || !userInfo) {
    throw new CustomError({
      msg,
      httpStatusCode: code,
      errorCode,
    });
  }
  const myAllAuths = await authController.common.getUserAuth(userInfo.id!);

  const myAllAuthsArr = myAllAuths.map((v) => v.auth_value!);
  const diffArr = getArrayDifference(shouldAuthArr, myAllAuthsArr);
  if (diffArr.length > 0) {
    return { flag: false, userInfo, diffArr };
  }
  return { flag: true, userInfo, diffArr: [] };
}

export const apiVerifyAuth = (shouldAuthArr: string[]) => {
  return async (ctx: ParameterizedContext, next) => {
    const res = await handleVerifyAuth({ ctx, shouldAuthArr });
    if (!res.flag) {
      throw new CustomError({
        msg: `缺少${res.diffArr.join()}权限！`,
        httpStatusCode: COMMON_HTTP_CODE.forbidden,
        errorCode: COMMON_HTTP_CODE.forbidden,
      });
    } else {
      await next();
    }
  };
};

export const apiVerifyEnv = (env: PROJECT_ENV_ENUM[]) => {
  return async (ctx: ParameterizedContext, next) => {
    if (!env.includes(PROJECT_ENV)) {
      throw new CustomError({
        msg: `只允许${env.join()}环境调用！`,
        httpStatusCode: COMMON_HTTP_CODE.forbidden,
        errorCode: COMMON_HTTP_CODE.forbidden,
      });
    } else {
      await next();
    }
  };
};
