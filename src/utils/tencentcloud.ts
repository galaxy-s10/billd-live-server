import crypto from 'crypto';

import cryptojs from 'crypto-js';
import * as tencentcloud from 'tencentcloud-sdk-nodejs';
import { Client } from 'tencentcloud-sdk-nodejs/tencentcloud/services/live/v20180801/live_client';

import { SRS_CB_URL_PARAMS } from '@/constant';
import {
  TENCENTCLOUD_LIVE,
  TENCENTCLOUD_SECRETID,
  TENCENTCLOUD_SECRETKEY,
} from '@/secret/secret';
import { LiveRoomTypeEnum } from '@/types/ILiveRoom';
import { chalkERROR, chalkSUCCESS } from '@/utils/chalkTip';

function getSignFn({ endpoint, params }) {
  function sort_params(params) {
    let strParam = '';
    const keys = Object.keys(params);
    keys.sort();
    // eslint-disable-next-line
    for (const k in keys) {
      // eslint-disable-next-line
      strParam += `&${keys[k]}=${params[keys[k]]}`;
    }
    return strParam;
  }

  function get_req_url(params, endpoint) {
    // eslint-disable-next-line
    params.Signature = escape(params.Signature);
    const url_strParam = sort_params(params);
    return `https://${endpoint}/?${url_strParam.slice(1)}`;
  }

  function formatSignString(reqMethod, endpoint, path, strParam) {
    // eslint-disable-next-line
    const strSign = `${reqMethod + endpoint + path}?${strParam.slice(1)}`;
    return strSign;
  }

  function sha1(secretKey, strsign) {
    const signMethodMap = { HmacSHA1: 'sha1' };
    const hmac = crypto.createHmac(signMethodMap.HmacSHA1, secretKey || '');
    return hmac.update(Buffer.from(strsign, 'utf8')).digest('base64');
  }

  // const params: any = {};
  // params.Action = Action;
  // params['InstanceIds.0'] = 'ins-09dx96dg';
  // params.Limit = 20;
  // params.Offset = 0;
  // params.Nonce = Nonce;
  // params.Region = Region;
  // params.SecretId = SECRET_ID;
  // params.Timestamp = Timestamp;
  // params.Version = Version;

  // 1. 对参数排序,并拼接请求字符串
  const strParam = sort_params(params);
  console.log('strParam', strParam);
  // 2. 拼接签名原文字符串
  const reqMethod = 'GET';
  const path = '/';
  const strSign = formatSignString(reqMethod, endpoint, path, strParam);
  console.log('strSign', strSign);

  // 3. 生成签名串
  const Signature = sha1(TENCENTCLOUD_SECRETKEY, strSign);
  console.log('生成签名串', Signature);
  // 4. 进行url编码并拼接请求url
  const reqUrl = get_req_url(params, endpoint);
  console.log('拼接请求url', reqUrl);
  return { Signature, reqUrl };
}

class TencentcloudClass {
  liveClient: Client;

  constructor() {
    // 导入对应产品模块的client models。
    const LiveClient = tencentcloud.live.v20180801.Client;
    // 实例化要请求产品(以cvm为例)的client对象
    const client = new LiveClient({
      // 为了保护密钥安全，建议将密钥设置在环境变量中或者配置文件中，请参考本文凭证管理章节。
      // 硬编码密钥到代码中有可能随代码泄露而暴露，有安全隐患，并不推荐。
      credential: {
        secretId: TENCENTCLOUD_SECRETID,
        secretKey: TENCENTCLOUD_SECRETKEY,
      },
    });
    this.liveClient = client;
  }

  /**
   * 查询直播中的流，返回正在直播中的流列表。适用于推流成功后查询在线流信息。
   * https://cloud.tencent.com/document/product/267/20472
   */
  queryLiveStream = async (data: { roomId: number }) => {
    const params = {
      StreamName: `roomId___${data.roomId}`, // 流名称，用于精确查询。
    };

    try {
      const res = await this.liveClient.DescribeLiveStreamOnlineList(params);
      console.log(chalkSUCCESS('查询腾讯云直播中的流成功！'));
      return { res };
    } catch (err) {
      console.log(err);
      console.log(chalkERROR('查询腾讯云直播中的流错误！'));
      return { err };
    }
  };

