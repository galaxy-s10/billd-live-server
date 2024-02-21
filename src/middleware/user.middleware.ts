import Joi from 'joi';
import { ParameterizedContext } from 'koa';

import { COMMON_HTTP_CODE } from '@/constant';
import { CustomError } from '@/model/customError.model';

const schema = Joi.object({
  id: Joi.number(),
  username: Joi.string().min(3).max(12),
  password: Joi.string().min(6).max(18),
  // username: Joi.string()
  //   .pattern(/[0-9a-zA-Z_]{6,12}$/)
  //   .required(),
  // password: Joi.string()
  //   .pattern(/(?![0-9]+$)(?![a-zA-Z]+$)(?![_]+$)[0-9a-zA-A_]{8,16}/)
  //   .required(),
  desc: Joi.string().min(3).max(50),
  avatar: Joi.string().min(3).max(100),
  code: Joi.string(),
  status: [1, 2],
  exp: Joi.number(),
  user_roles: Joi.array().items(Joi.number()),
});

export const verifyProp = async (ctx: ParameterizedContext, next) => {
  try {
    const prop = ctx.request.body;
    await schema.validateAsync(prop, {
      abortEarly: false, // when true，在第一个错误时停止验证，否则返回找到的所有错误。默认为true.
      allowUnknown: true, // 当true，允许对象包含被忽略的未知键。默认为false.
      // presence: 'required', // schema加上required()或者设置presence: 'required'。防止prop为undefined时也能通过验证
      convert: false,
    });
    await next();
  } catch (error: any) {
    throw new CustomError(
      error.message,
      error.statusCode || COMMON_HTTP_CODE.paramsError,
      error.errorCode || COMMON_HTTP_CODE.paramsError
    );
  }
};
