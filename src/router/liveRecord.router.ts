import Router from 'koa-router';

import liveRecordController from '@/controller/liveRecord.controller';

const liveRecordRouter = new Router({ prefix: '/live_record' });

liveRecordRouter.get('/list', liveRecordController.getList);

liveRecordRouter.get('/my_list', liveRecordController.getMyList);

liveRecordRouter.get('/statistics', liveRecordController.statistics);

export default liveRecordRouter;
