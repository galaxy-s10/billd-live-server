import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE } from '@/constant';
import { IList, IWallet } from '@/interface';
import { CustomError } from '@/model/customError.model';
import walletService from '@/service/wallet.service';

class LiveRoomController {
  common = {
    create: (data: IWallet) => walletService.create(data),
  };

  async getList(ctx: ParameterizedContext, next) {
    const {
      id,
      user_id,
      balance,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IWallet> = ctx.request.query;
    const result = await walletService.getList({
      id,
      user_id,
      balance,
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
    const result = await walletService.find(id);
    successHandler({ ctx, data: result });
    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const { user_id, balance }: IWallet = ctx.request.body;
    const isExist = await walletService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的直播间！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await walletService.update({
      id,
      user_id,
      balance,
    });
    successHandler({ ctx });
    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    const { user_id, balance }: IWallet = ctx.request.body;
    await this.common.create({
      user_id,
      balance,
    });
    successHandler({ ctx });
    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await walletService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的直播间！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await walletService.delete(id);
    successHandler({ ctx });
    await next();
  }
}

export default new LiveRoomController();
