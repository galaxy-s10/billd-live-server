import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import { IList, ILiveConfig } from '@/interface';
import { CustomError } from '@/model/customError.model';
import liveConfigService from '@/service/liveConfig.service';

class LiveConfigController {
  async getDetail(ctx: ParameterizedContext, next) {
    const result = await liveConfigService.findAll();
    const obj: any = {};
    result.forEach((item) => {
      const val = item.get();
      // obj[val.key!] = JSON.stringify(item);
      obj[val.key!] = {
        value: val.value,
        desc: val.desc,
        created_at: val.created_at,
        updated_at: val.updated_at,
      };
    });
    successHandler({ ctx, data: obj });
    await next();
  }

  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await liveConfigService.find(id);
    successHandler({ ctx, data: result });
    await next();
  }

  async findByKey(ctx: ParameterizedContext, next) {
    const { key } = ctx.params;
    const result = await liveConfigService.findByKey(key);
    successHandler({ ctx, data: result });
    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    const { type, key, value, desc }: ILiveConfig = ctx.request.body;
    await liveConfigService.create({
      type,
      key,
      value,
      desc,
    });
    successHandler({ ctx });
    await next();
  }

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
    }: IList<ILiveConfig> = ctx.request.query;
    const result = await liveConfigService.getList({
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

  async update(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const { key, value, desc }: ILiveConfig = ctx.request.body;
    await liveConfigService.update({
      id,
      key,
      value,
      desc,
    });
    successHandler({ ctx });
    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await liveConfigService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的直播配置！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await liveConfigService.delete(id);
    successHandler({ ctx });

    await next();
  }
}

export default new LiveConfigController();
