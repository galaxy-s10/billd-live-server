import Router from 'koa-router';

import areaController from '@/controller/area.controller';

const areaRouter = new Router({ prefix: '/area' });

areaRouter.get('/list', areaController.getList);

areaRouter.get('/area_live_room_list', areaController.getAreaLiveRoomList);

areaRouter.get('/live_room_list', areaController.getLiveRoomList);

areaRouter.get('/get_tree_area', areaController.getTreeArea);

export default areaRouter;
