import Router from 'koa-router';

import areaController from '@/controller/area.controller';

const areaRouter = new Router({ prefix: '/area' });

areaRouter.get('/list', areaController.getList);

areaRouter.get('/area_live_room_list', areaController.getAreaLiveRoomList);

areaRouter.get('/live_room_list', areaController.getLiveRoomList);

export default areaRouter;
