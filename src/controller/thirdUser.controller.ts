import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE } from '@/constant';
import { IList, IThirdUser } from '@/interface';
import { CustomError } from '@/model/customError.model';
import thirdUserService from '@/service/thirdUser.service';

class ThirdUserController {
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
    }: IList<IThirdUser> = ctx.request.query;
    const result = await thirdUserService.getList({
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

  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await thirdUserService.find(id);
    successHandler({ ctx, data: result });

    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const { user_id, third_platform, third_user_id }: IThirdUser =
      ctx.request.body;
    const isExist = await thirdUserService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的第三方用户记录！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const result = await thirdUserService.update({
      id,
      user_id,
      third_platform,
      third_user_id,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    const { user_id, third_platform, third_user_id }: IThirdUser =
      ctx.request.body;
    const result = await thirdUserService.create({
      user_id,
      third_platform,
      third_user_id,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await thirdUserService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的第三方用户记录！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const result = await thirdUserService.delete(id);
    successHandler({ ctx, data: result });

    await next();
  }
}

export default new ThirdUserController();
