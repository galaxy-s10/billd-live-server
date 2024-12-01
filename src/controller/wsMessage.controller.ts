import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE, MSG_MAX_LENGTH, REDIS_PREFIX } from '@/constant';
import redisController from '@/controller/redis.controller';
import { IList, IWsMessage } from '@/interface';
import { CustomError } from '@/model/customError.model';
import wsMessageService from '@/service/wsMessage.service';

class WsMessageController {
  common = {
    find: (id: number) => wsMessageService.find(id),
    getCountByLiveRecordId: (live_record_id: number) =>
      wsMessageService.getCountByLiveRecordId(live_record_id),
    create: ({
      live_record_id,
      username,
      origin_username,
      content_type,
      content,
      origin_content,
      live_room_id,
      user_id,
      client_ip,
      msg_type,
      user_agent,
      send_msg_time,
      is_show,
      remark,
    }: IWsMessage) => {
      if (content && content?.length > MSG_MAX_LENGTH) {
        throw new CustomError(
          `消息长度最大${MSG_MAX_LENGTH}！`,
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
      return wsMessageService.create({
        live_record_id,
        username,
        origin_username,
        content_type,
        content,
        origin_content,
        live_room_id,
        user_id,
        client_ip,
        msg_type,
        user_agent,
        send_msg_time,
        is_show,
        remark,
      });
    },
    update: ({
      id,
      live_record_id,
      username,
      origin_username,
      content_type,
      content,
      origin_content,
      live_room_id,
      user_id,
      client_ip,
      msg_type,
      user_agent,
      send_msg_time,
      is_show,
      remark,
    }) =>
      wsMessageService.update({
        id,
        live_record_id,
        username,
        origin_username,
        content_type,
        content,
        origin_content,
        live_room_id,
        user_id,
        client_ip,
        msg_type,
        user_agent,
        send_msg_time,
        is_show,
        remark,
      }),
    updateIsShow: ({ id, is_show }: IWsMessage) =>
      wsMessageService.update({ id, is_show }),
    getList: async ({
      id,
      live_record_id,
      username,
      origin_username,
      content_type,
      content,
      origin_content,
      live_room_id,
      user_id,
      client_ip,
      msg_type,
      user_agent,
      send_msg_time,
      is_show,
      remark,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IWsMessage>) => {
      try {
        const oldCache = await redisController.getVal({
          prefix: REDIS_PREFIX.dbLiveRoomHistoryMsgList,
          key: `${live_room_id!}`,
        });
        if (oldCache) {
          return JSON.parse(oldCache).value;
        }
      } catch (error) {
        console.log(error);
      }
      const result = await wsMessageService.getList({
        id,
        live_record_id,
        username,
        origin_username,
        content_type,
        content,
        origin_content,
        live_room_id,
        user_id,
        client_ip,
        msg_type,
        user_agent,
        send_msg_time,
        is_show,
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
      try {
        redisController.setExVal({
          prefix: REDIS_PREFIX.dbLiveRoomHistoryMsgList,
          key: `${live_room_id!}`,
          value: result,
          exp: 3,
        });
      } catch (error) {
        console.log(error);
      }
      return result;
    },
  };

  update = async (ctx: ParameterizedContext, next) => {
    const data = ctx.request.body;
    const res = await this.common.update(data);
    successHandler({ ctx, data: res });
    await next();
  };

  getList = async (ctx: ParameterizedContext, next) => {
    const data = ctx.request.query;
    const result = await this.common.getList(data);
    successHandler({ ctx, data: result });
    await next();
  };

  find = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const result = await this.common.find(id);
    successHandler({ ctx, data: result });
    await next();
  };

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await wsMessageService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的消息！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await wsMessageService.delete(id);
    successHandler({ ctx });
    await next();
  }
}

export default new WsMessageController();
