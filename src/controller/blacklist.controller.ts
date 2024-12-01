import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import { IBlacklist, IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import blacklistService from '@/service/blacklist.service';

class BlacklistController {
  common = {
    create: (data: IBlacklist) => blacklistService.create(data),
  };

  async getList(ctx: ParameterizedContext, next) {
    const {
      id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IBlacklist> = ctx.request.query;
    const result = await blacklistService.getList({
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

  async findByIp(ip: string) {
    const result = await blacklistService.findByIp(ip);
    return result;
  }

  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await blacklistService.find(id);
    successHandler({ ctx, data: result });
    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const { user_id, client_ip, msg }: IBlacklist = ctx.request.body;
    const isExist = await blacklistService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的黑名单！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await blacklistService.update({
      id,
      user_id,
      client_ip,
      msg,
    });
    successHandler({ ctx });
    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    const { user_id, client_ip, type, msg }: IBlacklist = ctx.request.body;
    await this.common.create({
      user_id,
      client_ip,
      type,
      msg,
    });
    successHandler({ ctx });
    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await blacklistService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的黑名单！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await blacklistService.delete(id);
    successHandler({ ctx });
    await next();
  }
}

export default new BlacklistController();
