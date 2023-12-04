import { MD5 } from 'crypto-js';
import { ParameterizedContext } from 'koa';
import { rimrafSync } from 'rimraf';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { SRS_CONFIG } from '@/config/secret';
import { wsSocket } from '@/config/websocket';
import { ALLOW_HTTP_CODE, DEFAULT_AUTH_INFO, LOCALHOST_URL } from '@/constant';
import authController from '@/controller/auth.controller';
import { ISrsRTC, LiveRoomPullIsShouldAuthEnum } from '@/interface';
import { IApiV1Clients, IApiV1Streams } from '@/interface-srs';
import { WsMsgTypeEnum } from '@/interface-ws';
import { CustomError } from '@/model/customError.model';
import liveService from '@/service/live.service';
import livePlayService from '@/service/livePlay.service';
import liveRoomService from '@/service/liveRoom.service';
import userService from '@/service/user.service';
import { resolveApp } from '@/utils';
import { chalkERROR, chalkSUCCESS, chalkWARN } from '@/utils/chalkTip';
import { myaxios } from '@/utils/request';

class SRSController {
  common = {
    getApiV1ClientDetail: (clientId: string) =>
      myaxios.get(
        `http://${LOCALHOST_URL}:${SRS_CONFIG.docker.port[1985]}/api/v1/clients/${clientId}`
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
  };

  rtcV1Publish = async (ctx: ParameterizedContext, next) => {
    const { api, clientip, sdp, streamurl, tid }: ISrsRTC = ctx.request.body;
    const res = await myaxios.post(
      `http://${LOCALHOST_URL}:${SRS_CONFIG.docker.port[1985]}/rtc/v1/publish/`,
      { api, clientip, sdp, streamurl, tid }
    );
    successHandler({
      ctx,
      data: res,
    });
    await next();
  };

  rtcV1Play = async (ctx: ParameterizedContext, next) => {
    const { api, clientip, sdp, streamurl, tid }: ISrsRTC = ctx.request.body;
    const res = await myaxios.post(
      `http://${LOCALHOST_URL}:${SRS_CONFIG.docker.port[1985]}/rtc/v1/play/`,
      { api, clientip, sdp, streamurl, tid }
    );
    successHandler({
      ctx,
      data: res,
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

  deleteApiV1Clients = async (ctx: ParameterizedContext, next) => {
    const { userInfo } = await authJwt(ctx);
    if (userInfo?.id !== 1) {
      throw new CustomError(
        `权限不足！`,
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const { clientId }: { clientId: string } = ctx.params;
    const res = await this.common.deleteApiV1Clients(clientId);
    successHandler({
      ctx,
      data: res,
    });
    await next();
  };

  async onStop(ctx: ParameterizedContext, next) {
    // https://ossrs.net/lts/zh-cn/docs/v5/doc/http-callback#nodejs-koa-example
    // code等于数字0表示成功，其他错误码代表失败。
    const { body } = ctx.request;
    console.log(chalkWARN(`on_stop参数`), body);

    const roomIdStr = body.stream.replace(/\.m3u8$/g, '');
    const reg = /^roomId___(\d+)$/g;
    const roomId = reg.exec(roomIdStr)?.[1];

    if (!roomId) {
      console.log(chalkERROR(`[on_stop] 房间id不存在！`));
      ctx.body = { code: 1, msg: '[on_stop] fail, roomId is not exist' };
      await next();
      return;
    }
    const [liveRoomInfo] = await Promise.all([
      liveRoomService.find(Number(roomId)),
    ]);
    if (!liveRoomInfo) {
      console.log(chalkERROR('[on_stop] liveRoomInfo为空'));
      ctx.body = { code: 1, msg: '[on_stop] fail, liveRoomInfo is not exist' };
      await next();
      return;
    }
    const params = new URLSearchParams(body.param);
    const paramsUserToken = params.get('usertoken');
    const paramsUserid = params.get('userid');
    const userInfo = await userService.findAndToken(Number(paramsUserid));
    if (!userInfo) {
      console.log(chalkERROR(`[on_stop] 用户不存在，不允许stop`));
      ctx.body = {
        code: 1,
        msg: '[on_stop] fail, userInfo is not exist',
      };
      await next();
      return;
    }
    const token = MD5(userInfo.token!).toString();
    if (token !== paramsUserToken) {
      console.log(chalkERROR(`[on_stop] 鉴权失败，不允许stop`));
      ctx.body = { code: 1, msg: '[on_stop] fail, token fail' };
      await next();
      return;
    }
    await livePlayService.deleteByLiveRoomIdAndUserId({
      live_room_id: Number(roomId),
      user_id: userInfo.id!,
    });
    console.log(
      chalkSUCCESS(`[on_stop] 房间id：${roomId}，所有验证通过，允许stop`)
    );
    ctx.body = { code: 0, msg: '[on_stop] all success, pass' };
    await next();
  }

  async onPlay(ctx: ParameterizedContext, next) {
    // https://ossrs.net/lts/zh-cn/docs/v5/doc/http-callback#nodejs-koa-example
    // code等于数字0表示成功，其他错误码代表失败。
    const startTime = performance.now();
    let duration = -1;
    const { body } = ctx.request;
    console.log(chalkWARN(`on_play参数`), body);

    const roomIdStr = body.stream.replace(/\.m3u8$/g, '');
    const reg = /^roomId___(\d+)$/g;
    const roomId = reg.exec(roomIdStr)?.[1];

    if (!roomId) {
      duration = Math.floor(performance.now() - startTime);
      console.log(chalkERROR(`[on_play] 耗时：${duration}，房间id不存在！`));
      ctx.body = {
        code: 1,
        msg: `[on_play] fail, duration: ${duration} , roomId is not exist`,
      };
      await next();
      return;
    }
    const [liveRoomInfo] = await Promise.all([
      liveRoomService.find(Number(roomId)),
    ]);
    if (!liveRoomInfo) {
      duration = Math.floor(performance.now() - startTime);
      console.log(chalkERROR(`[on_play] 耗时：${duration}，liveRoomInfo为空`));
      ctx.body = {
        code: 1,
        msg: `[on_play] fail, duration: ${duration} , liveRoomInfo is not exist`,
      };
      await next();
      return;
    }
    const params = new URLSearchParams(body.param);
    const paramsUserToken = params.get('usertoken');
    const paramsUserid = params.get('userid');
    const paramsRandomid = params.get('randomid');
    if (liveRoomInfo.pull_is_should_auth === LiveRoomPullIsShouldAuthEnum.yes) {
      if (!paramsUserToken || !paramsUserid) {
        duration = Math.floor(performance.now() - startTime);
        console.log(
          chalkERROR(
            `[on_play] 耗时：${duration}，该直播需要拉流token，当前用户没有拉流token，不允许拉流`
          )
        );
        ctx.body = {
          code: 1,
          msg: `[on_play] fail, duration: ${duration} , no token`,
        };
        await next();
        return;
      }
      const userInfo = await userService.findAndToken(Number(paramsUserid));
      if (!userInfo) {
        duration = Math.floor(performance.now() - startTime);
        console.log(
          chalkERROR(`[on_play] 耗时：${duration}，用户不存在，不允许拉流`)
        );
        ctx.body = {
          code: 1,
          msg: `[on_play] fail, duration: ${duration} , userInfo is not exist`,
        };
        await next();
        return;
      }
      const token = MD5(userInfo.token!).toString();
      if (token !== paramsUserToken) {
        duration = Math.floor(performance.now() - startTime);
        console.log(
          chalkERROR(`[on_play] 耗时：${duration}，鉴权失败，不允许拉流`)
        );
        ctx.body = {
          code: 1,
          msg: `[on_play] fail, duration: ${duration}, token fail`,
        };
        await next();
        return;
      }
      const authArr = await authController.common.getUserAuth(userInfo.id!);
      if (
        !authArr.find((item) => item.id === DEFAULT_AUTH_INFO.LIVE_PULL_SVIP.id)
      ) {
        duration = Math.floor(performance.now() - startTime);
        console.log(
          chalkERROR(
            `[on_play] 耗时：${duration}，鉴权失败，缺少权限，不允许拉流`
          )
        );
        ctx.body = {
          code: 1,
          msg: `[on_play] fail, duration: ${duration}, auth fail`,
        };
        await next();
        return;
      }
      await livePlayService.create({
        live_room_id: Number(roomId),
        user_id: userInfo.id,
        random_id: paramsRandomid || '-1',
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
      });
      duration = Math.floor(performance.now() - startTime);
      console.log(
        chalkSUCCESS(
          `[on_play] 耗时：${duration}，房间id：${roomId}，所有验证通过，允许拉流`
        )
      );
      ctx.body = {
        code: 0,
        msg: `[on_play] duration: ${duration}, all success, pass`,
      };
      await next();
    } else {
      await livePlayService.create({
        live_room_id: Number(roomId),
        user_id: -1,
        random_id: paramsRandomid || '-1',
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
      });
      duration = Math.floor(performance.now() - startTime);
      console.log(
        chalkSUCCESS(
          `[on_play] 耗时：${duration}，房间id：${roomId}，不需要拉流鉴权`
        )
      );
      ctx.body = {
        code: 0,
        msg: `[on_play] duration: ${duration}, all success, pass`,
      };
      await next();
    }
  }

  onPublish = async (ctx: ParameterizedContext, next) => {
    // https://ossrs.net/lts/zh-cn/docs/v5/doc/http-callback#nodejs-koa-example
    // code等于数字0表示成功，其他错误码代表失败。
    const { body } = ctx.request;
    console.log(chalkWARN(`on_publish参数`), body);

    const roomIdStr = body.stream.replace(/\.m3u8$/g, '');
    const reg = /^roomId___(\d+)$/g;
    const roomId = reg.exec(roomIdStr)?.[1];

    if (!roomId) {
      console.log(chalkERROR(`[on_publish] 房间id不存在！`));
      ctx.body = { code: 1, msg: '[on_publish] fail, roomId is not exist' };
      await next();
    } else {
      const params = new URLSearchParams(body.param);
      const paramsToken = params.get('token');
      const paramsType = params.get('type');
      if (!paramsToken) {
        console.log(chalkERROR(`[on_publish] 没有推流token`));
        ctx.body = { code: 1, msg: '[on_publish] fail, no token' };
        await next();
        return;
      }
      const result = await liveRoomService.findKey(Number(roomId));
      const rtmptoken = result?.key;
      if (rtmptoken !== paramsToken) {
        console.log(chalkERROR(`[on_publish] 房间id：${roomId}，鉴权失败`));
        ctx.body = { code: 1, msg: '[on_publish] fail, auth fail' };
        await next();
        return;
      }
      if (paramsType) {
        await liveRoomService.update({
          id: Number(roomId),
          type: Number(paramsType),
        });
      }
      const isLiveing = await liveService.findByRoomId(Number(roomId));
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
      const [liveRoomInfo] = await Promise.all([
        liveRoomService.find(Number(roomId)),
      ]);
      if (!liveRoomInfo) {
        console.log(chalkERROR('[on_publish] liveRoomInfo为空，不允许推流'));
        ctx.body = {
          code: 1,
          msg: '[on_publish] fail, liveRoomInfo is not exist',
        };
        await next();
        return;
      }
      console.log(
        chalkSUCCESS(`[on_publish] 房间id：${roomId}，所有验证通过，允许推流`)
      );
      ctx.body = { code: 0, msg: '[on_publish] all success, pass' };
      await liveService.create({
        live_room_id: Number(roomId),
        user_id: liveRoomInfo?.user_live_room?.user?.id,
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
      });
      wsSocket.io?.to(roomId).emit(WsMsgTypeEnum.roomLiving, { data: {} });
      await next();
    }
  };

  async onUnpublish(ctx: ParameterizedContext, next) {
    // https://ossrs.net/lts/zh-cn/docs/v5/doc/http-callback#nodejs-koa-example
    // code等于数字0表示成功，其他错误码代表失败。
    const { body } = ctx.request;
    console.log(chalkWARN(`on_unpublish参数`), body);

    const roomIdStr = body.stream.replace(/\.m3u8$/g, '');
    const reg = /^roomId___(\d+)$/g;
    const roomId = reg.exec(roomIdStr)?.[1];

    if (!roomId) {
      console.log(chalkERROR('[on_unpublish] 房间id不存在！'));
      ctx.body = { code: 1, msg: '[on_unpublish] fail, roomId is not exist' };
    } else {
      console.log(chalkSUCCESS(`[on_unpublish] 房间id：${roomId}，成功`));
      ctx.body = { code: 0, msg: '[on_unpublish] success' };
      liveService.deleteByLiveRoomId(Number(roomId));
      wsSocket.io?.to(roomId).emit(WsMsgTypeEnum.roomNoLive);
      const roomDir = resolveApp(`/src/webm/roomId_${roomId}`);
      console.log('删除roomDir333');
      rimrafSync(roomDir);
    }
    await next();
  }

  async onDvr(ctx: ParameterizedContext, next) {
    // https://ossrs.net/lts/zh-cn/docs/v5/doc/http-callback#nodejs-koa-example
    // code等于数字0表示成功，其他错误码代表失败。
    const { body } = ctx.request;
    console.log(chalkWARN(`on_dvr参数`), body);
    ctx.body = { code: 0, msg: '[on_dvr] success' };
    await next();
  }
}

export default new SRSController();
