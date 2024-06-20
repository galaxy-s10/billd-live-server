import cryptojs from 'crypto-js';
import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { handleVerifyAuth } from '@/app/verify.middleware';
import { wsSocket } from '@/config/websocket';
import {
  COMMON_HTTP_CODE,
  DEFAULT_AUTH_INFO,
  SRS_CB_URL_PARAMS,
} from '@/constant';
import liveController from '@/controller/live.controller';
import liveRecordController from '@/controller/liveRecord.controller';
import userLiveRoomController from '@/controller/userLiveRoom.controller';
import { CustomError } from '@/model/customError.model';
import { TENCENTCLOUD_LIVE } from '@/secret/secret';
import liveRoomService from '@/service/liveRoom.service';
import { ITencentcloudCssCb } from '@/types/srs';
import { WsMsgTypeEnum } from '@/types/websocket';
import { chalkERROR, chalkSUCCESS } from '@/utils/chalkTip';
import { tencentcloudUtils } from '@/utils/tencentcloud';

class TencentcloudCssController {
  async push(ctx: ParameterizedContext, next) {
    const { liveRoomId } = ctx.request.body;
    const authRes = await handleVerifyAuth({
      ctx,
      shouldAuthArr: [DEFAULT_AUTH_INFO.LIVE_PULL_SVIP.auth_value],
    });
    if (!authRes.flag) {
      throw new CustomError(
        `缺少${authRes.diffArr.join()}权限！`,
        COMMON_HTTP_CODE.forbidden,
        COMMON_HTTP_CODE.forbidden
      );
    }
    const [userLiveRoomInfo] = await Promise.all([
      userLiveRoomController.common.findByLiveRoomIdAndKey(Number(liveRoomId)),
    ]);
    const pushRes = tencentcloudUtils.getPushUrl({
      roomId: liveRoomId,
      key: userLiveRoomInfo?.live_room?.key,
    });
    const pullRes = tencentcloudUtils.getPullUrl({
      roomId: liveRoomId,
    });

    await Promise.all([
      liveRoomService.update({
        id: liveRoomId,
        rtmp_url: pullRes.rtmp,
        flv_url: pullRes.flv,
        hls_url: pullRes.hls,
      }),
      liveController.common.create({
        live_room_id: liveRoomId,
        user_id: authRes.userInfo.id,
        socket_id: '-1',
        track_audio: 1,
        track_video: 1,
        srs_action: '',
        srs_app: '',
        srs_client_id: '',
        srs_ip: '',
        srs_param: '',
        srs_server_id: '',
        srs_service_id: '',
        srs_stream: '',
        srs_stream_id: '',
        srs_stream_url: '',
        srs_tcUrl: '',
        srs_vhost: '',
      }),
      liveRecordController.common.create({
        client_id: '',
        live_room_id: liveRoomId,
        user_id: authRes.userInfo.id,
        danmu: 0,
        duration: 0,
        view: 0,
      }),
    ]);
    successHandler({ ctx, data: pushRes });
    await next();
  }

  remoteAuth = async (ctx: ParameterizedContext, next) => {
    const roomId = ctx.query['roomId'];
    const paramsPublishKey = ctx.query[SRS_CB_URL_PARAMS.publishKey];
    if (!roomId) {
      console.log(chalkERROR(`[tencentcloud_css_remoteAuth] 房间id不存在！`));
      successHandler({
        httpStatusCode: 403,
        ctx,
        data: '[tencentcloud_css_remoteAuth] fail, roomId is not exist',
      });
      await next();
      return;
    }
    // stream_param格式：'txSecret=xxxx&txTime=xxx&aa=123&bb=456',
    if (!paramsPublishKey) {
      console.log(chalkERROR(`[tencentcloud_css_remoteAuth] 没有推流token`));
      successHandler({
        httpStatusCode: 403,
        ctx,
        data: '[tencentcloud_css_remoteAuth] fail, no token',
      });
      await next();
      return;
    }
    const result = await liveRoomService.findKey(Number(roomId));
    const rtmptoken = result?.key;
    if (rtmptoken !== paramsPublishKey) {
      console.log(
        chalkERROR(`[tencentcloud_css_remoteAuth] 房间id：${roomId}，鉴权失败`)
      );
      successHandler({
        httpStatusCode: 403,
        ctx,
        data: '[tencentcloud_css_remoteAuth] fail, auth fail',
      });
      await next();
      return;
    }
    // const isLiveing = await liveController.common.findByLiveRoomId(
    //   Number(roomId)
    // );
    // if (isLiveing) {
    //   console.log(
    //     chalkERROR(
    //       `[tencentcloud_css_remoteAuth] 房间id：${roomId}，鉴权成功，但是正在直播，不允许推流`
    //     )
    //   );
    //   ctx.body = {
    //     code: 1,
    //     msg: '[tencentcloud_css_remoteAuth] fail, room is living',
    //   };
    //   await next();
    //   return;
    // }
    const [userLiveRoomInfo] = await Promise.all([
      userLiveRoomController.common.findByLiveRoomId(Number(roomId)),
    ]);
    if (!userLiveRoomInfo) {
      console.log(
        chalkERROR(
          '[tencentcloud_css_remoteAuth] userLiveRoomInfo为空，不允许推流'
        )
      );
      successHandler({
        httpStatusCode: 403,
        ctx,
        data: '[tencentcloud_css_remoteAuth] fail, userLiveRoomInfo is not exist',
      });
      await next();
      return;
    }
    console.log(
      chalkSUCCESS(
        `[tencentcloud_css_remoteAuth] 房间id：${roomId}，所有验证通过，允许推流`
      )
    );
    successHandler({
      ctx,
      data: '[tencentcloud_css_remoteAuth] all success, pass',
    });
    await Promise.all([
      liveController.common.create({
        live_room_id: Number(roomId),
        user_id: userLiveRoomInfo.user_id,
        socket_id: '-1',
        track_audio: 1,
        track_video: 1,
        srs_action: '',
        srs_app: '',
        srs_client_id: '',
        srs_ip: '',
        srs_param: '',
        srs_server_id: '',
        srs_service_id: '',
        srs_stream: '',
        srs_stream_id: '',
        srs_stream_url: '',
        srs_tcUrl: '',
        srs_vhost: '',
      }),
      liveRecordController.common.create({
        client_id: '',
        live_room_id: Number(roomId),
        user_id: userLiveRoomInfo.user_id,
        danmu: 0,
        duration: 0,
        view: 0,
      }),
    ]);
    wsSocket.io?.to(roomId).emit(WsMsgTypeEnum.roomLiving, {
      live_room: userLiveRoomInfo.live_room!,
      anchor_socket_id: '',
    });
    await next();
  };

