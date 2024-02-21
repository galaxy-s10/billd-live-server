import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { tencentcloudUtils } from '@/utils/tencentcloud';

class TencentcloudCssController {
  async push(ctx: ParameterizedContext, next) {
    const { liveRoomId } = ctx.request.body;
    const res = tencentcloudUtils.getPushUrl({
      roomId: liveRoomId,
    });
    successHandler({ ctx, data: res });
    await next();
  }
}

export default new TencentcloudCssController();
