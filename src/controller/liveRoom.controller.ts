import cryptojs from 'crypto-js';
import { ParameterizedContext } from 'koa';

import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE, PROJECT_ENV, PROJECT_ENV_ENUM } from '@/constant';
import { IList, ILiveRoom } from '@/interface';
import { CustomError } from '@/model/customError.model';
import liveService from '@/service/live.service';
import liveRoomService from '@/service/liveRoom.service';

class LiveRoomController {
  common = {
    create: (data: ILiveRoom) => liveRoomService.create(data),
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

  async publish(ctx: ParameterizedContext, next) {
    // https://ossrs.net/lts/zh-cn/docs/v5/doc/http-callback#nodejs-koa-example
    // code等于数字0表示成功，其他错误码代表失败。
    const { body } = ctx.request;
    console.log(body, 666);
    const reg = /^roomId___(.+)/g;
    const roomId = reg.exec(body.stream)?.[1];
    if (!roomId) {
      ctx.body = { code: 1, msg: 'no live_room' };
    } else {
      const result = await liveRoomService.findLiveRoomUserToken(
        Number(roomId)
      );
      const usertoken = result?.user_live_room?.user.token;
      const rtmptoken = cryptojs.MD5(usertoken || '').toString();
      const params = new URLSearchParams(body.param);
      const paramstoken = params.get('token');
      const type = params.get('type');
      if (rtmptoken !== paramstoken) {
        console.log('鉴权失败');
        ctx.body = { code: 1, msg: 'auth fail' };
      } else {
        console.log('鉴权成功');
        ctx.body = { code: 0, msg: 'auth success' };
        if (type === 'user') {
          let flvurl = `http://localhost:5001/livestream/roomId___${roomId}.flv`;
          if (PROJECT_ENV === PROJECT_ENV_ENUM.prod) {
            flvurl = `https://live.hsslive.cn/srsflv/livestream/roomId___${roomId}.flv`;
          }
          await liveService.deleteByLiveRoomId(Number(roomId));
          liveService.create({
            live_room_id: Number(roomId),
            user_id: result?.user_live_room?.user.id,
            socketId: '-1',
            system: 2,
            track_audio: false,
            track_video: true,
            coverImg: '',
            streamurl: '',
            flvurl,
          });
        }
      }
    }
    await next();
  }

  async unpublish(ctx: ParameterizedContext, next) {
    // https://ossrs.net/lts/zh-cn/docs/v5/doc/http-callback#nodejs-koa-example
    // code等于数字0表示成功，其他错误码代表失败。
    const { body } = ctx.request;
    console.log(body, 'unpublishunpublish');
    const reg = /^roomId___(.+)/g;
    const roomId = reg.exec(body.stream)?.[1];
    if (!roomId) {
      successHandler({ ctx, data: 'no live_room' });
    } else {
      successHandler({ ctx, data: 'ok' });
      const params = new URLSearchParams(body.param);
      const type = params.get('type');
      if (type === 'user') {
        liveService.deleteByLiveRoomId(Number(roomId));
      }
      // if (rtmptoken !== paramstoken) {
      //   ctx.body = { code: 1, msg: 'auth fail' };
      // } else {
      //   ctx.body = { code: 0, msg: 'auth success' };
      // }
    }
    await next();
  }

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
    const { name, rtmp_url, flv_url, hls_url }: ILiveRoom = ctx.request.body;
    const isExist = await liveRoomService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的直播间！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await liveRoomService.update({
      id,
      name,
      rtmp_url,
      flv_url,
      hls_url,
    });
    successHandler({ ctx });
    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    const { name, rtmp_url, flv_url, hls_url }: ILiveRoom = ctx.request.body;
    await this.common.create({
      name,
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
