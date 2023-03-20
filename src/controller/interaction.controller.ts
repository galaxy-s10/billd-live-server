import { ParameterizedContext } from 'koa';

import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE } from '@/constant';
import { IList, IInteraction } from '@/interface';
import { CustomError } from '@/model/customError.model';
import interactionService from '@/service/interaction.service';

class InteractionController {
  common = {
    create: (data: IInteraction) => interactionService.create(data),
  };

  async getList(ctx: ParameterizedContext, next) {
    const {
      id,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IInteraction> = ctx.request.query;
    const result = await interactionService.getList({
      id,
      nowPage,
      pageSize,
      orderBy,
      orderName,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await interactionService.find(id);
    successHandler({ ctx, data: result });

    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(
        `权限不足！`,
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const id = +ctx.params.id;
    const {
      user_type,
      user_info,
      client,
      client_ip,
      type,
      value,
    }: IInteraction = ctx.request.body;
    const isExist = await interactionService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的互动！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await interactionService.update({
      id,
      user_type,
      user_info,
      client,
      client_ip,
      type,
      value,
    });
    successHandler({ ctx });

    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(
        `权限不足！`,
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const {
      user_type,
      user_info,
      client,
      client_ip,
      type,
      value,
    }: IInteraction = ctx.request.body;
    await this.common.create({
      user_type,
      user_info,
      client,
      client_ip,
      type,
      value,
    });
    successHandler({ ctx });

    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(
        `权限不足！`,
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const id = +ctx.params.id;
    const isExist = await interactionService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的互动！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await interactionService.delete(id);
    successHandler({ ctx });

    await next();
  }
}

export default new InteractionController();
