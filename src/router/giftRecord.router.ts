import Router from 'koa-router';

import giftRecordController from '@/controller/giftRecord.controller';

const giftRecordRouter = new Router({ prefix: '/gift_record' });

giftRecordRouter.get('/list', giftRecordController.getList);

giftRecordRouter.get('/gift_group_list', giftRecordController.getGiftGroupList);

giftRecordRouter.post('/create', giftRecordController.create);

export default giftRecordRouter;
