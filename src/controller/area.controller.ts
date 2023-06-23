import { ParameterizedContext } from 'koa';

import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE } from '@/constant';
import { IArea, IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import areaService from '@/service/area.service';

class AreaController {
  common = {
    getList: async (data) => {
      const {
        id,
        name,
        remark,
        weight,
        orderBy = 'asc',
        orderName = 'id',
        nowPage,
        pageSize,
        keyWord,
        rangTimeType,
        rangTimeStart,
        rangTimeEnd,
      }: IList<IArea> = data;
      const result = await areaService.getList({
        id,
        name,
        remark,
        weight,
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
    getAreaLiveRoomList: async (data) => {
      const {
        id,
        name,
        remark,
        weight,
        orderBy = 'asc',
        orderName = 'id',
        nowPage,
        pageSize,
        keyWord,
        rangTimeType,
        rangTimeStart,
        rangTimeEnd,
      }: IList<IArea> = data;
      const result = await areaService.getAreaLiveRoomList({
        id,
        name,
        remark,
        weight,
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
      const isExist = await areaService.isExist([id]);
      if (!isExist) {
        if (isRoute) {
          throw new CustomError(
            `不存在id为${id}的分区！`,
            ALLOW_HTTP_CODE.paramsError,
            ALLOW_HTTP_CODE.paramsError
          );
        }
      } else {
        await areaService.delete(id);
      }
    },
  };

  getList = async (ctx: ParameterizedContext, next) => {
    const result = await this.common.getList(ctx.request.query);
    successHandler({ ctx, data: result });

    await next();
  };

  getLiveRoomList = async (ctx: ParameterizedContext, next) => {
    const { id, nowPage, pageSize }: IList<IArea> = ctx.request.query;
    const result = await areaService.getLiveRoomList({
      area_id: id,
      nowPage,
      pageSize,
    });
    successHandler({ ctx, data: result });

    await next();
  };

  getAreaLiveRoomList = async (ctx: ParameterizedContext, next) => {
    const result = await this.common.getAreaLiveRoomList(ctx.request.query);
    successHandler({ ctx, data: result });

    await next();
  };

  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await areaService.find(id);
    successHandler({ ctx, data: result });

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
    const { name, remark, weight }: IArea = ctx.request.body;
    await areaService.create({
      name,
      remark,
      weight,
    });
    successHandler({ ctx });

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

export default new AreaController();
