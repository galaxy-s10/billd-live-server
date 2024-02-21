import AlipaySdk from 'alipay-sdk';
import { getRandomString } from 'billd-utils';

import { ALIPAY_LIVE_CONFIG } from '@/secret/secret';

// 支付宝开放平台（自然博客直播）：https://open.alipay.com/develop/pm/sub/appinfo?appId=2021003193626441

class AliPaySdkClass {
  sdk: AlipaySdk;

  constructor() {
    this.sdk = new AlipaySdk({
      appId: ALIPAY_LIVE_CONFIG.appId,
      privateKey: ALIPAY_LIVE_CONFIG.privateKey,
      alipayPublicKey: ALIPAY_LIVE_CONFIG.alipayPublicKey,
      gateway: ALIPAY_LIVE_CONFIG.gateway,
    });
  }

  precreate = async (data: { total_amount: string; subject: string }) => {
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
      total_amount: data.total_amount,
      /**
       * subject，类型：字符串。最大长度256，必选，示例值：Iphone6 16G
       * 订单标题。注意：不可使用特殊字符，如 /，=，& 等。
       */
      subject: data.subject,
      /**
       * product_code，类型：字符串。最大长度64，必选，示例值：FACE_TO_FACE_PAYMENT
       * 销售产品码。如果签约的是当面付快捷版，则传 OFFLINE_PAYMENT；其它支付宝当面付产品传 FACE_TO_FACE_PAYMENT；不传则默认使用 FACE_TO_FACE_PAYMENT。
       */
      product_code: 'FACE_TO_FACE_PAYMENT',
      /**
       * body，类型：字符串。最大长度128，可选，示例值：Iphone6 16G
       * 订单附加信息。如果请求时传递了该参数，将在异步通知、对账单中原样返回，同时会在商户和用户的pc账单详情中作为交易描述展示
       */
      body: data.subject,
      /**
       * notify_url，类型：字符串。最大长度256，可选，示例值：http://api.test.alipay.net/atinterface/receive_notify.htm
       * 支付宝服务器主动通知商户服务器里指定的页面http/https路径。
       */
      // notify_url: 'https://live.xxx.cn/auth_pay',
    };
    // https://opendocs.alipay.com/open/f540afd8_alipay.trade.precreate?scene=19&pathHash=d3c84596
    const aliPayRes = await this.sdk.exec('alipay.trade.precreate', {
      method: 'alipay.trade.precreate',
      bizContent,
    });
    return { bizContent, aliPayRes };
  };

  query = async (out_trade_no: string) => {
    // https://opendocs.alipay.com/open/02ekfh?scene=23&pathHash=925e7dfc
    const aliPayRes = await this.sdk.exec('alipay.trade.query', {
      method: 'alipay.trade.query',
      bizContent: {
        out_trade_no,
      },
    });
    return aliPayRes;
  };
}

export const aliPaySdk = new AliPaySdkClass();
