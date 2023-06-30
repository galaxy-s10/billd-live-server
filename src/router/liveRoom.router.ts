import Router from 'koa-router';

import liveRoomController from '@/controller/liveRoom.controller';

const liveRoomRouter = new Router({ prefix: '/live_room' });

liveRoomRouter.get('/list', liveRoomController.getList);

liveRoomRouter.get('/find/:id', liveRoomController.find);

liveRoomRouter.put('/update_key', liveRoomController.updateKey);

// SRS http回调
liveRoomRouter.post('/on_publish', liveRoomController.onPublish);
// SRS http回调
liveRoomRouter.post('/on_play', liveRoomController.onPlay);
// SRS http回调
liveRoomRouter.post('/on_unpublish', liveRoomController.onUnpublish);

export default liveRoomRouter;
