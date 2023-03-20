import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE } from '@/constant';
import { IList, IVisitorLog } from '@/interface';
import { CustomError } from '@/model/customError.model';
import positionService from '@/service/position.service';
import visitorLogService from '@/service/visitorLog.service';

class VisitorLogController {
  async getHistoryVisitTotal(ctx: ParameterizedContext, next) {
    const { orderBy = 'asc', orderName = 'ip' } = ctx.request.query;
    const result = await visitorLogService.getHistoryVisitTotal({
      orderBy,
      orderName,
    });

    successHandler({ ctx, data: result });
    await next();
  }

  async getDayVisitTotal(ctx: ParameterizedContext, next) {
    const {
      orderBy = 'asc',
      orderName = 'ip',
      startTime,
      endTime,
    } = ctx.request.query;
    const result = await visitorLogService.getDayVisitTotal({
      orderBy,
      orderName,
      startTime,
      endTime,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  async getIpVisitTotal(ctx: ParameterizedContext, next) {
    const {
      nowPage,
      pageSize,
      orderBy = 'asc',
      orderName = 'ip',
      startTime,
      endTime,
    } = ctx.request.query;
    const result = await visitorLogService.getIpVisitTotal({
      nowPage,
      pageSize,
      orderBy,
      orderName,
      startTime,
      endTime,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  async getList(ctx: ParameterizedContext, next) {
    const {
      id,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IVisitorLog> = ctx.request.query;
    const result = await visitorLogService.getList({
      id,
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
  }

  async getList2(ctx: ParameterizedContext, next) {
    const {
      id,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IVisitorLog> = ctx.request.query;
    const result = await visitorLogService.getList2({
      id,
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
  }

  async create(ctx: ParameterizedContext, next) {
    const ip = (ctx.request.headers['x-real-ip'] as string) || '127.0.0.1';
    // 这个接口的userInfo不是必须的
    const { userInfo } = await authJwt(ctx);
    if (ip === '127.0.0.1') {
      successHandler({ ctx, data: '开发环境下调用' });
    } else {
      const ip_data = await positionService.get(ip);
      const result = await visitorLogService.create({
        ip,
        user_id: userInfo?.id || -1,
        ip_data: JSON.stringify(ip_data),
      });
      successHandler({ ctx, data: result });
    }

    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await visitorLogService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的访客日志！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const result = await visitorLogService.delete(id);
    successHandler({ ctx, data: result });

    await next();
  }
}

export default new VisitorLogController();
