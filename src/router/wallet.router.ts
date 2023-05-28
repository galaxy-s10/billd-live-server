import Router from 'koa-router';

import walletController from '@/controller/wallet.controller';

const walletRouter = new Router({ prefix: '/wallet' });

walletRouter.get('/list', walletController.getList);

walletRouter.post('/init', walletController.initUserWallet);

export default walletRouter;
