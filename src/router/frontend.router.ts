import Router from 'koa-router';

import frontendController from '@/controller/frontend.controller';

const frontendRouter = new Router({ prefix: '/frontend' });

frontendRouter.get('/detail', frontendController.getDetail);

frontendRouter.get('/find/:id', frontendController.find);

frontendRouter.post('/create', frontendController.create);

frontendRouter.get('/list', frontendController.getList);

frontendRouter.put('/update/:id', frontendController.update);

frontendRouter.delete('/delete/:id', frontendController.delete);

export default frontendRouter;
