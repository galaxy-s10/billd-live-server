import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE } from '@/constant';
import { IGiftRecord, IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import giftRecordService from '@/service/giftRecord.service';

class GiftRecordController {
  common = {
    create: ({
      is_recv,
      goods_id,
      goods_nums,
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
        order_id,
        live_room_id,
        send_user_id,
        recv_user_id,
        remark,
      }),
    find: (id: number) => giftRecordService.find(id),
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

  find = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const result = await this.common.find(id);
    successHandler({ ctx, data: result });
    await next();
  };

  async update(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const {
      is_recv,
      goods_id,
      goods_nums,
      order_id,
      live_room_id,
      send_user_id,
      recv_user_id,
      remark,
    }: IGiftRecord = ctx.request.body;
    const isExist = await giftRecordService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的礼物记录！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await giftRecordService.update({
      id,
      is_recv,
      goods_id,
      goods_nums,
      order_id,
      live_room_id,
      send_user_id,
      recv_user_id,
      remark,
    });
    successHandler({ ctx });
    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok || !userInfo) {
      throw new CustomError(message, code, code);
    }
    const data: IGiftRecord = ctx.request.body;
    await this.common.create(data);
    successHandler({ ctx });
    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await giftRecordService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的礼物记录！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await giftRecordService.delete(id);
    successHandler({ ctx });
    await next();
  }
}

export default new GiftRecordController();
