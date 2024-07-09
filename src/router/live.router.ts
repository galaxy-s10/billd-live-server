import Router from 'koa-router';

import liveController from '@/controller/live.controller';

const liveRouter = new Router({ prefix: '/live' });

liveRouter.get('/list', liveController.getList);

liveRouter.get('/live_room_online_user', liveController.getLiveUser);

liveRouter.get('/list_duplicate_removal', liveController.listDuplicateRemoval);

// 生成一个全新的假直播
liveRouter.post('/render_fake_live', liveController.renderFakeLive);

// 添加一个假直播开播
liveRouter.post('/add_fake_live', liveController.addFakeLive);

// 删除一个假直播开播
liveRouter.post('/del_fake_live', liveController.delFakeLive);

liveRouter.post('/close_live', liveController.closeLive);

liveRouter.get('/is_live', liveController.isLive);

liveRouter.get('/forward_list', liveController.getForwardList);

liveRouter.post('/kill_forward/:pid', liveController.killForward);

export default liveRouter;
