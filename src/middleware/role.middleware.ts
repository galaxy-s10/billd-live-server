import Joi from 'joi';
import { ParameterizedContext } from 'koa';

import { COMMON_HTTP_CODE } from '@/constant';
import { CustomError } from '@/model/customError.model';

const schema = Joi.object({
  id: Joi.number(),
  p_id: Joi.number(),
  role_name: Joi.string().min(2).max(30),
  role_value: Joi.string().min(3).max(30),
  type: [1, 2],
  priority: Joi.number(),
  role_auths: Joi.array().items(Joi.number()),
  c_roles: Joi.array().items(Joi.number()),
});

export const verifyProp = async (ctx: ParameterizedContext, next) => {
  try {
    const props = ctx.request.body;
    await schema.validateAsync(props, {
      abortEarly: false,
      allowUnknown: false,
      convert: false,
    });
    await next();
  } catch (error: any) {
    throw new CustomError({
      msg: error.message,
      httpStatusCode: COMMON_HTTP_CODE.paramsError,
      errorCode: COMMON_HTTP_CODE.paramsError,
    });
  }
};
