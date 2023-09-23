import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { SRS_CONFIG } from '@/config/secret';
import { wsSocket } from '@/config/websocket';
import { ALLOW_HTTP_CODE } from '@/constant';
import { ISrsRTC } from '@/interface';
import { IApiV1Clients, IApiV1Streams } from '@/interface-srs';
import { WsMsgTypeEnum } from '@/interface-ws';
import { CustomError } from '@/model/customError.model';
import liveService from '@/service/live.service';
import liveRoomService from '@/service/liveRoom.service';
import { chalkERROR, chalkSUCCESS, chalkWARN } from '@/utils/chalkTip';
import { myaxios } from '@/utils/request';

class SRSController {
  common = {
    getApiV1ClientDetail: (clientId: string) =>
      myaxios.get(
        `http://localhost:${SRS_CONFIG.docker.port[1985]}/api/v1/clients/${clientId}`
      ),
    getApiV1Clients: ({ start, count }: { start: number; count: number }) =>
      myaxios.get<IApiV1Clients>(
        `http://localhost:${SRS_CONFIG.docker.port[1985]}/api/v1/clients?start=${start}&count=${count}`
      ),
    getApiV1Streams: ({ start, count }: { start: number; count: number }) =>
      myaxios.get<IApiV1Streams>(
        `http://localhost:${SRS_CONFIG.docker.port[1985]}/api/v1/streams?start=${start}&count=${count}`
      ),
    deleteApiV1Clients: (clientId: string) =>
      myaxios.delete(
        `http://localhost:${SRS_CONFIG.docker.port[1985]}/api/v1/clients/${clientId}`
      ),
  };

  rtcV1Publish = async (ctx: ParameterizedContext, next) => {
    const { api, clientip, sdp, streamurl, tid }: ISrsRTC = ctx.request.body;
    const res = await myaxios.post(
      `http://localhost:${SRS_CONFIG.docker.port[1985]}/rtc/v1/publish/`,
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
      `http://localhost:${SRS_CONFIG.docker.port[1985]}/rtc/v1/play/`,
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
    console.log(chalkWARN(`on_publish参数`), body);

    const reg = /^roomId___(.+)/g;
    const roomId = reg.exec(body.stream)?.[1];
    if (!roomId) {
      console.log(chalkERROR(`[on_publish] 房间id不存在！`));
      ctx.body = { code: 1, msg: 'no roomId' };
      await next();
    } else {
      const params = new URLSearchParams(body.param);
      const paramsToken = params.get('token');
      const paramsType = params.get('type');
      if (!paramsToken) {
        console.log(chalkERROR(`[on_publish] 没有推流token`));
        ctx.body = { code: 1, msg: '[on_publish] no token, return' };
        await next();
        return;
      }
      const result = await liveRoomService.findKey(Number(roomId));
      const rtmptoken = result?.key;
      if (rtmptoken !== paramsToken) {
        console.log(chalkERROR(`[on_publish] 房间id：${roomId}，鉴权失败`));
        ctx.body = { code: 1, msg: '[on_publish] auth fail, return' };
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
        ctx.body = { code: 1, msg: '[on_publish] room is living, return' };
        await next();
      } else {
        console.log(
          chalkSUCCESS(`[on_publish] 房间id：${roomId}，鉴权成功，允许推流`)
        );
        const [liveRoomInfo] = await Promise.all([
          liveRoomService.find(Number(roomId)),
        ]);
        if (!liveRoomInfo) {
          console.log(chalkERROR('[on_publish] liveRoomInfo为空'));
          return;
        }

        ctx.body = { code: 0, msg: '[on_publish] auth success, pass' };
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
    }
  };

  async onUnpublish(ctx: ParameterizedContext, next) {
    // https://ossrs.net/lts/zh-cn/docs/v5/doc/http-callback#nodejs-koa-example
    // code等于数字0表示成功，其他错误码代表失败。
    const { body } = ctx.request;
    console.log(chalkWARN(`on_unpublish参数`), body);
    const reg = /^roomId___(.+)/g;
    const roomId = reg.exec(body.stream)?.[1];

    if (!roomId) {
      console.log(chalkERROR('[on_unpublish] roomId为空'));
      ctx.body = { code: 1, msg: '[on_unpublish] fail, no roomId' };
    } else {
      console.log(chalkSUCCESS(`[on_unpublish] 房间id：${roomId}，成功`));
      ctx.body = { code: 0, msg: '[on_unpublish] success' };
      liveService.deleteByLiveRoomId(Number(roomId));
      wsSocket.io?.to(roomId).emit(WsMsgTypeEnum.roomNoLive);
      // const roomDir = resolveApp(`/src/webm/roomId_${roomId}`);
      // console.log('删除roomDir333');
      // rimrafSync(roomDir);
    }
    await next();
  }
}

export default new SRSController();
