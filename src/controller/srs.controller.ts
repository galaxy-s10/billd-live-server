import fs from 'fs';
import path from 'path';

import axios from 'axios';
import { ParameterizedContext } from 'koa';
import nodeSchedule from 'node-schedule';
import { rimrafSync } from 'rimraf';

import successHandler from '@/app/handler/success-handle';
import { wsSocket } from '@/config/websocket';
import {
  LOCALHOST_URL,
  SCHEDULE_TYPE,
  SRS_CB_URL_PARAMS,
  WEBM_DIR,
} from '@/constant';
import liveController from '@/controller/live.controller';
import liveRecordController from '@/controller/liveRecord.controller';
import userLiveRoomController from '@/controller/userLiveRoom.controller';
import { SwitchEnum } from '@/interface';
import { SRS_CONFIG, SRS_LIVE } from '@/secret/secret';
import liveRoomService from '@/service/liveRoom.service';
import { LiveRoomTypeEnum } from '@/types/ILiveRoom';
import { IApiV1Clients, IApiV1Streams, ISrsCb, ISrsRTC } from '@/types/srs';
import { WsMsgTypeEnum } from '@/types/websocket';
import { chalkERROR, chalkSUCCESS, chalkWARN } from '@/utils/chalkTip';
import { forwardToOtherPlatform } from '@/utils/process';
import { myaxios } from '@/utils/request';

