import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { handleVerifyAuth } from '@/app/verify.middleware';
import { COMMON_HTTP_CODE, DEFAULT_AUTH_INFO } from '@/constant';
import liveController from '@/controller/live.controller';
import liveRecordController from '@/controller/liveRecord.controller';
import { CustomError } from '@/model/customError.model';
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
    } else {
      await next();
    }
    const res = tencentcloudUtils.getPushUrl({
      roomId: liveRoomId,
    });
    await Promise.all([
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
    successHandler({ ctx, data: res });
    await next();
  }
}

export default new TencentcloudCssController();
