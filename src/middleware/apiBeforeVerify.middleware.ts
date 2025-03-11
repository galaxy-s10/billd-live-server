import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import {
  COMMON_ERROE_MSG,
  COMMON_ERROR_CODE,
  COMMON_HTTP_CODE,
} from '@/constant';
import blacklistController from '@/controller/blacklist.controller';
import { BlacklistTypeEnum } from '@/interface';
import { CustomError } from '@/model/customError.model';
import { strSlice } from '@/utils';
import { chalkINFO } from '@/utils/chalkTip';

// 前台的所有get和白名单内的接口不需要token
const frontendWhiteList: string[] = [
  '/init/role',
  '/init/auth',
  '/init/role_auth',
  '/init/day_data',

  '/user/register', // 注册，这个接口是post的
  '/user/login', // 登录，这个接口是post的
  '/user/id_login', // 登录，这个接口是post的
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

  '/srs/on_publish',
  '/srs/on_play',
  '/srs/on_stop',
  '/srs/on_unpublish',
  '/srs/on_dvr',
  '/srs/rtcV1Play',
  '/srs/rtcV1Whep',

  '/ws/keep_joined',

  '/tencentcloud_css/on_publish',
  '/tencentcloud_css/on_unpublish',
  '/tencentcloud_css/remote_auth',

  '/tencentcloud_chat/gen_user_sig',
];

// 允许频繁请求的路径白名单
const frequentlyWhiteList: string[] = [];

export const apiBeforeVerify = async (ctx: ParameterizedContext, next) => {
  console.log(chalkINFO('===== 中间件开始（apiBeforeVerify） ====='));
  const url = ctx.request.path;
  const client_ip = strSlice(String(ctx.request.headers['x-real-ip']), 90);

  const consoleEnd = () => {
    console.log(chalkINFO(`===== 中间件通过（apiBeforeVerify） =====`));
  };

  // console.log('params:', { ...ctx.params });
  // console.log('query:', { ...ctx.request.query });
  // console.log('body:', { ...ctx.request.body });
  // console.log('referer:', ctx.request.header.referer);
  // console.log('cookie:', ctx.request.header.cookie);
  // console.log('token:', ctx.request.header.authorization);

  // 判断黑名单
  const ipBlacklist = await blacklistController.common.findAllClientIpNotNull();
  const ipInBlacklist = ipBlacklist.find((v) => v.client_ip === client_ip);
  if (ipInBlacklist) {
    if (ipInBlacklist?.type === BlacklistTypeEnum.frequent) {
      throw new CustomError({
        msg: COMMON_ERROE_MSG.frequent,
        httpStatusCode: COMMON_HTTP_CODE.forbidden,
        errorCode: COMMON_ERROR_CODE.frequent,
      });
    } else if (ipInBlacklist?.type === BlacklistTypeEnum.admin_disable) {
      throw new CustomError({
        msg: COMMON_ERROE_MSG.admin_disable,
        httpStatusCode: COMMON_HTTP_CODE.forbidden,
        errorCode: COMMON_ERROR_CODE.admin_disable,
      });
    }
  }

  // 验证是否频繁请求
  if (!frequentlyWhiteList.includes(url)) {
    const isFrequently = false;
    if (isFrequently) {
      const { userInfo } = await authJwt(ctx);
      blacklistController.common.create({
        user_id: userInfo?.id,
        client_ip,
        type: BlacklistTypeEnum.frequent,
        msg: COMMON_ERROE_MSG.frequent,
      });
      throw new CustomError({
        msg: `ip：${client_ip}，${COMMON_ERROE_MSG.frequent}`,
        httpStatusCode: COMMON_HTTP_CODE.forbidden,
        errorCode: COMMON_ERROR_CODE.frequent,
      });
    }
  }

  // 前端的get接口都不需要判断token，白名单内的也不需要判断token（如注册登录这些接口是post的）
  if (ctx.request.method === 'GET' || frontendWhiteList.includes(url)) {
    await next();
    consoleEnd();
  } else {
    const { code, errorCode, msg } = await authJwt(ctx);
    if (code !== COMMON_HTTP_CODE.success) {
      throw new CustomError({
        msg,
        httpStatusCode: code,
        errorCode,
      });
    }
    /**
     * 因为这个verify.middleware是最先执行的中间件路由，
     * 而且这个verify.middleware是异步的，因此如果需要等待异步执行完成才继续匹配后面的中间时，
     * 必须使用await next()，如果这里使用next()，就会返回数据了（404），也就是不会
     * 继续走后面的匹配了！但是如果加了await，就会等待后面的继续匹配完！
     */
    await next();
    consoleEnd();
  }
};
