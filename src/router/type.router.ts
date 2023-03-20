import Router from 'koa-router';

import typeController from '@/controller/type.controller';
import { verifyProp } from '@/middleware/type.middleware';

const typeRouter = new Router({
  prefix: '/type',
});

// 分类列表
typeRouter.get('/list', typeController.getList);

// 创建分类
typeRouter.post('/create', verifyProp, typeController.create);

// 查找分类
typeRouter.get('/find/:id', typeController.find);

// 更新分类
typeRouter.put('/update/:id', verifyProp, typeController.update);

// 删除分类
typeRouter.delete('/delete/:id', typeController.delete);

export default typeRouter;
