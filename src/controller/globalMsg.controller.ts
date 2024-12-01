import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import { IGlobalMsg, IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import globalMsgService from '@/service/globalMsg.service';

class GlobalMsgController {
  common = {
    create: (data: IGlobalMsg) => globalMsgService.create(data),
    find: (id: number) => globalMsgService.find(id),
    getList: ({
      id,
      user_id,
      client_ip,
      priority,
      show,
      type,
      remark,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IGlobalMsg>) =>
      globalMsgService.getList({
        id,
        user_id,
        client_ip,
        priority,
        show,
        type,
        orderBy,
        orderName,
        nowPage,
        pageSize,
        keyWord,
        rangTimeType,
        rangTimeStart,
        rangTimeEnd,
      }),
    getMyList: ({
      id,
      user_id,
      client_ip,
      priority,
      show,
      type,
      remark,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IGlobalMsg>) =>
      globalMsgService.getMyList({
        id,
        user_id,
        client_ip,
        priority,
        show,
        type,
        orderBy,
        orderName,
        nowPage,
        pageSize,
        keyWord,
        rangTimeType,
        rangTimeStart,
        rangTimeEnd,
      }),
  };

  getList = async (ctx: ParameterizedContext, next) => {
    const data: IList<IGlobalMsg> = ctx.request.query;
    const result = await this.common.getList(data);
    successHandler({ ctx, data: result });
    await next();
  };

  getMyList = async (ctx: ParameterizedContext, next) => {
    const { userInfo } = await authJwt(ctx);
    const data: IList<IGlobalMsg> = ctx.request.query;
    const result = await this.common.getMyList({
      ...data,
      // @ts-ignore
      user_id: userInfo?.id || null,
    });
    successHandler({ ctx, data: result });
    await next();
  };

  find = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const result = await this.common.find(id);
    successHandler({ ctx, data: result });
    await next();
  };

  async update(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const { user_id, client_ip, priority, show, type, remark }: IGlobalMsg =
      ctx.request.body;
    const isExist = await globalMsgService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的全局消息！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await globalMsgService.update({
      id,
      user_id,
      client_ip,
      priority,
      show,
      type,
      remark,
    });
    successHandler({ ctx });
    await next();
  }

  create = async (ctx: ParameterizedContext, next) => {
    const data = ctx.request.body;
    await this.common.create(data);
    successHandler({ ctx });
    await next();
  };

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await globalMsgService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的全局消息！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await globalMsgService.delete(id);
    successHandler({ ctx });
    await next();
  }
}

export default new GlobalMsgController();
