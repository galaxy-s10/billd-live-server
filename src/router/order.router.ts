import Router from 'koa-router';

import orderController from '@/controller/order.controller';

const orderRouter = new Router({ prefix: '/order' });

orderRouter.get('/order_list', orderController.getList);

orderRouter.get('/pay_status', orderController.getPayStatus);

orderRouter.post('/pay', orderController.create);

export default orderRouter;
