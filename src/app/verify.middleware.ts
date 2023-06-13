import chalk from 'chalk';
import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import { IP_WHITE_LIST } from '@/config/secret';
import {
  ALLOW_HTTP_CODE,
  BLACKLIST_TYPE,
  COMMON_ERR_MSG,
  ERROR_HTTP_CODE,
} from '@/constant';
import blacklistController from '@/controller/blacklist.controller';
import logController from '@/controller/log.controller';
import { CustomError } from '@/model/customError.model';
import { isAdmin } from '@/utils';
import { chalkINFO } from '@/utils/chalkTip';

// 前台的所有get和白名单内的接口不需要token
const frontendWhiteList = [
  '/init/role',
  '/init/auth',
  '/init/roleAuth',
  '/init/dayData',
  '/link/create', // 申请友链，这个接口是post的
  '/visitor_log/create', // 访客记录，这个接口是post的
  '/user/login', // 登录，这个接口是post的
  '/qq_user/login', // 登录，这个接口是post的
  '/email_user/login', // 登录，这个接口是post的
  '/github_user/login', // 登录，这个接口是post的
  '/email_user/send_login_code', // 发送登录验证码，这个接口是post的
  '/email_user/send_register_code', // 发送注册验证码，这个接口是post的
  '/email_user/send_bind_code', // 发送绑定邮箱验证码，这个接口是post的
  '/email_user/send_cancel_bind_code', // 发送解绑邮箱验证码，这个接口是post的
  '/email_user/register', // 注册，这个接口是post的
  '/order/pay',
  '/wallet/init',
  '/live_room/auth',
];

// 后台的所有接口都需要判断token，除了白名单内的不需要token
const backendWhiteList = [
  '/admin/email_user/send_login_code', // 发送登录验证码
  '/admin/user/login', // 后台的这个接口是post的
  '/admin/user/code_login', // 验证码登录
  '/admin/github_user/login', // github登录
  '/admin/qq_user/login', // 登录接口
  '/admin/email_user/send_login_code', // 发送登录验证码
  '/admin/email_user/send_register_code', // 发送注册验证码
  '/admin/email_user/send_bind_code', // 发送绑定邮箱验证码
  '/admin/email_user/send_cancel_bind_code', // 发送解绑邮箱验证码
  '/admin/email_user/login', // 登录
  '/admin/email_user/register', // 注册
];

const globalWhiteList = ['/init/'];

// 允许频繁请求的路径白名单
const frequentlyWhiteList = [];

async function isPass(ip: string) {
  const nowDate = +new Date();
  let flag = true;
  if (IP_WHITE_LIST.includes(ip)) return flag;
  const [oneMinuteApiNum, oneHourApiNum, oneDayApiNum] = await Promise.all([
    logController.common.getCount({
      startTime: new Date(nowDate - 1000 * 60), // 一分钟内访问的次数
      endTime: new Date(nowDate),
      api_real_ip: ip,
    }),
    logController.common.getCount({
      startTime: new Date(nowDate - 1000 * 60 * 60), // 一小时内访问的次数
      endTime: new Date(nowDate),
      api_real_ip: ip,
    }),
    logController.common.getCount({
      startTime: new Date(nowDate - 1000 * 60 * 60 * 24), // 一天内访问的次数
      endTime: new Date(nowDate),
      api_real_ip: ip,
    }),
  ]);
  oneMinuteApiNum > 100 && (flag = false);
  oneHourApiNum > 2000 && (flag = false);
  oneDayApiNum > 5000 && (flag = false);
  return flag;
}

export const apiBeforeVerify = async (ctx: ParameterizedContext, next) => {
  console.log('apiBeforeVerify中间件');
  const url = ctx.request.path;
  const ip = (ctx.request.headers['x-real-ip'] as string) || '127.0.0.1';
  const admin = isAdmin(ctx);
  const consoleEnd = () => {
    console.log(
      chalkINFO(
        `日期：${new Date().toLocaleString()}，ip：${ip}，响应${
          ctx.request.method
        } ${url}`
      )
    );
  };

  console.log(
    chalkINFO(
      `日期：${new Date().toLocaleString()}，ip：${ip}，收到接口 ${
        ctx.request.method
      } ${url}请求`
    )
  );

  console.log(chalk.blueBright('query:'), { ...ctx.request.query });
  console.log(chalk.blueBright('params:'), ctx.params);
  console.log(chalk.blueBright('body:'), ctx.request.body);
  console.log(chalk.blueBright('referer:'), ctx.request.header.referer);
  console.log(chalk.blueBright('cookie:'), ctx.request.header.cookie);
  console.log(chalk.blueBright('token:'), ctx.request.headers.authorization);

  // 判断黑名单
  const inBlacklist = await blacklistController.findByIp(ip);

  if (inBlacklist?.type === BLACKLIST_TYPE.banIp) {
    // 频繁操作
    throw new CustomError(
      `当前ip:${ip}调用api频繁,${COMMON_ERR_MSG.banIp}`,
      ALLOW_HTTP_CODE.forbidden,
      ERROR_HTTP_CODE.banIp
    );
  } else if (inBlacklist?.type === BLACKLIST_TYPE.adminDisableUser) {
    // 管理员手动禁用
    throw new CustomError(
      COMMON_ERR_MSG.adminDisableUser,
      ALLOW_HTTP_CODE.forbidden,
      ERROR_HTTP_CODE.adminDisableUser
    );
  }

  // 验证是否频繁请求
  if (frequentlyWhiteList.indexOf(url) === -1) {
    const res = await isPass(ip);
    if (!res) {
      const { userInfo } = await authJwt(ctx);
      blacklistController.common.create({
        user_id: userInfo?.id,
        ip,
        type: BLACKLIST_TYPE.banIp,
        msg: COMMON_ERR_MSG.banIp,
      });
      throw new CustomError(
        `当前ip:${ip}调用api频繁,${COMMON_ERR_MSG.banIp}`,
        ALLOW_HTTP_CODE.forbidden,
        ERROR_HTTP_CODE.banIp
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

  // if (admin) {
  //   if (backendWhiteList.indexOf(url) !== -1) {
  //     await next();
  //     consoleEnd();
  //     return;
  //   }
  //   const { code, message } = await authJwt(ctx);
  //   if (code !== ALLOW_HTTP_CODE.ok) {
  //     consoleEnd();
  //     throw new CustomError(message, code, code);
  //   }
  //   /**
  //    * 这里必须await next()，因为路由匹配肯定是先匹配这个app.use的，
  //    * 如果这里匹配完成后直接next()了，就会返回数据了（404），也就是不会
  //    * 继续走后面的匹配了！但是如果加了await，就会等待后面的继续匹配完！
  //    */
  //   await next();
  //   consoleEnd();
  // } else {
  // 前端的get接口都不需要判断token，白名单内的也不需要判断token（如注册登录这些接口是post的）
  if (ctx.request.method === 'GET' || frontendWhiteList.indexOf(url) !== -1) {
    await next();
    consoleEnd();
    return;
  }
  const { code, message } = await authJwt(ctx);
  if (code !== ALLOW_HTTP_CODE.ok) {
    consoleEnd();
    throw new CustomError(message, code, code);
  }
  /**
   * 因为这个verify.middleware是最先执行的中间件路由，
   * 而且这个verify.middleware是异步的，因此如果需要等待异步执行完成才继续匹配后面的中间时，
   * 必须使用await next()，如果这里使用next()，就会返回数据了（404），也就是不会
   * 继续走后面的匹配了！但是如果加了await，就会等待后面的继续匹配完！
   */
  await next();
  consoleEnd();
  // }
};
