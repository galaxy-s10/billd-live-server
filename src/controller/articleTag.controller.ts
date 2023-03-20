import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import articleTagService from '@/service/articleTag.service';

class ArticleTagController {
  async create(ctx: ParameterizedContext, next) {
    const prop = ctx.request.body;
    const result = await articleTagService.create(prop);
    successHandler({ ctx, data: result });
    await next();
  }

  async getList(ctx: ParameterizedContext, next) {
    const result = await articleTagService.getList();
    successHandler({ ctx, data: result });
    await next();
  }
}

export default new ArticleTagController();