class SRSController {
  common = {
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
      type: LiveRoomTypeEnum;
      key: string;
    }) => {
      const pushParams = (type: LiveRoomTypeEnum) =>
        `?${SRS_CB_URL_PARAMS.roomId}=${data.liveRoomId}&${SRS_CB_URL_PARAMS.publishType}=${type}&${SRS_CB_URL_PARAMS.publishKey}=${data.key}`;
      return {
        push_rtmp_url: `${SRS_LIVE.PushDomain}/${SRS_LIVE.AppName}/roomId___${
          data.liveRoomId
        }${pushParams(data.type)}`,
        push_obs_server: `${SRS_LIVE.PushDomain}/${SRS_LIVE.AppName}/roomId___${data.liveRoomId}`,
        push_obs_stream_key: pushParams(LiveRoomTypeEnum.obs),
        push_webrtc_url: ``,
        push_srt_url: ``,
      };
    },
    closeLiveByLiveRoomId: async (liveRoomId: number) => {
      const res1 = await liveController.common.findAllLiveByRoomId(liveRoomId);
      const arr: any[] = [];
      res1.forEach((item) => {
        arr.push(this.common.deleteApiV1Clients(item.srs_client_id!));
      });
      const res = await Promise.all(arr);
      return res;
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
    // @ts-ignore
    const { body }: { body: ISrsCb } = ctx.request;
    console.log(chalkWARN(`on_publish参数`), body);

    const roomIdStr = body.stream.replace(/\.m3u8$/g, '');
    const reg = /^roomId___(\d+)$/g;
    const roomId = reg.exec(roomIdStr)?.[1];

    if (!roomId) {
      console.log(chalkERROR(`[on_publish] 房间id不存在！`));
      ctx.body = { code: 1, msg: '[on_publish] fail, roomId is not exist' };
      await next();
    } else {
      // body.param格式：?pushtype=0&pushkey=xxxxx
      const params = new URLSearchParams(body.param);
      const paramsPublishKey = params.get(SRS_CB_URL_PARAMS.publishKey);
      const paramsPublishType = params.get(SRS_CB_URL_PARAMS.publishType);
      if (!paramsPublishKey) {
        console.log(chalkERROR(`[on_publish] 没有推流token`));
        ctx.body = { code: 1, msg: '[on_publish] fail, no token' };
        await next();
        return;
      }
      const result = await liveRoomService.findKey(Number(roomId));
      const pushKey = result?.key;
      if (pushKey !== paramsPublishKey) {
        console.log(chalkERROR(`[on_publish] 房间id：${roomId}，鉴权失败`));
        ctx.body = { code: 1, msg: '[on_publish] fail, auth fail' };
        await next();
        return;
      }
      if (paramsPublishType) {
        await liveRoomService.update({
          id: Number(roomId),
          cdn: SwitchEnum.no,
          type: Number(paramsPublishType),
        });
        if (result) {
          if (
            Number(paramsPublishType) === LiveRoomTypeEnum.forward_bilibili ||
            Number(paramsPublishType) === LiveRoomTypeEnum.forward_huya ||
            Number(paramsPublishType) === LiveRoomTypeEnum.forward_all
          ) {
            let index = 0;
            const max = 30;
            const timer = setInterval(() => {
              if (index > max) {
                clearInterval(timer);
              }
              index += 1;
              // 根据body.stream_id，轮询判断查找流里面的audio，audio有值了，再转推流
              this.common
                .getApiV1StreamsDetail(body.stream_id)
                .then((res) => {
                  if (res && res.stream?.video && res.stream?.audio) {
                    clearInterval(timer);
                    console.log(chalkSUCCESS('开始转推'));
                    if (
                      Number(paramsPublishType) ===
                      LiveRoomTypeEnum.forward_bilibili
                    ) {
                      forwardToOtherPlatform({
                        platform: 'bilibili',
                        localFlv: result.flv_url!,
                        remoteRtmp: result.forward_bilibili_url!,
                      });
                    } else if (
                      Number(paramsPublishType) ===
                      LiveRoomTypeEnum.forward_huya
                    ) {
                      forwardToOtherPlatform({
                        platform: 'huya',
                        localFlv: result.flv_url!,
                        remoteRtmp: result.forward_huya_url!,
                      });
                    } else if (
                      Number(paramsPublishType) === LiveRoomTypeEnum.forward_all
                    ) {
                      forwardToOtherPlatform({
                        platform: 'bilibili',
                        localFlv: result.flv_url!,
                        remoteRtmp: result.forward_bilibili_url!,
                      });
                      forwardToOtherPlatform({
                        platform: 'huya',
                        localFlv: result.flv_url!,
                        remoteRtmp: result.forward_huya_url!,
                      });
                    }
                  }
                })
                .catch((error) => {
                  console.log(error);
                });
            }, 1000);
          }
        }
      }
      const isLiveing = await liveController.common.findByLiveRoomId(
        Number(roomId)
      );
      if (isLiveing) {
        console.log(
          chalkERROR(
            `[on_publish] 房间id：${roomId}，鉴权成功，但是正在直播，不允许推流`
          )
        );
        ctx.body = { code: 1, msg: '[on_publish] fail, room is living' };
        await next();
        return;
      }
      const [userLiveRoomInfo] = await Promise.all([
        userLiveRoomController.common.findByLiveRoomId(Number(roomId)),
      ]);
      if (!userLiveRoomInfo) {
        console.log(
          chalkERROR('[on_publish] userLiveRoomInfo为空，不允许推流')
        );
        ctx.body = {
          code: 1,
          msg: '[on_publish] fail, userLiveRoomInfo is not exist',
        };
        await next();
        return;
      }
      console.log(
        chalkSUCCESS(`[on_publish] 房间id：${roomId}，所有验证通过，允许推流`)
      );
      ctx.body = { code: 0, msg: '[on_publish] all success, pass' };
      await Promise.all([
        liveController.common.create({
          live_room_id: Number(roomId),
          socket_id: '-1',
          track_audio: 1,
          track_video: 1,
          srs_action: body.action,
          srs_app: body.app,
          srs_client_id: body.client_id,
          srs_ip: body.ip,
          srs_param: body.param,
          srs_server_id: body.server_id,
          srs_service_id: body.service_id,
          srs_stream: body.stream,
          srs_stream_id: body.stream_id,
          srs_stream_url: body.stream_url,
          srs_tcUrl: body.tcUrl,
          srs_vhost: body.vhost,
          is_tencentcloud_css: 2,
          flag_id: body.client_id,
        }),
        liveRecordController.common.create({
          client_id: body.client_id,
          live_room_id: Number(roomId),
          user_id: userLiveRoomInfo.user_id,
          danmu: 0,
          duration: 0,
          view: 0,
        }),
      ]);
      wsSocket.io
        ?.to(roomId)
        .emit(WsMsgTypeEnum.roomLiving, { live_room_id: roomId });
      await next();
    }
  };

  async onUnpublish(ctx: ParameterizedContext, next) {
    // https://ossrs.net/lts/zh-cn/docs/v5/doc/http-callback#nodejs-koa-example
    // code等于数字0表示成功，其他错误码代表失败。
    // @ts-ignore
    const { body }: { body: ISrsCb } = ctx.request;
    console.log(chalkWARN(`on_unpublish参数`), body);

    const roomIdStr = body.stream.replace(/\.m3u8$/g, '');
    const reg = /^roomId___(\d+)$/g;
    const roomId = reg.exec(roomIdStr)?.[1];

    if (!roomId) {
      console.log(chalkERROR('[on_unpublish] 房间id不存在！'));
      ctx.body = { code: 1, msg: '[on_unpublish] fail, roomId is not exist' };
      await next();
      return;
    }
    // body.param格式：?pushtype=0&pushkey=xxxxx
    const params = new URLSearchParams(body.param);
    const paramsPublishKey = params.get(SRS_CB_URL_PARAMS.publishKey);
    if (!paramsPublishKey) {
      console.log(chalkERROR(`[on_unpublish] 没有推流token`));
      ctx.body = { code: 1, msg: '[on_unpublish] fail, no token' };
      await next();
      return;
    }
    const result = await liveRoomService.findKey(Number(roomId));
    const pushKey = result?.key;
    if (pushKey !== paramsPublishKey) {
      console.log(chalkERROR(`[on_unpublish] 房间id：${roomId}，鉴权失败`));
      ctx.body = { code: 1, msg: '[on_unpublish] fail, auth fail' };
      await next();
      return;
    }
    const userLiveRoomInfo =
      await userLiveRoomController.common.findByLiveRoomId(Number(roomId));
    if (!userLiveRoomInfo) {
      console.log(chalkERROR('[on_unpublish] userLiveRoomInfo为空'));
      ctx.body = {
        code: 1,
        msg: '[on_unpublish] fail, userLiveRoomInfo is not exist',
      };
      await next();
      return;
    }
    await Promise.all([
      liveController.common.deleteByLiveRoomId([Number(roomId)]),
      liveRecordController.common.updateByLiveRoomIdAndUserId({
        client_id: body.client_id,
        live_room_id: Number(roomId),
        user_id: userLiveRoomInfo.user_id,
        end_time: `${+new Date()}`,
      }),
    ]);
    wsSocket.io?.to(roomId).emit(WsMsgTypeEnum.roomNoLive);
    console.log(chalkSUCCESS(`[on_unpublish] 房间id：${roomId}，成功`));
    ctx.body = { code: 0, msg: '[on_unpublish] success' };
    nodeSchedule.cancelJob(`${SCHEDULE_TYPE.blobIsExist}___${roomId}`);
    await next();
    const roomDir = path.resolve(WEBM_DIR, `roomId_${roomId}`);
    if (fs.existsSync(roomDir)) {
      console.log('收到主播断开直播，删除直播间的webm目录');
      rimrafSync(roomDir);
    }
  }

  async onDvr(ctx: ParameterizedContext, next) {
    // https://ossrs.net/lts/zh-cn/docs/v5/doc/http-callback#nodejs-koa-example
    // code等于数字0表示成功，其他错误码代表失败。
    // @ts-ignore
    const { body }: { body: ISrsCb } = ctx.request;
    console.log(chalkWARN(`on_dvr参数`), body);
    ctx.body = { code: 0, msg: '[on_dvr] success' };
    await next();
  }
}

export default new SRSController();
