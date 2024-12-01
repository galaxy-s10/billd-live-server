import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import { IList, IWallet } from '@/interface';
import { CustomError } from '@/model/customError.model';
import walletService from '@/service/wallet.service';

class WalletController {
  common = {
    create: ({ user_id, balance }: IWallet) =>
      walletService.create({ user_id, balance }),
    findByUserId: (userId: number) => walletService.findByUserId(userId),
    updateByUserId: ({ user_id, balance }: IWallet) =>
      walletService.updateByUserId({ user_id, balance }),
    changeBalanceByUserId: ({ user_id, balance }: IWallet) =>
      walletService.changeBalanceByUserId({ user_id, balance }),
  };

  async getList(ctx: ParameterizedContext, next) {
    const {
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

  findMyWallet = async (ctx: ParameterizedContext, next) => {
    const { code, userInfo, msg } = await authJwt(ctx);
    if (code !== COMMON_HTTP_CODE.success || !userInfo) {
      throw new CustomError(msg, code, code);
    }
    const result = await this.common.findByUserId(userInfo.id!);
    successHandler({ ctx, data: result });
    await next();
  };

  async update(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const { user_id, balance }: IWallet = ctx.request.body;
    const isExist = await walletService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的直播间！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
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
    const data: IWallet = ctx.request.body;
    await this.common.create(data);
    successHandler({ ctx });
    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await walletService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的直播间！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await walletService.delete(id);
    successHandler({ ctx });
    await next();
  }
}

export default new WalletController();
