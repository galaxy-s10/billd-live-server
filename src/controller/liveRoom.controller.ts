import { getRandomString } from 'billd-utils';
import cryptojs from 'crypto-js';
import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import successHandler from '@/app/handler/success-handle';
import { SERVER_LIVE } from '@/config/secret';
import { ALLOW_HTTP_CODE } from '@/constant';
import { IList, ILiveRoom } from '@/interface';
import { CustomError } from '@/model/customError.model';
import liveService from '@/service/live.service';
import liveRoomService from '@/service/liveRoom.service';
import userLiveRoomService from '@/service/userLiveRoom.service';

class LiveRoomController {
  common = {
    create: (data: ILiveRoom) => liveRoomService.create(data),
    update: (data: ILiveRoom) => liveRoomService.update(data),
  };

  async getList(ctx: ParameterizedContext, next) {
    const {
      id,
      name,
      rtmp_url,
      flv_url,
      hls_url,
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
      name,
      rtmp_url,
      flv_url,
      hls_url,
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
    const result = await liveRoomService.find(id);
    successHandler({ ctx, data: result });
    await next();
  }

  async onPlay(ctx: ParameterizedContext, next) {
    // https://ossrs.net/lts/zh-cn/docs/v5/doc/http-callback#nodejs-koa-example
    // code等于数字0表示成功，其他错误码代表失败。
    ctx.body = { code: 0, msg: 'room is living' };
    await next();
  }

  onPublish = async (ctx: ParameterizedContext, next) => {
    // https://ossrs.net/lts/zh-cn/docs/v5/doc/http-callback#nodejs-koa-example
    // code等于数字0表示成功，其他错误码代表失败。
    const { body } = ctx.request;
    console.log(body, 'on_publish参数');
    const reg = /^roomId___(.+)/g;
    const roomId = reg.exec(body.stream)?.[1];
    if (!roomId) {
      ctx.body = { code: 1, msg: 'no live_room' };
    } else {
      const result = await liveRoomService.findKey(Number(roomId));
      const rtmptoken = result?.key;
      const params = new URLSearchParams(body.param);
      const paramstoken = params.get('token');
      const paramstype = params.get('type');
      if (rtmptoken !== paramstoken) {
        console.log('鉴权失败');
        ctx.body = { code: 1, msg: 'on_publish auth fail' };
      } else {
        console.log('鉴权成功');
        if (paramstype) {
          await this.common.update({
            id: Number(roomId),
            type: Number(paramstype),
          });
        }
        const isLiveing = await liveService.findByRoomId(Number(roomId));
        if (isLiveing) {
          ctx.body = { code: 0, msg: 'on_publish room is living' };
        } else {
          ctx.body = { code: 0, msg: 'on_publish auth success' };
          const liveRoom = await liveRoomService.find(Number(roomId));
          liveService.create({
            live_room_id: Number(roomId),
            user_id: liveRoom?.user_live_room?.user?.id,
            socket_id: '-1',
            track_audio: 1,
            track_video: 1,
          });
        }
      }
    }
    await next();
  };

  async onUnpublish(ctx: ParameterizedContext, next) {
    // https://ossrs.net/lts/zh-cn/docs/v5/doc/http-callback#nodejs-koa-example
    // code等于数字0表示成功，其他错误码代表失败。
    const { body } = ctx.request;
    console.log(body, 'on_unpublish参数');
    const reg = /^roomId___(.+)/g;
    const roomId = reg.exec(body.stream)?.[1];
    if (!roomId) {
      ctx.body = { code: 1, msg: 'on_unpublish room is living' };
    } else {
      ctx.body = { code: 0, msg: 'on_unpublish success' };
      liveService.deleteByLiveRoomId(Number(roomId));
    }
    await next();
  }

  updateKey = async (ctx: ParameterizedContext, next) => {
    const { code, userInfo, message } = await authJwt(ctx);
    if (userInfo) {
      const liveRoom = await userLiveRoomService.findByUserId(
        userInfo.id || -1
      );
      if (!liveRoom) {
        throw new CustomError(
          `你还没有开通直播间！`,
          ALLOW_HTTP_CODE.paramsError,
          ALLOW_HTTP_CODE.paramsError
        );
      } else {
        const key = cryptojs
          .MD5(`${+new Date()}___${getRandomString(6)}`)
          .toString();
        const rtmp_url = `${SERVER_LIVE.PushDomain}/${
          SERVER_LIVE.AppName
        }/roomId___${liveRoom.live_room!.id!}?token=${key}`;
        await this.common.update({
          id: liveRoom.live_room!.id!,
          key,
          rtmp_url,
        });
        successHandler({ ctx, data: { rtmp_url, liveRoom } });
      }
    } else {
      throw new CustomError(message, code, code);
    }
    await next();
  };

  async create(ctx: ParameterizedContext, next) {
    const { name, type, weight, rtmp_url, cdn, flv_url, hls_url }: ILiveRoom =
      ctx.request.body;
    await this.common.create({
      name,
      key: cryptojs.MD5(`${+new Date()}___${getRandomString(6)}`).toString(),
      type,
      weight,
      cdn,
      rtmp_url,
      flv_url,
      hls_url,
    });
    successHandler({ ctx });
    await next();
  }

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
    const isExist = await liveRoomService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的直播间！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await liveRoomService.delete(id);
    successHandler({ ctx });
    await next();
  }
}

export default new LiveRoomController();
