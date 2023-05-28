import Router from 'koa-router';

import userLiveRoomController from '@/controller/userLiveRoom.controller';

const userLiveRoomRouter = new Router({ prefix: '/user_live_room' });

userLiveRoomRouter.get(
  '/find_by_userId/:userId',
  userLiveRoomController.findByUserId
);

userLiveRoomRouter.post('/create', userLiveRoomController.create);

export default userLiveRoomRouter;
