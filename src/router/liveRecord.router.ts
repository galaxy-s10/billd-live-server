import Router from 'koa-router';

import liveRecordController from '@/controller/liveRecord.controller';

const liveRecordRouter = new Router({ prefix: '/live_record' });

liveRecordRouter.get('/list', liveRecordController.getList);

export default liveRecordRouter;
