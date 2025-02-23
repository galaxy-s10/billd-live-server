import Router from 'koa-router';

import wsController from '@/controller/ws.controller';

const wsRouter = new Router({ prefix: '/ws' });

wsRouter.post('/keep_joined', wsController.keepJoined);

export default wsRouter;
