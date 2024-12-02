import fs from 'fs';
import path from 'path';

import { ParameterizedContext } from 'koa';
import nodeSchedule from 'node-schedule';
import { rimrafSync } from 'rimraf';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import liveRedisController from '@/config/websocket/live-redis.controller';
import { COMMON_HTTP_CODE, SCHEDULE_TYPE, WEBM_DIR } from '@/constant';
import { IList, ILive } from '@/interface';
import { CustomError } from '@/model/customError.model';
import liveService from '@/service/live.service';
import { getForwardList, killPid } from '@/utils/process';

import tencentcloudCssController from './tencentcloudCss.controller';

class LiveController {
  common = {
    findAll: async ({
      id,
      live_record_id,
      live_room_id,
      user_id,
      platform,
      stream_name,
      stream_id,
      remark,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<ILive>) => {
      const result = await liveService.findAll({
        id,
        live_record_id,
        live_room_id,
        user_id,
        platform,
        stream_name,
        stream_id,
        remark,
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

    getList: async ({
      id,
      live_record_id,
      live_room_id,
      user_id,
      platform,
      stream_name,
      stream_id,
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
    }: IList<ILive>) => {
      const result = await liveService.getList({
        id,
        live_record_id,
        live_room_id,
        user_id,
        platform,
        stream_name,
        stream_id,
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
      });
      return result;
    },

    getPureList: async ({
      id,
      live_record_id,
      live_room_id,
      user_id,
      platform,
      stream_name,
      stream_id,
      remark,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<ILive>) => {
      const result = await liveService.getPureList({
        id,
        live_record_id,
        live_room_id,
        user_id,
        platform,
        stream_name,
        stream_id,
        remark,
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

    delete: async (id: number, isRoute?: boolean) => {
      const isExist = await liveService.isExist([id]);
      if (!isExist) {
        if (isRoute) {
          throw new CustomError(
            `不存在id为${id}的直播！`,
            COMMON_HTTP_CODE.paramsError,
            COMMON_HTTP_CODE.paramsError
          );
        }
      } else {
        await liveService.delete(id);
      }
    },

    deleteByLiveRoomId: async (liveRoomIds: number[]) => {
      if (!liveRoomIds.length) {
        console.log('liveRoomIds为空');
        return 0;
      }
      const res = await liveService.deleteByLiveRoomId(liveRoomIds);
      return res;
    },

    findByLiveRoomId: async (liveRoomId: number) => {
      const res = await liveService.findByLiveRoomId(liveRoomId);
      return res;
    },

    findLiveRecordByLiveRoomId: (liveRoomId: number) => {
      return liveService.findLiveRecordByLiveRoomId(liveRoomId);
    },

    liveRoomisLive: async (liveRoomId: number) => {
      const res = await liveService.liveRoomisLive(liveRoomId);
      return res;
    },

    closeLive: async (liveRoomId: number) => {
      const res = await tencentcloudCssController.common.closeLive({
        live_room_id: liveRoomId,
      });
      nodeSchedule.cancelJob(`${SCHEDULE_TYPE.blobIsExist}___${liveRoomId}`);
      const roomDir = path.resolve(WEBM_DIR, `roomId_${liveRoomId}`);
      if (fs.existsSync(roomDir)) {
        rimrafSync(roomDir);
      }
      return res;
    },

    create: async ({
      id,
      live_record_id,
      live_room_id,
      user_id,
      platform,
      stream_name,
      stream_id,
      remark,
    }: ILive) => {
      const res = await liveService.create({
        id,
        live_record_id,
        live_room_id,
        user_id,
        platform,
        stream_name,
        stream_id,
        remark,
      });
      return res;
    },
  };

  getList = async (ctx: ParameterizedContext, next) => {
    const result = await this.common.getList(ctx.request.query);
    successHandler({ ctx, data: result });
    await next();
  };

  getPureList = async (ctx: ParameterizedContext, next) => {
    const result = await this.common.getPureList(ctx.request.query);
    successHandler({ ctx, data: result });
    await next();
  };

  getLiveUser = async (ctx: ParameterizedContext, next) => {
    const { live_room_id } = ctx.request.query;
    const liveUser = await liveRedisController.getLiveRoomOnlineUser(
      Number(live_room_id)
    );
    successHandler({ ctx, data: liveUser });
    await next();
  };

  listDuplicateRemoval = async (ctx: ParameterizedContext, next) => {
    successHandler({ ctx });
    await next();
  };

  renderFakeLive = async (ctx: ParameterizedContext, next) => {
    successHandler({ ctx });
    await next();
  };

  renderFakeLiveByBilibili = async (ctx: ParameterizedContext, next) => {
    successHandler({ ctx });
    await next();
  };

  addFakeLive = async (ctx: ParameterizedContext, next) => {
    successHandler({ ctx });
    await next();
  };

  delFakeLive = async (ctx: ParameterizedContext, next) => {
    successHandler({ ctx });
    await next();
  };

  closeLive = async (ctx: ParameterizedContext, next) => {
    const { code, userInfo, msg } = await authJwt(ctx);
    if (code !== COMMON_HTTP_CODE.success || !userInfo) {
      throw new CustomError(msg, code, code);
    }

    successHandler({ ctx });
    await next();
  };

  closeLiveByLiveRoomId = async (ctx: ParameterizedContext, next) => {
    const { live_room_id } = ctx.params;
    if (!live_room_id) {
      throw new CustomError(
        'live_room_id为空',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await this.common.closeLive(live_room_id);
    successHandler({ ctx });
    await next();
  };

  async isLive(ctx: ParameterizedContext, next) {
    successHandler({ ctx });
    await next();
  }

  liveRoomisLive = async (ctx: ParameterizedContext, next) => {
    const live_room_id = +ctx.params.live_room_id;
    if (!live_room_id) {
      throw new CustomError(
        'live_room_id为空',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const res = await this.common.liveRoomisLive(live_room_id);
    successHandler({ ctx, data: res });
    await next();
  };

  async getForwardList(ctx: ParameterizedContext, next) {
    const res: any = await getForwardList();
    let list: any[] = [];
    if (res.stdout !== '') {
      list = res.stdout.split('\n');
    }
    successHandler({ ctx, data: { list, res } });
    await next();
  }

  async killForward(ctx: ParameterizedContext, next) {
    const { pid } = ctx.params;
    if (!pid) {
      throw new CustomError(
        'pid为空',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const res = await killPid(pid);
    successHandler({ ctx, data: res });
    await next();
  }

  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await liveService.find(id);
    successHandler({ ctx, data: result });

    await next();
  }

  delete = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    await this.common.delete(id, true);
    successHandler({ ctx });

    await next();
  };
}

export default new LiveController();
