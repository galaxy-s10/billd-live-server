import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import { IArea, IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import areaService from '@/service/area.service';
import { ILiveRoom } from '@/types/ILiveRoom';

class AreaController {
  common = {
    getList: async (data) => {
      const {
        id,
        name,
        remark,
        priority,
        orderBy,
        orderName,
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
        priority,
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
        cdn,
        is_fake,
        is_show,
        status,
        childNowPage,
        childPageSize,
        childOrderName,
        childOrderBy,
        childKeyWord,
        orderBy,
        orderName,
        nowPage,
        pageSize,
        keyWord,
        rangTimeType,
        rangTimeStart,
        rangTimeEnd,
      }: IList<IArea & ILiveRoom> = data;
      const result = await areaService.getAreaLiveRoomList({
        id,
        cdn,
        is_fake,
        is_show,
        status,
        childNowPage,
        childPageSize,
        childOrderName,
        childOrderBy,
        childKeyWord,
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
    isExist: async (ids: number[]) => {
      const isExist = await areaService.isExist(ids);
      if (!isExist) {
        throw new CustomError(
          `不存在id为${ids.join()}的分区！`,
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
    },
    delete: async (id: number, isRoute?: boolean) => {
      const isExist = await areaService.isExist([id]);
      if (!isExist) {
        if (isRoute) {
          throw new CustomError(
            `不存在id为${id}的分区！`,
            COMMON_HTTP_CODE.paramsError,
            COMMON_HTTP_CODE.paramsError
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
    const { id, is_show, status, nowPage, pageSize }: IList<IArea & ILiveRoom> =
      ctx.request.query;
    const result = await areaService.getLiveRoomList({
      area_id: id,
      is_show,
      status,
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
    const { name, remark, priority }: IArea = ctx.request.body;
    await areaService.create({
      name,
      remark,
      priority,
    });
    successHandler({ ctx });

    await next();
  }

  delete = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    await this.common.delete(id, true);
    successHandler({ ctx });

    await next();
  };
}

export default new AreaController();
