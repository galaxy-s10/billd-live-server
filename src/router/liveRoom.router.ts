import Router from 'koa-router';

import { apiVerifyAuth } from '@/app/verify.middleware';
import { DEFAULT_AUTH_INFO } from '@/constant';
import liveRoomController from '@/controller/liveRoom.controller';

const liveRoomRouter = new Router({ prefix: '/live_room' });

liveRoomRouter.get('/list', liveRoomController.getList);

liveRoomRouter.get('/find/:id', liveRoomController.find);

liveRoomRouter.put('/update_key', liveRoomController.updateKey);

liveRoomRouter.get('/verify_pk_key/:id', liveRoomController.verifyPkKey);

liveRoomRouter.put(
  '/update/:id',
  apiVerifyAuth([DEFAULT_AUTH_INFO.LIVE_MANAGE.auth_value]),
  liveRoomController.update
);

export default liveRoomRouter;
