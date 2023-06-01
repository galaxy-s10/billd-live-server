import AlipaySdk from 'alipay-sdk';
import { getRandomString } from 'billd-utils';
import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { ALIPAY_LIVE_CONFIG } from '@/config/secret';
import { ALLOW_HTTP_CODE, REDIS_PREFIX } from '@/constant';
import goodsControllerfrom from '@/controller/goods.controller';
import redisController from '@/controller/redis.controller';
import { GoodsTypeEnum, IList, IOrder, PayStatusEnum } from '@/interface';
import { CustomError } from '@/model/customError.model';
import orderService from '@/service/order.service';
import walletService from '@/service/wallet.service';

// 支付宝开放平台（自然博客直播）：https://open.alipay.com/develop/pm/sub/appinfo?appId=2021003193626441

class OrderController {
  async commonGetPayStatus(out_trade_no) {
    const alipaySdk = new AlipaySdk({
      appId: ALIPAY_LIVE_CONFIG.appId,
      privateKey: ALIPAY_LIVE_CONFIG.privateKey,
      alipayPublicKey: ALIPAY_LIVE_CONFIG.alipayPublicKey,
      gateway: ALIPAY_LIVE_CONFIG.gateway,
    });
    const bizContent = {
      out_trade_no, // 商户订单号。由商家自定义，64个字符以内，仅支持字母、数字、下划线且需保证在商户端不重复。
    };
    // https://opendocs.alipay.com/open/02ekfh?scene=23&pathHash=925e7dfc
    const res = await alipaySdk.exec('alipay.trade.query', {
      method: 'alipay.trade.query',
      bizContent,
    });
    const orderInfo = await orderService.findByOutTradeNo(out_trade_no);
    let tradeStatus = PayStatusEnum.error;
    if (orderInfo) {
      if (res.msg === 'Success') {
        await orderService.update({
          id: orderInfo.id,
          buyer_logon_id: res.buyerLogonId,
          buyer_pay_amount: res.buyerPayAmount,
          buyer_user_id: res.buyerUserId,
          invoice_amount: res.invoiceAmount,
          point_amount: res.pointAmount,
          receipt_amount: res.receiptAmount,
          send_pay_date: res.sendPayDate,
          trade_no: res.tradeNo,
          trade_status: res.tradeStatus,
        });
        if (res.tradeStatus === 'WAIT_BUYER_PAY') {
          tradeStatus = PayStatusEnum.WAIT_BUYER_PAY;
        }
        if (res.tradeStatus === 'TRADE_SUCCESS') {
          tradeStatus = PayStatusEnum.TRADE_SUCCESS;
        }
      }
    }

    return { tradeStatus, orderInfo };
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

    const alipaySdk = new AlipaySdk({
      appId: ALIPAY_LIVE_CONFIG.appId,
      privateKey: ALIPAY_LIVE_CONFIG.privateKey,
      alipayPublicKey: ALIPAY_LIVE_CONFIG.alipayPublicKey,
      gateway: ALIPAY_LIVE_CONFIG.gateway,
    });

    let total_amount = price;
    if (goodsInfo.type === GoodsTypeEnum.recharge) {
      const newmoney = Number(money);
      if (!newmoney) {
        throw new CustomError(
          `价格不正确！`,
          ALLOW_HTTP_CODE.paramsError,
          ALLOW_HTTP_CODE.paramsError
        );
      }
      total_amount = Number(newmoney).toFixed(2);
    }

    const bizContent = {
      /**
       * out_trade_no，类型：字符串。最大长度64，必选，示例值：20150320010101001
       * 商户订单号。由商家自定义，64个字符以内，仅支持字母、数字、下划线且需保证在商户端不重复。
       */
      out_trade_no: `${+new Date()}___${getRandomString(10)}`,
      /**
       * total_amount，类型：字符串。最大长度11，必选，示例值：88.88
       * 订单总金额，单位为元，精确到小数点后两位，取值范围为 [0.01,100000000]，金额不能为 0。
       */
      total_amount,
      /**
       * subject，类型：字符串。最大长度256，必选，示例值：Iphone6 16G
       * 订单标题。注意：不可使用特殊字符，如 /，=，& 等。
       */
      subject,
      /**
       * product_code，类型：字符串。最大长度64，必选，示例值：FACE_TO_FACE_PAYMENT
       * 销售产品码。如果签约的是当面付快捷版，则传 OFFLINE_PAYMENT；其它支付宝当面付产品传 FACE_TO_FACE_PAYMENT；不传则默认使用 FACE_TO_FACE_PAYMENT。
       */
      product_code: 'FACE_TO_FACE_PAYMENT',
      /**
       * body，类型：字符串。最大长度128，可选，示例值：Iphone6 16G
       * 订单附加信息。如果请求时传递了该参数，将在异步通知、对账单中原样返回，同时会在商户和用户的pc账单详情中作为交易描述展示
       */
      body: subject,
      /**
       * notify_url，类型：字符串。最大长度256，可选，示例值：http://api.test.alipay.net/atinterface/receive_notify.htm
       * 支付宝服务器主动通知商户服务器里指定的页面http/https路径。
       */
      // notify_url: 'https://live.hsslive.cn/auth_pay',
    };

    // https://opendocs.alipay.com/open/f540afd8_alipay.trade.precreate?scene=19&pathHash=d3c84596
    const res = await alipaySdk.exec('alipay.trade.precreate', {
      method: 'alipay.trade.precreate',
      bizContent,
    });

    const createDate: IOrder = {
      billd_live_user_id: userInfo?.id,
      billd_live_goods_id: goodsId,
      billd_live_live_room_id: liveRoomId,
      out_trade_no: bizContent.out_trade_no,
      total_amount,
      subject,
      product_code: bizContent.product_code,
      qr_code: res.qrCode,
    };
    await orderService.create(createDate);
    const exp = 60 * 5;
    redisController.setExVal({
      prefix: REDIS_PREFIX.order,
      key: bizContent.out_trade_no,
      exp,
      value: createDate,
    });

    successHandler({
      ctx,
      data: { qr_code: res.qrCode, out_trade_no: bizContent.out_trade_no },
    });
    await next();
  }

  getPayStatus = async (ctx: ParameterizedContext, next) => {
    const { out_trade_no } = ctx.request.query;
    const { tradeStatus, orderInfo } = await this.commonGetPayStatus(
      out_trade_no
    );
    if (orderInfo && tradeStatus === PayStatusEnum.TRADE_SUCCESS) {
      const res1 = await walletService.findByUserId(
        orderInfo.billd_live_user_id!
      );
      if (res1) {
        const oldbalance = Number(Number(res1.balance).toFixed(2));
        const newbalance = `${
          oldbalance + Number(Number(orderInfo.total_amount).toFixed(2))
        }`;
        await walletService.updateByUserId({
          user_id: orderInfo.billd_live_user_id,
          balance: newbalance,
        });
      }
    }

    successHandler({
      ctx,
      data: { tradeStatus },
    });
    await next();
  };

  async getList(ctx: ParameterizedContext, next) {
    const {
      id,
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
