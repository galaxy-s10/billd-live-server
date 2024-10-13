import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import { IList, ILiveRecord } from '@/interface';
import { CustomError } from '@/model/customError.model';
import liveRecordService from '@/service/liveRecord.service';

class LiveRecordController {
  common = {
    find: async (id: number) => {
      const res = await liveRecordService.find(id);
      return res;
    },

    create: async (data: ILiveRecord) => {
      const res = await liveRecordService.create(data);
      return res;
    },

    updateByLiveRoomIdAndUserId: async (data: ILiveRecord) => {
      const res = await liveRecordService.updateByLiveRoomIdAndUserId(data);
      return res;
    },

    updateView: async (data: ILiveRecord) => {
      const res = await liveRecordService.updateView(data);
      return res;
    },

    getList: async ({
      id,
      client_id,
      live_room_id,
      user_id,
      childOrderName,
      childOrderBy,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<ILiveRecord>) => {
      const result = await liveRecordService.getList({
        id,
        client_id,
        live_room_id,
        user_id,
        childOrderName,
        childOrderBy,
        nowPage,
        pageSize,
        orderBy,
        orderName,
        keyWord,
        rangTimeType,
        rangTimeStart,
        rangTimeEnd,
      });
      return result;
    },

    delete: async (id: number) => {
      const isExist = await liveRecordService.isExist([id]);
      if (!isExist) {
        throw new CustomError(
          `不存在id为${id}的直播记录！`,
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
      await liveRecordService.delete(id);
    },

    deleteByLiveRoomIdAndUserId: async (data: {
      client_id: number;
      live_room_id: number;
      user_id: number;
    }) => {
      const res = await liveRecordService.deleteByLiveRoomIdAndUserId(data);
      return res;
    },
  };

  getList = async (ctx: ParameterizedContext, next) => {
    const result = await this.common.getList(ctx.request.query);
    successHandler({ ctx, data: result });

    await next();
  };
}

export default new LiveRecordController();