  /**
   * 查询直播中的流，返回正在直播中的流列表。适用于推流成功后查询在线流信息。
   * https://cloud.tencent.com/document/product/267/20472
   */
  queryLiveStreamAll = async () => {
    const params = {
      PageNum: 1,
      PageSize: 100,
    };
    try {
      const res = await this.liveClient.DescribeLiveStreamOnlineList(params);
      console.log(chalkSUCCESS('查询腾讯云直播中的流成功！'));
      return { res };
    } catch (err) {
      console.log(err);
      console.log(chalkERROR('查询腾讯云直播中的流错误！'));
      return { err };
    }
  };

  /**
   * 断开直播推流，断开推流连接，但可以重新推流。
   * https://cloud.tencent.com/document/product/267/20469
   */
  dropLiveStream = async (data: { roomId: number }) => {
    const params = {
      StreamName: `roomId___${data.roomId}`, // 流名称
      AppName: TENCENTCLOUD_LIVE.AppName,
      DomainName: TENCENTCLOUD_LIVE.PushDomain,
    };
    try {
      const res = await this.liveClient.DropLiveStream(params);
      console.log(
        chalkSUCCESS(`断开腾讯云直播推流成功！roomId：${data.roomId}`),
        res
      );
      return { res };
    } catch (err) {
      console.log(err);
      console.log(chalkERROR(`断开腾讯云直播推流错误！roomId：${data.roomId}`));
      return { err };
    }
  };

  /**
   * 获取拉流地址。
   */
  getPullUrl = (data: { liveRoomId: number }) => {
    const url = `${TENCENTCLOUD_LIVE.PullDomain}/${TENCENTCLOUD_LIVE.AppName}/roomId___${data.liveRoomId}`;
    return {
      rtmp: `rtmp://${url}`,
      flv: `https://${url}.flv`,
      hls: `https://${url}.m3u8`,
      webrtc: `webrtc://${url}`,
    };
  };

  /**
   * 拼装推流 URL
   * https://cloud.tencent.com/document/product/267/32720
   */
  getPushUrl = (data: {
    liveRoomId: number;
    key: string;
    type: LiveRoomTypeEnum;
  }) => {
    // 推流鉴权方式：静态鉴权(static)，https://developer.qiniu.com/pili/6678/push-the-current-authentication
    // 推流地址格式：rtmp://<Domain>/<AppName>/<StreamName>?txSecret=xxx&txTime=xxxx
    // https://cloud.tencent.com/document/product/267/32720
    const StreamName = `roomId___${data.liveRoomId}`;
    const Hex = (num: number) => num.toString(16).toUpperCase();
    const txTime = Math.floor(Date.now() / 1000) + 60 * 60; // txTime（地址有效期） 表示何时该 URL 会过期，格式支持十六进制的 UNIX 时间戳（时间单位：秒）。
    const txSecret = cryptojs
      .MD5(TENCENTCLOUD_LIVE.Key + StreamName + Hex(txTime))
      .toString();
    const key = `${StreamName}?txSecret=${txSecret}&txTime=${Hex(txTime)}&${
      SRS_CB_URL_PARAMS.roomId
    }=${data.liveRoomId}&${SRS_CB_URL_PARAMS.publishType}=${data.type}&${
      SRS_CB_URL_PARAMS.publishKey
    }=${data.key}`;
    return {
      push_rtmp_url: `rtmp://${TENCENTCLOUD_LIVE.PushDomain}/${TENCENTCLOUD_LIVE.AppName}/${key}`,
      push_obs_server: `rtmp://${TENCENTCLOUD_LIVE.PushDomain}/${TENCENTCLOUD_LIVE.AppName}/`,
      push_obs_stream_key: key,
      push_webrtc_url: `webrtc://${TENCENTCLOUD_LIVE.PushDomain}/${TENCENTCLOUD_LIVE.AppName}/${key}`,
      push_srt_url: ``,
    };
  };
}

export const tencentcloudUtils = new TencentcloudClass();
