import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE } from '@/constant';
import { IList, ILive } from '@/interface';
import { CustomError } from '@/model/customError.model';
import liveService from '@/service/live.service';
import userLiveRoomService from '@/service/userLiveRoom.service';

import srsController from './srs.controller';

class LiveController {
  common = {
    getList: async ({
      id,
      live_room_id,
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
      const result = await liveService.getList({
        id,
        live_room_id,
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
      return result;
    },

    delete: async (id: number, isRoute?: boolean) => {
      const isExist = await liveService.isExist([id]);
      if (!isExist) {
        if (isRoute) {
          throw new CustomError(
            `不存在id为${id}的直播！`,
            ALLOW_HTTP_CODE.paramsError,
            ALLOW_HTTP_CODE.paramsError
          );
        }
      } else {
        await liveService.delete(id);
      }
    },

    deleteByLiveRoomId: async (liveRoomId: number) => {
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
    if (code !== ALLOW_HTTP_CODE.ok || !userInfo) {
      throw new CustomError(message, code, code);
    }
    const userLiveRoomInfo = await userLiveRoomService.findByUserId(
      userInfo.id!
    );
    if (!userLiveRoomInfo) {
      throw new CustomError('userLiveRoomInfo为空', 400, 400);
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
    if (code !== ALLOW_HTTP_CODE.ok || !userInfo) {
      throw new CustomError(message, code, code);
    }
    const userLiveRoomInfo = await userLiveRoomService.findByUserId(
      userInfo.id!
    );
    if (!userLiveRoomInfo) {
      throw new CustomError('userLiveRoomInfo为空', 400, 400);
    }
    const roomId = userLiveRoomInfo.live_room_id!;
    const res = await liveService.findAllLiveByRoomId(roomId);
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
