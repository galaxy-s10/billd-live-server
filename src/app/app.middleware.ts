import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import {
  ALLOW_HTTP_CODE,
  CORS_ALLOW_ORIGIN,
  ERROR_BUSINESS_CODE,
  PROJECT_ENV,
} from '@/constant';
import logController from '@/controller/log.controller';
import { CustomError } from '@/model/customError.model';
import { chalkERROR, chalkINFO, chalkSUCCESS } from '@/utils/chalkTip';

// 全局错误处理中间件
export const catchErrorMiddle = async (ctx: ParameterizedContext, next) => {
  const insertLog = async (info: {
    statusCode: number;
    errorCode: number;
    duration: number;
    error: string;
    message: string;
  }) => {
    try {
      if (PROJECT_ENV !== 'beta') {
        // 将请求写入日志表
        const { userInfo } = await authJwt(ctx);
        logController.common.create({
          user_id: userInfo?.id || -1,
          api_user_agent: ctx.request.headers['user-agent']?.slice(0, 250),
          api_body: JSON.stringify(ctx.request.body || {}).slice(0, 250),
          api_query: JSON.stringify(ctx.query).slice(0, 250),
          api_real_ip:
            (ctx.request.headers['x-real-ip'] as string) || '127.0.0.1',
          api_forwarded_for: JSON.stringify(
            ctx.request.headers['x-forwarded-for'] || {}
          ).slice(0, 250),
          api_referer: ctx.request.headers.referer?.slice(0, 250),
          api_method: ctx.request.method,
          // ctx.request.host存在时获取主机（hostname:port）。当 app.proxy 是 true 时支持 X-Forwarded-Host，否则使用 Host。
          api_host: ctx.request.host, // ctx.request.hostname不带端口号;ctx.request.host带端口号
          // ctx.request.hostname存在时获取主机名。当 app.proxy 是 true 时支持 X-Forwarded-Host，否则使用 Host。
          api_hostname: ctx.request.hostname, // ctx.request.hostname不带端口号;ctx.request.host带端口号
          api_path: ctx.request.path,
          api_status_code: info.statusCode,
          api_error: info.error,
          api_err_msg: info.message,
          api_duration: info.duration,
          api_err_code: info.errorCode,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  let duration = -1;
  try {
    const startTime = performance.now();
    const url = ctx.request.path;
    const ip = (ctx.request.headers['x-real-ip'] as string) || '127.0.0.1';

    const consoleEnd = () => {
      duration = Math.floor(performance.now() - startTime);
      console.log(
        chalkINFO(
          `===== catchErrorMiddle中间件通过,耗时:${duration}ms,http状态码:${ctx.status} =====`
        )
      );
      console.log(
        chalkSUCCESS(`ip:${ip},响应请求 ${ctx.request.method} ${url}`)
      );
      console.log();
    };
    console.log();
    console.log(chalkINFO(`ip:${ip},收到请求 ${ctx.request.method} ${url}`));
    console.log(chalkINFO('===== catchErrorMiddle中间件开始 ====='));
    await next();
    consoleEnd();
    const whiteList = [
      '/qiniu_data/upload_chunk',
      '/qiniu_data/upload',
      '/qiniu_data/progress',
    ];
    if (whiteList.includes(ctx.request.path)) {
      console.log('白名单，不插入日志');
      return;
    }
    const statusCode = ctx.status;
    const msg = `【ERROR】客户端请求:${ctx.request.method} ${ctx.request.path},服务端响应http状态码:${statusCode}`;
    /**
     * 如果通过了catchErrorMiddle中间件，但是返回的状态不是200，
     * 代表了在next前面没有设置ctx状态码，因此默认就是返回404！
     * 因此业务层必须在next前设置ctx的状态码200，让接口通过catchErrorMiddle中间件，让它返回数据，
     * 或者业务层直接throw new Error或者CustomError，不让这个接口通过catchErrorMiddle中间件，
     * 让catchErrorMiddle中间件判断错误，并且返回错误数据！
     */
    if (
      statusCode !== ALLOW_HTTP_CODE.ok &&
      statusCode !== ALLOW_HTTP_CODE.apiCache
    ) {
      if (
        [ALLOW_HTTP_CODE.notFound, ALLOW_HTTP_CODE.methodNotAllowed].includes(
          statusCode
        )
      ) {
        const defaultSuccess = {
          statusCode,
          errorCode: statusCode,
          error: msg,
          message: msg,
          duration,
        };
        // 服务端返回http状态码200、304、404、405，写入日志表
        console.log(
          chalkINFO(`服务端返回http状态码200、304、404、405，写入日志表`)
        );
        insertLog(defaultSuccess);
      } else {
        const defaultSuccess = {
          statusCode,
          errorCode: ERROR_BUSINESS_CODE.errStatusCode,
          error: msg,
          message: msg,
          duration,
        };
        // 服务端返回http状态码不是200、304、404、405，写入日志表
        console.log(
          chalkINFO(`服务端返回http状态码不是200、304、404、405，写入日志表，`)
        );
        insertLog(defaultSuccess);
      }
      throw new CustomError(msg, statusCode, statusCode);
    } else {
      const defaultSuccess = {
        statusCode,
        errorCode: statusCode,
        error: '请求成功！',
        message: '请求成功！',
        duration,
      };
      // 请求成功写入日志表
      insertLog(defaultSuccess);
    }
  } catch (error: any) {
    console.log(chalkERROR(`===== catchErrorMiddle中间件捕获到错误 =====`));
    if (ctx.request.path.indexOf('/socket.io/') !== -1) {
      console.log('socket.io错误，return');
      return;
    }
    ctx.app.emit('error', error, ctx);
    if (!(error instanceof CustomError)) {
      const defaultError = {
        statusCode: ALLOW_HTTP_CODE.serverError,
        errorCode: ERROR_BUSINESS_CODE.serverError,
        error: error?.message,
        message: '服务器错误！',
        duration,
      };
      // 不是CustomError，也写入日志表
      insertLog(defaultError);
      return;
    }
    // 是CustomError，判断errorCode，非法的错误（频繁请求和被禁用）不写入日志
    if (
      ![
        ERROR_BUSINESS_CODE.banIp,
        ERROR_BUSINESS_CODE.adminDisableUser,
      ].includes(error.errorCode)
    ) {
      insertLog({
        statusCode: error.statusCode,
        error: error.message,
        errorCode: error.errorCode,
        message: error.message,
        duration,
      });
    }
  }
};

// 跨域中间件
export const corsMiddle = async (ctx: ParameterizedContext, next) => {
  console.log(chalkINFO('===== corsMiddle中间件开始 ====='), ctx.header.origin);
  const startTime = performance.now();
  ctx.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Content-Length, Authorization, Accept, X-Requested-With'
  ); // 允许的请求头
  ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS'); // 允许的方法

  // 如果是本地环境
  if (ctx.header.origin?.indexOf('http://localhost') !== -1) {
    ctx.set('Access-Control-Allow-Credentials', 'true'); // 允许携带cookie，Access-Control-Allow-Origin为*的时候不能设置Access-Control-Allow-Credentials:true！
    ctx.set('Access-Control-Allow-Origin', ctx.header.origin!); // 允许的源
  } else if (CORS_ALLOW_ORIGIN === '*') {
    ctx.set('Access-Control-Allow-Origin', '*'); // 允许所有源
  } else if (CORS_ALLOW_ORIGIN.includes(ctx.header.origin)) {
    ctx.set('Access-Control-Allow-Credentials', 'true'); // 允许携带cookie，Access-Control-Allow-Origin为*的时候不能设置Access-Control-Allow-Credentials:true！
    ctx.set('Access-Control-Allow-Origin', ctx.header.origin); // 允许的源
  } else {
    console.log('非法源！');
  }

  if (ctx.method === 'OPTIONS') {
    // 跨域请求时，浏览器会先发送options
    ctx.body = 'ok';
  } else {
    await next();
    const duration = Math.floor(performance.now() - startTime);
    console.log(
      chalkINFO(
        `===== corsMiddle中间件通过,耗时${duration}ms,http状态码:${ctx.status} ===== `
      ),
      ctx.header.origin
    );
  }
};
