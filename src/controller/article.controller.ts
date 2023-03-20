import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE } from '@/constant';
import { IArticle, IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import articleService from '@/service/article.service';
import tagService from '@/service/tag.service';
import typeService from '@/service/type.service';
import { arrayUnique, isAdmin } from '@/utils';

class ArticleController {
  async create(ctx: ParameterizedContext, next) {
    const {
      title,
      desc,
      head_img,
      is_comment,
      status,
      content,
      priority,
      types,
      tags,
    }: IArticle = ctx.request.body;
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, code, code);
    }
    const tagIsExist = await tagService.isExist(arrayUnique(tags!));
    if (!tagIsExist) {
      throw new CustomError(
        `标签id:${tags!.toString()}中存在不存在的标签！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const typeIsExist = await typeService.isExist(arrayUnique(types!));
    if (!typeIsExist) {
      throw new CustomError(
        `分类id:${types!.toString()}中存在不存在的分类！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const result = await articleService.create({
      title,
      desc,
      head_img,
      is_comment,
      status,
      content,
      priority,
    });
    // @ts-ignore
    tags && (await result.setTags(tags));
    // @ts-ignore
    types && (await result.setTypes(types));
    // @ts-ignore
    await result.setUsers([userInfo.id]);
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
    const {
      title,
      desc,
      is_comment,
      priority,
      status,
      head_img,
      content,
      tags = [],
      types = [],
    }: IArticle = ctx.request.body;
    const article: any = await articleService.find(id);
    if (!article) {
      throw new CustomError(
        `不存在id为${id}的文章！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const isExistTag = await tagService.isExist(tags);
    if (!isExistTag) {
      throw new CustomError(
        `不存在id为${id}的标签！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const isExistType = await typeService.isExist(types);
    if (!isExistType) {
      throw new CustomError(
        `不存在id为${id}的分类！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await articleService.update({
      id,
      title,
      desc,
      is_comment,
      priority,
      status,
      head_img,
      content,
    });
    article.setTypes(types);
    article.setTags(tags);
    successHandler({ ctx });
    await next();
  }

  async test(ctx: ParameterizedContext, next) {
    // for (let i = 0; i < 1000000000; i += 1) {}
    await new Promise((res) => {
      setTimeout(() => {
        res(1);
      }, 1000);
    });
    successHandler({ ctx, data: {} });
    await next();
  }

  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    let from_user_id = -1;
    // 这个接口的userInfo不是必须的
    const { code, userInfo } = await authJwt(ctx);
    if (code === ALLOW_HTTP_CODE.ok) {
      from_user_id = userInfo!.id!;
    }
    const result = await articleService.findArticleDetail(id, from_user_id);
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
      status,
      tags = [],
      types = [],
      users = [],
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IArticle> = ctx.request.query;
    const result = await articleService.getList({
      id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      status: isAdmin(ctx) ? status : 1,
      tags,
      types,
      users,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    successHandler({ ctx, data: result });
    await next();
  }

  async getKeyWordList(ctx: ParameterizedContext, next) {
    const {
      id,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      status,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IArticle> = ctx.request.query;
    const result = await articleService.getKeyWordList({
      id,
      orderBy,
      orderName,
      keyWord,
      nowPage,
      pageSize,
      status: isAdmin(ctx) ? status : 1,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    successHandler({ ctx, data: result });
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
    const article: any = await articleService.find(id);
    if (!article) {
      throw new CustomError(
        `不存在id为${id}的文章！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    article.setTypes([]);
    article.setTags([]);
    await articleService.delete(id);
    successHandler({ ctx });
    await next();
  }
}

export default new ArticleController();
