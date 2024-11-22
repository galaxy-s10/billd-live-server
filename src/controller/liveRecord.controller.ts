import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import { IList, ILiveRecord } from '@/interface';
import { CustomError } from '@/model/customError.model';
import liveRecordService from '@/service/liveRecord.service';

class LiveRecordController {
  common = {
    find: (id: number) => {
      return liveRecordService.find(id);
    },

    create: ({
      id,
      platform,
      stream_name,
      stream_id,
      user_id,
      live_room_id,
      duration,
      danmu,
      view,
      start_time,
      end_time,
      remark,
    }: ILiveRecord) => {
      return liveRecordService.create({
        id,
        platform,
        stream_name,
        stream_id,
        user_id,
        live_room_id,
        duration,
        danmu,
        view,
        start_time,
        end_time,
        remark,
      });
    },

    update: ({
      id,
      platform,
      stream_name,
      stream_id,
      user_id,
      live_room_id,
      duration,
      danmu,
      view,
      start_time,
      end_time,
      remark,
    }: ILiveRecord) => {
      return liveRecordService.update({
        id,
        platform,
        stream_name,
        stream_id,
        user_id,
        live_room_id,
        duration,
        danmu,
        view,
        start_time,
        end_time,
        remark,
      });
    },

    updateDuration: (data: ILiveRecord) => {
      return liveRecordService.updateDuration(data);
    },

    getList: ({
      id,
      platform,
      stream_name,
      stream_id,
      user_id,
      live_room_id,
      duration,
      danmu,
      view,
      start_time,
      end_time,
      remark,
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
      return liveRecordService.getList({
        id,
        platform,
        stream_name,
        stream_id,
        user_id,
        live_room_id,
        duration,
        danmu,
        view,
        start_time,
        end_time,
        remark,
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
  };

  getList = async (ctx: ParameterizedContext, next) => {
    const result = await this.common.getList(ctx.request.query);
    successHandler({ ctx, data: result });

    await next();
  };
}

export default new LiveRecordController();
