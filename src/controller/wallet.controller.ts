import { ParameterizedContext } from 'koa';

import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE, PROJECT_ENV } from '@/constant';
import userController from '@/controller/user.controller';
import { IList, IUser, IWallet } from '@/interface';
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
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(
        '权限不足！',
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
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

  initUserWallet = async (ctx: ParameterizedContext, next) => {
    if (PROJECT_ENV !== 'development') {
      throw new CustomError(
        '非开发环境，不能初始化钱包！',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const res = await userController.common.list({
      orderBy: 'asc',
      orderName: 'id',
    });
    const handleWallert = async (item: IUser) => {
      const flag = await walletService.findByUserId(item.id!);
      if (!flag) {
        await this.common.create({ user_id: item.id, balance: '0.00' });
      }
    };
    const arr: any[] = [];
    res.rows.forEach((item: IUser) => {
      arr.push(handleWallert(item));
    });
    await Promise.all(arr);
    successHandler({ ctx, data: '初始化钱包成功！' });
    await next();
  };

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
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(
        '权限不足！',
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
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
