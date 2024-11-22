import fs from 'fs';
import path from 'path';

import { ParameterizedContext } from 'koa';
import nodeSchedule from 'node-schedule';
import { rimrafSync } from 'rimraf';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import liveRedisController from '@/config/websocket/live-redis.controller';
import { COMMON_HTTP_CODE, SCHEDULE_TYPE, WEBM_DIR } from '@/constant';
import srsController from '@/controller/srs.controller';
import userLiveRoomController from '@/controller/userLiveRoom.controller';
import { IList, ILive, SwitchEnum } from '@/interface';
import { CustomError } from '@/model/customError.model';
import liveService from '@/service/live.service';
import liveRoomService from '@/service/liveRoom.service';
import { ILiveRoom, LiveRoomTypeEnum } from '@/types/ILiveRoom';
import { chalkERROR } from '@/utils/chalkTip';
import { getForwardList, killPid } from '@/utils/process';
import { tencentcloudCssUtils } from '@/utils/tencentcloud-css';

import tencentcloudCssController from './tencentcloudCss.controller';

class LiveController {
  common = {
    async startLiveUpdateMyLiveRoomInfo(data: {
      userId?: number;
      liveRoomType: number;
    }) {
      const { userId, liveRoomType } = data;
      const res: any = { roomId: undefined, userLiveRoomInfo: undefined };

      if (!userId) {
        console.log(chalkERROR('userId为空'));
        return res;
      }
      const userLiveRoomInfo = await userLiveRoomController.common.findByUserId(
        userId
      );
      if (!userLiveRoomInfo) {
        console.log(chalkERROR('userLiveRoomInfo为空'));
        return res;
      }
      res.userLiveRoomInfo = userLiveRoomInfo;
      const roomId = userLiveRoomInfo.live_room_id!;
      res.roomId = roomId;
      let pullRes: {
        rtmp: string;
        flv: string;
        hls: string;
        webrtc: string;
      };
      if (
        [
          LiveRoomTypeEnum.tencent_css,
          LiveRoomTypeEnum.tencent_css_pk,
        ].includes(liveRoomType)
      ) {
        pullRes = tencentcloudCssUtils.getPullUrl({
          liveRoomId: roomId,
        });
      } else {
        pullRes = srsController.common.getPullUrl({
          liveRoomId: roomId,
        });
      }

      await liveRoomService.update({
        id: roomId,
        type: liveRoomType,
        cdn: [
          LiveRoomTypeEnum.tencent_css,
          LiveRoomTypeEnum.tencent_css_pk,
        ].includes(liveRoomType)
          ? SwitchEnum.yes
          : SwitchEnum.no,
        rtmp_url: pullRes.rtmp,
        flv_url: pullRes.flv,
        hls_url: pullRes.hls,
        webrtc_url: pullRes.webrtc,
      });
      return res;
    },
    getList: async ({
      id,
      live_room_id,
      cdn,
      status,
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
    }: IList<ILive & ILiveRoom>) => {
      // try {
      //   const key = cryptojs.MD5(
      //     JSON.stringify({
      //       id,
      //       live_room_id,
      //       live_room_is_show,
      //       live_room_status,
      //       cdn,
      //       is_fake,
      //       orderBy,
      //       orderName,
      //       nowPage,
      //       pageSize,
      //       keyWord,
      //       rangTimeType,
      //       rangTimeStart,
      //       rangTimeEnd,
      //     })
      //   );
      //   const oldCache = await redisController.getVal({
      //     prefix: REDIS_PREFIX.dbLiveList,
      //     key: key.toString(),
      //   });
      //   if (oldCache) {
      //     return JSON.parse(oldCache).value as {
      //       nowPage: number;
      //       pageSize: number;
      //       hasMore: boolean;
      //       total: number;
      //       rows: ILive[];
      //     };
      //   }
      // } catch (error) {
      //   console.log(error);
      // }
      const result = await liveService.getList({
        id,
        live_room_id,
        cdn,
        status,
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
      // try {
      //   const key = cryptojs.MD5(
      //     JSON.stringify({
      //       id,
      //       live_room_id,
      //       cdn,
      //       is_fake,
      //       is_show,
      //       status,
      //       orderBy,
      //       orderName,
      //       nowPage,
      //       pageSize,
      //       keyWord,
      //       rangTimeType,
      //       rangTimeStart,
      //       rangTimeEnd,
      //     })
      //   );
      //   redisController.setExVal({
      //     prefix: REDIS_PREFIX.dbLiveList,
      //     key: key.toString(),
      //     value: result,
      //     exp: 3,
      //   });
      // } catch (error) {
      //   console.log(error);
      // }
      return result;
    },

    getPureList: async ({
      id,
      live_record_id,
      platform,
      stream_name,
      stream_id,
      user_id,
      live_room_id,
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
        platform,
        stream_name,
        stream_id,
        user_id,
        live_room_id,
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
        throw new CustomError(
          'liveRoomIds为空',
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
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

    create: async (data: ILive) => {
      const res = await liveService.create(data);
      return res;
    },
  };

  startLiveUpdateMyLiveRoomInfo = async (ctx: ParameterizedContext, next) => {
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== COMMON_HTTP_CODE.success || !userInfo) {
      throw new CustomError(message, code, code);
    }
    const { type } = ctx.request.body;
    const result = await this.common.startLiveUpdateMyLiveRoomInfo({
      userId: userInfo.id,
      liveRoomType: type,
    });
    successHandler({ ctx, data: result });
    await next();
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
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== COMMON_HTTP_CODE.success || !userInfo) {
      throw new CustomError(message, code, code);
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
