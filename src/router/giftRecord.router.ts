import Router from 'koa-router';

import giftRecordController from '@/controller/giftRecord.controller';

const giftRecordRouter = new Router({ prefix: '/gift_record' });

giftRecordRouter.get('/list', giftRecordController.getList);

giftRecordRouter.get('/create', giftRecordController.create);

export default giftRecordRouter;
