import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import { IList, ISettings } from '@/interface';
import { CustomError } from '@/model/customError.model';
import settingsService from '@/service/settings.service';

class SettingsController {
  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await settingsService.find(id);
    successHandler({ ctx, data: result });
    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    const { type, key, value, desc }: ISettings = ctx.request.body;
    await settingsService.create({
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
    }: IList<ISettings> = ctx.request.query;
    const result = await settingsService.getList({
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
    const { key, value, desc }: ISettings = ctx.request.body;
    await settingsService.update({
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
    const isExist = await settingsService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的前台设置！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await settingsService.delete(id);
    successHandler({ ctx });

    await next();
  }
}

export default new SettingsController();
