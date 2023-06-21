import { getRandomString } from 'billd-utils';
import cryptojs from 'crypto-js';
import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import successHandler from '@/app/handler/success-handle';
import { SERVER_LIVE } from '@/config/secret';
import { ALLOW_HTTP_CODE } from '@/constant';
import liveRoomController from '@/controller/liveRoom.controller';
import { IList, IUserLiveRoom, LiveRoomTypeEnum } from '@/interface';
import { CustomError } from '@/model/customError.model';
import liveRoomService from '@/service/liveRoom.service';
import userLiveRoomService from '@/service/userLiveRoom.service';

class UserLiveRoomController {
  common = {
    create: (data: IUserLiveRoom) => userLiveRoomService.create(data),
    findByUserId: (userId) => userLiveRoomService.findByUserId(userId),
  };

  async getList(ctx: ParameterizedContext, next) {
    const {
      id,
      user_id,
      live_room_id,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IUserLiveRoom> = ctx.request.query;
    const result = await userLiveRoomService.getList({
      id,
      user_id,
      live_room_id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    successHandler({ ctx, data: result });
    await next();
  }

  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await userLiveRoomService.find(id);
    successHandler({ ctx, data: result });
    await next();
  }

  findByUserId = async (ctx: ParameterizedContext, next) => {
    const userId = +ctx.params.userId;
    const result = await this.common.findByUserId(userId);
    successHandler({ ctx, data: result });
    await next();
  };

  async update(ctx: ParameterizedContext, next) {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(
        '权限不足！',
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const id = +ctx.params.id;
    const { user_id, live_room_id }: IUserLiveRoom = ctx.request.body;
    const isExist = await userLiveRoomService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的用户直播间！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await userLiveRoomService.update({
      id,
      user_id,
      live_room_id,
    });
    successHandler({ ctx });
    await next();
  }

  create = async (ctx: ParameterizedContext, next) => {
    const { userInfo } = await authJwt(ctx);
    if (!userInfo) {
      throw new CustomError(
        `请登录！`,
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const isExist = await this.common.findByUserId(userInfo.id);
    if (isExist) {
      throw new CustomError(
        `你已开通直播间！`,
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }

    const rtmptoken = cryptojs
      .MD5(`${+new Date()}___${getRandomString(6)}`)
      .toString();
    const liveRoom = await liveRoomController.common.create({
      name: `${userInfo.username!.slice(0, 10)}的直播间`,
      key: rtmptoken,
      type: LiveRoomTypeEnum.user_obs,
      weight: 11,
    });
    const liveUrl = (live_room_id: number) => ({
      rtmp_url: `${SERVER_LIVE.PushDomain}/${SERVER_LIVE.AppName}/roomId___${live_room_id}?type=${LiveRoomTypeEnum.user_obs}&token=${rtmptoken}`,
      flv_url: `${SERVER_LIVE.PullDomain}/${SERVER_LIVE.AppName}/roomId___${live_room_id}.flv`,
      hls_url: `${SERVER_LIVE.PullDomain}/${SERVER_LIVE.AppName}/roomId___${live_room_id}.m3u8`,
    });
    // liveUrl = (live_room_id: number) => {
    //   const res = tencentcloudUtils.getPullUrl({ roomId: live_room_id });
    //   return {
    //     rtmp_url: res.rtmp,
    //     flv_url: res.flv,
    //     hls_url: res.hls,
    //   };
    // };
    const { rtmp_url, flv_url, hls_url } = liveUrl(liveRoom.id!);
    await liveRoomService.update({
      rtmp_url,
      flv_url,
      hls_url,
      id: liveRoom.id,
    });
    const result = await this.common.create({
      user_id: userInfo.id,
      live_room_id: liveRoom.id,
    });
    successHandler({ ctx, data: result });
    await next();
  };

  async delete(ctx: ParameterizedContext, next) {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(
        '权限不足！',
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const id = +ctx.params.id;
    const isExist = await userLiveRoomService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的用户直播间！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await userLiveRoomService.delete(id);
    successHandler({ ctx });
    await next();
  }
}

export default new UserLiveRoomController();
