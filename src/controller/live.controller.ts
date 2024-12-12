import fs from 'fs';
import path from 'path';

import { ParameterizedContext } from 'koa';
import nodeSchedule from 'node-schedule';
import { rimrafSync } from 'rimraf';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import {
  COMMON_HTTP_CODE,
  REDIS_KEY,
  SCHEDULE_TYPE,
  WEBM_DIR,
} from '@/constant';
import { IList, ILive } from '@/interface';
import { CustomError } from '@/model/customError.model';
import liveService from '@/service/live.service';
import { getForwardList, killPid } from '@/utils/process';

import liveRoomController from './liveRoom.controller';
import redisController from './redis.controller';
import srsController from './srs.controller';
import tencentcloudCssController from './tencentcloudCss.controller';
import userController from './user.controller';
import userLiveRoomController from './userLiveRoom.controller';

class LiveController {
  common = {
    liveUser: async (key: string) => {
      const res = await redisController.findByPrefix({
        prefix: key,
      });
      const userIdArr: any[] = [];
      const liveRoomIdArr: any[] = [];

      res.forEach((item) => {
        const live_room_id = item.split('___')[1];
        const user_id = item.split('___')[2];
        liveRoomIdArr.push(live_room_id);
        userIdArr.push(user_id);
      });
      const res1 = await userController.common.findAll(userIdArr);
      const res2 = await liveRoomController.common.findAll(liveRoomIdArr);

      const userObj = {};
      const liveRoomObj = {};

      res1.forEach((item) => {
        userObj[item.id!] = item;
      });
      res2.forEach((item) => {
        liveRoomObj[item.id!] = item;
      });

      const res3: any[] = [];
      res.forEach((item) => {
        const live_room_id = item.split('___')[1];
        const user_id = item.split('___')[2];

        res3.push({
          user_id,
          user_avatar: userObj[user_id]?.avatar || '',
          user_username: userObj[user_id]?.username || user_id,
          live_room_id,
          live_room_name: liveRoomObj[live_room_id]?.name || '',
        });
      });
      return res3;
    },

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

    deleteByLiveRoomId: async (liveRoomIdArr: number[]) => {
      if (!liveRoomIdArr.length) {
        console.log('liveRoomIdArr为空');
        return 0;
      }
      const res = await liveService.deleteByLiveRoomId(liveRoomIdArr);
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
      const tencentcloudCssCloseRes =
        await tencentcloudCssController.common.closeLive({
          live_room_id: liveRoomId,
        });
      const srsCloseRes = await srsController.common.closeLive({
        live_room_id: liveRoomId,
      });
      nodeSchedule.cancelJob(`${SCHEDULE_TYPE.blobIsExist}___${liveRoomId}`);
      const roomDir = path.resolve(WEBM_DIR, `roomId_${liveRoomId}`);
      if (fs.existsSync(roomDir)) {
        rimrafSync(roomDir);
      }
      return { tencentcloudCssCloseRes, srsCloseRes };
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

  getLiveRoomOnlineUser = async (ctx: ParameterizedContext, next) => {
    const live_room_id = +ctx.params.live_room_id;
    if (!live_room_id) {
      throw new CustomError(
        `live_room_id错误`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const key = `${REDIS_KEY.joined}${live_room_id}`;
    const res = await this.common.liveUser(key);
    successHandler({ ctx, data: res });
    await next();
  };

  getAllLiveRoomOnlineUser = async (ctx: ParameterizedContext, next) => {
    const key = `${REDIS_KEY.joined}`;
    const res = await this.common.liveUser(key);
    successHandler({ ctx, data: res });
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

  closeMyLive = async (ctx: ParameterizedContext, next) => {
    const { code, userInfo, msg } = await authJwt(ctx);
    if (code !== COMMON_HTTP_CODE.success || !userInfo) {
      throw new CustomError(msg, code, code);
    }
    const liveRoom = await userLiveRoomController.common.findByUserId(
      userInfo.id || -1
    );
    if (!liveRoom) {
      throw new CustomError(
        `你还没有开通直播间！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const res = await this.common.closeLive(liveRoom.id!);
    successHandler({ ctx, data: res });
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
