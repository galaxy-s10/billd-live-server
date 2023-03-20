import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE } from '@/constant';
import { IList, ILog } from '@/interface';
import { CustomError } from '@/model/customError.model';
import logService from '@/service/log.service';

class LogController {
  common = {
    create: (data: ILog) => logService.create(data),
    deleteRang: () => logService.deleteRang(),
    getCount: ({ api_real_ip, startTime, endTime }) =>
      logService.getCount({ api_real_ip, startTime, endTime }),
  };

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
    }: IList<ILog> = ctx.request.query;
    const { userInfo } = await authJwt(ctx);
    if (userInfo?.id !== 1) {
      throw new CustomError(
        `权限不足！`,
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const result = await logService.getList({
      id,
      nowPage,
      pageSize,
      orderBy,
      orderName,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });

    successHandler({ ctx, data: result });

    await next();
  }

  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await logService.find(id);
    successHandler({ ctx, data: result });

    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const {
      user_id,
      api_user_agent,
      api_from,
      api_referer,
      api_forwarded_for,
      api_real_ip,
      api_host,
      api_hostname,
      api_method,
      api_path,
      api_query,
      api_body,
      api_err_msg,
      api_status_code,
      api_duration,
      api_err_code,
      api_error,
    }: ILog = ctx.request.body;
    const isExist = await logService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的日志！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const result = await logService.update({
      id,
      user_id,
      api_user_agent,
      api_from,
      api_referer,
      api_forwarded_for,
      api_real_ip,
      api_host,
      api_hostname,
      api_method,
      api_path,
      api_query,
      api_body,
      api_err_msg,
      api_status_code,
      api_duration,
      api_err_code,
      api_error,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    const {
      user_id,
      api_user_agent,
      api_from,
      api_referer,
      api_forwarded_for,
      api_real_ip,
      api_host,
      api_hostname,
      api_method,
      api_path,
      api_query,
      api_body,
      api_err_msg,
      api_status_code,
      api_duration,
      api_err_code,
      api_error,
    }: ILog = ctx.request.body;

    const result = await this.common.create({
      user_id,
      api_user_agent,
      api_from,
      api_referer,
      api_forwarded_for,
      api_real_ip,
      api_host,
      api_hostname,
      api_method,
      api_path,
      api_query,
      api_body,
      api_err_msg,
      api_status_code,
      api_duration,
      api_err_code,
      api_error,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await logService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的日志！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const result = await logService.delete(id);
    successHandler({ ctx, data: result });

    await next();
  }
}

export default new LogController();
