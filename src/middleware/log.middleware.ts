import Joi from 'joi';
import { ParameterizedContext } from 'koa';

import { ALLOW_HTTP_CODE } from '@/constant';
import { CustomError } from '@/model/customError.model';

const schema = Joi.object({
  user_id: Joi.number(),
  api_user_agent: Joi.string(),
  api_from: Joi.number(),
  api_real_ip: Joi.string(),
  api_host: Joi.string(),
  api_hostname: Joi.string(),
  api_method: Joi.string(),
  api_path: Joi.string(),
  api_query: Joi.string(),
  api_body: Joi.string(),
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
    throw new CustomError(
      error.message,
      ALLOW_HTTP_CODE.paramsError,
      ALLOW_HTTP_CODE.paramsError
    );
  }
};
