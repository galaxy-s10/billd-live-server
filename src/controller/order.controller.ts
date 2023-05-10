import AlipaySdk from 'alipay-sdk';
import { getRandomString } from 'billd-utils';
import { ParameterizedContext } from 'koa';
import Sequelize from 'sequelize';

import successHandler from '@/app/handler/success-handle';
import { ALIPAY_LIVE_CONFIG } from '@/config/secret';
import { REDIS_PREFIX } from '@/constant';
import redisController from '@/controller/redis.controller';
import orderModel from '@/model/order.model';

const { Op } = Sequelize;

class AliPayController {
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

    const res = await alipaySdk.exec('alipay.trade.query', {
      method: 'alipay.trade.query',
      bizContent,
    });
    const orderInfo = await orderModel.findOne({ where: { out_trade_no } });
    let tradeStatus = 'error';
    if (orderInfo) {
      if (res.msg === 'Success') {
        await orderModel.update(
          {
            buyer_logon_id: res.buyerLogonId,
            buyer_pay_amount: res.buyerPayAmount,
            buyer_user_id: res.buyerUserId,
            invoice_amount: res.invoiceAmount,
            point_amount: res.pointAmount,
            receipt_amount: res.receiptAmount,
            send_pay_date: res.sendPayDate,
            trade_no: res.tradeNo,
            trade_status: res.tradeStatus,
          },
          { where: { out_trade_no } }
        );
        if (res.tradeStatus === 'WAIT_BUYER_PAY') {
          tradeStatus = 'WAIT_BUYER_PAY';
        }
        if (res.tradeStatus === 'TRADE_SUCCESS') {
          tradeStatus = 'TRADE_SUCCESS';
        }
      }
    }

    return { tradeStatus };
  }

  async create(ctx: ParameterizedContext, next) {
    const { total_amount, subject, body } = ctx.request.body;
    const alipaySdk = new AlipaySdk({
      appId: ALIPAY_LIVE_CONFIG.appId,
      privateKey: ALIPAY_LIVE_CONFIG.privateKey,
      alipayPublicKey: ALIPAY_LIVE_CONFIG.alipayPublicKey,
      gateway: ALIPAY_LIVE_CONFIG.gateway,
    });

    const bizContent = {
      out_trade_no: `${+new Date()}___${getRandomString(10)}`, // 商户订单号。由商家自定义，64个字符以内，仅支持字母、数字、下划线且需保证在商户端不重复。
      total_amount, // 订单总金额，单位为元，精确到小数点后两位，取值范围为 [0.01,100000000]，金额不能为 0。
      subject, // 订单标题。注意：不可使用特殊字符，如 /，=，& 等。
      product_code: 'FACE_TO_FACE_PAYMENT', // 销售产品码。如果签约的是当面付快捷版，则传 OFFLINE_PAYMENT；其它支付宝当面付产品传 FACE_TO_FACE_PAYMENT；不传则默认使用 FACE_TO_FACE_PAYMENT。
      body, // 订单附加信息。如果请求时传递了该参数，将在异步通知、对账单中原样返回，同时会在商户和用户的pc账单详情中作为交易描述展示
      // notify_url: 'https://live.hsslive.cn/auth_pay',
    };

    const res = await alipaySdk.exec('alipay.trade.precreate', {
      method: 'alipay.trade.precreate',
      bizContent,
      // returnUrl: 'https://live.hsslive.cn/auth_pay',
    });
    const createDate = {
      out_trade_no: bizContent.out_trade_no,
      total_amount,
      subject,
      product_code: bizContent.product_code,
      qr_code: res.qrCode,
    };
    await orderModel.create(createDate);
    const exp = 60 * 5;
    redisController.setExVal({
      prefix: REDIS_PREFIX.order,
      key: bizContent.out_trade_no,
      exp,
      value: JSON.stringify({
        ...createDate,
        created_at: new Date().toLocaleString(),
        expired_at: new Date(+new Date() + exp * 1000).toLocaleString(),
      }),
    });

    successHandler({
      ctx,
      data: { qr_code: res.qrCode, out_trade_no: bizContent.out_trade_no },
    });
    await next();
  }

  getPayStatus = async (ctx: ParameterizedContext, next) => {
    const { out_trade_no } = ctx.request.query;
    const { tradeStatus } = await this.commonGetPayStatus(out_trade_no);
    successHandler({
      ctx,
      data: { tradeStatus },
    });
    await next();
  };

  async getList(ctx: ParameterizedContext, next) {
    const res = await orderModel.findAndCountAll({
      where: {
        trade_status: {
          [Op.or]: ['WAIT_BUYER_PAY', 'TRADE_SUCCESS'],
        },
      },
    });
    successHandler({ ctx, data: res });
    await next();
  }
}

export default new AliPayController();
