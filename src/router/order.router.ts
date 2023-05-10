import Router from 'koa-router';

import alipayController from '@/controller/order.controller';

const orderRouter = new Router({ prefix: '/order' });

orderRouter.get('/order_list', alipayController.getList);

orderRouter.get('/pay_status', alipayController.getPayStatus);

orderRouter.post('/pay', alipayController.create);

export default orderRouter;
