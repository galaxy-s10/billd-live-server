import Router from 'koa-router';

import wsMessageController from '@/controller/wsMessage.controller';

const wsMessageRouter = new Router({ prefix: '/ws_message' });

wsMessageRouter.get('/list', wsMessageController.getList);

wsMessageRouter.post('/update', wsMessageController.update);

export default wsMessageRouter;
