import Router from 'koa-router';

import { apiVerifyAuth } from '@/app/verify.middleware';
import { DEFAULT_AUTH_INFO } from '@/constant';
import liveController from '@/controller/live.controller';

const liveRouter = new Router({ prefix: '/live' });

liveRouter.get('/list', liveController.getList);

liveRouter.get('/pure_list', liveController.getPureList);

liveRouter.get(
  '/live_room_online_user/:live_room_id',
  liveController.getLiveRoomOnlineUser
);

liveRouter.get(
  '/live_room_online_user_count/:live_room_id',
  liveController.getLiveRoomOnlineUserCount
);

liveRouter.get(
  '/all_live_room_online_user',
  liveController.getAllLiveRoomOnlineUser
);

// 删除在线列表的重复直播间
liveRouter.get('/list_duplicate_removal', liveController.listDuplicateRemoval);

// 生成一个全新的假直播
liveRouter.post('/render_fake_live', liveController.renderFakeLive);

// 生成一个全新的假直播
liveRouter.post(
  '/render_fake_live_bilibili',
  liveController.renderFakeLiveByBilibili
);

// 添加一个假直播开播
liveRouter.post('/add_fake_live', liveController.addFakeLive);

// 删除一个假直播开播
liveRouter.post('/del_fake_live', liveController.delFakeLive);

liveRouter.post('/start_live', liveController.startLive);

liveRouter.post('/close_my_live', liveController.closeMyLive);

liveRouter.post(
  '/close_live_by_live_room_id/:live_room_id',
  apiVerifyAuth([DEFAULT_AUTH_INFO.LIVE_MANAGE.auth_value]),
  liveController.closeLiveByLiveRoomId
);

liveRouter.get('/is_live', liveController.isLive);

liveRouter.get(
  '/live_room_is_live/:live_room_id',
  liveController.liveRoomisLive
);

liveRouter.get('/forward_list', liveController.getForwardList);

liveRouter.post(
  '/kill_forward/:pid',
  apiVerifyAuth([DEFAULT_AUTH_INFO.LIVE_MANAGE.auth_value]),
  liveController.killForward
);

export default liveRouter;
