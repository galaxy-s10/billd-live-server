import axios from 'axios';
import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { wsSocket } from '@/config/websocket';
import liveRedisController from '@/config/websocket/live-redis.controller';
import { LOCALHOST_URL, SRS_CB_URL_QUERY } from '@/constant';
import liveController from '@/controller/live.controller';
import liveRecordController from '@/controller/liveRecord.controller';
import { LivePlatformEnum } from '@/interface';
import { SRS_CONFIG, SRS_LIVE } from '@/secret/secret';
import { LiveRoomTypeEnum } from '@/types/ILiveRoom';
import { IApiV1Clients, IApiV1Streams, ISrsCb, ISrsRTC } from '@/types/srs';
import { WsMsgTypeEnum } from '@/types/websocket';
import { strSlice } from '@/utils';
import { liveRoomVerifyAuth } from '@/utils/business';
import { chalkERROR, chalkSUCCESS, chalkWARN } from '@/utils/chalkTip';
import { myaxios } from '@/utils/request';

class SRSController {
  allowDev = true;

  common = {
    isLive: async (roomId: number) => {
      try {
        const liveRes = await liveController.common.findByLiveRoomId(
          Number(roomId)
        );
        return !!liveRes;
        // if (!liveRes?.stream_id) {
        //   return false;
        // }
        // const res = await this.common.getApiV1StreamsDetail(liveRes.stream_id);
        // return res.code === 0;
      } catch (error) {
        console.log(error);
        return true;
      }
    },
    closeLive: async ({ live_room_id }) => {
      const liveRes = await liveController.common.findLiveRecordByLiveRoomId(
        Number(live_room_id)
      );
      if (!liveRes) {
        return;
      }
      await liveController.common.delete(liveRes.id!);
      await liveRecordController.common.update({
        id: liveRes.live_record_id,
        // @ts-ignore
        end_time: +new Date(),
      });
    },
    getApiV1ClientDetail: (clientId: string) =>
      myaxios.get(
        `http://${LOCALHOST_URL}:${SRS_CONFIG.docker.port[1985]}/api/v1/clients/${clientId}`
      ),
    getApiV1StreamsDetail: (streamsId: string) =>
      myaxios.get(
        `http://${LOCALHOST_URL}:${SRS_CONFIG.docker.port[1985]}/api/v1/streams/${streamsId}`
      ),
    getApiV1Clients: ({ start, count }: { start: number; count: number }) =>
      myaxios.get<IApiV1Clients>(
        `http://${LOCALHOST_URL}:${SRS_CONFIG.docker.port[1985]}/api/v1/clients?start=${start}&count=${count}`
      ),
    getApiV1Streams: ({ start, count }: { start: number; count: number }) =>
      myaxios.get<IApiV1Streams>(
        `http://${LOCALHOST_URL}:${SRS_CONFIG.docker.port[1985]}/api/v1/streams?start=${start}&count=${count}`
      ),
    deleteApiV1Clients: (clientId: string) =>
      myaxios.delete(
        `http://${LOCALHOST_URL}:${SRS_CONFIG.docker.port[1985]}/api/v1/clients/${clientId}`
      ),
    getPullUrl: (data: { liveRoomId: number }) => {
      return {
        rtmp: `${SRS_LIVE.PushDomain}/${SRS_LIVE.AppName}/roomId___${data.liveRoomId}`,
        flv: `${SRS_LIVE.PullDomain}/${SRS_LIVE.AppName}/roomId___${data.liveRoomId}.flv`,
        hls: `${SRS_LIVE.PullDomain}/${SRS_LIVE.AppName}/roomId___${data.liveRoomId}.m3u8`,
        webrtc: ``,
      };
    },
    getPushUrl: (data: {
      liveRoomId: number;
      userId: number;
      type: LiveRoomTypeEnum;
      key: string;
    }) => {
      const pushParams = (type: LiveRoomTypeEnum) =>
        `?${SRS_CB_URL_QUERY.roomId}=${data.liveRoomId}&${SRS_CB_URL_QUERY.publishType}=${type}&${SRS_CB_URL_QUERY.publishKey}=${data.key}&${SRS_CB_URL_QUERY.userId}=${data.userId}`;
      return {
        rtmp_url: `${SRS_LIVE.PushDomain}/${SRS_LIVE.AppName}/roomId___${
          data.liveRoomId
        }${pushParams(data.type)}`,
        obs_server: `${SRS_LIVE.PushDomain}/${SRS_LIVE.AppName}/roomId___${data.liveRoomId}`,
        obs_stream_key: pushParams(LiveRoomTypeEnum.obs),
        webrtc_url: ``,
        srt_url: ``,
      };
    },
  };

