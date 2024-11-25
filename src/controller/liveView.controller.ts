import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import { IList, ILiveView } from '@/interface';
import { CustomError } from '@/model/customError.model';
import liveViewService from '@/service/liveView.service';

class LiveViewController {
  common = {
    getCountByLiveRecordId: (live_record_id: number) =>
      liveViewService.getCountByLiveRecordId(live_record_id),
    updateDuration: (data: ILiveView) => liveViewService.updateDuration(data),
    create: (data: ILiveView) => liveViewService.create(data),
    find: (id: number) => liveViewService.find(id),
  };

  async getList(ctx: ParameterizedContext, next) {
    const {
      id,
      live_record_id,
      live_room_id,
      user_id,
      duration,
      user_agent,
      client_ip,
      client_env,
      remark,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      childKeyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<ILiveView> = ctx.request.query;
    const result = await liveViewService.getList({
      id,
      live_record_id,
      live_room_id,
      user_id,
      duration,
      user_agent,
      client_ip,
      client_env,
      remark,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      childKeyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    successHandler({ ctx, data: result });
    await next();
  }

  find = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const result = await this.common.find(id);
    successHandler({ ctx, data: result });
    await next();
  };

  async update(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const {
      live_record_id,
      live_room_id,
      user_id,
      duration,
      user_agent,
      client_ip,
      client_env,
      remark,
    }: ILiveView = ctx.request.body;
    const isExist = await liveViewService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的记录！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await liveViewService.update({
      id,
      live_record_id,
      live_room_id,
      user_id,
      duration,
      user_agent,
      client_ip,
      client_env,
      remark,
    });
    successHandler({ ctx });
    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    const {
      id,
      live_record_id,
      live_room_id,
      user_id,
      duration,
      user_agent,
      client_ip,
      client_env,
      remark,
    }: ILiveView = ctx.request.body;
    await this.common.create({
      id,
      live_record_id,
      live_room_id,
      user_id,
      duration,
      user_agent,
      client_ip,
      client_env,
      remark,
    });
    successHandler({ ctx });
    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await liveViewService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的记录！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await liveViewService.delete(id);
    successHandler({ ctx });
    await next();
  }
}

export default new LiveViewController();
