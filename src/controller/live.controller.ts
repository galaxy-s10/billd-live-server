import { arrayUnique, getArrayDifference, getRandomString } from 'billd-utils';
import cryptojs from 'crypto-js';
import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import {
  COMMON_HTTP_CODE,
  DEFAULT_ROLE_INFO,
  REDIS_PREFIX,
  THIRD_PLATFORM,
} from '@/constant';
import srsController from '@/controller/srs.controller';
import { IList, ILive } from '@/interface';
import { CustomError } from '@/model/customError.model';
import liveService, {
  handleDelRedisByDbLiveList,
} from '@/service/live.service';
import thirdUserService from '@/service/thirdUser.service';
import userLiveRoomService from '@/service/userLiveRoom.service';
import walletService from '@/service/wallet.service';
import {
  ILiveRoom,
  LiveRoomIsShowEnum,
  LiveRoomPullIsShouldAuthEnum,
  LiveRoomStatusEnum,
  LiveRoomTypeEnum,
  LiveRoomUseCDNEnum,
} from '@/types/ILiveRoom';
import { getForwardList, killPid } from '@/utils/process';

import liveRoomController from './liveRoom.controller';
import redisController from './redis.controller';
import userController from './user.controller';
import userLiveRoomController from './userLiveRoom.controller';

class LiveController {
  common = {
    getList: async ({
      id,
      live_room_id,
      live_room_is_show,
      live_room_status,
      is_tencentcloud_css,
      user_id,
      is_fake,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<ILive & ILiveRoom>) => {
      try {
        const key = cryptojs.MD5(
          JSON.stringify({
            id,
            live_room_id,
            live_room_is_show,
            live_room_status,
            is_tencentcloud_css,
            user_id,
            is_fake,
            orderBy,
            orderName,
            nowPage,
            pageSize,
            keyWord,
            rangTimeType,
            rangTimeStart,
            rangTimeEnd,
          })
        );
        const oldCache = await redisController.getVal({
          prefix: REDIS_PREFIX.dbLiveList,
          key: key.toString(),
        });
        if (oldCache) {
          return JSON.parse(oldCache).value as {
            nowPage: number;
            pageSize: number;
            hasMore: boolean;
            total: number;
            rows: ILive[];
          };
        }
      } catch (error) {
        console.log(error);
      }
      const result = await liveService.getList({
        id,
        live_room_id,
        live_room_is_show,
        live_room_status,
        is_tencentcloud_css,
        user_id,
        is_fake,
        nowPage,
        pageSize,
        orderBy,
        orderName,
        keyWord,
        rangTimeType,
        rangTimeStart,
        rangTimeEnd,
      });
      try {
        const key = cryptojs.MD5(
          JSON.stringify({
            id,
            live_room_id,
            live_room_is_show,
            live_room_status,
            is_tencentcloud_css,
            user_id,
            is_fake,
            orderBy,
            orderName,
            nowPage,
            pageSize,
            keyWord,
            rangTimeType,
            rangTimeStart,
            rangTimeEnd,
          })
        );
        redisController.setExVal({
          prefix: REDIS_PREFIX.dbLiveList,
          key: key.toString(),
          value: result,
          exp: 60,
        });
      } catch (error) {
        console.log(error);
      }
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

    create: async (data: ILive) => {
      const res = await liveService.create(data);
      return res;
    },
  };

  getList = async (ctx: ParameterizedContext, next) => {
    const result = await this.common.getList(ctx.request.query);
    successHandler({ ctx, data: result });
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
    const rtmptoken = cryptojs
      .MD5(`${+new Date()}___${getRandomString(6)}`)
      .toString();
    const createLiveRoomInfo = await liveRoomController.common.create({
      name: `${createUserInfo.username!.slice(0, 10) as string}的直播间`,
      key: rtmptoken,
      type: LiveRoomTypeEnum.obs,
      weight: 0,
      cdn: LiveRoomUseCDNEnum.no,
      pull_is_should_auth: LiveRoomPullIsShouldAuthEnum.no,
      rtmp_url,
      flv_url,
      hls_url,
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
      user_id: createUserInfo.id,
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
              user_id: item?.user?.id,
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
    const userLiveRoomInfo = await userLiveRoomService.findByUserId(
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
    const res1 = await liveService.findAllLiveByRoomId(roomId);
    res1.forEach((item) => {
      srsController.common.deleteApiV1Clients(item.srs_client_id!);
    });
    await liveService.deleteByLiveRoomId(roomId);
    successHandler({ ctx, data: userLiveRoomInfo });
    await next();
  };

  async isLive(ctx: ParameterizedContext, next) {
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== COMMON_HTTP_CODE.success || !userInfo) {
      throw new CustomError(message, code, code);
    }
    const userLiveRoomInfo = await userLiveRoomService.findByUserId(
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
    if (pid) {
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
