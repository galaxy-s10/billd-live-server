import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import { IList, ILivePlay } from '@/interface';
import { CustomError } from '@/model/customError.model';
import livePlayService from '@/service/livePlay.service';

class LivePlayController {
  common = {
    find: async (id: number) => {
      const res = await livePlayService.find(id);
      return res;
    },

    findAll: async (data: {
      live_room_id;
      user_id;
      random_id;
      rangTimeStart;
      rangTimeEnd;
    }) => {
      const res = await livePlayService.findAll(data);
      return res;
    },

    create: async (data: ILivePlay) => {
      const res = await livePlayService.create(data);
      return res;
    },

    getList: async ({
      id,
      live_room_id,
      user_id,
      random_id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<ILivePlay>) => {
      const result = await livePlayService.getList({
        id,
        live_room_id,
        user_id,
        random_id,
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
      const isExist = await livePlayService.isExist([id]);
      if (!isExist) {
        throw new CustomError(
          `不存在id为${id}的直播！`,
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
      await livePlayService.delete(id);
    },

    updateEndTime: async (data: {
      live_room_id: number;
      user_id?: number;
      random_id?: string;
      srs_client_id: string;
      srs_ip: string;
      end_time: string;
    }) => {
      const res = await livePlayService.updateEndTime(data);
      return res;
    },
  };

  getList = async (ctx: ParameterizedContext, next) => {
    const result = await this.common.getList(ctx.request.query);
    successHandler({ ctx, data: result });

    await next();
  };
}

export default new LivePlayController();
