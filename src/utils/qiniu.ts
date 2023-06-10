import { AxiosError } from 'axios';
import qiniu from 'qiniu';

import { QINIU_ACCESSKEY, QINIU_LIVE, QINIU_SECRETKEY } from '@/config/secret';
import { chalkERROR } from '@/utils/chalkTip';
import axios from '@/utils/request';

export interface IQiniuKey {
  prefix: string;
  hash: string;
  ext: string;
}

const qiniuConfConfig = new qiniu.conf.Config();

// @ts-ignore
qiniuConfConfig.zone = qiniu.zone.Zone_z2; // https://developer.qiniu.com/kodo/1289/nodejs#general-uptoken，qiniu.zone.Zone_z2代表华南

class QiniuClass {
  config = qiniuConfConfig;

  /**
   * 获取七牛云accessToken
   * @returns
   */
  getAccessToken(
    url: string,
    reqMethod: string,
    reqContentType: string,
    reqBody?: any,
    reqHeaders?: any
  ) {
    // https://developer.qiniu.com/pili/2772/http-requests-authentication
    const mac = new qiniu.auth.digest.Mac(QINIU_ACCESSKEY, QINIU_SECRETKEY);
    const accessToken = qiniu.util.generateAccessTokenV2(
      mac,
      url,
      reqMethod,
      reqContentType,
      JSON.stringify(reqBody),
      reqHeaders
    );
    return accessToken;
  }

  /**
   * 生成rtmp推流地址。
   * https://developer.qiniu.com/pili/2767/the-rtmp-push-flow-address
   */
  generateRtmpPublishUrl = (data: { roomId: number }) => {
    const expireAt = Math.floor(Date.now() / 1000) + 60 * 60;
    const path = `/${QINIU_LIVE.Hub}/roomId___${data.roomId}?e=${expireAt}`;
    const sign = qiniu.util.hmacSha1(path, QINIU_SECRETKEY);
    const encodedSign = qiniu.util.urlSafeToBase64(sign);
    const token = `${QINIU_ACCESSKEY}:${encodedSign}`;
    const url = `rtmp://${QINIU_LIVE.RTMPPublishDomain}/${QINIU_LIVE.Hub}/roomId___${data.roomId}?e=${expireAt}&token=${token}`;
    console.log('roomId', data.roomId);
    console.log('过期时间', expireAt);
    console.log('url', url);
    return url;
  };

  /**
   * 获取flv拉流地址。
   */
  getFlvPullUrl = (data: { roomId: number }) => {
    const url = `http://${QINIU_LIVE.RTMPPublishDomain}/${QINIU_LIVE.Hub}/roomId___${data.roomId}.flv`;
    return url;
  };

  /**
   * 查询直播流信息，查询目标直播流基本信息和配置信息
   * https://developer.qiniu.com/pili/2773/query-stream
   */
  queryAFlow = async (data: { roomId: number }) => {
    const encodedStreamTitle = `${Buffer.from(
      `roomId___${data.roomId}`
    ).toString('base64')}`; // 经过base64编码的直播流名
    const reqUrl = `https://pili.qiniuapi.com/v2/hubs/${QINIU_LIVE.Hub}/streams/${encodedStreamTitle}`;
    const contentType = 'application/x-www-form-urlencoded';
    const token = this.getAccessToken(reqUrl, 'GET', contentType);
    let res;
    try {
      const qiniures = await axios.get(reqUrl, {
        headers: {
          // WARN 不要省略Content-Type这个请求头，否则报unauthorized！!!
          'Content-Type': contentType,
          Authorization: `${token}`,
        },
      });
      res = qiniures;
    } catch (error: any) {
      const e: AxiosError = error;
      console.log('response.status', e.response?.status);
      console.log('response.data', e.response?.data);
      console.log(chalkERROR('查询直播流信息错误！'));
    }
    return res;
  };

  /**
   * 创建一个直播流，推流时如果流不存在，系统会自动创建一个流。
   * https://developer.qiniu.com/pili/2515/create-a-flow
   * code 200代表成功；614代表stream already exists
   */
  createAFlow = async (data: { roomId: number }) => {
    const reqUrl = `https://pili.qiniuapi.com/v2/hubs/${QINIU_LIVE.Hub}/streams`;
    const contentType = 'application/json';
    const reqBody = {
      key: `roomId___${data.roomId}`, // 直播流名，需要满足的条件为 4-200个数字或字母
    };
    const token = this.getAccessToken(reqUrl, 'POST', contentType, reqBody);
    try {
      await axios({
        method: 'POST',
        url: reqUrl,
        data: reqBody,
        headers: {
          // TIP 这个接口不带Content-Type这个请求头也没问题。
          'Content-Type': contentType,
          Authorization: `${token}`,
        },
      });
    } catch (error: any) {
      const e: AxiosError = error;
      console.log('response.status', e.response?.status);
      console.log('response.data', e.response?.data);
      console.log(chalkERROR('创建一个直播流错误！'));
    }
  };
}

export const qiniuUtils = new QiniuClass();
