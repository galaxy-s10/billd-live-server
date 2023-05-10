import { ParameterizedContext } from 'koa';

import { ALLOW_HTTP_CODE, ERROR_HTTP_CODE, PROJECT_ENV } from '@/constant';
import logController from '@/controller/log.controller';
import { CustomError } from '@/model/customError.model';
import { isAdmin } from '@/utils';
import { chalkINFO } from '@/utils/chalkTip';

import { authJwt } from './auth/authJwt';

// 全局错误处理中间件
export const catchErrorMiddle = async (ctx: ParameterizedContext, next) => {
  // 这个中间件是第一个中间件，得是异步的，否则直接就next到下一个中间件了
  console.log('catchErrorMiddle中间件');
  const start = Date.now();
  const insertLog = async (info: {
    statusCode: number;
    errorCode: number;
    error: string;
    message: string;
  }) => {
    if (PROJECT_ENV !== 'beta') {
      console.log(
        chalkINFO(
          `当前不是beta环境，写入日志，api_status_code：${info.statusCode}`
        )
      );
      // 将请求写入日志表
      const { userInfo } = await authJwt(ctx);
      logController.common.create({
        user_id: userInfo?.id || -1,
        api_user_agent: ctx.request.headers['user-agent'],
        api_from: isAdmin(ctx) ? 2 : 1,
        api_body: JSON.stringify(ctx.request.body || {}),
        api_query: JSON.stringify(ctx.query),
        api_real_ip:
          (ctx.request.headers['x-real-ip'] as string) || '127.0.0.1',
        api_forwarded_for: ctx.request.headers['x-forwarded-for'] as string,
        api_referer: ctx.request.headers.referer,
        api_method: ctx.request.method,
        // ctx.request.host存在时获取主机（hostname:port）。当 app.proxy 是 true 时支持 X-Forwarded-Host，否则使用 Host。
        api_host: ctx.request.host, // ctx.request.hostname不带端口号;ctx.request.host带端口号
        // ctx.request.hostname存在时获取主机名。当 app.proxy 是 true 时支持 X-Forwarded-Host，否则使用 Host。
        api_hostname: ctx.request.hostname, // ctx.request.hostname不带端口号;ctx.request.host带端口号
        api_path: ctx.request.path,
        api_status_code: info.statusCode,
        api_error: info.error,
        api_err_msg: info.message,
        api_duration: Date.now() - start,
        api_err_code: info.errorCode,
      });
    }
  };
  try {
    console.log('catchErrorMiddle中间件开始...');
    await next();
    console.log(
      chalkINFO(`catchErrorMiddle中间件通过！http状态码：${ctx.status}`)
    );
    const whiteList = [
      '/admin/qiniu_data/upload_chunk',
      '/admin/qiniu_data/upload',
      '/admin/qiniu_data/mulit_upload',
      '/admin/qiniu_data/progress',
      '/order/pay_status',
    ];
    if (whiteList.includes(ctx.request.path)) {
      console.log('白名单，不插入日志');
      return;
    }
    const statusCode = ctx.status;
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
      if (statusCode === ALLOW_HTTP_CODE.notFound) {
        const defaultSuccess = {
          statusCode,
          errorCode: ERROR_HTTP_CODE.notFound,
          error: '这个返回了404的http状态码，请排查问题！',
          message: '这个返回了404的http状态码，请排查问题！',
        };
        // 404接口写入日志表
        console.log(
          chalkINFO(`404接口写入日志表，api_status_code：${statusCode}`)
        );
        insertLog(defaultSuccess);
      } else {
        const defaultSuccess = {
          statusCode,
          errorCode: ERROR_HTTP_CODE.errStatusCode,
          error: '返回了即不是200也不是404的http状态码，请排查问题！',
          message: '返回了即不是200也不是404的http状态码，请排查问题！',
        };
        // 既不是200也不是404，写入日志表
        console.log(
          chalkINFO(
            `既不是200也不是404，写入日志表，api_status_code：${statusCode}`
          )
        );
        insertLog(defaultSuccess);
      }
      throw new CustomError(
        '返回了即不是200也不是404的http状态码，请排查问题！',
        ALLOW_HTTP_CODE.notFound,
        ALLOW_HTTP_CODE.notFound
      );
    } else {
      const defaultSuccess = {
        statusCode,
        errorCode: statusCode,
        error: '请求成功！',
        message: '请求成功！',
      };
      // 请求成功写入日志表
      insertLog(defaultSuccess);
    }
  } catch (error: any) {
    console.log('catchErrorMiddle中间件捕获到错误！');
    if (ctx.request.path.indexOf('/socket.io/') !== -1) {
      console.log('socket.io错误，return');
      return;
    }
    ctx.app.emit('error', error, ctx);
    if (!(error instanceof CustomError)) {
      const defaultError = {
        statusCode: ALLOW_HTTP_CODE.serverError,
        errorCode: ERROR_HTTP_CODE.serverError,
        error: error?.message,
        message: '服务器错误！',
      };
      // 不是CustomError，也写入日志表
      insertLog(defaultError);
      return;
    }
    // 是CustomError，判断errorCode，非法的错误（频繁请求和被禁用）不写入日志
    if (
      ![ERROR_HTTP_CODE.banIp, ERROR_HTTP_CODE.adminDisableUser].includes(
        error.errorCode
      )
    ) {
      insertLog({
        statusCode: error.statusCode,
        error: error.message,
        errorCode: error.errorCode,
        message: error.message,
      });
    }
  }
};

// 跨域中间件
export const corsMiddle = async (ctx: ParameterizedContext, next) => {
  console.log('corsMiddle跨域中间件');
  ctx.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Content-Length, Authorization, Accept, X-Requested-With'
  ); // 允许的请求头
  ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS'); // 允许的方法

  // 如果是本地环境
  if (ctx.header.origin?.indexOf('http://localhost') !== -1) {
    ctx.set('Access-Control-Allow-Credentials', 'true'); // 允许携带cookie，Access-Control-Allow-Origin为*的时候不能设置Access-Control-Allow-Credentials:true！
    ctx.set('Access-Control-Allow-Origin', ctx.header.origin!); // 允许的源
  } else {
    const allowOrigin = ['https://www.hsslive.cn', 'https://admin.hsslive.cn'];
    // @ts-ignore
    if (allowOrigin === '*') {
      ctx.set('Access-Control-Allow-Origin', '*'); // 允许所有源
    } else if (allowOrigin.includes(ctx.header.origin)) {
      ctx.set('Access-Control-Allow-Credentials', 'true'); // 允许携带cookie，Access-Control-Allow-Origin为*的时候不能设置Access-Control-Allow-Credentials:true！
      ctx.set('Access-Control-Allow-Origin', ctx.header.origin); // 允许的源
    } else {
      console.log('非法源！');
    }
  }

  if (ctx.method === 'OPTIONS') {
    // 跨域请求时，浏览器会先发送options
    ctx.body = 'ok';
  } else {
    await next();
    console.log(chalkINFO(`corsMiddle中间件通过！ `));
  }
};
