import { ParameterizedContext } from 'koa';

import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE } from '@/constant';
import { IList, ILivePlay } from '@/interface';
import { CustomError } from '@/model/customError.model';
import livePlayService from '@/service/livePlay.service';

class LivePlayController {
  common = {
    getList: async ({
      id,
      live_room_id,
      user_id,
      random_id,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<ILivePlay>) => {
      const result = await livePlayService.getList({
        id,
        live_room_id,
        user_id,
        random_id,
        nowPage,
        pageSize,
        orderBy,
        orderName,
        keyWord,
        rangTimeType,
        rangTimeStart,
        rangTimeEnd,
      });
      return result;
    },

    delete: async (id: number, isRoute?: boolean) => {
      const isExist = await livePlayService.isExist([id]);
      if (!isExist) {
        if (isRoute) {
          throw new CustomError(
            `不存在id为${id}的直播！`,
            ALLOW_HTTP_CODE.paramsError,
            ALLOW_HTTP_CODE.paramsError
          );
        }
      } else {
        await livePlayService.delete(id);
      }
    },
    deleteByLiveRoomId: async (liveRoomId: number) => {
      await livePlayService.deleteByLiveRoomId(liveRoomId);
    },
  };

  getList = async (ctx: ParameterizedContext, next) => {
    const result = await this.common.getList(ctx.request.query);
    successHandler({ ctx, data: result });

    await next();
  };

  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await livePlayService.find(id);
    successHandler({ ctx, data: result });

    await next();
  }

  delete = async (ctx: ParameterizedContext, next) => {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(
        `权限不足！`,
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const id = +ctx.params.id;
    await this.common.delete(id, true);
    successHandler({ ctx });

    await next();
  };
}

export default new LivePlayController();
