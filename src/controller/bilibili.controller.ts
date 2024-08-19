import { filterObj } from 'billd-utils';
import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { myaxios } from '@/utils/request';

class BilibiliController {
  getUserRecommend = async (ctx: ParameterizedContext, next) => {
    const { page, page_size, platform }: any = ctx.request.query;
    const result = await myaxios.get(
      'https://api.live.bilibili.com/xlive/web-interface/v1/second/getUserRecommend',
      {
        params: {
          page,
          page_size,
          platform,
        },
      }
    );
    successHandler({ ctx, data: result });
    await next();
  };

  get = async (ctx: ParameterizedContext, next) => {
    const queryRes: any = ctx.request.query;
    const params = filterObj(queryRes, ['url']);
    const result = await myaxios.get(
      // eslint-disable-next-line
      `https://api.live.bilibili.com/${queryRes.url}`,
      {
        params,
      }
    );
    successHandler({ ctx, data: result });
    await next();
  };

  post = async (ctx: ParameterizedContext, next) => {
    const queryRes: any = ctx.request.body;
    const params = filterObj(queryRes, ['url']);
    const result = await myaxios.post(
      // eslint-disable-next-line
      `https://api.live.bilibili.com/${queryRes.url}`,
      params
    );
    successHandler({ ctx, data: result });
    await next();
  };
}

export default new BilibiliController();
