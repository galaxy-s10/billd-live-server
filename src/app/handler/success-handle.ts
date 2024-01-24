import { ParameterizedContext } from 'koa';

import { ALLOW_HTTP_CODE, HTTP_SUCCESS_MSG } from '@/constant';

const successHandler = ({
  statusCode = ALLOW_HTTP_CODE.ok,
  code = ALLOW_HTTP_CODE.ok,
  ctx,
  data,
  message,
}: {
  statusCode?: number;
  code?: number;
  ctx: ParameterizedContext;
  data?: any;
  message?: string;
}) => {
  const methods = ctx.request.method;

  ctx.status = statusCode; // 不手动设置状态的话，koa默认方法返回404，delete方法返回400
  ctx.body = {
    code,
    data,
    message: message || HTTP_SUCCESS_MSG[methods],
  };
};

export default successHandler;
