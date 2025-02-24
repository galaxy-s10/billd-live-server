import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import { pubClient } from '@/config/redis/publish';
import {
  COMMON_ERROE_MSG,
  COMMON_ERROR_CODE,
  COMMON_HTTP_CODE,
  REDIS_CHANNEL,
} from '@/constant';
import { CustomError } from '@/model/customError.model';
import { handleCtxRequestHeaders, strSlice } from '@/utils';
import { chalkERROR, chalkINFO } from '@/utils/chalkTip';

// 全局错误处理中间件
export const catchErrorMiddle = async (ctx: ParameterizedContext, next) => {
  let duration = -1;
  const startTime = performance.now();
  const url = ctx.request.path;
  const client_ip = strSlice(
    String(ctx.request.headers['x-real-ip'] || ''),
    100
  );
  console.log(
    chalkINFO(`ip:${client_ip},收到请求 ${ctx.request.method} ${url}`)
  );
  console.log(chalkINFO('===== 中间件开始（catchErrorMiddle） ====='));
  const consoleEnd = () => {
    duration = Math.floor(performance.now() - startTime);
    console.log(chalkINFO(`===== 中间件通过（catchErrorMiddle） =====`));
    console.log(
      chalkINFO(
        `ip:${client_ip},响应请求 ${ctx.status} ${ctx.request.method} ${url} ,耗时:${duration}ms`
      )
    );
    console.log();
    if (ctx.status === COMMON_HTTP_CODE.notFound) {
      ctx.status = COMMON_HTTP_CODE.notFound;
      ctx.body = {
        code: COMMON_HTTP_CODE.notFound,
        errorCode: COMMON_HTTP_CODE.notFound,
        msg: COMMON_ERROE_MSG.notFound,
      };
    }
  };

  try {
    await next();
    consoleEnd();
  } catch (error: any) {
    console.log(chalkERROR(`===== catchErrorMiddle中间件捕获到错误 =====`));
    if (url.indexOf('/socket.io/') !== -1) {
      console.log('socket.io错误，return');
      return;
    }
    const { path, method } = ctx.request;

    // eslint-disable-next-line
    const errorLog = (error) => {
      console.log('httpStatusCode:', error.httpStatusCode);
      console.log('errorCode:', error.errorCode);
      console.log('message:', error.message);
      console.log('query:', { ...ctx.request.query });
      console.log('params:', ctx.params);
      console.log('body:', ctx.request.body);
      console.log('host:', ctx.request.header.host);
      console.log('referer:', ctx.request.header.referer);
      console.log('cookie:', ctx.request.header.cookie);
      console.log('token:', ctx.request.headers.authorization);
      console.log('error:', error);
      console.log('ctx.body:', ctx.body);
    };
    const insertLog = async (info: {
      httpStatusCode: number;
      errorCode: number;
      duration: number;
      error: string;
      msg: string;
    }) => {
      try {
        if (
          ![COMMON_HTTP_CODE.success, COMMON_HTTP_CODE.apiCache].includes(
            info.httpStatusCode
          )
        ) {
          // 将请求写入日志表
          const { userInfo } = await authJwt(ctx);
          const api_body = strSlice(JSON.stringify(ctx.request.body), 2000);
          const api_query = strSlice(JSON.stringify(ctx.request.query), 2000);
          const headers = handleCtxRequestHeaders(ctx);
          const api_user_agent = headers.user_agent;
          const api_real_ip = headers.real_ip;
          const api_forwarded_for = headers.forwarded_for;
          const api_referer = headers.referer;
          const api_path = headers.path;
          pubClient.publish(
            REDIS_CHANNEL.writeDbLog,
            JSON.stringify({
              user_id: userInfo?.id || -1,
              api_user_agent,
              api_body,
              api_query,
              api_real_ip,
              api_forwarded_for,
              api_referer,
              api_path,
              api_method: ctx.request.method,
              // ctx.request.host存在时获取主机（hostname:port）。当 app.proxy 是 true 时支持 X-Forwarded-Host，否则使用 Host。
              api_host: ctx.request.host, // ctx.request.hostname不带端口号;ctx.request.host带端口号
              // ctx.request.hostname存在时获取主机名。当 app.proxy 是 true 时支持 X-Forwarded-Host，否则使用 Host。
              api_hostname: ctx.request.hostname, // ctx.request.hostname不带端口号;ctx.request.host带端口号
              api_status_code: info.httpStatusCode,
              api_error: info.error,
              api_err_msg: info.msg,
              api_duration: info.duration,
              api_err_code: info.errorCode,
            })
          );
        }
      } catch (err) {
        console.log(err);
      }
    };
    if (!(error instanceof CustomError)) {
      console.log(chalkERROR(`收到非自定义错误！`));
      const defaultError = {
        httpStatusCode: COMMON_HTTP_CODE.serverError,
        errorCode: COMMON_ERROR_CODE.serverError,
        error: error.message,
        msg: COMMON_ERROE_MSG.serverError,
      };
      ctx.status = defaultError.httpStatusCode;
      ctx.body = {
        code: defaultError.errorCode,
        errorCode: defaultError.errorCode,
        error: defaultError.error,
        msg: defaultError.msg,
      };
      errorLog(error);
      insertLog({ ...defaultError, duration });
      console.log(chalkERROR(`非自定义错误返回前端的数据`), defaultError);
    } else {
      // 不手动设置状态的话，默认是404（delete方法返回400），因此，即使走到了error-handle，且ctx.body返回了数据
      // 但是没有手动设置status的话，一样返回不了数据，因为status状态码都返回404了。
      ctx.status = error.httpStatusCode;
      ctx.body = {
        code: error.errorCode,
        errorCode: error.errorCode,
        msg: error?.message || COMMON_ERROE_MSG[error.httpStatusCode],
      };

      errorLog(error);
      insertLog({
        httpStatusCode: error.httpStatusCode,
        error: error.message,
        errorCode: error.errorCode,
        msg: error.message,
        duration,
      });
      console.log(
        chalkERROR(
          `===== 收到自定义错误: ip:${client_ip},${method} ${path} =====`
        )
      );
      // consoleEnd();
    }
  }
};
