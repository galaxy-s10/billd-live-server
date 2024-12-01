import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import { IList, IWalletRecord } from '@/interface';
import { CustomError } from '@/model/customError.model';
import walletRecordService from '@/service/walletRecord.service';

class WalletRecordController {
  common = {
    create: ({
      user_id,
      order_id,
      type,
      name,
      amount,
      amount_status,
      remark,
    }: IWalletRecord) =>
      walletRecordService.create({
        user_id,
        order_id,
        type,
        name,
        amount,
        amount_status,
        remark,
      }),
    find: (id: number) => walletRecordService.find(id),
    getList: ({
      id,
      user_id,
      order_id,
      type,
      name,
      remark,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IWalletRecord>) =>
      walletRecordService.getList({
        id,
        user_id,
        order_id,
        type,
        name,
        remark,
        orderBy,
        orderName,
        nowPage,
        pageSize,
        keyWord,
        rangTimeType,
        rangTimeStart,
        rangTimeEnd,
      }),
  };

  getList = async (ctx: ParameterizedContext, next) => {
    const data = ctx.request.query;
    const result = await this.common.getList(data);
    successHandler({ ctx, data: result });
    await next();
  };

  getMyList = async (ctx: ParameterizedContext, next) => {
    const { code, errorCode, userInfo, msg } = await authJwt(ctx);
    if (code !== COMMON_HTTP_CODE.success || !userInfo) {
      throw new CustomError(msg, code, errorCode);
    }
    const data = ctx.request.query;
    const result = await this.common.getList({ ...data, user_id: userInfo.id });
    successHandler({ ctx, data: result });
    await next();
  };

  find = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const result = await this.common.find(id);
    successHandler({ ctx, data: result });
    await next();
  };

  async update(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const {
      user_id,
      order_id,
      type,
      name,
      amount,
      amount_status,
      remark,
    }: IWalletRecord = ctx.request.body;
    const isExist = await walletRecordService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的钱包记录！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await walletRecordService.update({
      id,
      user_id,
      order_id,
      type,
      name,
      amount,
      amount_status,
      remark,
    });
    successHandler({ ctx });
    await next();
  }

  create = async (ctx: ParameterizedContext, next) => {
    const data: IWalletRecord = ctx.request.body;
    await this.common.create(data);
    successHandler({ ctx });
    await next();
  };

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await walletRecordService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的钱包记录！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await walletRecordService.delete(id);
    successHandler({ ctx });
    await next();
  }
}

export default new WalletRecordController();
