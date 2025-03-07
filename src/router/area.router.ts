import Router from 'koa-router';

import areaController from '@/controller/area.controller';

const areaRouter = new Router({ prefix: '/area' });

areaRouter.post('/create', areaController.create);

areaRouter.put('/update', areaController.update);

areaRouter.get('/list', areaController.getList);

areaRouter.get('/get_area_info/:id', areaController.getAreaInfo);

areaRouter.get('/area_live_room_list', areaController.getAreaLiveRoomList);

areaRouter.get('/live_room_list', areaController.getLiveRoomList);

areaRouter.get('/get_all_area', areaController.getAllArea);

areaRouter.get('/get_all_area_by_tree', areaController.getAllAreaByTree);

areaRouter.get('/get_all_children_area/:id', areaController.getAllChildrenArea);

export default areaRouter;
