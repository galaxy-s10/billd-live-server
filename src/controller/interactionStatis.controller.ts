import { ParameterizedContext } from 'koa';

import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE } from '@/constant';
import { IList, IInteractionStatis } from '@/interface';
import { CustomError } from '@/model/customError.model';
import interactionStatisService from '@/service/interactionStatis.service';

class InteractionController {
  common = {
    create: (data: IInteractionStatis) => interactionStatisService.create(data),
    getList: (data: IList<IInteractionStatis>) =>
      interactionStatisService.getList(data),
    update: (data: IInteractionStatis) => interactionStatisService.update(data),
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
    }: IList<IInteractionStatis> = ctx.request.query;
    const result = await this.common.getList({
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
    const result = await interactionStatisService.find(id);
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
    const { key, value, desc, type }: IInteractionStatis = ctx.request.body;
    const isExist = await interactionStatisService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的互动！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await this.common.update({
      id,
      key,
      value,
      desc,
      type,
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
    const { key, value, desc, type }: IInteractionStatis = ctx.request.body;
    await this.common.create({
      key,
      value,
      desc,
      type,
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
    const isExist = await interactionStatisService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的互动！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await interactionStatisService.delete(id);
    successHandler({ ctx });

    await next();
  }
}

export default new InteractionController();
