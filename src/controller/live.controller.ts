import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE, REDIS_PREFIX } from '@/constant';
import srsController from '@/controller/srs.controller';
import { IList, ILive } from '@/interface';
import { CustomError } from '@/model/customError.model';
import liveService from '@/service/live.service';
import userLiveRoomService from '@/service/userLiveRoom.service';
import { getForwardList, killPid } from '@/utils/process';

import redisController from './redis.controller';

class LiveController {
  common = {
    getList: async ({
      id,
      live_room_id,
      live_room_is_show,
      live_room_status,
      user_id,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<ILive>) => {
      try {
        const oldCache = await redisController.getVal({
          prefix: REDIS_PREFIX.dbLiveList,
          key: '',
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
        user_id,
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
        redisController.setExVal({
          prefix: REDIS_PREFIX.dbLiveList,
          key: '',
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

    deleteByLiveRoomId: async (liveRoomId: number) => {
      if (!liveRoomId) {
        throw new CustomError(
          'liveRoomId为空',
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
      await liveService.deleteByLiveRoomId(liveRoomId);
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
