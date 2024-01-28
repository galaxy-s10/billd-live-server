import dayjs from 'dayjs';
import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE } from '@/constant';
import {
  IList,
  ISignin,
  WalletRecordAmountStatusEnum,
  WalletRecordEnum,
} from '@/interface';
import { CustomError } from '@/model/customError.model';
import signinService from '@/service/signin.service';
import { dateStartAndEnd } from '@/utils';

import walletController from './wallet.controller';
import walletRecordController from './walletRecord.controller';

class SigninController {
  getList = async (ctx: ParameterizedContext, next) => {
    const {
      id,
      nums,
      username,
      user_id,
      live_room_id,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<ISignin> = ctx.request.query;
    const result = await signinService.getList({
      id,
      nums,
      username,
      user_id,
      live_room_id,
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
  };

  todayIsSignin = async (ctx: ParameterizedContext, next) => {
    const { code, errorCode, userInfo, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok || !userInfo) {
      throw new CustomError(message, code, errorCode);
    }
    const todayRangTime = dateStartAndEnd(new Date());
    const today = await signinService.findIsSignin({
      user_id: userInfo.id,
      rangTimeStart: todayRangTime.startTime,
      rangTimeEnd: todayRangTime.endTime,
    });
    successHandler({ ctx, data: today });
    await next();
  };

  create = async (ctx: ParameterizedContext, next) => {
    const { code, errorCode, userInfo, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok || !userInfo) {
      throw new CustomError(message, code, errorCode);
    }
    const todayRangTime = dateStartAndEnd(new Date());
    const yesterdayRangTime = dateStartAndEnd(
      new Date(dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'))
    );
    const today = await signinService.findIsSignin({
      user_id: userInfo.id,
      rangTimeStart: todayRangTime.startTime,
      rangTimeEnd: todayRangTime.endTime,
    });
    let nums = 1;
    if (!today) {
      // 查找昨天的签到情况，如果没有昨天签到记录，则连续签到次数为1，
      // 如果有昨天签到记录，则连续签到次数为昨天的连续签到次数加一
      const yesterday = await signinService.findIsSignin({
        user_id: userInfo.id,
        rangTimeStart: yesterdayRangTime.startTime,
        rangTimeEnd: yesterdayRangTime.endTime,
      });
      if (yesterday) {
        nums = (yesterday.nums || 1) + 1;
        await signinService.create({
          user_id: userInfo.id,
          nums,
        });
      } else {
        await signinService.create({
          user_id: userInfo.id,
          nums: 1,
        });
      }
      const signinAmount = 50;
      await walletController.common.changeBalanceByUserId({
        user_id: userInfo.id,
        balance: signinAmount,
      });
      await walletRecordController.common.create({
        user_id: userInfo.id,
        type: WalletRecordEnum.signin,
        name: '签到奖励',
        amount: signinAmount,
        amount_status: WalletRecordAmountStatusEnum.add,
      });
    } else {
      throw new CustomError(
        `今天已签到过了！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    successHandler({ ctx, data: { nums } });
    await next();
  };

  find = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const result = await signinService.find(id);
    successHandler({ ctx, data: result });
    await next();
  };

  update = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const { nums }: ISignin = ctx.request.body;
    const result = await signinService.update({
      id,
      nums,
    });
    successHandler({ ctx, data: result });
    await next();
  };

  delete = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const result = await signinService.delete(id);
    successHandler({ ctx, data: result });
    await next();
  };
}

export default new SigninController();
