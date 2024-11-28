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

  statistics = async (ctx: ParameterizedContext, next) => {
    const {
      live_room_id,
      user_id,
      rangTimeStart,
      rangTimeEnd,
    }: IList<ILiveRecord> = ctx.request.query;
    if (!Number(rangTimeStart) || !Number(rangTimeEnd)) {
      throw new CustomError(
        'rangTimeStart或rangTimeEnd错误',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const rangTime = getRangTimeDay({
      rangTimeEnd: Number(rangTimeEnd),
      rangTimeStart: Number(rangTimeStart),
    });
    if (rangTime.length > 180) {
      throw new CustomError(
        '最大查询范围180天',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const res1 = await liveRecordService.statistics1({
      user_id,
      live_room_id,
      startTime: Number(rangTimeStart),
      endTime: Number(rangTimeEnd),
    });
    interface IItem {
      danmu: number[];
      view: number[];
      user_total: Record<number, any>;
      live_room_total: Record<number, any>;
      duration: number[];
    }
    const map: Record<string, IItem | undefined> = {};
    const res11 = res1.map((item) => {
      const val = item.get();
      const key = val.created_at!.split(' ')[0].replaceAll('-', '/');
      map[key] = undefined;
      return {
        ...val,
        created_at: key,
      };
    });
    res11.forEach((item) => {
      const val = map[item.created_at];
      if (val) {
        val.danmu.push(item.danmu || 0);
        val.view.push(item.view || 0);
        val.user_total[item.user_id || -1] = 1;
        val.live_room_total[item.live_room_id || -1] = 1;
        val.duration.push(item.duration || 0);
      } else {
        map[item.created_at] = {
          danmu: [item.danmu || 0],
          view: [item.view || 0],
          user_total: { [item.user_id || -1]: 1 },
          live_room_total: { [item.live_room_id || -1]: 1 },
          duration: [item.duration || 0],
        };
      }
    });
    const map1 = {};
    Object.keys(map).forEach((item) => {
      const duration = map[item]?.duration || [];
      const danmu = map[item]?.danmu || [];
      const view = map[item]?.view || [];
      const danmu_total = danmu.reduce((pre, curr) => pre + curr, 0);
      const view_total = view.reduce((pre, curr) => pre + curr, 0);
      const user_total = Object.keys(map[item]?.user_total || {}).length;
      const live_room_total = Object.keys(
        map[item]?.live_room_total || {}
      ).length;
      const duration_total = duration.reduce((pre, curr) => pre + curr, 0);
      map1[item] = {
        danmu_total,
        view_total,
        user_total,
        live_room_total,
        duration_total,
        duration_average_user: Math.floor(duration_total / user_total) || 0,
        duration_average_live_room:
          Math.floor(duration_total / live_room_total) || 0,
      };
    });
    const res = rangTime.map((item) => {
      if (!map1[item]) {
        return {
          day: item,
          view_total: 0,
          danmu_total: 0,
          user_total: 0,
          live_room_total: 0,
          duration_total: 0,
          duration_average_user: 0,
          duration_average_live_room: 0,
        };
      }
      return {
        day: item,
        view_total: map1[item].view_total,
        danmu_total: map1[item].danmu_total,
        user_total: map1[item].user_total,
        live_room_total: map1[item].live_room_total,
        duration_total: map1[item].duration_total,
        duration_average_user: map1[item].duration_average_user,
        duration_average_live_room: map1[item].duration_average_live_room,
      };
    });
    successHandler({ ctx, data: res });
    await next();
  };

  getList = async (ctx: ParameterizedContext, next) => {
    const result = await this.common.getList(ctx.request.query);
    successHandler({ ctx, data: result });

    await next();
  };
}

export default new LiveRecordController();
