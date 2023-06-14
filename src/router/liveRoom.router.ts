import Router from 'koa-router';

import liveRoomController from '@/controller/liveRoom.controller';

const liveRoomRouter = new Router({ prefix: '/live_room' });

liveRoomRouter.get('/list', liveRoomController.getList);

liveRoomRouter.post('/auth', liveRoomController.auth);

liveRoomRouter.get('/find/:id', liveRoomController.find);

export default liveRoomRouter;
