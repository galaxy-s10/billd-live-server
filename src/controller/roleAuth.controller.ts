import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import roleAuthService from '@/service/roleAuth.service';

class RoleAuthController {
  async getList(ctx: ParameterizedContext, next) {
    const result = await roleAuthService.getList();
    successHandler({ ctx, data: result });
    await next();
  }
}

export default new RoleAuthController();
