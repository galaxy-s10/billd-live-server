import Joi from 'joi';
import { ParameterizedContext } from 'koa';

import { COMMON_HTTP_CODE } from '@/constant';
import { CustomError } from '@/model/customError.model';
import { UserStatusEnum } from '@/types/IUser';

const schema = Joi.object({
  id: Joi.number().error(new Error('id要求是数字！')),
  username: Joi.string()
    .min(3)
    .max(12)
    .error(new Error('用户名长度要求3-12！')),
  password: Joi.string().min(6).max(18).error(new Error('密码长度要求6-18！')),
  // username: Joi.string()
  //   .pattern(/[0-9a-zA-Z_]{6,12}$/)
  //   .required(),
  // password: Joi.string()
  //   .pattern(/(?![0-9]+$)(?![a-zA-Z]+$)(?![_]+$)[0-9a-zA-A_]{8,16}/)
  //   .required(),
  desc: Joi.string().min(3).max(50).error(new Error('描述长度要求3-50！')),
  avatar: Joi.string().min(3).max(100).error(new Error('头像长度要求3-100！')),
  status: Joi.array()
    .valid(UserStatusEnum.disable, UserStatusEnum.normal)
    .error(new Error('状态错误！')),
  code: Joi.string().error(new Error('code格式错误！')),
  exp: Joi.number().error(new Error('exp格式错误！')),
  user_roles: Joi.array()
    .items(Joi.number())
    .error(new Error('用户角色格式错误！')),
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
