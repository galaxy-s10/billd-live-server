import { ParameterizedContext } from 'koa';

import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE } from '@/constant';
import { IList, IMusic } from '@/interface';
import { CustomError } from '@/model/customError.model';
import musicService from '@/service/music.service';
import { isAdmin } from '@/utils';

class MusicController {
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
    }: IList<IMusic> = ctx.request.query;
    const result = await musicService.getList({
      id,
      status: isAdmin(ctx) ? status : 1,
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
    const result = await musicService.find(id);
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
    const { name, cover_pic, audio_url, author, status }: IMusic =
      ctx.request.body;
    const isExist = await musicService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的音乐！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await musicService.update({
      id,
      name,
      cover_pic,
      audio_url,
      author,
      status,
    });
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
    const { name, cover_pic, audio_url, author, status }: IMusic =
      ctx.request.body;
    await musicService.create({
      name,
      cover_pic,
      audio_url,
      author,
      status,
    });
    successHandler({ ctx });

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
    const isExist = await musicService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的音乐！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await musicService.delete(id);
    successHandler({ ctx });

    await next();
  }
}

export default new MusicController();
