import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE, MSG_MAX_LENGTH } from '@/constant';
import { IList, IWsMessage } from '@/interface';
import { CustomError } from '@/model/customError.model';
import wsMessageService from '@/service/wsMessage.service';

class WsMessageController {
  common = {
    create: ({
      msg_type,
      live_room_id,
      user_id,
      msg_is_file,
      ip,
      content,
      origin_content,
      username,
      origin_username,
      user_agent,
      send_msg_time,
      redbag_send_id,
      is_show,
      is_verify,
    }: IWsMessage) => {
      if (content && content?.length > MSG_MAX_LENGTH) {
        throw new CustomError(
          `消息长度最大${MSG_MAX_LENGTH}！`,
          ALLOW_HTTP_CODE.paramsError,
          ALLOW_HTTP_CODE.paramsError
        );
      }
      return wsMessageService.create({
        msg_type,
        live_room_id,
        user_id,
        msg_is_file,
        ip,
        content,
        origin_content,
        username,
        origin_username,
        user_agent,
        send_msg_time,
        redbag_send_id,
        is_show,
        is_verify,
      });
    },
    find: (id: number) => wsMessageService.find(id),
    updateIsShow: ({ id, is_show }: IWsMessage) =>
      wsMessageService.update({ id, is_show }),
  };

  async update(ctx: ParameterizedContext, next) {
    const {
      id,
      msg_type,
      live_room_id,
      user_id,
      msg_is_file,
      ip,
      content,
      origin_content,
      username,
      origin_username,
      user_agent,
      send_msg_time,
      redbag_send_id,
      is_show,
      is_verify,
    }: IWsMessage = ctx.request.body;

    const res = await wsMessageService.update({
      id,
      msg_type,
      live_room_id,
      user_id,
      msg_is_file,
      ip,
      content,
      origin_content,
      username,
      origin_username,
      user_agent,
      send_msg_time,
      redbag_send_id,
      is_show,
      is_verify,
    });
    successHandler({ ctx, data: res });
    await next();
  }

  async getList(ctx: ParameterizedContext, next) {
    const {
      msg_type,
      redbag_send_id,
      live_room_id,
      user_id,
      msg_is_file,
      ip,
      is_show,
      is_verify,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IWsMessage> = ctx.request.query;
    const result = await wsMessageService.getList({
      msg_type,
      redbag_send_id,
      live_room_id,
      user_id,
      msg_is_file,
      ip,
      is_show,
      is_verify,
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

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await wsMessageService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的消息！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await wsMessageService.delete(id);
    successHandler({ ctx });
    await next();
  }
}

export default new WsMessageController();
