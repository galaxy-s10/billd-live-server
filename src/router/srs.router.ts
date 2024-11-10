import Router from 'koa-router';

import { apiVerifyAuth } from '@/app/verify.middleware';
import { DEFAULT_AUTH_INFO } from '@/constant';
import srsController from '@/controller/srs.controller';

const srsRouter = new Router({ prefix: '/srs' });

srsRouter.post('/rtcV1Publish', srsController.rtcV1Publish);

srsRouter.post('/rtcV1Play', srsController.rtcV1Play);

srsRouter.post('/rtcV1Whep', srsController.rtcV1Whep);

srsRouter.get('/apiV1Streams', srsController.getApiV1Streams);

srsRouter.get('/apiV1Clients', srsController.getApiV1Clients);

srsRouter.delete(
  '/apiV1Clients/:clientId',
  apiVerifyAuth([DEFAULT_AUTH_INFO.LIVE_MANAGE.auth_value]),
  srsController.deleteApiV1Clients
);

srsRouter.delete(
  '/audience/:id',
  apiVerifyAuth([DEFAULT_AUTH_INFO.LIVE_MANAGE.auth_value]),
  srsController.deleteAudience
);

// https://ossrs.net/lts/zh-cn/docs/v5/doc/http-callback

// 对于事件on_publish和on_play：
// 返回值：SRS要求HTTP服务器返回HTTP200并且response内容为整数错误码（0表示成功），其他错误码会断开客户端连接。

// SRS http回调，当客户端发布流时，譬如flash/FMLE方式推流到服务器
srsRouter.post('/on_publish', srsController.onPublish);

// SRS http回调，当客户端停止发布流时
srsRouter.post('/on_unpublish', srsController.onUnpublish);

// SRS http回调，当客户端开始播放流时
srsRouter.post('/on_play', srsController.onPlay);

// SRS http回调，当客户端停止播放时
srsRouter.post('/on_stop', srsController.onStop);

// SRS http回调，当DVR录制关闭一个flv文件时
srsRouter.post('/on_dvr', srsController.onDvr);

export default srsRouter;
