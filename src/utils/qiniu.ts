import { AxiosError } from 'axios';
import qiniu from 'qiniu';

import { QINIU_ACCESSKEY, QINIU_LIVE, QINIU_SECRETKEY } from '@/config/secret';
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
      JSON.stringify(reqBody)
    );
    return accessToken;
  }

  /**
   * 获取推流地址（静态鉴权）
   * https://developer.qiniu.com/pili/6678/push-the-current-authentication
   */
  getPublishUrl = (data: { roomId: number }) => {
    const url = `rtmp://${QINIU_LIVE.RTMPPublishDomain}/${QINIU_LIVE.Hub}/${data.roomId}?key=${QINIU_LIVE.PublishKey}`;
    return url;
  };

  /**
   * 查询直播流信息，查询目标直播流基本信息和配置信息
   * https://developer.qiniu.com/pili/2773/query-stream
   * code 200代表成功；614代表stream already exists
   */
  queryAFlow = async (data: { roomId: number }) => {
    const encodedStreamTitle = `${Buffer.from(`5555555${data.roomId}`).toString(
      'base64'
    )}`; // 经过base64编码的直播流名
    console.log(encodedStreamTitle, 333);
    const reqUrl = `https://pili.qiniuapi.com/v2/hubs/${QINIU_LIVE.Hub}`;
    // const reqUrl = `https://pili.qiniuapi.com/v2/hubs/${QINIU_LIVE.Hub}/stat/play`;
    // const reqUrl = `https://pili.qiniuapi.com/v2/hubs/${QINIU_LIVE.Hub}/streams`;
    // const reqUrl = `https://pili.qiniuapi.com/v2/hubs/${QINIU_LIVE.Hub}/streams/${encodedStreamTitle}`;
    const contentType = 'application/x-www-form-urlencoded';
    console.log('urlurl', reqUrl);
    const token = this.getAccessToken(reqUrl, 'GET', contentType);
    console.log(999, token);

    let res;
    try {
      const qiniures = await axios.get(reqUrl, {
        headers: {
          // Accept: contentType,
          contentType,
          Authorization: `${token}`,
        },
      });
      res = qiniures;
    } catch (error: any) {
      const e: AxiosError = error;
      console.log(e.isAxiosError, e.response?.status, e.response?.data);
      // console.log(e);
    }
    console.log(res, 222212);
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
      key: `${data.roomId}`, // 直播流名，需要满足的条件为 4-200个数字或字母
      // key: `${Math.random().toString().slice(2, 4)}${data.roomId}`, // 直播流名，需要满足的条件为 4-200个数字或字母
    };
    const token = this.getAccessToken(reqUrl, 'POST', contentType, reqBody);
    console.log('urlurl', reqUrl);
    console.log('reqBody', reqBody);
    console.log(888, token);
    try {
      const res = await axios({
        method: 'POST',
        url: reqUrl,
        data: reqBody,
        headers: {
          contentType,
          Authorization: `${token}`,
        },
      });
      console.log(332323253, res);
    } catch (error: any) {
      const e: AxiosError = error;
      console.log(e.isAxiosError, e.response?.status, e.response?.data);
    }
    return `rtmp://${QINIU_LIVE.RTMPPublishDomain}/${QINIU_LIVE.Hub}/${data.roomId}?key=${QINIU_LIVE.PublishKey}`;
  };
}

export const QiniuUtils = new QiniuClass();
