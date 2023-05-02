import AlipaySdk from 'alipay-sdk';
import { getRandomString } from 'billd-utils';
import Router from 'koa-router';
import Sequelize from 'sequelize';

import successHandler from '@/app/handler/success-handle';
import { ALIPAY_CONFIG } from '@/config/secret';
import OrderModel from '@/model/order.model';

const alipayRouter = new Router({ prefix: '/alipay' });
const { Op } = Sequelize;

alipayRouter.post('/pay', async (ctx, next) => {
  const { total_amount, subject, body } = ctx.request.body;
  const alipaySdk = new AlipaySdk({
    appId: ALIPAY_CONFIG.appId,
    privateKey: ALIPAY_CONFIG.privateKey,
    alipayPublicKey: ALIPAY_CONFIG.alipayPublicKey,
    gateway: ALIPAY_CONFIG.gateway,
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
  await OrderModel.create({
    out_trade_no: bizContent.out_trade_no,
    total_amount,
    subject,
    product_code: bizContent.product_code,
    qr_code: res.qrCode,
  });

  successHandler({
    ctx,
    data: { qr_code: res.qrCode, out_trade_no: bizContent.out_trade_no },
  });
  await next();
});

alipayRouter.get('/pay_status', async (ctx, next) => {
  const { out_trade_no } = ctx.request.query;
  console.log('out_trade_noout_trade_no', out_trade_no, ctx.request.query);
  const alipaySdk = new AlipaySdk({
    appId: ALIPAY_CONFIG.appId,
    privateKey: ALIPAY_CONFIG.privateKey,
    alipayPublicKey: ALIPAY_CONFIG.alipayPublicKey,
    gateway: ALIPAY_CONFIG.gateway,
  });

  const bizContent = {
    out_trade_no, // 商户订单号。由商家自定义，64个字符以内，仅支持字母、数字、下划线且需保证在商户端不重复。
  };

  const res = await alipaySdk.exec('alipay.trade.query', {
    method: 'alipay.trade.query',
    bizContent,
  });
  const orderInfo = await OrderModel.findOne({ where: { out_trade_no } });
  console.log('orderInfoorderInfo', orderInfo);
  let tradeStatus = 'error';
  if (orderInfo) {
    if (res.msg === 'Success') {
      await OrderModel.update(
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

  successHandler({ ctx, data: { tradeStatus } });
  await next();
});

alipayRouter.get('/pay_list', async (ctx, next) => {
  const res = await OrderModel.findAndCountAll({
    where: {
      trade_status: {
        [Op.or]: ['WAIT_BUYER_PAY', 'TRADE_SUCCESS'],
      },
    },
  });
  successHandler({ ctx, data: res });
  await next();
});

export default alipayRouter;
