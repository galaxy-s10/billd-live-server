import Router from 'koa-router';

import linkController from '@/controller/link.controller';
import { verifyProp } from '@/middleware/link.middleware';

const linkRouter = new Router({ prefix: '/link' });

// 友链列表
linkRouter.get('/list', linkController.getList);

// 创建友链
linkRouter.post('/create', verifyProp, linkController.create);

// 查找友链
linkRouter.get('/find/:id', linkController.find);

// 更新友链
linkRouter.put('/update/:id', verifyProp, linkController.update);

// 删除友链
linkRouter.delete('/delete/:id', linkController.delete);

export default linkRouter;
