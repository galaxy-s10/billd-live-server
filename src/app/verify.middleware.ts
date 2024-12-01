import { getArrayDifference } from 'billd-utils';
import chalk from 'chalk';
import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import {
  BLACKLIST_TYPE,
  COMMON_ERROE_MSG,
  COMMON_ERROR_CODE,
  COMMON_HTTP_CODE,
  PROJECT_ENV,
  PROJECT_ENV_ENUM,
} from '@/constant';
import authController from '@/controller/auth.controller';
import blacklistController from '@/controller/blacklist.controller';
import { CustomError } from '@/model/customError.model';
import { strSlice } from '@/utils';
import { chalkINFO } from '@/utils/chalkTip';

// 前台的所有get和白名单内的接口不需要token
const frontendWhiteList = [
  '/init/role',
  '/init/auth',
  '/init/roleAuth',
  '/init/dayData',

  '/user/register', // 注册，这个接口是post的
  '/user/login', // 登录，这个接口是post的
  '/user/username_login', // 登录，这个接口是post的
  '/user/qrcode_login', // 登录，这个接口是post的

  '/qq_user/login', // 登录，这个接口是post的

  '/wechat_user/login', // 登录，这个接口是post的

  '/qiniu_data/upload',
  '/qiniu_data/upload_chunk',
  '/qiniu_data/merge_chunk',

  '/live/render_fake_live',
  '/live/add_fake_live',
  '/live/del_fake_live',

  '/order/pay',

  '/wallet/init',

  '/desk_user/login',
  '/desk_user/create',
  '/desk_user/update_by_uuid',
  '/desk_user/link_verify',

  '/srs/on_publish',
  '/srs/on_play',
  '/srs/on_stop',
  '/srs/on_unpublish',
  '/srs/on_dvr',
  '/srs/rtcV1Play',
  '/srs/rtcV1Whep',

  '/tencentcloud_css/on_publish',
  '/tencentcloud_css/on_unpublish',
  '/tencentcloud_css/remote_auth',
];

// 全局白名单
const globalWhiteList = ['/init/'];

// 允许频繁请求的路径白名单
const frequentlyWhiteList = [];

export const apiBeforeVerify = async (ctx: ParameterizedContext, next) => {
  console.log(chalkINFO('===== apiBeforeVerify中间件开始 ====='));
  const startTime = performance.now();
  const url = ctx.request.path;
  const client_ip = strSlice(
    String(ctx.request.headers['x-real-ip'] || ''),
    100
  );
  const consoleEnd = () => {
    const duration = Math.floor(performance.now() - startTime);
    console.log(
      chalkINFO(
        `===== apiBeforeVerify中间件通过,耗时:${duration}ms,http状态码:${ctx.status} =====`
      )
    );
  };

  console.log(chalk.blueBright('query:'), { ...ctx.request.query });
  console.log(chalk.blueBright('params:'), ctx.params);
  console.log(chalk.blueBright('body:'), { ...ctx.request.body });
  console.log(chalk.blueBright('referer:'), ctx.request.header.referer);
  console.log(chalk.blueBright('cookie:'), ctx.request.header.cookie);
  console.log(chalk.blueBright('token:'), ctx.request.headers.authorization);

  // 判断黑名单
  const inBlacklist = await blacklistController.findByIp(client_ip);

  if (inBlacklist?.type === BLACKLIST_TYPE.banIp) {
    // 频繁操作
    throw new CustomError(
      `当前ip:${client_ip}调用api频繁,${COMMON_ERROE_MSG.banIp}`,
      COMMON_HTTP_CODE.forbidden,
      COMMON_ERROR_CODE.banIp
    );
  } else if (inBlacklist?.type === BLACKLIST_TYPE.adminDisableUser) {
    // 管理员手动禁用
    throw new CustomError(
      COMMON_ERROE_MSG.userStatusIsDisable,
      COMMON_HTTP_CODE.forbidden,
      COMMON_ERROR_CODE.userStatusIsDisable
    );
  }

  // 验证是否频繁请求
  // @ts-ignore
  if (frequentlyWhiteList.indexOf(url) === -1) {
    const res = true;
    // const res = await isPass(client_ip);
    if (!res) {
      const { userInfo } = await authJwt(ctx);
      blacklistController.common.create({
        user_id: userInfo?.id,
        client_ip,
        type: BLACKLIST_TYPE.banIp,
        msg: COMMON_ERROE_MSG.banIp,
      });
      throw new CustomError(
        `当前ip:${client_ip}调用api频繁,${COMMON_ERROE_MSG.banIp}`,
        COMMON_HTTP_CODE.forbidden,
        COMMON_ERROR_CODE.banIp
      );
    }
  }

  let allowNext = false;
  globalWhiteList.forEach((item) => {
    if (ctx.req.url!.indexOf(item) === 0) {
      allowNext = true;
    }
  });

  if (allowNext) {
    console.log(chalkINFO('全局白名单，next'));
    await next();
    consoleEnd();
    return;
  }

  // 前端的get接口都不需要判断token，白名单内的也不需要判断token（如注册登录这些接口是post的）
  if (ctx.request.method === 'GET' || frontendWhiteList.indexOf(url) !== -1) {
    await next();
    consoleEnd();
    return;
  }
  const { code, msg } = await authJwt(ctx);
  if (code !== COMMON_HTTP_CODE.success) {
    consoleEnd();
    throw new CustomError(msg, code, code);
  }
  /**
   * 因为这个verify.middleware是最先执行的中间件路由，
   * 而且这个verify.middleware是异步的，因此如果需要等待异步执行完成才继续匹配后面的中间时，
   * 必须使用await next()，如果这里使用next()，就会返回数据了（404），也就是不会
   * 继续走后面的匹配了！但是如果加了await，就会等待后面的继续匹配完！
   */
  await next();
  consoleEnd();
};

export async function handleVerifyAuth({ ctx, shouldAuthArr }) {
  const { code, userInfo, msg } = await authJwt(ctx);
  if (code !== COMMON_HTTP_CODE.success || !userInfo) {
    throw new CustomError(msg, code, code);
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
      throw new CustomError(
        `缺少${res.diffArr.join()}权限！`,
        COMMON_HTTP_CODE.forbidden,
        COMMON_HTTP_CODE.forbidden
      );
    } else {
      await next();
    }
  };
};
export const apiVerifyEnv = (env: PROJECT_ENV_ENUM[]) => {
  return async (ctx: ParameterizedContext, next) => {
    if (!env.includes(PROJECT_ENV)) {
      throw new CustomError(
        `只允许${env.join()}环境调用！`,
        COMMON_HTTP_CODE.forbidden,
        COMMON_HTTP_CODE.forbidden
      );
    } else {
      await next();
    }
  };
};
