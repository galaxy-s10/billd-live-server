import Router from 'koa-router';

import worksController from '@/controller/works.controller';
import { verifyProp } from '@/middleware/works.middleware';

const worksRouter = new Router({ prefix: '/works' });

// 标签列表
worksRouter.get('/list', worksController.getList);

// 创建标签
worksRouter.post('/create', verifyProp, worksController.create);

// 查找标签
worksRouter.get('/find/:id', worksController.find);

// 更新标签
worksRouter.put('/update/:id', verifyProp, worksController.update);

// 删除标签
worksRouter.delete('/delete/:id', worksController.delete);

export default worksRouter;
