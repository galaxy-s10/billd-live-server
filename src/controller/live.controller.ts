import fs from 'fs';
import path from 'path';

import { arrayUnique, getArrayDifference, getRandomString } from 'billd-utils';
import cryptojs from 'crypto-js';
import { ParameterizedContext } from 'koa';
import nodeSchedule from 'node-schedule';
import { rimrafSync } from 'rimraf';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import liveRedisController from '@/config/websocket/live-redis.controller';
import {
  COMMON_HTTP_CODE,
  DEFAULT_ROLE_INFO,
  SCHEDULE_TYPE,
  THIRD_PLATFORM,
  WEBM_DIR,
} from '@/constant';
import liveRoomController from '@/controller/liveRoom.controller';
import srsController from '@/controller/srs.controller';
import userController from '@/controller/user.controller';
import userLiveRoomController from '@/controller/userLiveRoom.controller';
import { IList, ILive } from '@/interface';
import { CustomError } from '@/model/customError.model';
import liveService, {
  handleDelRedisByDbLiveList,
} from '@/service/live.service';
import liveRoomService from '@/service/liveRoom.service';
import thirdUserService from '@/service/thirdUser.service';
import walletService from '@/service/wallet.service';
import {
  ILiveRoom,
  LiveRoomIsShowEnum,
  LiveRoomPullIsShouldAuthEnum,
  LiveRoomStatusEnum,
  LiveRoomTypeEnum,
  LiveRoomUseCDNEnum,
} from '@/types/ILiveRoom';
import { chalkERROR } from '@/utils/chalkTip';
import { getForwardList, killPid } from '@/utils/process';
import { tencentcloudUtils } from '@/utils/tencentcloud';

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
        pullRes = tencentcloudUtils.getPullUrl({
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
          ? LiveRoomUseCDNEnum.yes
          : LiveRoomUseCDNEnum.no,
        rtmp_url: pullRes.rtmp,
        flv_url: pullRes.flv,
        hls_url: pullRes.hls,
      });
      return res;
    },
    getList: async ({
      id,
      is_tencentcloud_css,
      live_room_id,
      cdn,
      is_fake,
      is_show,
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
        is_tencentcloud_css,
        live_room_id,
        cdn,
        is_fake,
        is_show,
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
      live_room_id,
      socket_id,
      track_audio,
      track_video,
      flag_id,
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
        live_room_id,
        socket_id,
        track_audio,
        track_video,
        flag_id,
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

    liveRoomisLive: async (liveRoomId: number) => {
      const res = await liveService.liveRoomisLive(liveRoomId);
      return res;
    },

    findAllLiveByRoomId: async (liveRoomId: number) => {
      const res = await liveService.findAllLiveByRoomId(liveRoomId);
      return res;
    },

    closeLive: async (liveRoomId: number) => {
      const res = await Promise.all([
        srsController.common.closeLiveByLiveRoomId(liveRoomId),
        tencentcloudUtils.dropLiveStream({ roomId: liveRoomId }),
        this.common.deleteByLiveRoomId([liveRoomId]),
      ]);
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
    const result = await this.common.getList({});
    const map = {};
    const delMap = {};
    const delRoomId: number[] = [];
    const delLiveId: number[] = [];
    result.rows.forEach((item) => {
      const { id, live_room_id } = item;
      if (live_room_id && id) {
        if (!map[live_room_id]) {
          map[live_room_id] = true;
        } else {
          delMap[id] = live_room_id;
          delRoomId.push(live_room_id);
          delLiveId.push(id);
        }
      }
    });
    const uniDelRoomId = arrayUnique(delRoomId);
    const uniDelLiveId = arrayUnique(delLiveId);
    const delRes = await liveService.delete(delLiveId);
    successHandler({ ctx, data: { uniDelRoomId, uniDelLiveId, delRes } });
    await next();
  };

  renderFakeLive = async (ctx: ParameterizedContext, next) => {
    const { rtmp_url, flv_url, hls_url } = ctx.request.body;
    async function fn() {
      let result;
      const username = getRandomString(6);
      const isExist = await userController.common.isSameName(username);
      if (isExist) {
        // 已存在了，继续递归
        result = await fn();
      } else {
        result = await userController.common.create({
          username,
          password: getRandomString(6),
        });
      }
      return result;
    }
    const createUserInfo = await fn();
    const pushKey = cryptojs
      .MD5(`${+new Date()}___${getRandomString(6)}`)
      .toString();
    const createLiveRoomInfo = await liveRoomController.common.create({
      name: `${createUserInfo.username!.slice(0, 10) as string}的直播间`,
      key: pushKey,
      type: LiveRoomTypeEnum.obs,
      priority: 0,
      cdn: LiveRoomUseCDNEnum.no,
      pull_is_should_auth: LiveRoomPullIsShouldAuthEnum.no,
      rtmp_url,
      flv_url,
      hls_url,
      cdn_push_obs_server: '',
      cdn_push_obs_stream_key: '',
      cdn_push_rtmp_url: '',
      cdn_push_srt_url: '',
      cdn_push_webrtc_url: '',
      is_show: LiveRoomIsShowEnum.yes,
      status: LiveRoomStatusEnum.normal,
      is_fake: 1,
    });
    // @ts-ignore
    await createLiveRoomInfo.setAreas([1]);
    await userLiveRoomController.common.create({
      user_id: createUserInfo.id,
      live_room_id: createLiveRoomInfo.id,
    });
    // @ts-ignore
    await createUserInfo.setRoles([DEFAULT_ROLE_INFO.VIP_USER.id]);
    await walletService.create({ user_id: createUserInfo.id, balance: 0 });
    await thirdUserService.create({
      user_id: createUserInfo.id,
      third_user_id: createUserInfo.id,
      third_platform: THIRD_PLATFORM.website,
    });
    const res = await this.common.create({
      live_room_id: createLiveRoomInfo.id,
      socket_id: '-1',
      track_audio: 1,
      track_video: 1,
      srs_action: 'fake',
      srs_app: 'fake',
      srs_client_id: 'fake',
      srs_ip: 'fake',
      srs_param: 'fake',
      srs_server_id: 'fake',
      srs_service_id: 'fake',
      srs_stream: 'fake',
      srs_stream_id: 'fake',
      srs_stream_url: 'fake',
      srs_tcUrl: 'fake',
      srs_vhost: 'fake',
      is_tencentcloud_css: 2,
      flag_id: '',
    });
    handleDelRedisByDbLiveList();
    successHandler({ ctx, data: res });
    await next();
  };

  renderFakeLiveByBilibili = async (ctx: ParameterizedContext, next) => {
    const { rtmp_url, flv_url, hls_url } = ctx.request.body;
    async function fn() {
      let result;
      const username = getRandomString(6);
      const isExist = await userController.common.isSameName(username);
      if (isExist) {
        // 已存在了，继续递归
        result = await fn();
      } else {
        result = await userController.common.create({
          username,
          password: getRandomString(6),
        });
      }
      return result;
    }
    const createUserInfo = await fn();
    const pushKey = cryptojs
      .MD5(`${+new Date()}___${getRandomString(6)}`)
      .toString();
    const createLiveRoomInfo = await liveRoomController.common.create({
      name: `${createUserInfo.username!.slice(0, 10) as string}的直播间`,
      key: pushKey,
      type: LiveRoomTypeEnum.obs,
      priority: 0,
      cdn: LiveRoomUseCDNEnum.no,
      pull_is_should_auth: LiveRoomPullIsShouldAuthEnum.no,
      rtmp_url,
      flv_url,
      hls_url,
      cdn_push_obs_server: '',
      cdn_push_obs_stream_key: '',
      cdn_push_rtmp_url: '',
      cdn_push_srt_url: '',
      cdn_push_webrtc_url: '',
      is_show: LiveRoomIsShowEnum.yes,
      status: LiveRoomStatusEnum.normal,
      is_fake: 1,
    });
    // @ts-ignore
    await createLiveRoomInfo.setAreas([1]);
    await userLiveRoomController.common.create({
      user_id: createUserInfo.id,
      live_room_id: createLiveRoomInfo.id,
    });
    // @ts-ignore
    await createUserInfo.setRoles([DEFAULT_ROLE_INFO.VIP_USER.id]);
    await walletService.create({ user_id: createUserInfo.id, balance: 0 });
    await thirdUserService.create({
      user_id: createUserInfo.id,
      third_user_id: createUserInfo.id,
      third_platform: THIRD_PLATFORM.website,
    });
    const res = await this.common.create({
      live_room_id: createLiveRoomInfo.id,
      socket_id: '-1',
      track_audio: 1,
      track_video: 1,
      srs_action: 'fake',
      srs_app: 'fake',
      srs_client_id: 'fake',
      srs_ip: 'fake',
      srs_param: 'fake',
      srs_server_id: 'fake',
      srs_service_id: 'fake',
      srs_stream: 'fake',
      srs_stream_id: 'fake',
      srs_stream_url: 'fake',
      srs_tcUrl: 'fake',
      srs_vhost: 'fake',
      is_tencentcloud_css: 2,
      flag_id: '',
    });
    handleDelRedisByDbLiveList();
    successHandler({ ctx, data: res });
    await next();
  };

  addFakeLive = async (ctx: ParameterizedContext, next) => {
    const { is_all, num } = ctx.request.body;
    // 查找所有fake直播间
    const res1 = await liveRoomController.common.getList({ is_fake: 1 });
    // 查找所有fake直播间的直播记录
    const res2 = await this.common.getList({ is_fake: 1 });
    // @ts-ignore
    const arr1 = res1.rows.map((v: ILiveRoom) => v.id);
    const arr2 = res2.rows.map((v: ILive) => v.live_room_id);
    const res3 = getArrayDifference(arr1, arr2);
    let code = 0;
    const queue: any[] = [];
    if (res3[0]) {
      // @ts-ignore
      res1.rows.forEach((item: ILiveRoom) => {
        let addArr: any[] = [];
        if (is_all === 1) {
          addArr = res3;
        } else if (num > 0) {
          addArr = res3.slice(0, num);
        }
        if (addArr.includes(item.id)) {
          queue.push(
            this.common.create({
              live_room_id: item.id,
              socket_id: '-1',
              track_audio: 1,
              track_video: 1,
              srs_action: 'fake',
              srs_app: 'fake',
              srs_client_id: 'fake',
              srs_ip: 'fake',
              srs_param: 'fake',
              srs_server_id: 'fake',
              srs_service_id: 'fake',
              srs_stream: 'fake',
              srs_stream_id: 'fake',
              srs_stream_url: 'fake',
              srs_tcUrl: 'fake',
              srs_vhost: 'fake',
              is_tencentcloud_css: 2,
              flag_id: '',
            })
          );
        }
      });
      await Promise.all(queue);
      code = 1;
    }
    handleDelRedisByDbLiveList();
    successHandler({ ctx, data: { code } });
    await next();
  };

  delFakeLive = async (ctx: ParameterizedContext, next) => {
    const { is_all, num } = ctx.request.body;
    // 查找所有fake直播间的直播记录
    const res1 = await this.common.getList({ is_fake: 1 });
    const arr1 = res1.rows.map((v: ILiveRoom) => v.id!);
    let code = 0;
    if (arr1[0]) {
      let delArr: any[] = [];
      if (is_all === 1) {
        delArr = arr1;
      } else if (num > 0) {
        delArr = arr1.slice(0, num);
      }
      await liveService.delete(delArr);
      code = 1;
    }
    handleDelRedisByDbLiveList();
    successHandler({ ctx, data: { code } });
    await next();
  };

  closeLive = async (ctx: ParameterizedContext, next) => {
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== COMMON_HTTP_CODE.success || !userInfo) {
      throw new CustomError(message, code, code);
    }
    const userLiveRoomInfo = await userLiveRoomController.common.findByUserId(
      userInfo.id!
    );
    if (!userLiveRoomInfo) {
      throw new CustomError(
        'userLiveRoomInfo为空',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await this.common.closeLive(userLiveRoomInfo.live_room_id!);
    successHandler({ ctx, data: userLiveRoomInfo });
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
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== COMMON_HTTP_CODE.success || !userInfo) {
      throw new CustomError(message, code, code);
    }
    const userLiveRoomInfo = await userLiveRoomController.common.findByUserId(
      userInfo.id!
    );
    if (!userLiveRoomInfo) {
      throw new CustomError(
        'userLiveRoomInfo为空',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const roomId = userLiveRoomInfo.live_room_id!;
    const res = await liveService.findAllLiveByRoomId(roomId);
    successHandler({ ctx, data: res });
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
