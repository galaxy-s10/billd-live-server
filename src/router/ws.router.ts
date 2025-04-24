import Router from 'koa-router';

import wsController from '@/controller/ws.controller';

const wsRouter = new Router({ prefix: '/ws' });

wsRouter.get('/get_ws_info', wsController.getWsInfo);

wsRouter.post('/join', wsController.join);

wsRouter.post('/keep_joined', wsController.keepJoined);

wsRouter.post('/add_cluster_ws', wsController.addClusterWs);

wsRouter.post('/del_cluster_ws', wsController.delClusterWs);

export default wsRouter;
