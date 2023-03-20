import Joi from 'joi';
import { ParameterizedContext } from 'koa';

import { ALLOW_HTTP_CODE } from '@/constant';
import { CustomError } from '@/model/customError.model';

const schema = Joi.object({
  model: Joi.string().min(3).max(50),
  key: Joi.string().min(3).max(50),
  value: Joi.string().min(3).max(100),
  lang: Joi.string().min(2).max(50),
  desc: Joi.string().min(2).max(100),
});
// .required();
// .error(new Error('参数'));
// .xor('id'); // 定义一组键之间的排他关系，其中一个是必需的，但不是同时需要

export const verifyProp = async (ctx: ParameterizedContext, next) => {
  try {
    const prop = ctx.request.body;
    await schema.validateAsync(prop, {
      abortEarly: false, // when true，在第一个错误时停止验证，否则返回找到的所有错误。默认为true.
      allowUnknown: false, // 当true，允许对象包含被忽略的未知键。默认为false.
      presence: 'required', // schema加上required()或者设置presence: 'required'。防止prop为undefined时也能通过验证
    });
    await next();
  } catch (error: any) {
    throw new CustomError(
      error.message,
      ALLOW_HTTP_CODE.paramsError,
      ALLOW_HTTP_CODE.paramsError
    );
  }
};
