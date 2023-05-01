import AlipaySdk from 'alipay-sdk';
import Router from 'koa-router';

import successHandler from '@/app/handler/success-handle';
import { ALIPAY_CONFIG } from '@/config/secret';

const alipayRouter = new Router({ prefix: '/alipay' });

alipayRouter.get('/pay', async (ctx, next) => {
  const alipaySdk = new AlipaySdk({
    appId: ALIPAY_CONFIG.appId,
    privateKey: ALIPAY_CONFIG.privateKey,
    alipayPublicKey: ALIPAY_CONFIG.alipayPublicKey,
    // gateway: ALIPAY_CONFIG.gateway,
  });
  console.log('alipaySdk', alipaySdk);

  // const formData = new AlipayFormData();
  // formData.setMethod('get');
  // formData.addField('notifyUrl', 'https://live.hsslive.cn/');
  // formData.addField('returnUrl', 'https://live.hsslive.cn/auth_pay');
  // formData.addField('bizContent', {
  //   out_trade_no: new Date().valueOf(),
  //   total_amount: '88.88',
  //   subject: '女装',
  //   product_code: 'QUICK_WAP_WAY',
  //   body: '测试商品',
  // });
  const bizContent = {
    out_trade_no: new Date().valueOf(),
    total_amount: '88.88',
    subject: '女装',
    product_code: 'FACE_TO_FACE_PAYMENT',
    body: '测试商品',
  };
  // const res = '111';
  const res = alipaySdk.pageExec('alipay.trade.page.pay', {
    method: 'GET',
    bizContent,
    returnUrl: 'https://live.hsslive.cn/auth_pay',
  });
  console.log(111111);
  successHandler({ ctx, data: res });
  await next();
});

alipayRouter.post('/auth_pay', async (ctx, next) => {
  const postData = ctx.request.body;
  console.log('auth_payauth_pay');
  successHandler({ ctx, data: postData });
  await next();
});

alipayRouter.get('/success', async (ctx, next) => {
  successHandler({ ctx, data: 'successsuccess' });
  await next();
});

export default alipayRouter;
