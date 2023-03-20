import { ParameterizedContext } from 'koa';

export const verifyProp = async (ctx: ParameterizedContext, next) => {
  await next();
};
