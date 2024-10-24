import { getRandomString } from 'billd-utils';
import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE, REDIS_PREFIX } from '@/constant';
import redisController from '@/controller/redis.controller';
import { CustomError } from '@/model/customError.model';
import deskUserService from '@/service/deskUser.service';
import { IDeskUser } from '@/types/IUser';

class DeskUserController {
  common = {
    login: async ({ uuid, password }) => {
      const res = await deskUserService.login({ uuid, password });
      return res;
    },
  };

  login = async (ctx: ParameterizedContext, next) => {
    const { uuid, password }: IDeskUser = ctx.request.body;
    if (!uuid || !password) {
      throw new CustomError(
        `uuid和password不能为空`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const res = await this.common.login({ uuid, password });
    if (!res) {
      throw new CustomError(
        `密码错误！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    successHandler({ ctx, data: { msg: '登录成功' } });
    await next();
  };

  linkVerify = async (ctx: ParameterizedContext, next) => {
    const { uuid, password }: IDeskUser = ctx.request.body;

    const res = await this.common.login({ uuid, password });

    successHandler({ ctx, data: { code: res ? 1 : 2 } });
    await next();
  };

  async findReceiverByUuid(ctx: ParameterizedContext, next) {
    const { uuid }: any = ctx.request.query;
    const val = await redisController.getVal({
      prefix: REDIS_PREFIX.deskUserUuid,
      key: uuid,
    });
    let receiver = '';
    try {
      receiver = JSON.parse(val!).value.socket_id!;
    } catch (error) {
      console.log(error);
    }
    successHandler({ ctx, data: { receiver } });
    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    const result = await deskUserService.create({
      uuid: getRandomString(8),
      password: getRandomString(8),
      status: 1,
    });
    successHandler({ ctx, data: result });
    await next();
  }

  async updateByUuid(ctx: ParameterizedContext, next) {
    const { uuid, password, new_password, status }: IDeskUser =
      ctx.request.body;
    if (!uuid) {
      throw new CustomError(
        `uuid不能为空！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const deskUser = await deskUserService.findByUuid(uuid);
    if (!deskUser) {
      throw new CustomError(
        `不存在uuid为${uuid}的desk用户！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    if (deskUser.password !== password) {
      throw new CustomError(
        `旧密码错误！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await deskUserService.updateByUuid({
      uuid,
      password: new_password,
      status,
    });
    successHandler({ ctx });
    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await deskUserService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的desk用户！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const result = await deskUserService.delete(id);
    successHandler({ ctx, data: result });

    await next();
  }
}
export default new DeskUserController();
