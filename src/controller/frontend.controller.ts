import { ParameterizedContext } from 'koa';

import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE } from '@/constant';
import { IFrontend, IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import frontendService from '@/service/frontend.service';

class FrontendController {
  async getDetail(ctx: ParameterizedContext, next) {
    const result = await frontendService.findAll();
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
    const result = await frontendService.find(id);
    successHandler({ ctx, data: result });
    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    const { type, key, value, desc }: IFrontend = ctx.request.body;
    await frontendService.create({
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
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IFrontend> = ctx.request.query;
    const result = await frontendService.getList({
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

  async getStatis(ctx: ParameterizedContext, next) {
    const result = await frontendService.static();
    successHandler({ ctx, data: result });
    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(
        '权限不足！',
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const id = +ctx.params.id;
    const { key, value, desc }: IFrontend = ctx.request.body;
    await frontendService.update({
      id,
      key,
      value,
      desc,
    });
    successHandler({ ctx });
    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(
        '权限不足！',
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const id = +ctx.params.id;
    const isExist = await frontendService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的前端设置！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await frontendService.delete(id);
    successHandler({ ctx });

    await next();
  }
}

export default new FrontendController();
