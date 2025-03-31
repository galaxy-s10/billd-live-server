import { ParameterizedContext } from 'koa';

import { CORS_ALLOW_ORIGIN } from '@/constant';
import { chalkINFO } from '@/utils/chalkTip';

// 跨域中间件
export const cors = async (ctx: ParameterizedContext, next) => {
  console.log(
    chalkINFO('===== 中间件开始（corsMiddle） ====='),
    ctx.header.origin
  );
  ctx.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Content-Length, Authorization, Accept, X-Billd-Trace-Id, X-Requested-With, X-Billd-Env, X-Billd-App, X-Billd-Appver'
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

  // throw new CustomError({
  //   msg: `ddd`,
  // });

  if (ctx.method === 'OPTIONS') {
    // 跨域请求时，浏览器会先发送options
    ctx.body = 'ok';
  } else {
    await next();
    console.log(
      chalkINFO(`===== 中间件通过（corsMiddle） ===== `),
      ctx.header.origin
    );
  }
};
