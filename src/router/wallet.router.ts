import Router from 'koa-router';

import walletController from '@/controller/wallet.controller';

const walletRouter = new Router({ prefix: '/wallet' });

walletRouter.get('/list', walletController.getList);

walletRouter.get('/my_wallet', walletController.findMyWallet);

export default walletRouter;
