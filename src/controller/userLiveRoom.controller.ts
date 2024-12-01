import { getRandomString } from 'billd-utils';
import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import liveRoomController from '@/controller/liveRoom.controller';
import srsController from '@/controller/srs.controller';
import { IList, IUserLiveRoom, SwitchEnum } from '@/interface';
import { CustomError } from '@/model/customError.model';
import liveRoomService from '@/service/liveRoom.service';
import userLiveRoomService from '@/service/userLiveRoom.service';
import { LiveRoomStatusEnum, LiveRoomTypeEnum } from '@/types/ILiveRoom';

class UserLiveRoomController {
  common = {
    getList: ({
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
    }: IList<IUserLiveRoom>) =>
      userLiveRoomService.getList({
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
      }),
    findAll: () => userLiveRoomService.findAll(),
    create: (data: IUserLiveRoom) => userLiveRoomService.create(data),
    findByUserId: (userId: number) => userLiveRoomService.findByUserId(userId),
    findByLiveRoomId: (liveRoomId: number) =>
      userLiveRoomService.findByLiveRoomId(liveRoomId),
    findByLiveRoomIdAndKey: (liveRoomId: number) =>
      userLiveRoomService.findByLiveRoomIdAndKey(liveRoomId),
  };

  async getList(ctx: ParameterizedContext, next) {
    const data = ctx.request.query;
    const result = await this.common.getList(data);
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
    const id = +ctx.params.id;
    const { user_id, live_room_id }: IUserLiveRoom = ctx.request.body;
    const isExist = await userLiveRoomService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的用户直播间！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
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
    const { code, userInfo, msg } = await authJwt(ctx);
    if (code !== COMMON_HTTP_CODE.success || !userInfo) {
      throw new CustomError(msg, code, code);
    }
    const isExist = await this.common.findByUserId(userInfo.id!);
    if (isExist) {
      throw new CustomError(
        `你已开通直播间！`,
        COMMON_HTTP_CODE.forbidden,
        COMMON_HTTP_CODE.forbidden
      );
    }

    const key = getRandomString(30);
    const liveRoom = await liveRoomController.common.create({
      name: `${userInfo.username!.slice(0, 10)}的直播间`,
      key,
      type: LiveRoomTypeEnum.obs,
      priority: 21,
      cdn: SwitchEnum.no,
      is_show: SwitchEnum.yes,
      status: LiveRoomStatusEnum.normal,
    });
    // @ts-ignore
    await liveRoom.setAreas([1]);
    const pullUrlRes = srsController.common.getPullUrl({
      liveRoomId: liveRoom.id!,
    });
    const pushUrlRes = srsController.common.getPushUrl({
      userId: userInfo.id!,
      liveRoomId: liveRoom.id!,
      type: LiveRoomTypeEnum.srs,
      key,
    });
    await liveRoomService.update({
      pull_rtmp_url: pullUrlRes.rtmp,
      pull_flv_url: pullUrlRes.flv,
      pull_hls_url: pullUrlRes.hls,
      pull_webrtc_url: pullUrlRes.webrtc,
      push_rtmp_url: pushUrlRes.rtmp_url,
      push_obs_server: pushUrlRes.obs_server,
      push_obs_stream_key: pushUrlRes.obs_stream_key,
      push_webrtc_url: pushUrlRes.webrtc_url,
      push_srt_url: pushUrlRes.srt_url,
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
    const id = +ctx.params.id;
    const isExist = await userLiveRoomService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的用户直播间！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await userLiveRoomService.delete(id);
    successHandler({ ctx });
    await next();
  }
}

export default new UserLiveRoomController();