  rtcV1Publish = async (ctx: ParameterizedContext, next) => {
    const { sdp, streamurl }: ISrsRTC = ctx.request.body;
    const res = await myaxios.post(
      `http://${LOCALHOST_URL}:${SRS_CONFIG.docker.port[1985]}/rtc/v1/publish/`,
      { sdp, streamurl }
    );
    successHandler({
      ctx,
      data: res,
    });
    await next();
  };

  rtcV1Play = async (ctx: ParameterizedContext, next) => {
    const { sdp, streamurl }: ISrsRTC = ctx.request.body;
    const res = await myaxios.post(
      `http://${LOCALHOST_URL}:${SRS_CONFIG.docker.port[1985]}/rtc/v1/play/`,
      { sdp, streamurl }
    );
    successHandler({
      ctx,
      data: res,
    });
    await next();
  };

  rtcV1Whep = async (ctx: ParameterizedContext, next) => {
    const { app, stream, sdp }: { app: string; stream: string; sdp: string } =
      ctx.request.body;
    // WARN 线上服务器的是whip-play
    const res = await axios.post(
      `http://${LOCALHOST_URL}:${SRS_CONFIG.docker.port[1985]}/rtc/v1/whip-play/?app=${app}&stream=${stream}`,
      sdp
    );
    // WARN 本地测试的是whep
    // const res = await axios.post(
    //   `http://${LOCALHOST_URL}:${SRS_CONFIG.docker.port[1985]}/rtc/v1/whep/?app=${app}&stream=${stream}`,
    //   sdp
    // );
    successHandler({
      ctx,
      data: { answer: res.data },
    });
    await next();
  };

  getApiV1Streams = async (ctx: ParameterizedContext, next) => {
    const { start, count }: any = ctx.request.query;
    const res = await this.common.getApiV1Streams({ start, count });
    successHandler({
      ctx,
      data: res,
    });
    await next();
  };

  getApiV1Clients = async (ctx: ParameterizedContext, next) => {
    const { start, count }: any = ctx.request.query;
    const res = await this.common.getApiV1Clients({ start, count });
    successHandler({
      ctx,
      data: res,
    });
    await next();
  };

  /** 踢掉观众 */
  deleteAudience = async (ctx: ParameterizedContext, next) => {
    successHandler({
      ctx,
    });
    await next();
  };

  deleteApiV1Clients = async (ctx: ParameterizedContext, next) => {
    successHandler({
      ctx,
    });
    await next();
  };

  async onStop(ctx: ParameterizedContext, next) {
    ctx.body = { code: 0, msg: '[on_stop] all success, pass' };
    await next();
  }

  async onPlay(ctx: ParameterizedContext, next) {
    ctx.body = {
      code: 0,
      msg: `[on_play] all success, pass`,
    };
    await next();
  }

  onPublish = async (ctx: ParameterizedContext, next) => {
    // https://ossrs.net/lts/zh-cn/docs/v5/doc/http-callback#nodejs-koa-example
    // code等于数字0表示成功，其他错误码代表失败。
    try {
      // @ts-ignore
      const { body }: { body: ISrsCb } = ctx.request;
      console.log(chalkWARN(`srs on_publish参数`), body);
      const roomIdStr = body.stream.replace(/\.m3u8$/g, '');
      const reg = /^roomId___(\d+)$/g;
      const roomId = reg.exec(roomIdStr)?.[1];

      if (!roomId) {
        console.log(chalkERROR(`[srs on_publish] 房间id不存在！`));
        ctx.body = { code: 1, msg: '[srs on_publish] 房间id不存在！' };
        await next();
        return;
      }
      // body.param格式：?pushtype=0&pushkey=xxxxx
      const params = new URLSearchParams(body.param);
      const publishKey = params.get(SRS_CB_URL_QUERY.publishKey);
      const userId = params.get(SRS_CB_URL_QUERY.userId);
      const isdev = params.get(SRS_CB_URL_QUERY.isdev);
      if (!Number(userId)) {
        console.log(chalkERROR(`[srs on_publish] userId不存在！`));
        ctx.body = { code: 1, msg: '[srs on_publish] userId不存在！' };
        await next();
        return;
      }
      let authRes;
      if (this.allowDev && isdev === '1') {
        console.log(chalkSUCCESS(`[srs on_publish] 开发模式，不鉴权`));
        successHandler({
          code: 0,
          ctx,
          data: '[srs on_publish] 开发模式，不鉴权',
        });
        await next();
      } else {
        const res = await liveRoomVerifyAuth({ roomId, publishKey });
        authRes = res;
        if (res.code === 0) {
          console.log(chalkSUCCESS(`[srs on_publish] ${res.msg}`));
        } else {
          console.log(chalkERROR(`[srs on_publish] ${res.msg}`));
          successHandler({
            code: 1,
            ctx,
            data: `[srs on_publish] ${res.msg}`,
          });
          return;
        }
      }
      const isLiving = await liveController.common.findByLiveRoomId(
        Number(roomId)
      );
      if (isLiving) {
        successHandler({
          code: 1,
          ctx,
          data: '[srs on_publish] 正在直播',
        });
        await next();
        return;
      }
      const recRes = await liveRecordController.common.create({
        platform: LivePlatformEnum.srs,
        stream_name: '',
        stream_id: body.stream_id,
        user_id: Number(userId),
        live_room_id: Number(roomId),
        duration: 0,
        danmu: 0,
        view: 0,
        // @ts-ignore
        start_time: +new Date(),
        remark: '',
      });
      const liveRes = await liveController.common.create({
        platform: LivePlatformEnum.srs,
        live_record_id: recRes.id,
        live_room_id: Number(roomId),
        user_id: Number(userId),
        stream_id: body.stream_id,
        stream_name: body.stream,
      });
      wsSocket.io
        ?.to(`${roomId}`)
        .emit(WsMsgTypeEnum.roomLiving, { live_room_id: roomId });
      const client_ip = strSlice(
        String(ctx.request.headers['x-real-ip'] || ''),
        100
      );
      liveRedisController.setSrsPublishing({
        data: {
          live_room_id: Number(roomId),
          live_record_id: recRes.id!,
          live_id: liveRes.id!,
        },
        client_ip,
        exp: 5,
      });
      successHandler({
        code: 0,
        ctx,
        // eslint-disable-next-line
        data: `[srs on_publish] ${authRes.msg}`,
      });
      await next();
    } catch (error) {
      console.log(error);
      successHandler({
        code: 1,
        ctx,
        data: '[srs on_publish] catch error',
      });
      await next();
    }
  };

