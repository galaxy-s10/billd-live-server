import { getRandomString } from 'billd-utils';
import cryptojs from 'crypto-js';
import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE, REDIS_PREFIX } from '@/constant';
import redisController from '@/controller/redis.controller';
import { IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import liveRoomService from '@/service/liveRoom.service';
import userLiveRoomService from '@/service/userLiveRoom.service';
import { ILiveRoom } from '@/types/ILiveRoom';

import srsController from './srs.controller';

class LiveRoomController {
  common = {
    create: (data: ILiveRoom) => liveRoomService.create(data),
    update: (data: ILiveRoom) => liveRoomService.update(data),
    find: (id: number) => liveRoomService.find(id),
  };

  getList = async (ctx: ParameterizedContext, next) => {
    const {
      id,
      status,
      is_show,
      name,
      desc,
      type,
      cdn,
      pull_is_should_auth,
      rtmp_url,
      flv_url,
      hls_url,
      webrtc_url,
      push_rtmp_url,
      push_obs_server,
      push_obs_stream_key,
      push_webrtc_url,
      push_srt_url,
      hidden_cover_img,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<ILiveRoom> = ctx.request.query;
    const result = await liveRoomService.getList({
      id,
      status,
      is_show,
      name,
      desc,
      type,
      cdn,
      pull_is_should_auth,
      rtmp_url,
      flv_url,
      hls_url,
      webrtc_url,
      push_rtmp_url,
      push_obs_server,
      push_obs_stream_key,
      push_webrtc_url,
      push_srt_url,
      hidden_cover_img,
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
  };

  find = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const result = await this.common.find(id);
    successHandler({ ctx, data: result });
    await next();
  };

  verifyPkKey = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const { key } = ctx.request.query;
    const result = await redisController.getVal({
      prefix: REDIS_PREFIX.livePkKey,
      key: `${id}`,
    });
    let pass = false;
    try {
      if (result) {
        const res = JSON.parse(result);
        if (res.value.key === key) {
          pass = true;
        }
      }
    } catch (error) {
      console.log(error);
    }
    successHandler({ ctx, data: pass });
    await next();
  };

  updateKey = async (ctx: ParameterizedContext, next) => {
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== COMMON_HTTP_CODE.success || !userInfo) {
      throw new CustomError(message, code, code);
    }
    const liveRoom = await userLiveRoomService.findByUserId(userInfo.id || -1);
    if (!liveRoom) {
      throw new CustomError(
        `你还没有开通直播间！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    } else {
      const key = cryptojs
        .MD5(`${+new Date()}___${getRandomString(6)}`)
        .toString();
      const pushRes = srsController.common.getPushUrl({
        liveRoomId: liveRoom.live_room!.id!,
        type: liveRoom.live_room!.type!,
        key,
      });
      await this.common.update({
        id: liveRoom.live_room!.id!,
        key,
        push_rtmp_url: pushRes.push_rtmp_url,
        push_obs_server: pushRes.push_obs_server,
        push_obs_stream_key: pushRes.push_obs_stream_key,
        push_webrtc_url: pushRes.push_webrtc_url,
        push_srt_url: pushRes.push_srt_url,
      });
      successHandler({ ctx, data: pushRes });
    }
    await next();
  };

  create = async (ctx: ParameterizedContext, next) => {
    const {
      status,
      is_show,
      remark,
      cover_img,
      bg_img,
      name,
      desc,
      type,
      pull_is_should_auth,
      weight,
      rtmp_url,
      cdn,
      flv_url,
      hls_url,
      webrtc_url,
      push_rtmp_url,
      push_obs_server,
      push_obs_stream_key,
      push_webrtc_url,
      push_srt_url,
      forward_bilibili_url,
      forward_douyin_url,
      forward_douyu_url,
      forward_huya_url,
      forward_kuaishou_url,
      forward_xiaohongshu_url,
    }: ILiveRoom = ctx.request.body;
    await this.common.create({
      status,
      is_show,
      remark,
      cover_img,
      bg_img,
      name,
      desc,
      key: cryptojs.MD5(`${+new Date()}___${getRandomString(6)}`).toString(),
      type,
      pull_is_should_auth,
      weight,
      cdn,
      rtmp_url,
      flv_url,
      hls_url,
      webrtc_url,
      push_rtmp_url,
      push_obs_server,
      push_obs_stream_key,
      push_webrtc_url,
      push_srt_url,
      forward_bilibili_url,
      forward_douyin_url,
      forward_douyu_url,
      forward_huya_url,
      forward_kuaishou_url,
      forward_xiaohongshu_url,
    });
    successHandler({ ctx });
    await next();
  };

  update = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const {
      status,
      is_show,
      remark,
      cover_img,
      bg_img,
      name,
      desc,
      type,
      pull_is_should_auth,
      weight,
      rtmp_url,
      cdn,
      flv_url,
      hls_url,
      webrtc_url,
      push_rtmp_url,
      push_obs_server,
      push_obs_stream_key,
      push_webrtc_url,
      push_srt_url,
      forward_bilibili_url,
      forward_douyin_url,
      forward_douyu_url,
      forward_huya_url,
      forward_kuaishou_url,
      forward_xiaohongshu_url,
    }: ILiveRoom = ctx.request.body;
    await this.common.update({
      id,
      status,
      is_show,
      remark,
      cover_img,
      bg_img,
      name,
      desc,
      type,
      pull_is_should_auth,
      weight,
      cdn,
      rtmp_url,
      flv_url,
      hls_url,
      webrtc_url,
      push_rtmp_url,
      push_obs_server,
      push_obs_stream_key,
      push_webrtc_url,
      push_srt_url,
      forward_bilibili_url,
      forward_douyin_url,
      forward_douyu_url,
      forward_huya_url,
      forward_kuaishou_url,
      forward_xiaohongshu_url,
    });
    successHandler({ ctx });
    await next();
  };

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await liveRoomService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的直播间！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await liveRoomService.delete(id);
    successHandler({ ctx });
    await next();
  }
}

export default new LiveRoomController();
