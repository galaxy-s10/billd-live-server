import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE } from '@/constant';
import { IList, IStar } from '@/interface';
import { CustomError } from '@/model/customError.model';
import articleService from '@/service/article.service';
import commentService from '@/service/comment.service';
import starService from '@/service/star.service';
import userService from '@/service/user.service';

class StarController {
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
    }: IList<IStar> = ctx.request.query;
    const result = await starService.getList({
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
    const result = await starService.find(id);
    successHandler({ ctx, data: result });

    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const { article_id, to_user_id, from_user_id, comment_id }: IStar =
      ctx.request.body;
    const isExist = await starService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的star！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await starService.update({
      id,
      article_id,
      to_user_id,
      from_user_id,
      comment_id,
    });
    successHandler({ ctx });

    await next();
  }

  // DONE
  async create(ctx: ParameterizedContext, next) {
    const { article_id, to_user_id, comment_id }: IStar = ctx.request.body;
    if (!article_id) {
      throw new CustomError(
        `article_id不能为空！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    if (!comment_id) {
      throw new CustomError(
        `comment_id不能为空！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    if (!to_user_id) {
      throw new CustomError(
        `to_user_id不能为空！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, code, code);
    }
    const isEverStar = await starService.everStar({
      article_id,
      comment_id,
      to_user_id,
      from_user_id: userInfo!.id,
    });
    if (isEverStar) {
      throw new CustomError(
        `不能重复点赞！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const articleIsExist =
      article_id === -1 ? true : await articleService.isExist([article_id]);
    if (!articleIsExist) {
      throw new CustomError(
        `不存在id为${article_id}的文章！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const commentIsExist =
      comment_id === -1 ? true : await commentService.isExist([comment_id]);
    if (!commentIsExist) {
      throw new CustomError(
        `不存在id为${comment_id}的评论！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const userIsExist =
      to_user_id === -1 ? true : await userService.isExist([to_user_id]);
    if (!userIsExist) {
      throw new CustomError(
        `不存在id为${to_user_id}的用户！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await starService.create({
      article_id,
      from_user_id: userInfo!.id,
      to_user_id,
      comment_id,
    });
    successHandler({ ctx });

    await next();
  }

  async starForArticle(ctx: ParameterizedContext, next) {
    const { article_id, to_user_id, comment_id }: IStar = ctx.request.body;
    if (!article_id) {
      throw new CustomError(
        `article_id不能为空！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    if (!comment_id) {
      throw new CustomError(
        `comment_id不能为空！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    if (!to_user_id) {
      throw new CustomError(
        `to_user_id不能为空！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, code, code);
    }
    let from_user_id = -1;
    from_user_id = userInfo!.id!;
    const articleIsExist = await articleService.isExist([article_id]);
    if (!articleIsExist) {
      throw new CustomError(
        `不存在id为${article_id}的文章！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const commentIsExist =
      comment_id === -1 ? true : await commentService.isExist([comment_id]);
    if (!commentIsExist) {
      throw new CustomError(
        `不存在id为${comment_id}的评论！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const userIsExist =
      to_user_id === -1 ? true : await userService.isExist([to_user_id]);
    if (!userIsExist) {
      throw new CustomError(
        `不存在id为${from_user_id}的用户！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const result = await starService.create({
      article_id,
      from_user_id,
      to_user_id,
      comment_id,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  async starForUser(ctx: ParameterizedContext, next) {
    const {
      article_id = -1,
      to_user_id = -1,
      comment_id = -1,
    }: IStar = ctx.request.body;
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, code, code);
    }
    const from_user_id = userInfo!.id;
    const articleIsExist =
      article_id === -1 ? true : await articleService.isExist([article_id]);
    if (!articleIsExist) {
      throw new CustomError(
        `不存在id为${article_id}的文章！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const commentIsExist =
      comment_id === -1 ? true : await commentService.isExist([comment_id]);
    if (!commentIsExist) {
      throw new CustomError(
        `不存在id为${comment_id}的评论！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const userIsExist = await userService.isExist([
      ...new Set([to_user_id].filter((v) => v !== -1)),
    ]);
    if (!userIsExist) {
      throw new CustomError(
        `不存在id为${to_user_id}的用户！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const result = await starService.create({
      article_id,
      to_user_id,
      from_user_id,
      comment_id,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  // DONE
  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await starService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的star！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, code, code);
    }
    const isMeStar: any = await starService.find(id);
    if (isMeStar.from_user_id !== userInfo!.id) {
      throw new CustomError(
        `不能删除别人的star！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await starService.delete(id);
    successHandler({ ctx });

    await next();
  }
}

export default new StarController();