  async onUnpublish(ctx: ParameterizedContext, next) {
    // https://ossrs.net/lts/zh-cn/docs/v5/doc/http-callback#nodejs-koa-example
    // code等于数字0表示成功，其他错误码代表失败。
    // @ts-ignore
    const { body }: { body: ISrsCb } = ctx.request;
    console.log(chalkWARN(`srs on_unpublish参数`), body);
    try {
      const roomIdStr = body.stream.replace(/\.m3u8$/g, '');
      const reg = /^roomId___(\d+)$/g;
      const roomId = reg.exec(roomIdStr)?.[1];

      if (!roomId) {
        console.log(chalkERROR('[srs on_unpublish] 房间id不存在！'));
        ctx.body = { code: 1, msg: '[srs on_unpublish] 房间id不存在！' };
        await next();
        return;
      }
      // body.param格式：?pushtype=0&pushkey=xxxxx
      const params = new URLSearchParams(body.param);
      const publishKey = params.get(SRS_CB_URL_QUERY.publishKey);
      const isdev = params.get(SRS_CB_URL_QUERY.isdev);
      let authRes;
      if (this.allowDev && isdev === '1') {
        console.log(chalkSUCCESS(`[srs on_unpublish] 开发模式，不鉴权`));
        successHandler({
          code: 0,
          ctx,
          data: '[srs on_unpublish] 开发模式，不鉴权',
        });
        await next();
      } else {
        const res = await liveRoomVerifyAuth({ roomId, publishKey });
        authRes = res;
        if (res.code === 0) {
          console.log(chalkSUCCESS(`[srs on_unpublish] ${res.msg}`));
        } else {
          console.log(chalkERROR(`[srs on_unpublish] ${res.msg}`));
          successHandler({
            code: 1,
            ctx,
            data: `[srs on_unpublish] 房间id不存在！`,
          });
          await next();
          return;
        }
      }
      const liveRes = await liveController.common.findLiveRecordByLiveRoomId(
        Number(roomId)
      );
      if (!liveRes) {
        successHandler({
          code: 1,
          ctx,
          data: `[srs on_unpublish] 房间id：${roomId}，没在直播`,
        });
        await next();
        return;
      }
      await this.common.closeLive({
        live_room_id: Number(roomId),
      });
      wsSocket.io?.to(`${roomId}`).emit(WsMsgTypeEnum.roomNoLive);
      successHandler({
        code: 0,
        ctx,
        // eslint-disable-next-line
        data: `[srs on_unpublish] ${authRes.msg}`,
      });
      await next();
    } catch (error) {
      console.log(error);
      successHandler({
        code: 1,
        ctx,
        data: '[srs on_unpublish] catch error',
      });
      await next();
    }
  }

  async onDvr(ctx: ParameterizedContext, next) {
    // https://ossrs.net/lts/zh-cn/docs/v5/doc/http-callback#nodejs-koa-example
    // code等于数字0表示成功，其他错误码代表失败。
    ctx.body = { code: 0, msg: '[on_dvr] success' };
    await next();
  }
}

export default new SRSController();
