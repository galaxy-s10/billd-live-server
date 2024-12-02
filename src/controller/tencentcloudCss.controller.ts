import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { handleVerifyAuth } from '@/app/verify.middleware';
import { wsSocket } from '@/config/websocket';
import liveRedisController from '@/config/websocket/live-redis.controller';
import {
  COMMON_HTTP_CODE,
  DEFAULT_AUTH_INFO,
  SRS_CB_URL_QUERY,
} from '@/constant';
import liveController from '@/controller/live.controller';
import liveRecordController from '@/controller/liveRecord.controller';
import liveRoomController from '@/controller/liveRoom.controller';
import userLiveRoomController from '@/controller/userLiveRoom.controller';
import { LivePlatformEnum, SwitchEnum } from '@/interface';
import { CustomError } from '@/model/customError.model';
import { LiveRoomTypeEnum } from '@/types/ILiveRoom';
import {
  ITencentcloudCssPublishCb,
  ITencentcloudCssUnPublishCb,
} from '@/types/srs';
import { WsMsgTypeEnum } from '@/types/websocket';
import { strSlice } from '@/utils';
import { liveRoomVerifyAuth } from '@/utils/business';
import { chalkERROR, chalkSUCCESS, chalkWARN } from '@/utils/chalkTip';
import { tencentcloudCssUtils } from '@/utils/tencentcloud-css';

class TencentcloudCssController {
  allowDev = true;

  common = {
    isLive: async (roomId: number) => {
      const liveRes = await liveController.common.findByLiveRoomId(
        Number(roomId)
      );
      return !!liveRes;
      // const res = await tencentcloudCssUtils.queryLiveStream({ roomId });
      // return !!res.res?.OnlineInfo.length;
    },
    closeLive: async ({ live_room_id }) => {
      const liveRes = await liveController.common.findLiveRecordByLiveRoomId(
        Number(live_room_id)
      );
      if (!liveRes) {
        return;
      }
      await tencentcloudCssUtils.dropLiveStream({ roomId: live_room_id });
      await liveController.common.delete(liveRes.id!);
      await liveRecordController.common.update({
        id: liveRes.live_record_id,
        // @ts-ignore
        end_time: +new Date(),
      });
    },
  };

  isLive = async (ctx: ParameterizedContext, next) => {
    const res = await this.common.isLive(+ctx.params.roomId);
    successHandler({
      ctx,
      data: { is_live: res },
    });
    await next();
  };

  async push(ctx: ParameterizedContext, next) {
    const { liveRoomId } = ctx.request.body;
    const authRes = await handleVerifyAuth({
      ctx,
      shouldAuthArr: [DEFAULT_AUTH_INFO.LIVE_PUSH.auth_value],
    });
    if (!authRes.flag) {
      throw new CustomError(
        `缺少${authRes.diffArr.join()}权限！`,
        COMMON_HTTP_CODE.forbidden,
        COMMON_HTTP_CODE.forbidden
      );
    }
    const userLiveRoomInfo =
      await userLiveRoomController.common.findByLiveRoomIdAndKey(
        Number(liveRoomId)
      );
    const pushRes = tencentcloudCssUtils.getPushUrl({
      userId: authRes.userInfo.id!,
      liveRoomId,
      type: userLiveRoomInfo?.live_room?.type || LiveRoomTypeEnum.tencent_css,
      key: userLiveRoomInfo?.live_room?.key || '',
    });
    const pullRes = tencentcloudCssUtils.getPullUrl({
      liveRoomId,
    });
    await liveRoomController.common.update({
      id: liveRoomId,
      cdn: SwitchEnum.yes,
      pull_cdn_rtmp_url: pullRes.rtmp,
      pull_cdn_flv_url: pullRes.flv,
      pull_cdn_hls_url: pullRes.hls,
      pull_cdn_webrtc_url: pullRes.webrtc,
    });
    successHandler({ ctx, data: pushRes });
    await next();
  }

  remoteAuth = async (ctx: ParameterizedContext, next) => {
    console.log(chalkWARN(`tencentcloud_css remote_auth`), ctx.request.query);
    const roomId = ctx.request.query[SRS_CB_URL_QUERY.roomId] as string;
    const publishKey = ctx.request.query[SRS_CB_URL_QUERY.publishKey] as string;
    const isdev = ctx.request.query[SRS_CB_URL_QUERY.isdev] as string;
    if (this.allowDev && isdev === '1') {
      console.log(
        chalkSUCCESS(`[tencentcloud_css remote_auth] 开发模式，不鉴权`)
      );
      successHandler({
        ctx,
        data: '[tencentcloud_css remote_auth] 开发模式，不鉴权',
      });
      await next();
    } else {
      const res = await liveRoomVerifyAuth({ roomId, publishKey });
      if (res.code === 0) {
        console.log(chalkSUCCESS(`[tencentcloud_css remote_auth] ${res.msg}`));
        successHandler({
          ctx,
          data: '[tencentcloud_css remote_auth] success',
        });
        await next();
      } else {
        console.log(chalkERROR(`[tencentcloud_css remote_auth] ${res.msg}`));
        successHandler({
          httpStatusCode: 403,
          ctx,
          data: '[tencentcloud_css remote_auth] fail',
        });
        await next();
      }
    }
  };

