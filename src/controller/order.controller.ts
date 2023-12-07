import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE, REDIS_PREFIX } from '@/constant';
import goodsControllerfrom from '@/controller/goods.controller';
import redisController from '@/controller/redis.controller';
import { GoodsTypeEnum, IList, IOrder, PayStatusEnum } from '@/interface';
import { CustomError } from '@/model/customError.model';
import orderService from '@/service/order.service';
import walletService from '@/service/wallet.service';
import { asyncWraper } from '@/utils';
import { aliPaySdk } from '@/utils/alipaySdk';
import { chalkERROR } from '@/utils/chalkTip';

class OrderController {
  async commonGetPayStatus(out_trade_no: string, isExpired = false) {
    const orderInfo = await orderService.findByOutTradeNo(out_trade_no);
    if (!orderInfo) {
      console.log(chalkERROR('订单不存在！'));
      return { err: `订单不存在！` };
    }
    const aliPayRes = await aliPaySdk.query(out_trade_no);
    if (aliPayRes.code === '10000') {
      if (aliPayRes.tradeStatus === PayStatusEnum.TRADE_SUCCESS) {
        // const aliPayRes = {
        //   code: '10000',
        //   msg: 'Success',
        //   buyerLogonId: '147******11',
        //   buyerPayAmount: '0.00',
        //   buyerUserId: '2088932811657978',
        //   invoiceAmount: '0.00',
        //   outTradeNo: '1685861660019___M7m4HSNZbc',
        //   pointAmount: '0.00',
        //   receiptAmount: '0.00',
        //   totalAmount: '2.00',
        //   tradeNo: '2023060422001457971417335312',
        //   tradeStatus: 'WAIT_BUYER_PAY',
        // };
        asyncWraper(async () => {
          const orderRes = await orderService.updatePayOk({
            id: orderInfo.id,
            buyer_logon_id: aliPayRes.buyerLogonId,
            buyer_pay_amount: aliPayRes.buyerPayAmount,
            buyer_user_id: aliPayRes.buyerUserId,
            invoice_amount: aliPayRes.invoiceAmount,
            out_trade_no: aliPayRes.outTradeNo,
            point_amount: aliPayRes.pointAmount,
            receipt_amount: aliPayRes.receiptAmount,
            total_amount: aliPayRes.totalAmount,
            send_pay_date: aliPayRes.sendPayDate,
            trade_no: aliPayRes.tradeNo,
            trade_status: aliPayRes.tradeStatus,
            billd_live_order_version: 1,
          });
          if (orderRes[0]) {
            const userWallet = await walletService.findByUserId(
              orderInfo.billd_live_user_id || -1
            );
            if (userWallet) {
              const oldBalance = Number(userWallet.balance) * 100;
              const addBalance = Number(aliPayRes.totalAmount) * 100;
              const newbalance = `${((oldBalance + addBalance) / 100).toFixed(
                2
              )}`;
              await walletService.updateByUserId({
                user_id: orderInfo.billd_live_user_id,
                balance: newbalance,
              });
            }
          }
        });
      }
      return { aliPayRes };
    }
    if (isExpired) {
      asyncWraper(async () => {
        await orderService.delete(orderInfo.id || -1);
      });
    }

    return { err: aliPayRes };
  }

  async create(ctx: ParameterizedContext, next) {
    const { userInfo } = await authJwt(ctx);
    const { goodsId, liveRoomId, money } = ctx.request.body;

    const goodsInfo = await goodsControllerfrom.common.find(goodsId);
    if (!goodsInfo) {
      throw new CustomError(
        `不存在该商品！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const { price, name: subject } = goodsInfo;
    let total_amount = price;

    if (goodsInfo.type === GoodsTypeEnum.recharge) {
      const newmoney = Number(money);
      if (newmoney === 0) {
        throw new CustomError(
          `付款金额不能为0！`,
          ALLOW_HTTP_CODE.paramsError,
          ALLOW_HTTP_CODE.paramsError
        );
      }
      total_amount = Number(newmoney).toFixed(2);
    } else if (Number(price) === 0) {
      throw new CustomError(
        `付款金额不能为0！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }

    const res = await aliPaySdk.precreate({
      total_amount: total_amount!,
      subject: subject!,
    });

    if (res.aliPayRes.code !== '10000') {
      throw new CustomError(
        res.aliPayRes.subMsg,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }

    asyncWraper(async () => {
      const createDate: IOrder = {
        billd_live_user_id: userInfo?.id,
        billd_live_goods_id: goodsId,
        billd_live_live_room_id: liveRoomId,
        billd_live_order_version: 1,
        out_trade_no: res.bizContent.out_trade_no,
        total_amount: res.bizContent.total_amount,
        billd_live_order_subject: res.bizContent.subject,
        product_code: res.bizContent.product_code,
        qr_code: res.aliPayRes.qrCode,
      };
      await orderService.create(createDate);
      const exp = 60 * 5;
      redisController.setExVal({
        prefix: REDIS_PREFIX.order,
        key: res.bizContent.out_trade_no,
        exp,
        value: createDate,
      });
    });

    successHandler({
      ctx,
      data: {
        qr_code: res.aliPayRes.qrCode,
        out_trade_no: res.aliPayRes.outTradeNo,
      },
    });
    await next();
  }

  getPayStatus = async (ctx: ParameterizedContext, next) => {
    const { out_trade_no }: IOrder = ctx.request.query;
    const { err, aliPayRes } = await this.commonGetPayStatus(
      out_trade_no || '-1'
    );
    if (err) {
      successHandler({
        ctx,
        data: { tradeStatus: PayStatusEnum.error, err },
      });
    } else if (aliPayRes) {
      successHandler({
        ctx,
        data: { tradeStatus: aliPayRes.tradeStatus, aliPayRes },
      });
    } else {
      successHandler({
        ctx,
        data: { tradeStatus: PayStatusEnum.error, aliPayRes, err },
      });
    }

    await next();
  };

  async getList(ctx: ParameterizedContext, next) {
    const {
      id,
      billd_live_goods_id,
      billd_live_live_room_id,
      billd_live_user_id,
      trade_status,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IOrder> = ctx.request.query;

    const res = await orderService.getList({
      id,
      billd_live_goods_id,
      billd_live_live_room_id,
      billd_live_user_id,
      trade_status,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    successHandler({ ctx, data: res });
    await next();
  }
}

export default new OrderController();
