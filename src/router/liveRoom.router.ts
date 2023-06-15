import Router from 'koa-router';

import liveRoomController from '@/controller/liveRoom.controller';

const liveRoomRouter = new Router({ prefix: '/live_room' });

liveRoomRouter.get('/list', liveRoomController.getList);

liveRoomRouter.post('/publish', liveRoomController.publish);

liveRoomRouter.post('/unpublish', liveRoomController.unpublish);

liveRoomRouter.get('/find/:id', liveRoomController.find);

export default liveRoomRouter;
