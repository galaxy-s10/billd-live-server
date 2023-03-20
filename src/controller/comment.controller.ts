import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE } from '@/constant';
import { IComment, IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import articleService from '@/service/article.service';
import commentService from '@/service/comment.service';
import positionService from '@/service/position.service';
import userService from '@/service/user.service';
import { arrayUnique, isAdmin } from '@/utils';

class CommentController {
  // 评论列表
  async getList(ctx: ParameterizedContext, next) {
    const {
      id,
      status,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IComment> = ctx.request.query;
    const result = await commentService.getList({
      id,
      status: isAdmin(ctx) ? status : 1,
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

  // 文章评论列表
  async getArticleCommentList(ctx: ParameterizedContext, next) {
    const article_id = +ctx.params.article_id;
    const {
      id,
      status,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IComment> = ctx.request.query;
    let from_user_id = -1;
    // 这个接口的userInfo不是必须的
    const { code, userInfo } = await authJwt(ctx);
    if (code === ALLOW_HTTP_CODE.ok) {
      from_user_id = userInfo!.id!;
    }
    const result = await commentService.getArticleCommentList({
      id,
      status: isAdmin(ctx) ? status : 1,
      from_user_id,
      article_id,
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

  // TODO
  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await commentService.find(id);
    successHandler({ ctx, data: result });
    await next();
  }

  // TODO
  async update(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const {
      article_id,
      to_user_id,
      parent_comment_id,
      reply_comment_id,
      content,
    }: IComment = ctx.request.body;
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, code, code);
    }
    const comment: any = await commentService.find(id);
    if (userInfo!.id !== comment.from_user_id) {
      throw new CustomError(
        `你不能修改其他人的评论哦！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const isExist = await commentService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的评论！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const result = await commentService.update({
      id,
      article_id,
      from_user_id: userInfo!.id,
      to_user_id,
      parent_comment_id,
      reply_comment_id,
      content,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  // DONE 创建评论
  async create(ctx: ParameterizedContext, next) {
    const {
      article_id,
      to_user_id,
      parent_comment_id,
      reply_comment_id,
      content,
    }: IComment = ctx.request.body;
    if (!article_id) {
      throw new CustomError(
        `article_id不能为空！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    if (parent_comment_id === -1 && to_user_id !== -1) {
      throw new CustomError(
        `不能在父评论里回复其他用户哦！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    if (parent_comment_id === -1 && reply_comment_id !== -1) {
      throw new CustomError(
        `不能在父评论里回复其他评论哦！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, code, code);
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
    const commentIdArr = arrayUnique(
      [parent_comment_id!, reply_comment_id!].filter((v) => v !== -1)
    );
    const commentIsExist =
      commentIdArr.length === 0
        ? true
        : await commentService.isExist(commentIdArr);
    if (!commentIsExist) {
      throw new CustomError(
        `不存在id为${commentIdArr.toString()}的评论！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const userIsExist =
      to_user_id === -1 ? true : await userService.isExist([to_user_id!]);
    if (!userIsExist) {
      throw new CustomError(
        `不存在id为${to_user_id!}的用户！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const ua = ctx.request.headers['user-agent'];
    const ip = (ctx.request.headers['x-real-ip'] as string) || '127.0.0.1';
    const ip_data = await positionService.get(ip);
    await commentService.create({
      article_id,
      from_user_id: userInfo!.id,
      to_user_id,
      parent_comment_id,
      reply_comment_id,
      content,
      ua,
      ip,
      ip_data: JSON.stringify(ip_data),
    });
    successHandler({ ctx });

    await next();
  }

  // DONE 留言板评论列表
  async getCommentList(ctx: ParameterizedContext, next) {
    const {
      article_id = '-1',
      childrenPageSize = '3',
      nowPage,
      pageSize,
      orderBy = 'asc',
      orderName = 'created_at',
      status,
    }: any = ctx.request.query;
    let from_user_id = -1;
    // 这个接口的userInfo不是必须的
    const { code, userInfo } = await authJwt(ctx);
    if (code === ALLOW_HTTP_CODE.ok) {
      from_user_id = userInfo!.id!;
    }
    const result = await commentService.getCommentList({
      childrenPageSize,
      nowPage,
      pageSize,
      orderBy,
      orderName,
      status: isAdmin(ctx) ? status : 1,
      from_user_id,
      article_id,
    });
    successHandler({ ctx, data: { ...result } });

    await next();
  }

  // DONE 子评论列表
  async getChildrenCommentList(ctx: ParameterizedContext, next) {
    const {
      article_id,
      parent_comment_id,
      nowPage,
      pageSize,
      orderBy = 'asc',
      orderName = 'created_at',
      status,
    }: any = ctx.request.query;
    let from_user_id = -1;
    // 这个接口的userInfo不是必须的
    const { code, userInfo } = await authJwt(ctx);
    if (code === ALLOW_HTTP_CODE.ok) {
      from_user_id = userInfo!.id!;
    }
    const result = await commentService.getChildrenCommentList({
      nowPage,
      pageSize,
      orderBy,
      orderName,
      from_user_id,
      parent_comment_id,
      article_id,
      status: isAdmin(ctx) ? status : 1,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  // DONE 获取该评论的所有子评论
  async commonGetAllChildrenComment(parent_comment_id) {
    const result: any = await commentService.findAllChildren(parent_comment_id);
    return result;
  }

  // DONE 父评论的所有子评论(不分页)
  getAllChildrenComment = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.parent_comment_id;
    const isExist = await commentService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的评论！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const result: any = await this.commonGetAllChildrenComment(id);
    successHandler({ ctx, data: result });

    await next();
  };

  // DONE
  delete = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, code, code);
    }
    const isExist = await commentService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的评论！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const comment: any = await commentService.find(id);
    if (userInfo!.id !== comment.from_user_id) {
      throw new CustomError(
        `你不能删除其他人的评论哦！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    let effect = 0;
    // 如果删的是父评论,
    if (comment.parent_comment_id === -1) {
      const allChildComment: any = await this.commonGetAllChildrenComment(id);
      // 如果父评论有子评论则删除子评论
      if (allChildComment.count !== 0) {
        effect = await commentService.deleteMany(
          allChildComment.rows.map((v) => v.id)
        );
      }
      // 最后再删父评论
      await commentService.delete(id);
    } else {
      // 如果删的是子评论
      await commentService.delete(id);
    }
    successHandler({
      ctx,
      message:
        effect === 0 ? '删除成功！' : `删除成功，一共删除${effect}条子评论！`,
    });

    await next();
  };
}

export default new CommentController();
