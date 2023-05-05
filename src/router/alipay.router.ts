import Router from 'koa-router';

import alipayController from '@/controller/alipay.controller';

const alipayRouter = new Router({ prefix: '/alipay' });

alipayRouter.post('/pay', alipayController.create);

alipayRouter.get('/pay_status', alipayController.getPayStatus);

alipayRouter.get('/pay_list', alipayController.getList);

export default alipayRouter;
