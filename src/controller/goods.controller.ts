import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import { IGoods, IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import goodsService from '@/service/goods.service';

class GoodsController {
  common = {
    create: (data: IGoods) => goodsService.create(data),
    find: (id: number) => goodsService.find(id),
    findByType: (type) => goodsService.findByType(type),
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
      orderBy,
      orderName,
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

  find = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const result = await this.common.find(id);
    successHandler({ ctx, data: result });
    await next();
  };

  findByType = async (ctx: ParameterizedContext, next) => {
    const { type } = ctx.request.query;
    const result = await this.common.findByType(type);
    successHandler({ ctx, data: result });
    await next();
  };

  async update(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const {
      type,
      name,
      desc,
      short_desc,
      cover,
      price,
      original_price,
      nums,
      pay_nums,
      inventory,
      badge,
      badge_bg,
      remark,
    }: IGoods = ctx.request.body;
    const isExist = await goodsService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的商品！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await goodsService.update({
      id,
      type,
      name,
      desc,
      short_desc,
      cover,
      price,
      original_price,
      nums,
      pay_nums,
      inventory,
      badge,
      badge_bg,
      remark,
    });
    successHandler({ ctx });
    await next();
  }

  create = async (ctx: ParameterizedContext, next) => {
    const {
      type,
      name,
      desc,
      short_desc,
      cover,
      price,
      original_price,
      nums,
      pay_nums,
      inventory,
      badge,
      badge_bg,
      remark,
    }: IGoods = ctx.request.body;
    await this.common.create({
      type,
      name,
      desc,
      short_desc,
      cover,
      price,
      original_price,
      nums,
      pay_nums,
      inventory,
      badge,
      badge_bg,
      remark,
    });
    successHandler({ ctx });
    await next();
  };

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await goodsService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的商品！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await goodsService.delete(id);
    successHandler({ ctx });
    await next();
  }
}

export default new GoodsController();