  onPublish = async (ctx: ParameterizedContext, next) => {
    console.log('tencentcloud_css-onPublish');
    // @ts-ignore
    const { body }: { body: ITencentcloudCssCb } = ctx.request;
    const roomIdStr = body.stream_id;
    const reg = /^roomId___(\d+)$/g;
    const roomId = reg.exec(roomIdStr)?.[1];
    if (!roomId) {
      console.log(chalkERROR(`[tencentcloud_css_on_publish] 房间id不存在！`));
      ctx.body = {
        code: 1,
        msg: '[tencentcloud_css_on_publish] fail, roomId is not exist',
      };
      await next();
    } else {
      // stream_param格式：'txSecret=xxxx&txTime=xxx&aa=123&bb=456',
      const params = new URLSearchParams(body.stream_param);
      const paramsPublishKey = params.get(SRS_CB_URL_PARAMS.publishKey);
      const txSecret = cryptojs
        .MD5(TENCENTCLOUD_LIVE.CbKey + '' + body.t)
        .toString();
      if (txSecret !== body.sign) {
        console.log(chalkERROR(`[tencentcloud_css_on_publish] sign校验错误`));
        ctx.body = {
          code: 1,
          msg: '[tencentcloud_css_on_publish] fail, sign error',
        };
        await next();
        return;
      }
      if (!paramsPublishKey) {
        console.log(chalkERROR(`[tencentcloud_css_on_publish] 没有推流token`));
        ctx.body = {
          code: 1,
          msg: '[tencentcloud_css_on_publish] fail, no token',
        };
        await next();
        return;
      }
      const result = await liveRoomService.findKey(Number(roomId));
      const rtmptoken = result?.key;
      if (rtmptoken !== paramsPublishKey) {
        console.log(
          chalkERROR(
            `[tencentcloud_css_on_publish] 房间id：${roomId}，鉴权失败`
          )
        );
        ctx.body = {
          code: 1,
          msg: '[tencentcloud_css_on_publish] fail, auth fail',
        };
        await next();
        return;
      }
      // const isLiveing = await liveController.common.findByLiveRoomId(
      //   Number(roomId)
      // );
      // if (isLiveing) {
      //   console.log(
      //     chalkERROR(
      //       `[tencentcloud_css_on_publish] 房间id：${roomId}，鉴权成功，但是正在直播，不允许推流`
      //     )
      //   );
      //   ctx.body = {
      //     code: 1,
      //     msg: '[tencentcloud_css_on_publish] fail, room is living',
      //   };
      //   await next();
      //   return;
      // }
      const [userLiveRoomInfo] = await Promise.all([
        userLiveRoomController.common.findByLiveRoomId(Number(roomId)),
      ]);
      if (!userLiveRoomInfo) {
        console.log(
          chalkERROR(
            '[tencentcloud_css_on_publish] userLiveRoomInfo为空，不允许推流'
          )
        );
        ctx.body = {
          code: 1,
          msg: '[tencentcloud_css_on_publish] fail, userLiveRoomInfo is not exist',
        };
        await next();
        return;
      }
      console.log(
        chalkSUCCESS(
          `[tencentcloud_css_on_publish] 房间id：${roomId}，所有验证通过，允许推流`
        )
      );
      ctx.body = {
        code: 0,
        msg: '[tencentcloud_css_on_publish] all success, pass',
      };
      await Promise.all([
        liveController.common.create({
          live_room_id: Number(roomId),
          user_id: userLiveRoomInfo.user_id,
          socket_id: '-1',
          track_audio: 1,
          track_video: 1,
          srs_action: '',
          srs_app: '',
          srs_client_id: '',
          srs_ip: '',
          srs_param: '',
          srs_server_id: '',
          srs_service_id: '',
          srs_stream: '',
          srs_stream_id: '',
          srs_stream_url: '',
          srs_tcUrl: '',
          srs_vhost: '',
        }),
        liveRecordController.common.create({
          client_id: '',
          live_room_id: Number(roomId),
          user_id: userLiveRoomInfo.user_id,
          danmu: 0,
          duration: 0,
          view: 0,
        }),
      ]);
      wsSocket.io?.to(roomId).emit(WsMsgTypeEnum.roomLiving, {
        live_room: userLiveRoomInfo.live_room!,
        anchor_socket_id: '',
      });
      await next();
    }
  };

  async onUnpublish(ctx: ParameterizedContext, next) {
    console.log('tencentcloud_css-onUnpublish');
    const { body } = ctx.request;
    console.log(body);
    ctx.body = { code: 0, msg: '[tencentcloud_css_on_unpublish] success' };
    await next();
  }
}

export default new TencentcloudCssController();
