import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE } from '@/constant';
import { IList, IMonit } from '@/interface';
import { CustomError } from '@/model/customError.model';
import monitService from '@/service/monit.service';

class MonitController {
  async getList(ctx: ParameterizedContext, next) {
    const {
      id,
      type,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IMonit> = ctx.request.query;
    const result = await monitService.getList({
      id,
      type,
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
    const result = await monitService.find(id);
    successHandler({ ctx, data: result });

    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const { type, info }: IMonit = ctx.request.body;
    const isExist = await monitService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的监控！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const result = await monitService.update({
      id,
      type,
      info,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    const { type, info }: IMonit = ctx.request.body;
    const result = await monitService.create({
      type,
      info,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await monitService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的监控！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const result = await monitService.delete(id);
    successHandler({ ctx, data: result });

    await next();
  }
}

export default new MonitController();
