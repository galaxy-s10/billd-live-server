import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { COMMON_ERROR_CODE, COMMON_HTTP_CODE } from '@/constant';
import goodsController from '@/controller/goods.controller';
import liveRoomController from '@/controller/liveRoom.controller';
import walletController from '@/controller/wallet.controller';
import walletRecordController from '@/controller/walletRecord.controller';
import {
  GiftRecordIsRecvEnum,
  GiftRecordStatusEnum,
  IGiftRecord,
  IList,
  WalletRecordAmountStatusEnum,
  WalletRecordEnum,
} from '@/interface';
import { CustomError } from '@/model/customError.model';
import giftRecordService from '@/service/giftRecord.service';

class GiftRecordController {
  common = {
    create: ({
      is_recv,
      goods_id,
      goods_nums,
      goods_snapshot,
      order_id,
      live_room_id,
      send_user_id,
      recv_user_id,
      remark,
    }: IGiftRecord) =>
      giftRecordService.create({
        is_recv,
        goods_id,
        goods_nums,
        goods_snapshot,
        order_id,
        live_room_id,
        send_user_id,
        recv_user_id,
        remark,
      }),
    find: (id: number) => giftRecordService.find(id),
    update: async ({
      id,
      is_recv,
      goods_id,
      goods_nums,
      order_id,
      live_room_id,
      send_user_id,
      recv_user_id,
      status,
      remark,
    }: IGiftRecord) => {
      const isExist = await giftRecordService.isExist([id!]);
      if (!isExist) {
        throw new CustomError(
          `不存在id为${id!}的礼物记录！`,
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
      const res = giftRecordService.update({
        id,
        is_recv,
        goods_id,
        goods_nums,
        order_id,
        live_room_id,
        send_user_id,
        recv_user_id,
        status,
        remark,
      });
      return res;
    },
  };

  async getList(ctx: ParameterizedContext, next) {
    const {
      id,
      is_recv,
      goods_id,
      goods_nums,
      order_id,
      live_room_id,
      send_user_id,
      recv_user_id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IGiftRecord> = ctx.request.query;
    const result = await giftRecordService.getList({
      id,
      is_recv,
      goods_id,
      goods_nums,
      order_id,
      live_room_id,
      send_user_id,
      recv_user_id,
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

  async getGiftGroupList(ctx: ParameterizedContext, next) {
    const {
      id,
      is_recv,
      goods_id,
      goods_nums,
      order_id,
      live_room_id,
      send_user_id,
      recv_user_id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IGiftRecord> = ctx.request.query;
    const result = await giftRecordService.getGiftGroupList({
      id,
      is_recv,
      goods_id,
      goods_nums,
      order_id,
      live_room_id,
      send_user_id,
      recv_user_id,
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

  update = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const data: IGiftRecord = ctx.request.body;
    const isExist = await giftRecordService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的礼物记录！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await this.common.update({
      id,
      ...data,
    });
    successHandler({ ctx });
    await next();
  };

  create = async (ctx: ParameterizedContext, next) => {
    const { code, userInfo, msg } = await authJwt(ctx);
    if (code !== COMMON_HTTP_CODE.success || !userInfo) {
      throw new CustomError(msg, code, code);
    }
    const {
      live_room_id,
      goods_id,
      goods_nums,
      is_bilibili,
    }: IGiftRecord & { is_bilibili: boolean } = ctx.request.body;
    if (!live_room_id || !goods_id || !goods_nums) {
      throw new CustomError(
        `参数缺失！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const walletRes = await walletController.common.findByUserId(userInfo.id!);
    if (!walletRes) {
      throw new CustomError(
        `你没有钱包！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    let liveRoomRes;
    if (!is_bilibili) {
      liveRoomRes = await liveRoomController.common.find(live_room_id);
      if (!liveRoomRes) {
        throw new CustomError(
          `不存在id为${live_room_id}的直播间！`,
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
    }
    const goodsRes = await goodsController.common.find(goods_id);
    if (!goodsRes) {
      throw new CustomError(
        `不存在id为${goods_id}的商品！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const goodsAmount = goodsRes.price! * goods_nums;
    const remainBalance = walletRes.balance! - goodsAmount;
    if (remainBalance < 0) {
      throw new CustomError(
        `余额不足!`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_ERROR_CODE.balanceNotEnough
      );
    }
    const recordRes = await this.common.create({
      live_room_id,
      goods_id,
      goods_nums,
      goods_snapshot: JSON.stringify(goodsRes),
      send_user_id: userInfo.id!,
      recv_user_id: liveRoomRes?.user_live_room?.user?.id || -1,
      is_recv: GiftRecordIsRecvEnum.no,
    });
    try {
      await walletController.common.updateByUserId({
        user_id: userInfo.id!,
        balance: remainBalance,
      });
      await walletRecordController.common.create({
        user_id: userInfo.id!,
        type: WalletRecordEnum.reward,
        name: goodsRes.name,
        amount: goodsAmount,
        amount_status: WalletRecordAmountStatusEnum.del,
      });
    } catch (error) {
      console.log(error);
      this.common.update({
        id: recordRes.id,
        status: GiftRecordStatusEnum.balanceError,
      });
    }
    successHandler({ ctx });
    await next();
  };

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await giftRecordService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的礼物记录！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await giftRecordService.delete(id);
    successHandler({ ctx });
    await next();
  }
}

export default new GiftRecordController();