  onPublish = async (ctx: ParameterizedContext, next) => {
    // @ts-ignore
    const { body }: { body: ITencentcloudCssPublishCb } = ctx.request;
    console.log(chalkWARN(`tencentcloud_css on_publish`), body);
    try {
      if (body.errcode !== 0) {
        successHandler({
          ctx,
          data: `[tencentcloud_css on_publish] 推流错误，errcode: ${body.errcode}`,
        });
        await next();
        return;
      }
      const reg = /^roomId___(\d+)$/g;
      const roomId = reg.exec(body.stream_id)?.[1];
      const params = new URLSearchParams(body.stream_param);
      const publishKey = params.get(SRS_CB_URL_QUERY.publishKey);
      const userId = params.get(SRS_CB_URL_QUERY.userId);
      const isdev = params.get(SRS_CB_URL_QUERY.isdev);
      let authRes;
      if (this.allowDev && isdev === '1') {
        console.log(
          chalkSUCCESS(`[tencentcloud_css on_publish] 开发模式，不鉴权`)
        );
        successHandler({
          ctx,
          data: '[tencentcloud_css on_publish] 开发模式，不鉴权',
        });
        await next();
      } else {
        const res = await liveRoomVerifyAuth({ roomId, publishKey });
        authRes = res;
        if (res.code === 0) {
          console.log(chalkSUCCESS(`[tencentcloud_css on_publish] ${res.msg}`));
        } else {
          console.log(chalkERROR(`[tencentcloud_css on_publish] ${res.msg}`));
          return;
        }
      }
      const isLiving = await liveController.common.findByLiveRoomId(
        Number(roomId)
      );
      if (isLiving) {
        successHandler({
          ctx,
          data: '[tencentcloud_css on_publish] 正在直播',
        });
        await next();
        return;
      }
      const recRes = await liveRecordController.common.create({
        platform: LivePlatformEnum.tencentcloud_css,
        stream_name: '',
        stream_id: body.stream_id,
        user_id: Number(userId || -1),
        live_room_id: Number(roomId),
        duration: 0,
        danmu: 0,
        view: 0,
        // @ts-ignore
        start_time: +new Date(),
        remark: '',
      });
      const liveRes = await liveController.common.create({
        platform: LivePlatformEnum.tencentcloud_css,
        live_record_id: recRes.id,
        live_room_id: Number(roomId),
        user_id: Number(userId || -1),
      });
      wsSocket.io
        ?.to(`${roomId!}`)
        .emit(WsMsgTypeEnum.roomLiving, { live_room_id: roomId });
      const client_ip = strSlice(
        String(ctx.request.headers['x-real-ip'] || ''),
        100
      );
      liveRedisController.setTencentcloudCssPublishing({
        data: {
          live_room_id: Number(roomId),
          live_record_id: recRes.id!,
          live_id: liveRes.id!,
        },
        client_ip,
        exp: 10,
      });
      successHandler({
        ctx,
        // eslint-disable-next-line
        data: `[tencentcloud_css on_publish] ${authRes.msg}`,
      });
      await next();
    } catch (error) {
      console.log(error);
      successHandler({
        ctx,
        data: '[tencentcloud_css on_publish] catch error',
      });
      await next();
    }
  };

  onUnpublish = async (ctx: ParameterizedContext, next) => {
    // @ts-ignore
    const { body }: { body: ITencentcloudCssUnPublishCb } = ctx.request;
    console.log(chalkWARN(`tencentcloud_css on_unpublish`), body);
    try {
      const reg = /^roomId___(\d+)$/g;
      const roomId = reg.exec(body.stream_id)?.[1];
      const params = new URLSearchParams(body.stream_param);
      const publishKey = params.get(SRS_CB_URL_QUERY.publishKey);
      const isdev = params.get(SRS_CB_URL_QUERY.isdev);
      let authRes;
      if (this.allowDev && isdev === '1') {
        console.log(
          chalkSUCCESS(`[tencentcloud_css on_unpublish] 开发模式，不鉴权`)
        );
        successHandler({
          ctx,
          data: '[tencentcloud_css on_unpublish] 开发模式，不鉴权',
        });
        await next();
      } else {
        const res = await liveRoomVerifyAuth({ roomId, publishKey });
        authRes = res;
        if (res.code === 0) {
          console.log(
            chalkSUCCESS(`[tencentcloud_css on_unpublish] ${res.msg}`)
          );
        } else {
          console.log(chalkERROR(`[tencentcloud_css on_unpublish] ${res.msg}`));
          return;
        }
      }
      const liveRes = await liveController.common.findLiveRecordByLiveRoomId(
        Number(roomId)
      );
      if (!liveRes) {
        successHandler({
          ctx,
          data: `[tencentcloud_css on_unpublish] 房间id：${roomId!}，没在直播`,
        });
        await next();
        return;
      }
      await this.common.closeLive({
        live_room_id: Number(roomId),
      });
      wsSocket.io?.to(`${roomId!}`).emit(WsMsgTypeEnum.roomNoLive);
      successHandler({
        ctx,
        // eslint-disable-next-line
        data: `[tencentcloud_css on_unpublish] ${authRes.msg}`,
      });
      await next();
    } catch (error) {
      console.log(error);
      successHandler({
        ctx,
        data: '[tencentcloud_css on_unpublish] catch error',
      });
      await next();
    }
  };
}

export default new TencentcloudCssController();
