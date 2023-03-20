import { ParameterizedContext } from 'koa';

import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE } from '@/constant';
import { IList, ITag } from '@/interface';
import { CustomError } from '@/model/customError.model';
import tagService from '@/service/tag.service';

class TagController {
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
    }: IList<ITag> = ctx.request.query;
    const result = await tagService.getList({
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
    const result = await tagService.find(id);
    successHandler({ ctx, data: result });

    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(
        `权限不足！`,
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const id = +ctx.params.id;
    const { name, color }: ITag = ctx.request.body;
    const isExist = await tagService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的标签！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await tagService.update({ id, name, color });
    successHandler({ ctx });

    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(
        `权限不足！`,
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const { name, color }: ITag = ctx.request.body;
    await tagService.create({ name, color });
    successHandler({ ctx });

    await next();
  }

  async getArticleList(ctx: ParameterizedContext, next) {
    const tag_id = +ctx.params.tag_id;
    const { nowPage, pageSize } = ctx.request.query;
    const result = await tagService.getArticleList({
      tag_id,
      nowPage,
      pageSize,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(
        `权限不足！`,
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const id = +ctx.params.id;
    const isExist = await tagService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的标签！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await tagService.delete(id);
    successHandler({ ctx });

    await next();
  }
}

export default new TagController();
