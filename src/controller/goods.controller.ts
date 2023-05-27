import { ParameterizedContext } from 'koa';

import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE } from '@/constant';
import { IGoods, IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import goodsService from '@/service/goods.service';

class GoodsController {
  common = {
    create: (data: IGoods) => goodsService.create(data),
  };

  async getList(ctx: ParameterizedContext, next) {
    const {
      id,
      name,
      type,
      desc,
      short_desc,
      badge,
      badge_bg,
      remark,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IGoods> = ctx.request.query;
    const result = await goodsService.getList({
      id,
      name,
      type,
      desc,
      short_desc,
      badge,
      badge_bg,
      remark,
      orderBy,
      orderName,
      nowPage,
      pageSize,
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
    const result = await goodsService.find(id);
    successHandler({ ctx, data: result });
    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(
        '权限不足！',
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const id = +ctx.params.id;
    const {
      type,
      name,
      deleted_at,
      short_desc,
      cover,
      price,
      original_price,
      nums,
      badge,
      badge_bg,
      remark,
    }: IGoods = ctx.request.body;
    const isExist = await goodsService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的商品！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await goodsService.update({
      id,
      type,
      name,
      deleted_at,
      short_desc,
      cover,
      price,
      original_price,
      nums,
      badge,
      badge_bg,
      remark,
    });
    successHandler({ ctx });
    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    const {
      type,
      name,
      deleted_at,
      short_desc,
      cover,
      price,
      original_price,
      nums,
      badge,
      badge_bg,
      remark,
    }: IGoods = ctx.request.body;
    await this.common.create({
      type,
      name,
      deleted_at,
      short_desc,
      cover,
      price,
      original_price,
      nums,
      badge,
      badge_bg,
      remark,
    });
    successHandler({ ctx });
    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(
        '权限不足！',
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const id = +ctx.params.id;
    const isExist = await goodsService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的商品！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await goodsService.delete(id);
    successHandler({ ctx });
    await next();
  }
}

export default new GoodsController();
