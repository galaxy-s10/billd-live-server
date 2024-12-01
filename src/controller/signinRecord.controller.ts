import dayjs from 'dayjs';
import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import signinStatisticsController from '@/controller/signinStatistics.controller';
import walletController from '@/controller/wallet.controller';
import walletRecordController from '@/controller/walletRecord.controller';
import {
  IList,
  ISigninRecord,
  WalletRecordAmountStatusEnum,
  WalletRecordEnum,
} from '@/interface';
import { CustomError } from '@/model/customError.model';
import signinRecordService from '@/service/signinRecord.service';
import { dateStartAndEnd } from '@/utils';

class SigninRecordController {
  common = {
    todayIsSignin: async (user_id: number) => {
      const todayRangTime = dateStartAndEnd(new Date());
      const res = await signinRecordService.findIsSignin({
        user_id,
        rangTimeStart: todayRangTime.startTime,
        rangTimeEnd: todayRangTime.endTime,
      });
      return Boolean(res);
    },
    create: async ({ user_id, live_room_id }: ISigninRecord) => {
      const res = await signinRecordService.create({
        user_id,
        live_room_id,
      });
      return res;
    },
    findCountByUserId: async (user_id: number) => {
      const res = await signinRecordService.findCountByUserId(user_id);
      return res;
    },
  };

  getList = async (ctx: ParameterizedContext, next) => {
    const {
      id,
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
    }: IList<ISigninRecord> = ctx.request.query;
    const result = await signinRecordService.getList({
      id,
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
    const { code, errorCode, userInfo, msg } = await authJwt(ctx);
    if (code !== COMMON_HTTP_CODE.success || !userInfo) {
      throw new CustomError(msg, code, errorCode);
    }
    const res = await this.common.todayIsSignin(userInfo.id!);
    successHandler({ ctx, data: res });
    await next();
  };

  create = async (ctx: ParameterizedContext, next) => {
    const { code, errorCode, userInfo, msg } = await authJwt(ctx);
    if (code !== COMMON_HTTP_CODE.success || !userInfo) {
      throw new CustomError(msg, code, errorCode);
    }
    const today = await this.common.todayIsSignin(userInfo.id!);
    if (today) {
      throw new CustomError(
        `今天已签到过了！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const { live_room_id }: ISigninRecord = ctx.request.body;
    await this.common.create({
      user_id: userInfo.id,
      live_room_id,
    });
    const count = await this.common.findCountByUserId(userInfo.id!);
    let nums = 1;
    const nowTime = +new Date();
    const signinStatisticsRes =
      await signinStatisticsController.common.findByUserId(userInfo.id!);
    if (!signinStatisticsRes) {
      // 统计表没有记录
      await signinStatisticsController.common.create({
        user_id: userInfo.id,
        nums: 1,
        max_nums: 1,
        sum_nums: count,
        recently_signin_time: dayjs(nowTime).format('YYYY-MM-DD HH:mm:ss'),
      });
    } else {
      // 统计表有记录
      nums = (signinStatisticsRes.nums || 1) + 1;
      let max_nums = signinStatisticsRes.max_nums || 1;
      if (
        +new Date(signinStatisticsRes.recently_signin_time!) >=
        +new Date(
          dayjs(nowTime).subtract(1, 'day').format('YYYY-MM-DD 00:00:00')
        )
      ) {
        // 昨天有签到，判断nums和max_nums
        max_nums = Math.max(nums, max_nums);
      } else {
        // 昨天没有签到，最大连续签到次数不变，当前连续签到次数重置为1
        nums = 1;
      }
      await signinStatisticsController.common.update({
        id: signinStatisticsRes.id,
        user_id: userInfo.id,
        nums,
        max_nums,
        sum_nums: count,
        recently_signin_time: dayjs(nowTime).format('YYYY-MM-DD HH:mm:ss'),
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
    successHandler({ ctx, data: { nums } });
    await next();
  };

  find = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const result = await signinRecordService.find(id);
    successHandler({ ctx, data: result });
    await next();
  };

  update = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const { user_id, live_room_id }: ISigninRecord = ctx.request.body;
    const result = await signinRecordService.update({
      id,
      user_id,
      live_room_id,
    });
    successHandler({ ctx, data: result });
    await next();
  };

  delete = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const result = await signinRecordService.delete(id);
    successHandler({ ctx, data: result });
    await next();
  };
}

export default new SigninRecordController();
