import { ParameterizedContext } from 'koa';

import {
  COMMON_ERROE_MSG,
  COMMON_ERROR_CODE,
  COMMON_HTTP_CODE,
} from '@/constant';
import { CustomError } from '@/model/customError.model';
import { strSlice } from '@/utils';
import { chalk, chalkERROR } from '@/utils/chalkTip';

const errorHandler = (error, ctx: ParameterizedContext) => {
  const { path, method } = ctx.request;
  const client_ip = strSlice(
    String(ctx.request.headers['x-real-ip'] || ''),
    100
  );
  // eslint-disable-next-line
  const errorLog = (error) => {
    console.log(chalk.redBright('httpStatusCode:'), error.httpStatusCode);
    console.log(chalk.redBright('errorCode:'), error.errorCode);
    console.log(chalk.redBright('message:'), error.message);
    console.log(chalk.redBright('query:'), { ...ctx.request.query });
    console.log(chalk.redBright('params:'), ctx.params);
    console.log(chalk.redBright('body:'), ctx.request.body);
    console.log(chalk.redBright('host:'), ctx.request.header.host);
    console.log(chalk.redBright('referer:'), ctx.request.header.referer);
    console.log(chalk.redBright('cookie:'), ctx.request.header.cookie);
    console.log(chalk.redBright('token:'), ctx.request.headers.authorization);
    console.log(chalk.redBright('error:'), error);
    console.log(chalk.redBright('ctx.body:'), ctx.body);
  };
  function main() {
    if (!(error instanceof CustomError)) {
      console.log(chalkERROR(`收到非自定义错误！`));
      const defaultError = {
        code: COMMON_HTTP_CODE.serverError,
        errorCode: COMMON_ERROR_CODE.serverError,
        error: error.message,
        msg: COMMON_ERROE_MSG.serverError,
      };
      ctx.status = defaultError.code;
      ctx.body = {
        code: defaultError.errorCode,
        errorCode: defaultError.errorCode,
        error: defaultError.error,
        msg: defaultError.msg,
      };
      errorLog(error);
      console.log(
        chalkERROR(`非自定义错误返回前端的数据，http状态码：${ctx.status}`),
        defaultError
      );
      return;
    }

    console.log(chalkERROR(`===== 收到自定义错误:${method} ${path} =====`));

    // 不手动设置状态的话，默认是404（delete方法返回400），因此，即使走到了error-handle，且ctx.body返回了数据
    // 但是没有手动设置status的话，一样返回不了数据，因为status状态码都返回404了。
    ctx.status = error.httpStatusCode;
    ctx.body = {
      code: error.errorCode,
      errorCode: error.errorCode,
      msg: error?.message || COMMON_ERROE_MSG[error.httpStatusCode],
    };

    errorLog(error);
    console.log(
      chalkERROR(
        `===== 收到自定义错误: ip:${client_ip},${method} ${path} =====`
      )
    );
  }

  main();
};

export default errorHandler;
