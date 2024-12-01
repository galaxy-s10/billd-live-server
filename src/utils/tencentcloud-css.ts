import cryptojs from 'crypto-js';
import * as tencentcloud from 'tencentcloud-sdk-nodejs';
import { Client } from 'tencentcloud-sdk-nodejs/tencentcloud/services/live/v20180801/live_client';

import { SRS_CB_URL_QUERY } from '@/constant';
import {
  TENCENTCLOUD_CSS,
  TENCENTCLOUD_SECRETID,
  TENCENTCLOUD_SECRETKEY,
} from '@/secret/secret';
import { LiveRoomTypeEnum } from '@/types/ILiveRoom';
import { chalkERROR, chalkSUCCESS } from '@/utils/chalkTip';

class TencentcloudCssClass {
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
      console.log(chalkSUCCESS('查询腾讯云直播中的所有流成功！'));
      return { res };
    } catch (err) {
      console.log(err);
      console.log(chalkERROR('查询腾讯云直播中的所有流错误！'));
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
      AppName: TENCENTCLOUD_CSS.AppName,
      DomainName: TENCENTCLOUD_CSS.PushDomain,
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
    const url = `${TENCENTCLOUD_CSS.PullDomain}/${TENCENTCLOUD_CSS.AppName}/roomId___${data.liveRoomId}`;
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
    userId: number;
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
      .MD5(TENCENTCLOUD_CSS.Key + StreamName + Hex(txTime))
      .toString();
    const key = `${StreamName}?txSecret=${txSecret}&txTime=${Hex(txTime)}&${
      SRS_CB_URL_QUERY.roomId
    }=${data.liveRoomId}&${SRS_CB_URL_QUERY.publishType}=${data.type}&${
      SRS_CB_URL_QUERY.publishKey
    }=${data.key}&${SRS_CB_URL_QUERY.userId}=${data.userId}`;
    return {
      rtmp_url: `rtmp://${TENCENTCLOUD_CSS.PushDomain}/${TENCENTCLOUD_CSS.AppName}/${key}`,
      obs_server: `rtmp://${TENCENTCLOUD_CSS.PushDomain}/${TENCENTCLOUD_CSS.AppName}/`,
      obs_stream_key: key,
      webrtc_url: `webrtc://${TENCENTCLOUD_CSS.PushDomain}/${TENCENTCLOUD_CSS.AppName}/${key}`,
      srt_url: ``,
    };
  };
}

export const tencentcloudCssUtils = new TencentcloudCssClass();
