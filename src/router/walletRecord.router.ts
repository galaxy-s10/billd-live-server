import Router from 'koa-router';

import walletRecordController from '@/controller/walletRecord.controller';

const walletRecordRouter = new Router({ prefix: '/wallet_record' });

walletRecordRouter.get('/list', walletRecordController.getList);

walletRecordRouter.get('/my_list', walletRecordController.getMyList);

export default walletRecordRouter;
