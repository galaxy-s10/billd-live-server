import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { IList, ISigninStatistics } from '@/interface';
import signinStatisticsService from '@/service/signinStatistics.service';

class SigninStatisticsController {
  common = {
    create: async ({
      user_id,
      nums,
      max_nums,
      sum_nums,
      recently_signin_time,
    }: ISigninStatistics) => {
      const res = await signinStatisticsService.create({
        user_id,
        nums,
        max_nums,
        sum_nums,
        recently_signin_time,
      });
      return res;
    },
    update: async ({
      id,
      user_id,
      live_room_id,
      nums,
      max_nums,
      sum_nums,
      recently_signin_time,
    }: ISigninStatistics) => {
      const res = await signinStatisticsService.update({
        id,
        user_id,
        live_room_id,
        nums,
        max_nums,
        sum_nums,
        recently_signin_time,
      });
      return res;
    },
    findByUserId: async (user_id: number) => {
      const res = await signinStatisticsService.findByUserId(user_id);
      return res;
    },
  };

  getList = async (ctx: ParameterizedContext, next) => {
    const {
      id,
      username,
      user_id,
      live_room_id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<ISigninStatistics> = ctx.request.query;
    const result = await signinStatisticsService.getList({
      id,
      username,
      user_id,
      live_room_id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    successHandler({ ctx, data: result });
    await next();
  };

  find = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const result = await signinStatisticsService.find(id);
    successHandler({ ctx, data: result });
    await next();
  };

  update = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const data: ISigninStatistics = ctx.request.body;
    const result = await this.common.update({ id, ...data });
    successHandler({ ctx, data: result });
    await next();
  };

  delete = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const result = await signinStatisticsService.delete(id);
    successHandler({ ctx, data: result });
    await next();
  };
}

export default new SigninStatisticsController();
