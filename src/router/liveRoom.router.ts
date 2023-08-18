import Router from 'koa-router';

import liveRoomController from '@/controller/liveRoom.controller';

const liveRoomRouter = new Router({ prefix: '/live_room' });

liveRoomRouter.get('/list', liveRoomController.getList);

liveRoomRouter.get('/find/:id', liveRoomController.find);

liveRoomRouter.put('/update_key', liveRoomController.updateKey);

export default liveRoomRouter;
